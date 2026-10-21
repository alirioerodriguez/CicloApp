// Señales para comentar en la consulta, detectadas a partir de los registros.
// Umbrales de FIGO/ACOG; los marcados (CP) son criterio práctico y conviene que los revise una ginecóloga.
// Fuentes: [1] [2] [5] [11] [13] [14] [16] [29]–[34] [38]–[40].
import type { Period, Summary } from './cycle';
import { addDays, diffDays, today as todayISO } from './dates';
import type { AppData, DayLog, ISODate } from './types';

export interface Alerta {
  id: string;
  nivel: 'consulta' | 'info';
  texto: string;
}

const NEGATIVE_MOODS = ['triste', 'ansiosa', 'irritable', 'cambios_humor', 'abrumada'];
const CICLO_CORTO = 24; // FIGO
const CICLO_LARGO = 38; // FIGO
const VARIACION_MAX = 7; // FIGO, sin conocer la edad
const PERIODO_LARGO = 7; // ACOG
const RETRASO_DIAS = 7; // (CP)
const SIN_PERIODO_DIAS = 90;
const DOLOR_FUERTE = 7; // (CP)

function logsBetween(data: AppData, from: ISODate, to: ISODate): DayLog[] {
  const out: DayLog[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) if (data.logs[d]) out.push(data.logs[d]);
  return out;
}

function maxPain(data: AppData, p: Period): number {
  return Math.max(0, ...logsBetween(data, p.start, p.end).map((l) => l.pain));
}

// Índice del período al que pertenece una fecha (el último que empezó antes o ese día).
function cycleIndex(date: ISODate, periods: Period[]): number {
  let idx = -1;
  for (let i = 0; i < periods.length && periods[i].start <= date; i++) idx = i;
  return idx;
}

function cyclesWith(data: AppData, periods: Period[], test: (l: DayLog) => boolean): number {
  const set = new Set<number>();
  for (const l of Object.values(data.logs)) if (test(l)) set.add(cycleIndex(l.date, periods));
  return set.size;
}

function inAnyPeriod(date: ISODate, periods: Period[]) {
  return periods.some((p) => date >= p.start && date <= p.end);
}

