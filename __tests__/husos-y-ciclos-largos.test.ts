// Viajar entre países (Caracas UTC-4 → Madrid UTC+1) no tiene que mover ningún registro un día, y los ciclos atípicos
// (más de 50 o de 60 días, o un solo ciclo larguísimo) no tienen que romper las predicciones.
//
// El huso horario se fija al arrancar el proceso (en Node no se puede cambiar en caliente, sobre todo en Windows), así que
// `node scripts/probar-husos.js` corre esta misma prueba una vez por huso con la variable TZ. Con `npm test` corre en el huso
// de la máquina. Todo se compara contra valores fijos, que son los mismos en cualquier huso.
import { describe, expect, jest, test } from '@jest/globals';
import { diaDelBlister, tocaTomar } from '../src/lib/blister';
import { summarize } from '../src/lib/cycle';
import { addDays, diffDays, fromISO, toISO } from '../src/lib/dates';
import { emptyData, emptyLog } from '../src/lib/store';
import type { AppData, ISODate } from '../src/lib/types';

jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'es', regionCode: 'VE' }] }));
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('../src/lib/nube', () => ({ nubeConfigurada: false, neon: null }));

// Desfase (minutos al oeste de UTC) esperado el 15 de enero de 2026 en cada huso que usa scripts/probar-husos.js.
const DESFASE_ENERO: Record<string, number> = {
  'America/Caracas': 240,
  'Europe/Madrid': -60,
  'America/Argentina/Buenos_Aires': 180,
  'America/Los_Angeles': 480,
  'Pacific/Auckland': -780,
};

function historial(inicios: ISODate[], dias = 5): AppData {
  const d = emptyData();
  d.settings = { ...d.settings, onboarded: true, etapa: 'ciclo', cycleLength: 28, periodLength: 5 };
  for (const ini of inicios) for (let i = 0; i < dias; i++) { const f = addDays(ini, i); d.logs[f] = { ...emptyLog(f), flow: 3 }; }
  return d;
}

describe('Fechas y husos horarios', () => {
  test('(control) el proceso corre en el huso que pidió la variable TZ: si no, estas pruebas no probarían nada', () => {
    const tz = process.env.TZ;
    if (!tz) return; // npm test normal: se usa el huso de la máquina
    expect(DESFASE_ENERO[tz]).toBeDefined();
    expect(new Date(2026, 0, 15, 12).getTimezoneOffset()).toBe(DESFASE_ENERO[tz]);
  });

  test('sumar días y contar días da lo mismo cruzando los cambios de horario del norte y del sur', () => {
    for (const desde of ['2026-03-01', '2026-03-25', '2026-04-01', '2026-09-20', '2026-10-20', '2026-11-01']) {
      for (const n of [1, 7, 30, 45, 70, 180]) {
        const hasta = addDays(desde, n);
        expect(diffDays(hasta, desde)).toBe(n);
        expect(addDays(hasta, -n)).toBe(desde);
      }
    }
  });

  test('toISO(fromISO(x)) es x todos los días de más de un año (el mediodía local no se corre de día)', () => {
    let f: ISODate = '2026-01-01';
    for (let i = 0; i < 400; i++) { expect(toISO(fromISO(f))).toBe(f); f = addDays(f, 1); }
  });

  test('el historial de cuatro ciclos da siempre el mismo resumen', () => {
    const r = summarize(historial(['2026-07-03', '2026-07-31', '2026-08-29', '2026-09-26']), '2026-10-10');
    expect(r.cycles.map((c) => c.length)).toEqual([28, 29, 28]);
    expect(r.avgCycle).toBe(28);
    expect(r.cycleDay).toBe(15);
    expect(r.nextStart).toBe('2026-10-24');
    expect(r.daysToNext).toBe(14);
    expect(r.ovulation).toBe('2026-10-10');
  });

  test('viajar de Caracas a Madrid el mismo día no cambia el día del ciclo ni la próxima fecha', () => {
    const r = summarize(historial(['2026-09-12', '2026-10-10']), '2026-10-20');
    expect(r.cycleDay).toBe(11);
    expect(r.nextStart).toBe('2026-11-07');
  });

  test('el blíster marca las mismas pastillas y los mismos descansos, también con el cambio de horario de fin de octubre', () => {
    const b = { tipo: '21-7' as const, inicio: '2026-10-01', hora: '21:00', tipoPastilla: 'combinada' as const, activas: 21, inactivas: 7, inactivasPlacebo: false };
    const dias = Array.from({ length: 60 }, (_, i) => addDays('2026-10-01', i));
    const toma = dias.map((f) => (tocaTomar(b as never, f) ? 1 : 0)).join('');
    expect(toma.slice(0, 28)).toBe('1'.repeat(21) + '0'.repeat(7));
    expect(toma.slice(28, 56)).toBe('1'.repeat(21) + '0'.repeat(7));
    expect(diaDelBlister(b as never, '2026-10-29').numero).toBe(1);
  });
});

describe('Ciclos atípicos', () => {
  test('un ciclo de más de 60 días no se promedia como si fuera normal, y no rompe nada', () => {
    const d = historial(['2026-03-01', '2026-03-29', '2026-04-26', '2026-07-05' /* 70 días de ciclo */, '2026-08-02']);
    const r = summarize(d, '2026-08-20');
    expect(r.cycles.every((c) => c.length <= 50)).toBe(true);
    expect(r.avgCycle).toBeGreaterThanOrEqual(20);
    expect(r.avgCycle).toBeLessThanOrEqual(50);
    expect(r.nextStart).toBeTruthy();
    expect(Number.isFinite(r.cycleDay!)).toBe(true);
  });

  test('con un solo ciclo larguísimo (90 días) usa el ajuste de la usuaria y no inventa una fecha absurda', () => {
    const d = historial(['2026-05-01', '2026-07-30']);
    const r = summarize(d, '2026-08-15');
    expect(r.avgCycle).toBe(28);
    expect(r.nextStart).toBe(addDays('2026-07-30', 28));
  });

  test('ciclo especial (SOP): acepta ciclos de hasta 90 días y predice con la mediana, no con la media', () => {
    const d = historial(['2026-01-01', '2026-02-05', '2026-03-12', '2026-05-30' /* 79 días */, '2026-07-05'], 4);
    d.settings = { ...d.settings, etapa: 'especial', cycleLength: 35 };
    const r = summarize(d, '2026-07-20');
    expect(r.cycles.map((c) => c.length)).toEqual([35, 35, 79, 36]);
    expect(r.avgCycle).toBe(36); // la mediana; la media sería 46
    expect(r.ventana).not.toBeNull();
  });

  test('un atraso muy largo (casi 3 meses sin período) cuenta los días de atraso sin desbordar', () => {
    const d = historial(['2026-06-01', '2026-06-29']);
    const r = summarize(d, '2026-09-20');
    expect(r.lateDays).toBe(diffDays('2026-09-20', addDays('2026-06-29', 28))); // 55 días
    expect(r.cycleDay).toBe(diffDays('2026-09-20', '2026-06-29') + 1);
  });

  test('sin ningún registro no se rompe', () => {
    const r = summarize(emptyData(), '2026-10-01');
    expect(r.nextStart).toBeNull();
    expect(r.cycleDay).toBeNull();
  });
});
