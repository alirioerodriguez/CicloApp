// Reloj y apps de salud: unir días, subida de temperatura ("3 sobre 6"), promedios por fase y el PDF.
import { describe, expect, jest, test } from '@jest/globals';
import { summarize } from '../src/lib/cycle';
import { addDays } from '../src/lib/dates';
import { reportHtml } from '../src/lib/informe';
import { resumenPareja } from '../src/lib/pareja';
import { buscarSalto, desviosDesdeAbsolutos, fusionarDias, rangoALeer, resumenReloj } from '../src/lib/reloj';
import { emptyData } from '../src/lib/store';
import type { AppData, ISODate } from '../src/lib/types';

jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'es', regionCode: 'VE' }] }));
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('../src/lib/nube', () => ({ nubeConfigurada: false, neon: null }));

const flujo = (d: AppData, inicio: ISODate) => {
  for (let i = 0; i < 5; i++) {
    const f = addDays(inicio, i);
    d.logs[f] = { ...emptyData().logs[f], date: f, flow: 3, pain: 0, moods: [], symptoms: [], note: '', water: 0, sleep: null, pillTaken: false, pillTime: null, ovario: null, senos: [], intimidad: false, moco: null, temp: null, lh: null, loquios: null, tomas: [], cicatriz: null, bochornos: null, intensidad: null, despertares: null, despertoPor: [], sentir: null, menoExtra: [] };
  }
};

// Dos ciclos de 28 días (1 sep y 29 sep) con la temperatura subiendo 0,35 °C desde el día 15,
// y el pulso en reposo 3 lpm más alto en la fase lútea.
function datos(): AppData {
  const d = emptyData();
  d.settings = { ...d.settings, onboarded: true, name: 'Ana', red: { ...d.settings.red, on: true, enVivo: true } };
  for (const inicio of ['2026-09-01', '2026-09-29', '2026-10-27']) flujo(d, inicio);
  for (const inicio of ['2026-09-01', '2026-09-29']) {
    for (let i = 0; i < 28; i++) {
      const f = addDays(inicio, i);
      const lutea = i >= 14;
      d.reloj.dias[f] = { tempPiel: (lutea ? 0.3 : -0.05) + (i % 3) * 0.02, fcReposo: lutea ? 63 : 60, pasos: 8000, sueno: 420 };
    }
  }
  d.reloj.fuente = 'healthconnect';
  return d;
}

describe('Lectura', () => {
  test('lo nuevo pisa a lo viejo campo por campo y descarta valores raros', () => {
    expect(fusionarDias({ '2026-10-01': { pasos: 100, fcReposo: 60 } }, { '2026-10-01': { pasos: 200, vfc: NaN } })).toEqual({ '2026-10-01': { pasos: 200, fcReposo: 60 } });
  });

  test('la primera vez lee 4 meses; luego, desde 2 días antes de la última lectura', () => {
    expect(rangoALeer(null, '2026-10-23')).toEqual({ desde: '2026-06-25', hasta: '2026-10-23' });
    expect(rangoALeer('2026-10-20T08:00:00.000Z', '2026-10-23')).toEqual({ desde: '2026-10-18', hasta: '2026-10-23' });
  });

  test('la temperatura de la muñeca de Apple pasa a desvío sobre su propia línea base', () => {
    const abs: Record<ISODate, number> = {};
    for (let i = 0; i < 10; i++) abs[addDays('2026-10-01', i)] = 35.5;
    abs['2026-10-11'] = 35.9;
    expect(desviosDesdeAbsolutos(abs)['2026-10-11']).toBe(0.4);
    expect(desviosDesdeAbsolutos(abs)['2026-10-05']).toBe(0);
  });
});

describe('Subida de temperatura', () => {
  test('regla 3 sobre 6', () => {
    const serie = [0, 0.05, -0.02, 0.03, 0.01, 0.04, 0.1, 0.25, 0.3].map((valor, i) => ({ fecha: addDays('2026-10-01', i), valor }));
    expect(buscarSalto(serie)).toEqual({ fecha: '2026-10-07', subida: 0.25 });
  });

  test('sin subida clara no inventa nada', () => {
    const serie = [0, 0.05, -0.02, 0.03, 0.01, 0.04, 0.06, 0.05, 0.07].map((valor, i) => ({ fecha: addDays('2026-10-01', i), valor }));
    expect(buscarSalto(serie)).toBeNull();
  });

  test('una subida por ciclo y promedios por fase', () => {
    const d = datos();
    const r = resumenReloj(d, summarize(d, '2026-10-30'), '2026-10-30');
    expect(r.saltos.map((x) => [x.inicioCiclo, x.diaCiclo])).toEqual([
      ['2026-09-01', 15],
      ['2026-09-29', 15],
    ]);
    expect(r.porFase.lutea.fcReposo).toBe(63);
    expect(r.porFase.folicular.fcReposo).toBe(60);
    expect(r.difFcReposo).toBe(3);
    expect(r.difTemp).toBeGreaterThan(0.3);
    expect(r.curva.length).toBe(28);
  });
});

describe('Privacidad y PDF', () => {
  test('los datos del reloj nunca viajan a la pareja', () => {
    const d = datos();
    expect(JSON.stringify(resumenPareja(d, summarize(d, '2026-10-30')))).not.toMatch(/reloj|tempPiel|fcReposo|pasos/);
  });

  test('el PDF suma una tercera página solo si ella lo deja encendido', () => {
    const d = datos();
    const con = reportHtml(d, summarize(d));
    expect(con).toContain('Subida de temperatura por ciclo');
    expect(con).toContain('3 de 3');
    d.settings = { ...d.settings, pdfReloj: false };
    const sin = reportHtml(d, summarize(d));
    expect(sin).not.toContain('Subida de temperatura por ciclo');
    expect(sin).toContain('2 de 2');
  });
});
