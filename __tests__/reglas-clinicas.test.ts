// Reglas clínicas y de privacidad de Savia, probadas contra el código real (no contra copias).
// Correr con: npm test
import { describe, expect, jest, test } from '@jest/globals';
import { calendarMarks, getPeriods, sinAtrasos, summarize } from '../src/lib/cycle';
import { reportHtml } from '../src/lib/backup';
import { addDays } from '../src/lib/dates';
import { emptyData, emptyLog } from '../src/lib/store';
import type { AppData, DayLog, ISODate, Settings } from '../src/lib/types';
import { fppDesdeSemanas, semanasEmbarazo, trimestre } from '../src/content/embarazo';
import { diasSinPeriodo, puntajeMrs } from '../src/content/menopausia';
import { MENSAJE_EDIMBURGO, nivelEdimburgo } from '../src/content/posparto';

jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'es', regionCode: 'VE' }] }));
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('../src/lib/nube', () => ({ nubeConfigurada: false, neon: null }));

// Datos de prueba: períodos de `dias` días con flujo medio que empiezan en cada fecha.
function datos(inicios: ISODate[], ajustes: Partial<Settings> = {}, dias = 4, extra: Partial<DayLog>[] = []): AppData {
  const d = emptyData();
  d.settings = { ...d.settings, onboarded: true, ...ajustes };
  for (const inicio of inicios) {
    for (let i = 0; i < dias; i++) {
      const f = addDays(inicio, i);
      d.logs[f] = { ...emptyLog(f), flow: 3 };
    }
  }
  for (const l of extra) d.logs[l.date!] = { ...emptyLog(l.date!), ...l };
  return d;
}

// Inicios de período separados por estas duraciones de ciclo.
function inicios(desde: ISODate, ciclos: number[]): ISODate[] {
  const out = [desde];
  for (const c of ciclos) out.push(addDays(out[out.length - 1], c));
  return out;
}

describe('Ciclo especial (SOP y ciclos de hasta 90 días)', () => {
  test('usa la mediana: un ciclo largo no arrastra la predicción', () => {
    const fechas = inicios('2026-01-01', [31, 32, 84, 30, 33]);
    const s = summarize(datos(fechas, { etapa: 'especial' }), addDays(fechas[fechas.length - 1], 5));
    expect(s.avgCycle).toBe(32); // la media daría 42
    expect(s.cycleRange).toEqual([30, 84]);
  });

  test('en ciclo regular el ciclo de 84 días queda fuera (máximo 50)', () => {
    const fechas = inicios('2026-01-01', [31, 32, 84, 30, 33]);
    const s = summarize(datos(fechas), addDays(fechas[fechas.length - 1], 5));
    expect(s.cycles.map((c) => c.length)).toEqual([31, 32, 30, 33]);
  });

  test('acepta ciclos de 90 días y descarta los de más', () => {
    const fechas = inicios('2025-06-01', [45, 52, 90, 140]);
    const s = summarize(datos(fechas, { etapa: 'especial' }), addDays(fechas[fechas.length - 1], 5));
    expect(s.cycles.map((c) => c.length)).toEqual([45, 52, 90]);
    expect(s.avgCycle).toBe(52);
  });

  test('no avisa de atrasos en ciclo especial, embarazo, posparto, menopausia ni tras una pérdida', () => {
    const base = emptyData().settings;
    for (const etapa of ['especial', 'embarazo', 'posparto', 'meno'] as const) expect(sinAtrasos({ ...base, etapa })).toBe(true);
    expect(sinAtrasos({ ...base, silencioEmbarazo: true })).toBe(true);
    expect(sinAtrasos(base)).toBe(false);
  });

  test('muestra un rango probable en vez de una fecha', () => {
    const fechas = inicios('2026-01-01', [45, 60, 50]);
    const s = summarize(datos(fechas, { etapa: 'especial' }), addDays(fechas[fechas.length - 1], 10));
    expect(s.ventana).not.toBeNull();
  });
});

