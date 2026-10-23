// Modo pareja en vivo. Ella sube un resumen mínimo; la pareja lo ve en su Savia y en su widget.
// El resumen lleva los datos para calcular la fase de cualquier día (inicio del ciclo y duraciones), así la
// pareja ve el día correcto aunque ella no abra la app. Nunca lleva registros, síntomas, ánimo, notas,
// intimidad ni el método anticonceptivo. Lógica pura: se prueba en __tests__/pareja.test.ts.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { alimentosPara } from '../content/alimentos';
import { PAREJA, type ContenidoPareja, type FasePareja } from '../content/pareja';
import { semanasEmbarazo } from '../content/embarazo';
import type { Summary } from './cycle';
import { addDays, diffDays, today } from './dates';
import type { Pais } from './region';
import type { AppData, CompartirRed, Etapa, ISODate } from './types';

export interface ResumenPareja {
  v: 1;
  nombre: string;
  etapa: Etapa;
  compartir: CompartirRed[];
  ciclo: { inicio: ISODate; largo: number; sangrado: number; rango: [number, number] | null } | null;
  fpp: ISODate | null; // embarazo
  nacimiento: ISODate | null; // posparto
}

// Lo que se sube. Con pastilla no hay fases propias y el método no se comparte: va sin ciclo.
export function resumenPareja(data: AppData, s: Summary): ResumenPareja {
  const st = data.settings;
  const quiere = st.red.compartir;
  const deCiclo = st.etapa === 'ciclo' || st.etapa === 'especial' || st.etapa === 'ttc';
  const ciclo =
    deCiclo && !st.pillMode && s.lastStart && (quiere.includes('fase') || quiere.includes('periodo') || quiere.includes('energia'))
      ? { inicio: s.lastStart, largo: s.avgCycle, sangrado: s.avgPeriod, rango: s.cycleRange && s.cycleRange[1] - s.cycleRange[0] > 8 ? s.cycleRange : null }
      : null;
  return {
    v: 1,
    nombre: st.name.trim() || 'Tu pareja',
    etapa: st.etapa,
    compartir: [...quiere],
    ciclo,
    fpp: st.etapa === 'embarazo' && quiere.includes('fase') ? st.embarazo.fpp : null,
    nacimiento: st.etapa === 'posparto' && quiere.includes('fase') ? st.posparto.nacimiento : null,
  };
}

export interface VistaPareja {
  nombre: string;
  fase: FasePareja;
  contenido: ContenidoPareja;
  titulo: string; // "Ana está en su fase lútea"
  dia: number | null; // día del ciclo
  periodo: { enDias: number; fecha: ISODate; rango: [ISODate, ISODate] | null } | null; // solo si lo comparte
  enPeriodo: boolean;
  energia: ContenidoPareja['energia'];
  mision: string | null;
  citas: string[];
  platos: string[];
  ingredientes: { emoji: string; nombre: string }[];
  evitar: string | null;
}

// Cambia una vez al día y es la misma en la app, el widget y la notificación.
const delDia = <T,>(xs: T[], hoy: ISODate): T => xs[((diffDays(hoy, '2026-01-01') % xs.length) + xs.length) % xs.length];

export function faseDelDia(c: NonNullable<ResumenPareja['ciclo']>, hoy: ISODate): { fase: FasePareja; dia: number } {
  const dia = diffDays(hoy, c.inicio) + 1;
  if (dia <= c.sangrado) return { fase: 'menstrual', dia };
  const ov = c.largo - 13;
  if (dia >= c.largo - 4) return { fase: 'spm', dia }; // también si ya pasó la fecha: espera su período
  if (dia < ov - 1) return { fase: 'folicular', dia };
  if (dia <= ov + 1) return { fase: 'ovulatoria', dia };
  return { fase: 'lutea', dia };
}

