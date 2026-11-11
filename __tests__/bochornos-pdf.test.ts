// Menopausia: los bochornos y sus gatillos salen en el PDF y en el resumen para la médica.
import { describe, expect, jest, test } from '@jest/globals';
import { resumenBochornos } from '../src/content/menopausia';
import { consulta } from '../src/lib/consulta';
import { addDays, today } from '../src/lib/dates';
import { reportHtml } from '../src/lib/informe';
import { summarize as calcSummary } from '../src/lib/cycle';
import { emptyData, emptyLog } from '../src/lib/store';

jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'es', regionCode: 'AR' }] }));
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('../src/lib/nube', () => ({ nubeConfigurada: false, neon: null }));

function datos(meno: boolean) {
  const d = emptyData();
  d.settings.etapa = meno ? 'meno' : 'ciclo';
  const dias = [
    ...Array.from({ length: 4 }, () => ({ bochornos: 6, gatillos: ['cafe'], intensidad: 'Fuerte' })),
    ...Array.from({ length: 4 }, () => ({ bochornos: 2, gatillos: [] as string[], intensidad: 'Leve' })),
    { bochornos: 0, gatillos: [] as string[], intensidad: null },
  ];
  dias.forEach((x, i) => {
    const f = addDays(today(), -i);
    d.logs[f] = { ...emptyLog(f), ...x };
  });
  return d;
}

describe('Bochornos en el PDF para la médica', () => {
  test('resumen: días, promedio, máximo y días fuertes', () => {
    const r = resumenBochornos(datos(true))!;
    expect(r.registrados).toBe(9);
    expect(r.conBochornos).toBe(8);
    expect(r.promedio).toBeCloseTo(3.6, 1);
    expect(r.maximo).toBe(6);
    expect(r.fuertes).toBe(4);
  });

  test('sin registros de bochornos no hay resumen', () => {
    expect(resumenBochornos(emptyData())).toBeNull();
  });

  test('en modo menopausia el PDF trae la tarjeta y el gatillo; en otros modos no', () => {
    const d = datos(true);
    const html = reportHtml(d, calcSummary(d));
    expect(html).toContain('Bochornos (últimos 90 días)');
    expect(html).toContain('Café o mate');
    expect(html).toContain('no prueba que sea la causa');
    const c = datos(false);
    expect(reportHtml(c, calcSummary(c))).not.toContain('Bochornos (últimos 90 días)');
  });

  test('el resumen de consulta nombra el gatillo con los dos promedios', () => {
    const d = datos(true);
    const r = consulta(d, calcSummary(d), 3);
    expect(r.conversar.some((x) => x.includes('café o mate (6 vs. 1,6 por día)'))).toBe(true);
  });
});
