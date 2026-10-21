// Cálculos de "Salud ginecológica": autoexamen, dolor de ovarios y controles.
import type { Summary } from './cycle';
import { addDays, diffDays, fromISO, toISO, today as todayISO } from './dates';
import type { AppData, DayLog, ISODate } from './types';

export function addMonths(d: ISODate, n: number): ISODate {
  const x = fromISO(d);
  x.setMonth(x.getMonth() + n);
  return toISO(x);
}

// El mejor momento es unos días después del período (día 8 del ciclo). Con pastilla, una vez al mes.
export function proximoAutoexamen(data: AppData, s: Summary, ref: ISODate = todayISO()): ISODate {
  const last = [...data.autoexamenes].sort().pop() ?? null;
  if (!data.settings.pillMode && s.lastStart) {
    const d8 = addDays(s.lastStart, 7);
    const hechoEsteCiclo = last != null && last >= s.lastStart;
    if (!hechoEsteCiclo) return d8 < ref ? ref : d8;
    if (s.nextStart) return addDays(s.nextStart, 7);
  }
  if (last) {
    const next = addDays(last, 30);
    return next < ref ? ref : next;
  }
  return ref;
}

export interface OvarioEntry {
  date: ISODate;
  lado: NonNullable<DayLog['ovario']>;
  cycleDay: number | null;
  pain: number;
}

// Registros de dolor de ovario de los últimos N ciclos (o 60 días si no hay ciclos).
export function ovarioHistorial(data: AppData, s: Summary, ciclos = 2, ref: ISODate = todayISO()): OvarioEntry[] {
  const desde = s.periods.length >= ciclos ? s.periods[s.periods.length - ciclos].start : addDays(ref, -60);
  const starts = s.periods.map((p) => p.start);
  return Object.values(data.logs)
    .filter((l) => l.ovario && l.date >= desde && l.date <= ref)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((l) => {
      const st = [...starts].reverse().find((x) => x <= l.date) ?? null;
      return { date: l.date, lado: l.ovario!, cycleDay: st ? diffDays(l.date, st) + 1 : null, pain: l.pain };
    });
}

export function diasHasta(fecha: ISODate, ref: ISODate = todayISO()): number {
  return diffDays(fecha, ref);
}