export function vistaPareja(r: ResumenPareja, pais: Pais, hoy: ISODate = today()): VistaPareja {
  const quiere = r.compartir;
  const verFase = quiere.includes('fase');
  let fase: FasePareja = 'general';
  let dia: number | null = null;
  let titulo = `Hoy con ${r.nombre}`;

  if (r.ciclo) {
    const f = faseDelDia(r.ciclo, hoy);
    if (verFase) {
      fase = f.fase;
      dia = f.dia;
      titulo =
        f.fase === 'menstrual' ? `${r.nombre} está con su período` : f.fase === 'spm' ? `Se acerca el período de ${r.nombre}` : f.fase === 'ovulatoria' ? `${r.nombre} está en su mejor momento del mes` : `${r.nombre} está en su ${PAREJA[f.fase].nombre.toLowerCase()}`;
    } else if (quiere.includes('energia')) {
      // Sin fase: se usa por dentro solo para la energía y los consejos, sin nombrarla.
      fase = f.fase;
    }
  } else if (verFase && r.etapa === 'embarazo') {
    fase = 'embarazo';
    titulo = `${r.nombre} está en la semana ${semanasEmbarazo(r.fpp)} de su embarazo`;
  } else if (verFase && r.etapa === 'posparto') {
    fase = 'posparto';
    titulo = r.nacimiento ? `${r.nombre} está en la semana ${Math.max(0, Math.floor(diffDays(hoy, r.nacimiento) / 7))} de su posparto` : `${r.nombre} está en su posparto`;
  } else if (verFase && r.etapa === 'meno') {
    fase = 'meno';
    titulo = `${r.nombre} está en su menopausia`;
  }

  let periodo: VistaPareja['periodo'] = null;
  let enPeriodo = false;
  if (r.ciclo && quiere.includes('periodo')) {
    const f = faseDelDia(r.ciclo, hoy);
    enPeriodo = f.dia <= r.ciclo.sangrado;
    // Si ya pasó la fecha estimada, se dice "en cualquier momento" (enDias 0), nunca "atraso".
    const fecha = addDays(r.ciclo.inicio, r.ciclo.largo);
    const enDias = Math.max(0, diffDays(fecha, hoy));
    const rango: [ISODate, ISODate] | null = r.ciclo.rango ? [addDays(r.ciclo.inicio, r.ciclo.rango[0]), addDays(r.ciclo.inicio, r.ciclo.rango[1])] : null;
    if (!enPeriodo) periodo = { enDias, fecha, rango };
  }

  const ct = PAREJA[fase];
  const ayuda = quiere.includes('ayuda');
  const faseComida = fase === 'spm' ? 'lutea' : fase;
  const ingredientes =
    ayuda && (faseComida === 'menstrual' || faseComida === 'folicular' || faseComida === 'ovulatoria' || faseComida === 'lutea')
      ? alimentosPara(pais)
          .filter((a) => a.fases.includes(faseComida))
          .slice(0, 4)
          .map((a) => ({ emoji: a.emoji, nombre: a.nombre }))
      : [];

  return {
    nombre: r.nombre,
    fase,
    contenido: ct,
    titulo,
    dia,
    periodo,
    enPeriodo,
    energia: quiere.includes('energia') ? ct.energia : null,
    mision: ayuda ? delDia(ct.misiones, hoy) : null,
    citas: ayuda ? ct.citas : [],
    platos: ayuda ? ct.platos : [],
    ingredientes,
    evitar: ayuda ? ct.evitar : null,
  };
}

// ---------- En el teléfono de la pareja ----------
// Se guarda lo último que llegó, para el widget y para abrir sin internet. Va fuera de la cuenta.

export const CLAVE_PAREJA = 'savia:pareja';

export interface ParejaGuardada {
  resumen: ResumenPareja;
  leido: string; // fecha y hora de la última lectura
  avisos: boolean; // aviso diario a las 9 con la misión del día
}

export async function leerParejaGuardada(): Promise<ParejaGuardada | null> {
  try {
    const raw = await AsyncStorage.getItem(CLAVE_PAREJA);
    if (!raw) return null;
    const p = JSON.parse(raw) as ParejaGuardada;
    return p?.resumen?.v === 1 ? p : null;
  } catch {
    return null;
  }
}

export async function guardarPareja(p: ParejaGuardada | null): Promise<void> {
  if (p) await AsyncStorage.setItem(CLAVE_PAREJA, JSON.stringify(p));
  else await AsyncStorage.removeItem(CLAVE_PAREJA);
}

// Código de 8 letras y números, sin los que se confunden (0/O, 1/I/L).
const LETRAS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export function nuevoCodigo(azar: () => number = Math.random): string {
  let c = '';
  for (let i = 0; i < 8; i++) c += LETRAS[Math.floor(azar() * LETRAS.length)];
  return c;
}
export const mostrarCodigo = (c: string) => `${c.slice(0, 4)}-${c.slice(4)}`;
export const limpiarCodigo = (c: string) => c.toUpperCase().replace(/[^A-Z0-9]/g, '');
