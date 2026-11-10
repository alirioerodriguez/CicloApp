// Menopausia: qué gatillos acompañan los días con más bochornos.
import { describe, expect, jest, test } from '@jest/globals';
import { gatillosNotados } from '../src/content/menopausia';
import { addDays } from '../src/lib/dates';
import { emptyData, emptyLog } from '../src/lib/store';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('../src/lib/nube', () => ({ nubeConfigurada: false, neon: null }));

const REF = '2026-11-10';

function con(dias: { bochornos: number; gatillos: string[] }[]) {
  const d = emptyData();
  dias.forEach((x, i) => {
    const f = addDays(REF, -i);
    d.logs[f] = { ...emptyLog(f), ...x };
  });
  return d;
}

describe('Gatillos de bochornos', () => {
  test('marca el café si los días con café tienen bastantes más bochornos', () => {
    const d = con([
      ...Array.from({ length: 4 }, () => ({ bochornos: 6, gatillos: ['cafe'] })),
      ...Array.from({ length: 4 }, () => ({ bochornos: 2, gatillos: [] })),
    ]);
    const r = gatillosNotados(d, REF);
    expect(r.map((x) => x.id)).toEqual(['cafe']);
    expect(r[0].con).toBe(6);
    expect(r[0].sin).toBe(2);
  });

  test('no saca conclusiones con pocos días o sin diferencia', () => {
    expect(gatillosNotados(con([{ bochornos: 6, gatillos: ['cafe'] }, { bochornos: 6, gatillos: ['cafe'] }, ...Array.from({ length: 4 }, () => ({ bochornos: 2, gatillos: [] }))]), REF)).toEqual([]);
    expect(gatillosNotados(con(Array.from({ length: 8 }, (_, i) => ({ bochornos: 3, gatillos: i % 2 ? ['alcohol'] : [] }))), REF)).toEqual([]);
  });
});
