// Datos del reloj o de la app de salud (Apple Salud / Health Connect) cruzados con el ciclo.
// Lógica pura: se prueba en __tests__/reloj.test.ts. La lectura de cada sistema está en lib/fuentesSalud.
//
// Lo que se calcula:
// - Subida de temperatura de cada ciclo con la regla "3 sobre 6": tres noches seguidas por encima de las
//   seis anteriores, la tercera al menos 0,2 °C más alta. Suele pasar justo después de ovular. Es un dato
//   para conversar con la médica, NO un método anticonceptivo.
// - Promedios por fase (pulso en reposo, variabilidad, sueño, pasos y temperatura): en la fase lútea el
//   pulso en reposo y la temperatura suelen subir un poco.
import type { Summary } from './cycle';
import { addDays, diffDays } from './dates';
import { region } from './region';
import type { AppData, ISODate, MedidaReloj } from './types';

export type CampoReloj = keyof MedidaReloj;

// Junta lo leído con lo guardado: lo nuevo pisa a lo viejo campo por campo.
export function fusionarDias(viejo: Record<ISODate, MedidaReloj>, nuevo: Record<ISODate, MedidaReloj>): Record<ISODate, MedidaReloj> {
  const out = { ...viejo };
  for (const [d, m] of Object.entries(nuevo)) {
    const limpio = Object.fromEntries(Object.entries(m).filter(([, v]) => typeof v === 'number' && Number.isFinite(v)));
    if (Object.keys(limpio).length) out[d] = { ...out[d], ...limpio };
  }
  return out;
}

const mediana = (xs: number[]) => {
  const o = [...xs].sort((a, b) => a - b);
  const m = Math.floor(o.length / 2);
  return o.length % 2 ? o[m] : (o[m - 1] + o[m]) / 2;
};
const redondear = (x: number, dec = 2) => Math.round(x * 10 ** dec) / 10 ** dec;

// Apple da la temperatura de la muñeca en °C absolutos: se pasa a desvío respecto a su propia línea base
// (mediana de las 30 noches anteriores, o de todas si aún hay pocas), como lo muestra Apple Salud.
export function desviosDesdeAbsolutos(abs: Record<ISODate, number>): Record<ISODate, number> {
  const fechas = Object.keys(abs).sort();
  const out: Record<ISODate, number> = {};
  fechas.forEach((f, i) => {
    const previas = fechas.slice(Math.max(0, i - 30), i).map((x) => abs[x]);
    const base = previas.length >= 5 ? mediana(previas) : mediana(fechas.map((x) => abs[x]));
    out[f] = redondear(abs[f] - base);
  });
  return out;
}

export interface Salto {
  inicioCiclo: ISODate;
  fecha: ISODate; // primera noche alta
  diaCiclo: number;
  subida: number; // °C sobre la línea de las 6 anteriores (tercera noche)
  fuente: 'piel' | 'basal';
}

// Regla "3 sobre 6" sobre las lecturas disponibles (se saltan los días sin dato).
export function buscarSalto(serie: { fecha: ISODate; valor: number }[]): { fecha: ISODate; subida: number } | null {
  for (let i = 6; i + 2 < serie.length; i++) {
    const linea = Math.max(...serie.slice(i - 6, i).map((x) => x.valor));
    const tres = serie.slice(i, i + 3);
    // Que las tres noches estén dentro de 5 días (sin huecos largos).
    if (diffDays(tres[2].fecha, tres[0].fecha) > 4) continue;
    if (tres.every((x) => x.valor > linea) && tres[2].valor - linea >= 0.2) return { fecha: tres[0].fecha, subida: redondear(tres[2].valor - linea) };
  }
  return null;
}

// Un ciclo = desde el inicio de un período hasta el día antes del siguiente (o hasta hoy).
function ciclos(s: Summary, hoy: ISODate): { inicio: ISODate; fin: ISODate; sangrado: number }[] {
  return s.periods
    .filter((p) => p.start <= hoy)
    .map((p, i, ps) => ({ inicio: p.start, fin: i + 1 < ps.length ? addDays(ps[i + 1].start, -1) : hoy, sangrado: p.length }));
}

function serieTemp(dias: Record<ISODate, MedidaReloj>, desde: ISODate, hasta: ISODate): { serie: { fecha: ISODate; valor: number }[]; fuente: 'piel' | 'basal' } {
  const fechas = Object.keys(dias).filter((d) => d >= desde && d <= hasta).sort();
  const piel = fechas.filter((d) => dias[d].tempPiel != null).map((d) => ({ fecha: d, valor: dias[d].tempPiel! }));
  const basal = fechas.filter((d) => dias[d].tempBasal != null).map((d) => ({ fecha: d, valor: dias[d].tempBasal! }));
  return piel.length >= basal.length ? { serie: piel, fuente: 'piel' } : { serie: basal, fuente: 'basal' };
}

export function saltosPorCiclo(dias: Record<ISODate, MedidaReloj>, s: Summary, hoy: ISODate): Salto[] {
  const out: Salto[] = [];
  for (const c of ciclos(s, hoy)) {
    const { serie, fuente } = serieTemp(dias, c.inicio, c.fin);
    const salto = buscarSalto(serie);
    if (salto) out.push({ inicioCiclo: c.inicio, fecha: salto.fecha, diaCiclo: diffDays(salto.fecha, c.inicio) + 1, subida: salto.subida, fuente });
  }
  return out;
}

