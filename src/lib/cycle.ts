// Lógica pura del ciclo: sin React, sin almacenamiento. Fácil de probar.
import { CONDICIONES_RANGO } from '../content/condiciones';
import { SIN_OVULACION } from '../content/etapas';
import { addDays, diffDays, today as todayISO } from './dates';
import type { AppData, DayLog, ISODate, Phase, PillType, Settings } from './types';

export interface Period {
  start: ISODate;
  end: ISODate;
  length: number;
}

export interface CycleRecord {
  start: ISODate;
  length: number; // días hasta el siguiente período
  periodLength: number;
}

const MIN_CYCLE = 18;
const MAX_CYCLE = 50;
const MAX_CYCLE_ESPECIAL = 90; // ciclo especial: se aceptan ciclos de 35 a 90 días o más
const HISTORY = 6; // ciclos que se usan para promediar

// Sin ovulación propia (pastilla, implante o anillo): no hay días fértiles.
export function sinOvulacion(s: Settings): boolean {
  return s.pillMode || SIN_OVULACION.includes(s.anticonceptivo);
}

// En ciclo especial, embarazo, posparto, menopausia y tras una pérdida no se avisa de atrasos.
export function sinAtrasos(s: Settings): boolean {
  return s.ocultarRetrasos || s.silencioEmbarazo || s.etapa === 'especial' || s.etapa === 'posparto' || s.etapa === 'embarazo' || s.etapa === 'meno';
}

// Días con flujo, agrupados en períodos. Se tolera un día sin flujo en medio.
// En ciclo especial el manchado (flow 1) no cuenta como período.
export function getPeriods(logs: Record<ISODate, DayLog>, minFlow = 1): Period[] {
  const days = Object.values(logs)
    .filter((l) => l.flow >= minFlow)
    .map((l) => l.date)
    .sort();
  const periods: Period[] = [];
  for (const d of days) {
    const last = periods[periods.length - 1];
    if (last && diffDays(d, last.end) <= 2) {
      last.end = d;
      last.length = diffDays(d, last.start) + 1;
    } else {
      periods.push({ start: d, end: d, length: 1 });
    }
  }
  return periods;
}