export function detectAlertas(data: AppData, s: Summary, ref: ISODate = todayISO()): Alerta[] {
  const out: Alerta[] = [];
  const add = (id: string, nivel: Alerta['nivel'], texto: string) => out.push({ id, nivel, texto });
  const pill = data.settings.pillMode;
  const periods = s.periods;
  const cycles = s.cycles;
  const last2 = cycles.slice(-2);

  if (!pill) {
    if (last2.length === 2 && last2.every((c) => c.length < CICLO_CORTO))
      add('ciclos-cortos', 'consulta', `Tus últimos ciclos duraron menos de ${CICLO_CORTO} días. Vale la pena comentarlo en tu próxima consulta.`);
    if (last2.length === 2 && last2.every((c) => c.length > CICLO_LARGO))
      add('ciclos-largos', 'consulta', `Tus últimos ciclos duraron más de ${CICLO_LARGO} días. Vale la pena comentarlo en tu próxima consulta.`);
    if (cycles.length >= 6 && s.cycleRange && s.cycleRange[1] - s.cycleRange[0] > VARIACION_MAX)
      add('irregular', 'consulta', 'Tus ciclos están variando bastante. A veces pasa, pero es buena idea comentarlo con tu ginecóloga.');
    if (s.lastStart && diffDays(ref, s.lastStart) >= SIN_PERIODO_DIAS)
      add('sin-periodo', 'consulta', 'Llevas unos 3 meses sin período. Es un buen momento para consultar con tu ginecóloga.');
    else if (s.lateDays >= RETRASO_DIAS && !data.settings.ocultarRetrasos)
      add('retraso', 'info', 'Tu período viene con retraso. Puede pasar por estrés o cambios; si hay posibilidad de embarazo, una prueba casera puede aclararlo.');
  }

  const done = periods.filter((p) => diffDays(ref, p.end) > 1).slice(-2);
  if (done.some((p) => p.length > PERIODO_LARGO))
    add('periodo-largo', 'consulta', 'Tu período duró más de 7 días. Si se repite, coméntalo con tu ginecóloga.');

  // Sangrado abundante: flujo 4 dos días o más en un mismo período (CP), o coágulos grandes.
  const recent = periods.slice(-2);
  const heavy = recent.some((p) => {
    const ls = logsBetween(data, p.start, p.end);
    return ls.filter((l) => l.flow >= 4).length >= 2 || ls.some((l) => l.symptoms.includes('coagulos'));
  });
  if (heavy) add('abundante', 'consulta', 'Parece que tu sangrado es abundante. Si se repite, coméntalo con tu ginecóloga: hay tratamientos que ayudan.');

  // Manchado entre períodos en 2 ciclos (CP). Con pastilla: solo si sigue en 3 meses distintos.
  const spotting = (l: DayLog) => l.symptoms.includes('manchado') && !inAnyPeriod(l.date, periods);
  if (pill) {
    const months = new Set(Object.values(data.logs).filter((l) => spotting(l) && diffDays(ref, l.date) <= 120).map((l) => l.date.slice(0, 7)));
    if (months.size >= 3) add('pastilla-manchado', 'consulta', 'Sigues con sangrados fuera de lo esperado. Coméntalo con tu ginecóloga.');
  } else if (cyclesWith(data, periods, spotting) >= 2) {
    add('manchado', 'consulta', 'Notaste sangrado entre períodos. Si se repite o pasa después de las relaciones, coméntalo con tu médico.');
  }

  // Dolor.
  const painPeriods = periods.slice(-3).map((p) => maxPain(data, p));
  const last2Pain = painPeriods.slice(-2);
  if (last2Pain.length === 2 && last2Pain.every((p) => p >= DOLOR_FUERTE))
    add('dolor-fuerte', 'consulta', 'Tu dolor ha sido fuerte varios ciclos. No tienes que aguantarlo: coméntalo con tu ginecóloga.');
  else if (painPeriods.length === 3 && painPeriods[0] < painPeriods[1] && painPeriods[1] < painPeriods[2] && painPeriods[2] >= 5)
    add('dolor-aumenta', 'consulta', 'Tu dolor parece ir en aumento. Es buena idea consultarlo con tu ginecóloga.');

  if (cyclesWith(data, periods, (l) => l.symptoms.includes('dolor_relaciones')) >= 2)
    add('dolor-relaciones', 'consulta', 'Registraste dolor en las relaciones más de una vez. Es algo que vale la pena consultar.');

  if (Object.values(data.logs).some((l) => l.symptoms.includes('flujo_inusual') && diffDays(ref, l.date) <= 30))
    add('flujo-inusual', 'info', 'Si el flujo cambió de color u olor, o tienes picazón, coméntalo con tu médico.');

  // Posible falta de hierro (CP): cansancio y mareo frecuentes junto a sangrado abundante.
  const last60 = Object.values(data.logs).filter((l) => diffDays(ref, l.date) <= 60);
  if (heavy && last60.filter((l) => l.symptoms.includes('cansancio')).length >= 3 && last60.filter((l) => l.symptoms.includes('mareo')).length >= 2)
    add('hierro', 'consulta', 'Cansancio y mareo junto a períodos abundantes pueden tener relación con el hierro. Coméntalo con tu médico.');

  if (pill && !data.settings.pillType.startsWith('pop') && Object.values(data.logs).some((l) => l.symptoms.includes('migrana') && diffDays(ref, l.date) <= 90))
    add('migrana-pastilla', 'consulta', 'Si empiezas a tener migrañas, sobre todo con luces o visión rara antes del dolor, cuéntale a tu médico que tomas la pastilla.');

  // SPM / TDPM: comparar los 7 días antes del período con una semana de la fase folicular.
  if (!pill && cycles.length >= 2) {
    let spm = 0;
    let tdpmRun = 0;
    let tdpm = false;
    for (const c of cycles.slice(-6)) {
      const next = addDays(c.start, c.length);
      const lutea = logsBetween(data, addDays(next, -7), addDays(next, -1));
      const foli = logsBetween(data, addDays(c.start, 5), addDays(c.start, 11));
      const sym = (ls: DayLog[]) => ls.filter((l) => l.symptoms.length || l.moods.some((m) => NEGATIVE_MOODS.includes(m))).length;
      const neg = (ls: DayLog[]) => ls.filter((l) => l.moods.some((m) => NEGATIVE_MOODS.includes(m))).length;
      if (sym(lutea) >= 2 && sym(lutea) > sym(foli)) spm++;
      if (neg(lutea) >= 4 && neg(foli) <= 1) {
        tdpmRun++;
        if (tdpmRun >= 2) tdpm = true;
      } else tdpmRun = 0;
    }
    if (tdpm)
      add('tdpm', 'consulta', 'Antes de tu período el ánimo se te pone muy cuesta arriba. Si afecta tu día o tus relaciones, háblalo con tu médico: hay ayuda.');
    else if (spm >= 2)
      add('spm', 'info', 'Algunos síntomas aparecen antes de tu período y se van cuando empieza. Eso se llama SPM y es muy común.');
  }

  return out;
}
