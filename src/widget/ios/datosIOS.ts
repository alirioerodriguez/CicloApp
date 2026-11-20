// Lo que muestran los widgets de iPhone, armado por la app. Lógica pura (se prueba en __tests__/widget-ios.test.ts).
// Se calcula hoy y los próximos días, cada uno desde su medianoche: así la cuenta baja sola aunque no abras la app.
import { addDays, today } from '../../lib/dates';
import { vistaPareja, type ParejaGuardada, type VistaPareja } from '../../lib/pareja';
import { region, t } from '../../lib/region';
import type { ISODate } from '../../lib/types';
import { resumenCiclo, type ResumenCiclo } from '../datosCiclo';
import { resumenWidget, type ResumenWidget } from '../datosWidget';
import { simboloDeEmoji } from '../iconos';
import { cuenta, estadoPastilla, tituloPastilla } from '../textos';
import type { PropsPareja } from './SaviaPareja';
import type { PropsPastilla } from './SaviaPastilla';
import type { PropsPeriodo } from './SaviaPeriodo';

export const DIAS_ADELANTE = 7;

export function propsPeriodo(r: ResumenCiclo): PropsPeriodo {
  const k = cuenta(r);
  return { grande: k.grande, flor: !!k.flor, unidad: k.unidad, pie: k.pie ?? ' ', color: k.color };
}

export function propsPastilla(r: ResumenWidget, fecha: ISODate = today()): PropsPastilla {
  if (!r.activo) return { activo: false, titulo: '', estado: t('Configura tu blíster para ver qué pastilla te toca cada día.'), marca: 'pendiente', fecha, boton: false, tomadaWidget: null };
  const marca = r.estadoHoy === 'futura' || r.estadoHoy === 'previa' ? 'pendiente' : r.estadoHoy;
  return { activo: true, titulo: tituloPastilla(r), estado: estadoPastilla(r), marca, fecha, boton: r.estadoHoy === 'pendiente', atrasada: r.atrasada, tomadaWidget: null, botonTexto: t('Ya la tomé') };
}

// Lo que ve la pareja en su iPhone. Los textos ya traducidos: el widget solo los dibuja.
export function propsPareja(v: VistaPareja | null): PropsPareja {
  const rotulos = { hoy: t('HOY'), como: t('CÓMO SE SIENTE'), mision: t('TU MISIÓN DE HOY'), plan: t('UNA CITA'), comer: t('PARA COMER'), mimo: t('UN MIMO'), cercania: t('ENTRE USTEDES') };
  if (!v) return { conectada: false, simbolo: 'heart', titulo: t('Toca para conectar con el código de tu pareja.'), linea: '', como: '', mision: '', plan: '', plato: '', mimo: '', cercania: '', rotulos };
  const pe = v.periodo;
  const linea = v.enPeriodo ? t('Está con su período') : pe ? (pe.enDias === 0 ? t('Su período: en cualquier momento') : pe.enDias === 1 ? t('Su período: mañana') : t(`Su período: en ${pe.enDias} días`)) : '';
  const como = v.fase !== 'general' && v.contenido.como ? t(v.contenido.como) : '';
  return {
    conectada: true, simbolo: simboloDeEmoji(v.contenido.emoji), titulo: t(v.titulo), linea, como,
    mision: v.mision ? t(v.mision) : '', plan: v.plan ? t(v.plan) : '', plato: v.plato ? t(v.plato) : '',
    mimo: v.mimo ? t(v.mimo) : '', cercania: v.cercania ? t(v.cercania) : '', rotulos,
  };
}

// fromISO da el mediodía (para no saltar de día con los husos); el widget tiene que cambiar a las 00:00
export function medianoche(dia: ISODate): Date {
  const [y, m, d] = dia.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0);
}

export interface Entrada<P> {
  date: Date;
  props: P;
}

/** Una entrada por día: ahora y cada medianoche de los próximos `dias` días. */
export function lineaDeTiempo<P>(armar: (dia: ISODate) => P, hoy: ISODate = today(), dias = DIAS_ADELANTE, ahora = new Date()): Entrada<P>[] {
  const out: Entrada<P>[] = [{ date: ahora, props: armar(hoy) }];
  for (let i = 1; i <= dias; i++) {
    const dia = addDays(hoy, i);
    out.push({ date: medianoche(dia), props: armar(dia) });
  }
  return out;
}

// La pastilla: además de cada medianoche, una entrada a su hora, para pasar a «Aún no tomaste tu pastilla».
export function lineaPastilla(raw: unknown, hoy: ISODate = today(), ahora = new Date(), dias = DIAS_ADELANTE): Entrada<PropsPastilla>[] {
  const hhmm = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
  const out: Entrada<PropsPastilla>[] = [];
  for (let i = 0; i <= dias; i++) {
    const dia = addDays(hoy, i);
    const desde = i === 0 ? hhmm : '00:00';
    const r = resumenWidget(raw, dia, desde);
    out.push({ date: i === 0 ? ahora : medianoche(dia), props: propsPastilla(r, dia) });
    if (r.activo && r.estadoHoy === 'pendiente' && r.hora > desde) {
      const [h, m] = r.hora.split(':').map(Number);
      const cuando = medianoche(dia);
      cuando.setHours(h, m);
      out.push({ date: cuando, props: propsPastilla(resumenWidget(raw, dia, r.hora), dia) });
    }
  }
  return out;
}

// Tomas marcadas con el botón del widget mientras la app estaba cerrada: la app las pasa al blíster al abrirse.
export function tomasDelWidget(entradas: { props: Partial<PropsPastilla> }[]): { fecha: ISODate; hora: string }[] {
  const out = new Map<ISODate, string>();
  for (const e of entradas) {
    const { fecha, tomadaWidget } = e.props ?? {};
    if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha) && typeof tomadaWidget === 'string' && /^\d{2}:\d{2}$/.test(tomadaWidget) && !out.has(fecha)) out.set(fecha, tomadaWidget);
  }
  return [...out].map(([fecha, hora]) => ({ fecha, hora }));
}

export function lineasDeTiempo(raw: unknown, hoy: ISODate = today(), ahora = new Date(), pareja: ParejaGuardada | null = null) {
  return {
    periodo: lineaDeTiempo((d) => propsPeriodo(resumenCiclo(raw, d)), hoy, DIAS_ADELANTE, ahora),
    pastilla: lineaPastilla(raw, hoy, ahora),
    pareja: lineaDeTiempo((d) => propsPareja(pareja ? vistaPareja(pareja.resumen, region().pais, d) : null), hoy, DIAS_ADELANTE, ahora),
  };
}