export type FaseReloj = 'menstrual' | 'folicular' | 'lutea';

// Fase de un día para comparar: lútea desde la subida de temperatura (o, sin subida, desde 14 días antes
// del período siguiente). Sin período registrado no se clasifica.
export function faseDeDia(d: ISODate, s: Summary, saltos: Salto[], hoy: ISODate): FaseReloj | null {
  const c = ciclos(s, hoy).find((x) => d >= x.inicio && d <= x.fin);
  if (!c) return null;
  if (diffDays(d, c.inicio) < c.sangrado) return 'menstrual';
  const salto = saltos.find((x) => x.inicioCiclo === c.inicio);
  const siguiente = s.periods.find((p) => p.start > c.inicio)?.start ?? (s.nextStart && s.nextStart > c.inicio ? s.nextStart : null);
  const lutea = salto?.fecha ?? (siguiente ? addDays(siguiente, -14) : null);
  return lutea && d >= lutea ? 'lutea' : 'folicular';
}

export type PromediosFase = Record<FaseReloj, Partial<Record<CampoReloj, number>> & { dias: number }>;

export interface ResumenReloj {
  desde: ISODate | null;
  hasta: ISODate | null;
  noches: number; // días con algún dato
  promedios: Partial<Record<CampoReloj, number>>;
  porFase: PromediosFase;
  saltos: Salto[];
  // Diferencias lútea − folicular, si hay datos de las dos.
  difFcReposo: number | null;
  difTemp: number | null;
  curva: { dia: number; valor: number; fecha: ISODate }[]; // temperatura del último ciclo con datos, por día del ciclo
}

const CAMPOS: CampoReloj[] = ['pasos', 'fcReposo', 'fcMedia', 'vfc', 'sueno', 'tempPiel', 'tempBasal'];
const DEC: Record<CampoReloj, number> = { pasos: 0, fcReposo: 1, fcMedia: 1, vfc: 1, sueno: 0, tempPiel: 2, tempBasal: 2 };

function promedio(dias: MedidaReloj[]): Partial<Record<CampoReloj, number>> {
  const out: Partial<Record<CampoReloj, number>> = {};
  for (const k of CAMPOS) {
    const xs = dias.map((m) => m[k]).filter((v): v is number => typeof v === 'number');
    if (xs.length) out[k] = redondear(xs.reduce((a, b) => a + b, 0) / xs.length, DEC[k]);
  }
  return out;
}

export function resumenReloj(data: AppData, s: Summary, hoy: ISODate, desde?: ISODate): ResumenReloj {
  const dias = data.reloj.dias;
  const fechas = Object.keys(dias)
    .filter((d) => d <= hoy && (!desde || d >= desde))
    .sort();
  const saltos = saltosPorCiclo(dias, s, hoy).filter((x) => !desde || x.fecha >= desde);
  const grupos: Record<FaseReloj, MedidaReloj[]> = { menstrual: [], folicular: [], lutea: [] };
  for (const d of fechas) {
    const f = faseDeDia(d, s, saltos, hoy);
    if (f) grupos[f].push(dias[d]);
  }
  const porFase = Object.fromEntries((Object.keys(grupos) as FaseReloj[]).map((f) => [f, { ...promedio(grupos[f]), dias: grupos[f].length }])) as PromediosFase;
  const dif = (k: CampoReloj, dec: number) => (porFase.lutea[k] != null && porFase.folicular[k] != null ? redondear(porFase.lutea[k]! - porFase.folicular[k]!, dec) : null);

  // Curva del último ciclo que tenga al menos 5 noches con temperatura.
  let curva: ResumenReloj['curva'] = [];
  for (const c of ciclos(s, hoy).reverse()) {
    const { serie } = serieTemp(dias, c.inicio, c.fin);
    if (serie.length >= 5) {
      curva = serie.map((x) => ({ dia: diffDays(x.fecha, c.inicio) + 1, valor: x.valor, fecha: x.fecha }));
      break;
    }
  }

  return {
    desde: fechas[0] ?? null,
    hasta: fechas[fechas.length - 1] ?? null,
    noches: fechas.length,
    promedios: promedio(fechas.map((d) => dias[d])),
    porFase,
    saltos,
    difFcReposo: dif('fcReposo', 1),
    difTemp: dif('tempPiel', 2) ?? dif('tempBasal', 2),
    curva,
  };
}

// Cuántos días leer: la primera vez, 4 meses; después, desde 2 días antes de la última lectura.
export function rangoALeer(ultimaSync: string | null, hoy: ISODate): { desde: ISODate; hasta: ISODate } {
  const tope = addDays(hoy, -120);
  if (!ultimaSync) return { desde: tope, hasta: hoy };
  const d = addDays(ultimaSync.slice(0, 10), -2);
  return { desde: d < tope ? tope : d, hasta: hoy };
}

const decimal = (s: string) => (region().idioma === 'en' ? s : s.replace('.', ','));
export const formatoSueno = (min: number) => `${Math.floor(min / 60)} h ${String(Math.round(min % 60)).padStart(2, '0')} min`;
export const formatoTemp = (x: number) => `${x > 0 ? '+' : x < 0 ? '−' : '±'}${decimal(Math.abs(x).toFixed(2))} °C`;