export function getCycles(periods: Period[], maxCycle = MAX_CYCLE): CycleRecord[] {
  const out: CycleRecord[] = [];
  for (let i = 0; i < periods.length - 1; i++) {
    const length = diffDays(periods[i + 1].start, periods[i].start);
    if (length >= MIN_CYCLE && length <= maxCycle) {
      out.push({ start: periods[i].start, length, periodLength: periods[i].length });
    }
  }
  return out;
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const median = (xs: number[]) => {
  const o = [...xs].sort((a, b) => a - b);
  const m = Math.floor(o.length / 2);
  return o.length % 2 ? o[m] : (o[m - 1] + o[m]) / 2;
};

export interface Summary {
  periods: Period[];
  cycles: CycleRecord[];
  avgCycle: number;
  avgPeriod: number;
  cycleRange: [number, number] | null;
  learned: boolean; // true si los promedios salen de datos reales
  regular: boolean | null;
  lastStart: ISODate | null;
  cycleDay: number | null; // día 1 = primer día del último período
  nextStart: ISODate | null;
  daysToNext: number | null;
  lateDays: number; // > 0 si el período está atrasado
  ventana: [ISODate, ISODate] | null; // rango probable del próximo período (ciclos irregulares)
  inPeriod: boolean;
  phase: Phase | null;
  ovulation: ISODate | null;
  fertileStart: ISODate | null;
  fertileEnd: ISODate | null;
}

export function summarize(data: AppData, ref: ISODate = todayISO()): Summary {
  const { settings, logs } = data;
  const especial = settings.etapa === 'especial';
  const periods = getPeriods(logs, especial ? 2 : 1);
  const cycles = getCycles(periods, especial ? MAX_CYCLE_ESPECIAL : MAX_CYCLE);
  const recent = cycles.slice(-HISTORY);

  // En ciclo especial se usa la mediana: un ciclo muy largo no arrastra la predicción.
  let avgCycle = settings.cycleLength;
  if (recent.length >= 2) avgCycle = Math.round((especial ? median : mean)(recent.map((c) => c.length)));
  else if (recent.length === 1) avgCycle = Math.round((recent[0].length + settings.cycleLength) / 2);

  // Solo períodos ya terminados para el promedio de duración.
  const done = periods.filter((p) => diffDays(ref, p.end) > 1).slice(-HISTORY);
  const avgPeriod = done.length >= 2 ? Math.round(mean(done.map((p) => p.length))) : settings.periodLength;

  const lengths = recent.map((c) => c.length);
  const cycleRange: [number, number] | null = lengths.length >= 2 ? [Math.min(...lengths), Math.max(...lengths)] : null;
  const regular = cycleRange ? cycleRange[1] - cycleRange[0] <= 7 : null;

  const pastPeriods = periods.filter((p) => p.start <= ref);
  const last = pastPeriods[pastPeriods.length - 1] ?? null;
  const lastStart = last?.start ?? null;

  const base: Summary = {
    periods, cycles, avgCycle, avgPeriod, cycleRange, regular,
    learned: recent.length >= 2,
    lastStart, cycleDay: null, nextStart: null, daysToNext: null, lateDays: 0, ventana: null,
    inPeriod: false, phase: null, ovulation: null, fertileStart: null, fertileEnd: null,
  };
  if (!lastStart || !last) return base;

  const cycleDay = diffDays(ref, lastStart) + 1;
  const nextStart = addDays(lastStart, avgCycle);
  const daysToNext = diffDays(nextStart, ref);
  const lateDays = daysToNext < 0 ? -daysToNext : 0;

  // Con ciclos irregulares (declarados o con mucha variación) se muestra un rango en vez de una fecha.
  const irregular = especial || settings.condiciones.some((x) => CONDICIONES_RANGO.includes(x)) || (cycleRange != null && cycleRange[1] - cycleRange[0] > 8);
  const ventana: [ISODate, ISODate] | null = irregular
    ? cycleRange
      ? [addDays(lastStart, cycleRange[0]), addDays(lastStart, cycleRange[1])]
      : [addDays(nextStart, -5), addDays(nextStart, 5)]
    : null;
  const inPeriod = ref <= last.end || (ref <= addDays(lastStart, avgPeriod - 1) && diffDays(ref, last.end) <= 1);

  const ovulation = addDays(nextStart, -14);
  const ovDay = avgCycle - 13;

  let phase: Phase;
  if (inPeriod) phase = 'menstrual';
  else if (settings.pillMode) phase = 'pastilla';
  else if (cycleDay < ovDay - 1) phase = 'folicular';
  else if (cycleDay <= ovDay + 1) phase = 'ovulatoria';
  else phase = 'lutea';

  const fertil = !sinOvulacion(settings);
  return {
    ...base,
    cycleDay, nextStart, daysToNext, lateDays, ventana, inPeriod, phase,
    ovulation: fertil ? ovulation : null,
    fertileStart: fertil ? addDays(ovulation, -5) : null,
    fertileEnd: fertil ? addDays(ovulation, 1) : null,
  };
}

export interface DayMarks {
  period?: boolean; // registrado
  predicted?: boolean; // período estimado
  fertile?: boolean;
  ovulation?: boolean;
  intimidad?: boolean;
}

// Mapa fecha → marcas para el calendario (pasado real + 6 ciclos estimados).
export function calendarMarks(data: AppData, s: Summary, ref: ISODate = todayISO()): Record<ISODate, DayMarks> {
  const marks: Record<ISODate, DayMarks> = {};
  const mark = (d: ISODate, k: keyof DayMarks) => {
    (marks[d] ??= {})[k] = true;
  };

  const minFlow = data.settings.etapa === 'especial' ? 2 : 1;
  for (const l of Object.values(data.logs)) {
    if (l.flow >= minFlow) mark(l.date, 'period');
    if (l.intimidad) mark(l.date, 'intimidad');
  }

  const showFertile = !sinOvulacion(data.settings);
  const markFertile = (nextStart: ISODate) => {
    if (!showFertile) return;
    const ov = addDays(nextStart, -14);
    for (let i = -5; i <= 1; i++) mark(addDays(ov, i), 'fertile');
    mark(ov, 'ovulation');
  };

  // Ciclos pasados: la ovulación se estima 14 días antes del período siguiente.
  for (let i = 1; i < s.periods.length; i++) markFertile(s.periods[i].start);

  if (!s.nextStart) return marks;
  // Si está atrasado, la próxima estimación se corre a mañana.
  let start = s.lateDays > 0 ? addDays(ref, 1) : s.nextStart;
  for (let k = 0; k < 6; k++) {
    if (k > 0 || s.lateDays === 0) markFertile(start);
    for (let i = 0; i < s.avgPeriod; i++) {
      const d = addDays(start, i);
      if (!marks[d]?.period && d > ref) mark(d, 'predicted');
    }
    start = addDays(start, s.avgCycle);
  }
  return marks;
}

// ---------- Pastilla ----------

// Esquemas de blíster. El sangrado esperado sale de [16] [29] [45] [48] [49].
export const PILL_PACKS: Record<PillType, { length: number; active: number; label: string; breakTakes: boolean; soloProgestageno: boolean; sangrado: string }> = {
  '21-7': { length: 28, active: 21, label: 'Combinada: 21 + 7 días sin pastilla', breakTakes: false, soloProgestageno: false, sangrado: 'Sangrado de deprivación durante los 7 días de descanso.' },
  '21-7p': { length: 28, active: 21, label: 'Combinada: 21 + 7 placebo', breakTakes: true, soloProgestageno: false, sangrado: 'Sangrado de deprivación durante los 7 placebos.' },
  '24-4': { length: 28, active: 24, label: 'Combinada: 24 + 4 placebo', breakTakes: true, soloProgestageno: false, sangrado: 'Sangrado de deprivación durante los 4 placebos.' },
  '26-2': { length: 28, active: 26, label: 'Combinada: 26 + 2 (tipo Qlaira)', breakTakes: true, soloProgestageno: false, sangrado: 'Suele empezar entre los días 26 y 28, y a veces sigue en la tira siguiente.' },
  continua: { length: 28, active: 28, label: 'Combinada continua, sin pausa', breakTakes: true, soloProgestageno: false, sangrado: 'Sin sangrado regular; puede haber manchado.' },
  pop: { length: 28, active: 28, label: 'Solo progestágeno, 28 seguidas', breakTakes: true, soloProgestageno: true, sangrado: 'Irregular: puede ser frecuente, largo, escaso o no haber sangrado. Es lo esperado.' },
  'pop-24-4': { length: 28, active: 24, label: 'Solo progestágeno: 24 + 4 placebo', breakTakes: true, soloProgestageno: true, sangrado: 'Puede haber sangrado en los placebos y goteos inesperados, sobre todo al inicio.' },
};

export const PILL_TYPE_OPTIONS = (Object.keys(PILL_PACKS) as PillType[]).map((k) => ({
  value: k,
  label: PILL_PACKS[k].label,
}));

export interface PillStatus {
  dayInPack: number;
  packLength: number;
  active: boolean; // pastilla con hormona
  takesToday: boolean; // ¿le toca tomar algo hoy?
  nextPackStart: ISODate;
  breakStart: ISODate | null;
}

export function pillStatus(settings: Settings, ref: ISODate = todayISO()): PillStatus | null {
  if (!settings.pillMode || !settings.pillPackStart) return null;
  const pack = PILL_PACKS[settings.pillType];
  const offset = ((diffDays(ref, settings.pillPackStart) % pack.length) + pack.length) % pack.length;
  const dayInPack = offset + 1;
  const active = dayInPack <= pack.active;
  const nextPackStart = addDays(ref, pack.length - offset);
  return {
    dayInPack,
    packLength: pack.length,
    active,
    takesToday: active || pack.breakTakes,
    nextPackStart,
    breakStart: pack.active < pack.length && active ? addDays(ref, pack.active - offset) : null,
  };
}

// ---------- Estadísticas ----------

function startFor(date: ISODate, periods: Period[]): ISODate | null {
  let s: ISODate | null = null;
  for (const p of periods) {
    if (p.start <= date) s = p.start;
    else break;
  }
  return s;
}

export function painByCycleDay(data: AppData, periods: Period[], maxDay = 35): (number | null)[] {
  const sum = new Array(maxDay).fill(0);
  const count = new Array(maxDay).fill(0);
  for (const l of Object.values(data.logs)) {
    if (!l.pain) continue;
    const s = startFor(l.date, periods);
    if (!s) continue;
    const cd = diffDays(l.date, s);
    if (cd < maxDay) {
      sum[cd] += l.pain;
      count[cd]++;
    }
  }
  return sum.map((v, i) => (count[i] ? v / count[i] : null));
}

export function topCounts(logs: DayLog[], key: 'moods' | 'symptoms', n = 5): { id: string; count: number }[] {
  const c: Record<string, number> = {};
  for (const l of logs) for (const x of l[key]) c[x] = (c[x] ?? 0) + 1;
  return Object.entries(c)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

// "Tus cólicos suelen aparecer entre el día 1 y 2 del ciclo"
export function symptomWindows(data: AppData, periods: Period[]): { id: string; from: number; to: number; count: number }[] {
  const days: Record<string, number[]> = {};
  for (const l of Object.values(data.logs)) {
    const s = startFor(l.date, periods);
    if (!s) continue;
    const cd = diffDays(l.date, s) + 1;
    for (const x of l.symptoms) (days[x] ??= []).push(cd);
  }
  return Object.entries(days)
    .filter(([, ds]) => ds.length >= 3)
    .map(([id, ds]) => {
      const sorted = [...ds].sort((a, b) => a - b);
      const q = (p: number) => sorted[Math.floor(p * (sorted.length - 1))];
      return { id, from: q(0.25), to: q(0.75), count: ds.length };
    })
    .sort((a, b) => b.count - a.count);
}

// ---------- Logros ----------

function longestStreak(dates: ISODate[]): number {
  const sorted = [...dates].sort();
  let best = 0;
  let run = 0;
  for (let i = 0; i < sorted.length; i++) {
    run = i > 0 && diffDays(sorted[i], sorted[i - 1]) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return best;
}

export function unlockedLogros(data: AppData, s: Summary, ref: ISODate = todayISO()): string[] {
  const dates = Object.keys(data.logs);
  const first = [...dates].sort()[0];
  const adh = pillAdherence(data, 30, ref);
  const out: string[] = [];
  if (longestStreak(dates) >= 7) out.push('racha7');
  if (s.cycles.length >= 1) out.push('ciclo1');
  if (adh && adh.expected >= 20 && adh.taken === adh.expected) out.push('pastilla30');
  if (first && diffDays(ref, first) >= 90) out.push('meses3');
  if (data.settings.lastBackup) out.push('respaldo1');
  if (data.dreams.length >= 3) out.push('suenos3');
  return out;
}

export function pillAdherence(data: AppData, days = 30, ref: ISODate = todayISO()): { taken: number; expected: number } | null {
  if (!data.settings.pillMode) return null;
  let taken = 0;
  let expected = 0;
  for (let i = 0; i < days; i++) {
    const d = addDays(ref, -i);
    const st = pillStatus(data.settings, d);
    if (st && !st.takesToday) continue;
    expected++;
    if (data.logs[d]?.pillTaken) taken++;
  }
  return { taken, expected };
}