describe('Manchado vs. período (todas las etapas)', () => {
  const manchado = (date: ISODate): Partial<DayLog> => ({ date, flow: 1 });

  test('un manchado suelto no inicia un período ni reinicia el ciclo', () => {
    const d = datos(['2026-09-01'], {}, 4, [manchado('2026-09-15')]);
    const s = summarize(d, '2026-09-20');
    expect(s.periods).toHaveLength(1);
    expect(s.lastStart).toBe('2026-09-01');
    expect(s.cycleDay).toBe(20);
  });

  test('el día 1 es el primer día de flujo real, aunque antes haya manchado', () => {
    const d = datos(['2026-09-02'], {}, 4, [manchado('2026-09-01')]);
    expect(getPeriods(d.logs)[0].start).toBe('2026-09-02');
  });

  test('fuera de ciclo especial, el manchado del final alarga el período', () => {
    const d = datos(['2026-09-01'], {}, 4, [manchado('2026-09-05')]);
    expect(getPeriods(d.logs)[0]).toMatchObject({ start: '2026-09-01', end: '2026-09-05', length: 5 });
    expect(getPeriods(d.logs, 2)[0].end).toBe('2026-09-04');
  });

  test('el calendario no pinta como período un manchado suelto', () => {
    const d = datos(['2026-09-01'], {}, 4, [manchado('2026-09-15')]);
    const marks = calendarMarks(d, summarize(d, '2026-09-20'), '2026-09-20');
    expect(marks['2026-09-02']?.period).toBe(true);
    expect(marks['2026-09-15']?.period).toBeUndefined();
  });
});

describe('Embarazo', () => {
  test('semanas y trimestre a partir de la fecha probable de parto', () => {
    const hoy = '2026-10-09';
    const fpp = fppDesdeSemanas(14, hoy);
    expect(fpp).toBe('2027-04-09'); // faltan 26 semanas
    expect(semanasEmbarazo(fpp, hoy)).toBe(14);
    expect(trimestre(13)).toBe(1);
    expect(trimestre(14)).toBe(2);
    expect(trimestre(28)).toBe(3);
  });

  test('sin fecha probable de parto arranca en la semana 4', () => {
    expect(semanasEmbarazo(null)).toBe(4);
  });
});

describe('Posparto: escala de Edimburgo adaptada', () => {
  test('cualquier respuesta distinta de "Nunca" en hacerse daño es urgente y da el 911', () => {
    expect(nivelEdimburgo([0, 0, 0, 1])).toBe('urgente');
    expect(MENSAJE_EDIMBURGO.urgente).toContain('911');
    expect(MENSAJE_EDIMBURGO.urgente).toContain('no es tu culpa');
  });

  test('sin riesgo, 5 puntos o más es "cargada"', () => {
    expect(nivelEdimburgo([2, 2, 1, 0])).toBe('cargada');
    expect(nivelEdimburgo([1, 1, 1, 0])).toBe('bien');
  });
});

describe('Menopausia', () => {
  test('cuenta los días desde el último sangrado', () => {
    const d = datos(['2025-09-01'], { etapa: 'meno' }, 1);
    expect(diasSinPeriodo(d, '2026-09-15')).toBe(379); // más de 12 meses
    expect(diasSinPeriodo(emptyData(), '2026-09-15')).toBeNull();
  });

  test('MRS: subescalas física, ánimo e íntima, y más de 16 es fuerte', () => {
    const r = [1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1];
    expect(puntajeMrs(r)).toMatchObject({ total: 15, fisicos: 4, animo: 8, intimos: 3 });
    expect(puntajeMrs(new Array(11).fill(2)).etiqueta).toMatch(/fuertes/);
  });
});

describe('Privacidad del resumen para la ginecóloga', () => {
  test('no incluye intimidad, notas personales, ánimo ni diario de sueños', () => {
    const d = datos(['2026-09-01', '2026-09-29'], { name: 'Ana' }, 4, [
      { date: '2026-09-10', intimidad: true, note: 'NOTA-PRIVADA', moods: ['triste'], symptoms: ['colicos'] },
    ]);
    d.dreams = [{ id: 's1', date: '2026-09-11', texto: 'SUENO-SECRETO' } as never];
    const html = reportHtml(d, summarize(d, '2026-10-05'));
    expect(html).not.toMatch(/intimidad:|relaciones sexuales registradas/i);
    expect(html).not.toContain('NOTA-PRIVADA');
    expect(html).not.toContain('SUENO-SECRETO');
    expect(html).not.toMatch(/ánimo(s)? por día|Notas de la usuaria/);
    expect(html).toContain('Síntomas más frecuentes');
  });
});
