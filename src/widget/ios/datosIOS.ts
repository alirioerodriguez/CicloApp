// Lo que muestran los widgets de iPhone, armado por la app. Lógica pura (se prueba en __tests__/widget-ios.test.ts).
// Se calcula hoy y los próximos días, cada uno desde su medianoche: así la cuenta baja sola aunque no abras la app.
import { addDays, today } from '../../lib/dates';
import { t } from '../../lib/region';
import type { ISODate } from '../../lib/types';
import { resumenCiclo, type ResumenCiclo } from '../datosCiclo';
import { resumenWidget, type ResumenWidget } from '../datosWidget';
import { cuenta, estadoPastilla, tituloPastilla } from '../textos';
import type { PropsPastilla } from './SaviaPastilla';
import type { PropsPeriodo } from './SaviaPeriodo';

export const DIAS_ADELANTE = 7;

export function propsPeriodo(r: ResumenCiclo): PropsPeriodo {
  const k = cuenta(r);
  return { grande: k.grande, unidad: k.unidad, pie: k.pie ?? ' ', color: k.color };
}

export function propsPastilla(r: ResumenWidget): PropsPastilla {
  if (!r.activo) return { activo: false, titulo: '', estado: t('Configura tu blíster para ver qué pastilla te toca cada día.'), marca: 'pendiente' };
  return { activo: true, titulo: tituloPastilla(r), estado: estadoPastilla(r), marca: r.estadoHoy === 'futura' ? 'pendiente' : r.estadoHoy };
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

export function lineasDeTiempo(raw: unknown, hoy: ISODate = today(), ahora = new Date()) {
  return {
    periodo: lineaDeTiempo((d) => propsPeriodo(resumenCiclo(raw, d)), hoy, DIAS_ADELANTE, ahora),
    pastilla: lineaDeTiempo((d) => propsPastilla(resumenWidget(raw, d)), hoy, DIAS_ADELANTE, ahora),
  };
}
