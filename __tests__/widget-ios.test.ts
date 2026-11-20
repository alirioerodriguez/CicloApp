// Widgets de iPhone (expo-widgets): qué muestran y que la cuenta cambie sola a medianoche.
import { describe, expect, jest, test } from '@jest/globals';
import { addDays } from '../src/lib/dates';
import { emptyData, emptyLog } from '../src/lib/store';
import type { AppData } from '../src/lib/types';
import { DIAS_ADELANTE, lineaPastilla, lineasDeTiempo, medianoche, propsPareja, propsPastilla, propsPeriodo, tomasDelWidget } from '../src/widget/ios/datosIOS';
import { vistaPareja, type ResumenPareja } from '../src/lib/pareja';
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
    const p = propsPeriodo(resumenCiclo(null));
    expect(p.flor).toBe(true);
    expect(p.grande).toBe('');
  });
});

describe('Widget de la pastilla (iPhone)', () => {
  test('pastilla de hoy pendiente', () => {
    const p = propsPastilla(resumenWidget(conPastilla(), '2026-10-14', '10:00'), '2026-10-14');
    expect(p).toMatchObject({ activo: true, titulo: 'Pastilla 14/21', marca: 'pendiente', boton: true, fecha: '2026-10-14' });
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

describe('«Aún no tomaste tu pastilla» y el botón del widget', () => {
  test('pasada su hora y sin marcar, el widget lo dice (en Android y en iPhone)', () => {
    const antes = resumenWidget(conPastilla(), '2026-10-14', '20:59');
    const despues = resumenWidget(conPastilla(), '2026-10-14', '21:00');
    expect(antes).toMatchObject({ atrasada: false });
    expect(despues).toMatchObject({ atrasada: true });
    expect(propsPastilla(despues, '2026-10-14')).toMatchObject({ estado: 'Aún no tomaste tu pastilla', atrasada: true, boton: true });
  });

  test('ya marcada, no hay aviso ni botón', () => {
    const d = conPastilla();
    (d as unknown as { tomasPastilla: unknown }).tomasPastilla = { '2026-10-14': { hora: '20:10' } };
    const p = propsPastilla(resumenWidget(d, '2026-10-14', '22:00'), '2026-10-14');
    expect(p).toMatchObject({ boton: false, atrasada: false });
    expect(p.estado).not.toContain('Aún no');
  });

  test('la línea de tiempo pasa sola a «Aún no…» a la hora de la pastilla, cada día', () => {
    const ahora = new Date(2026, 9, 14, 9, 0);
    const linea = lineaPastilla(conPastilla(), '2026-10-14', ahora, 2);
    expect(linea.map((e) => [e.date.getDate(), e.date.getHours(), e.props.atrasada])).toEqual([
      [14, 9, false],
      [14, 21, true],
      [15, 0, false],
      [15, 21, true],
      [16, 0, false],
      [16, 21, true],
    ]);
  });

  test('si ya pasó la hora al abrir, no agrega otra entrada para hoy', () => {
    const linea = lineaPastilla(conPastilla(), '2026-10-14', new Date(2026, 9, 14, 22, 0), 1);
    expect(linea).toHaveLength(3);
    expect(linea[0].props.atrasada).toBe(true);
  });

  test('la app lee las tomas marcadas en el widget, una por día y solo las válidas', () => {
    expect(
      tomasDelWidget([
        { props: { fecha: '2026-10-14', tomadaWidget: '21:05' } },
        { props: { fecha: '2026-10-14', tomadaWidget: '22:00' } },
        { props: { fecha: '2026-10-15', tomadaWidget: null } },
        { props: { fecha: 'basura', tomadaWidget: '10:00' } },
        { props: { fecha: '2026-10-16', tomadaWidget: '9:00' } },
      ]),
    ).toEqual([{ fecha: '2026-10-14', hora: '21:05' }]);
  });
});

describe('Widget de pareja (iPhone)', () => {
  const resumen: ResumenPareja = { v: 1, nombre: 'Ana', etapa: 'ciclo', compartir: ['fase', 'energia', 'periodo', 'ayuda'], ciclo: { inicio: '2026-10-27', largo: 28, sangrado: 5, rango: null }, fpp: null, nacimiento: null };

  test('fase, cómo se siente, misión, plan y comida del día', () => {
    const p = propsPareja(vistaPareja(resumen, 'VE', '2026-11-14'));
    expect(p).toMatchObject({ conectada: true, titulo: 'Ana está en su fase lútea', linea: 'Su período: en 10 días' });
    for (const k of ['como', 'mision', 'plan', 'plato'] as const) expect(p[k].length).toBeGreaterThan(5);
    expect(p.rotulos.como).toBe('CÓMO SE SIENTE');
  });

  test('el plan y la comida cambian de un día a otro', () => {
    const dias = ['2026-11-12', '2026-11-13', '2026-11-14'].map((d) => propsPareja(vistaPareja(resumen, 'VE', d)));
    expect(new Set(dias.map((p) => p.plan)).size).toBeGreaterThan(1);
    expect(new Set(dias.map((p) => p.plato)).size).toBeGreaterThan(1);
  });

  test('si ella no comparte «cómo puede ayudarme», no hay consejos', () => {
    const p = propsPareja(vistaPareja({ ...resumen, compartir: ['fase'] }, 'VE', '2026-11-14'));
    expect(p).toMatchObject({ mision: '', plan: '', plato: '' });
  });

  test('sin conexión invita a conectar', () => {
    expect(propsPareja(null)).toMatchObject({ conectada: false });
  });

  test('una semana por delante en la línea de tiempo', () => {
    const { pareja } = lineasDeTiempo(null, '2026-11-14', new Date(2026, 10, 14, 10), { resumen, leido: 'x', avisos: true });
    expect(pareja).toHaveLength(DIAS_ADELANTE + 1);
    expect(pareja[0].props.titulo).toBe('Ana está en su fase lútea');
  });
});
