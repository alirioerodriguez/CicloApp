// Widgets de iPhone (expo-widgets): qué muestran y que la cuenta cambie sola a medianoche.
import { describe, expect, jest, test } from '@jest/globals';
import { addDays } from '../src/lib/dates';
import { emptyData, emptyLog } from '../src/lib/store';
import type { AppData } from '../src/lib/types';
import { DIAS_ADELANTE, lineasDeTiempo, medianoche, propsPastilla, propsPeriodo } from '../src/widget/ios/datosIOS';
import { resumenCiclo } from '../src/widget/datosCiclo';
import { resumenWidget } from '../src/widget/datosWidget';

jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'es', regionCode: 'VE' }] }));
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('../src/lib/nube', () => ({ nubeConfigurada: false, neon: null }));

function conCiclo(discreto = false): AppData {
  const d = emptyData();
  d.settings = { ...d.settings, onboarded: true, cycleLength: 28, periodLength: 5, discreet: discreto };
  for (const inicio of ['2026-09-01', '2026-09-29']) for (let i = 0; i < 5; i++) d.logs[addDays(inicio, i)] = { ...emptyLog(addDays(inicio, i)), flow: 3 };
  return d;
}

function conPastilla(): AppData {
  const d = emptyData();
  d.settings = { ...d.settings, onboarded: true, pillMode: true };
  d.blister = { tipo: '21-7', inicio: '2026-10-01', hora: '21:00', tipoPastilla: 'combinada' };
  return d;
}

describe('Widget del período (iPhone)', () => {
  test('muestra los días que faltan, igual que en Android', () => {
    const p = propsPeriodo(resumenCiclo(conCiclo(), '2026-10-17'));
    expect(p.grande).toBe('10');
    expect(p.unidad).toBe('días para tu período');
    expect(p.color).toBe('rosa');
  });

  test('en modo discreto no dice «período»', () => {
    const p = propsPeriodo(resumenCiclo(conCiclo(true), '2026-10-17'));
    expect(p.unidad).not.toMatch(/período/);
  });

  test('sin registros invita a abrir la app', () => {
    expect(propsPeriodo(resumenCiclo(null)).grande).toBe('🌸');
  });
});

describe('Widget de la pastilla (iPhone)', () => {
  test('pastilla de hoy pendiente', () => {
    const p = propsPastilla(resumenWidget(conPastilla(), '2026-10-14'));
    expect(p).toMatchObject({ activo: true, titulo: 'Pastilla 14/21', marca: 'pendiente' });
    expect(p.estado).toContain('21:00');
  });

  test('ya tomada hoy', () => {
    const d = conPastilla();
    (d as unknown as { tomasPastilla: unknown }).tomasPastilla = { '2026-10-14': { hora: '21:04' } };
    const p = propsPastilla(resumenWidget(d, '2026-10-14'));
    expect(['tomada', 'tarde']).toContain(p.marca);
  });

  test('sin blíster pide configurarlo', () => {
    expect(propsPastilla(resumenWidget(emptyData(), '2026-10-14'))).toMatchObject({ activo: false, marca: 'pendiente' });
  });
});

describe('Línea de tiempo', () => {
  test('hoy y una entrada por cada medianoche de los próximos días', () => {
    const ahora = new Date(2026, 9, 17, 15, 30);
    const { periodo, pastilla } = lineasDeTiempo(conCiclo(), '2026-10-17', ahora);
    expect(periodo).toHaveLength(DIAS_ADELANTE + 1);
    expect(pastilla).toHaveLength(DIAS_ADELANTE + 1);
    expect(periodo[0].date).toBe(ahora);
    expect(periodo[1].date).toEqual(new Date(2026, 9, 18, 0, 0, 0));
    expect(periodo.map((e) => e.props.grande).slice(0, 3)).toEqual(['10', '9', '8']);
  });

  test('la medianoche es a las 00:00 locales, no al mediodía', () => {
    const m = medianoche('2026-11-02');
    expect([m.getFullYear(), m.getMonth(), m.getDate(), m.getHours(), m.getMinutes()]).toEqual([2026, 10, 2, 0, 0]);
  });

  test('el día siguiente la pastilla vuelve a estar pendiente', () => {
    const d = conPastilla();
    (d as unknown as { tomasPastilla: unknown }).tomasPastilla = { '2026-10-14': { hora: '21:04' } };
    const { pastilla } = lineasDeTiempo(d, '2026-10-14');
    expect(pastilla[1].props).toMatchObject({ titulo: 'Pastilla 15/21', marca: 'pendiente' });
  });
});
