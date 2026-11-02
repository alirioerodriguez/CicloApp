// Tendencia de los últimos ciclos (Savia+) y el corte del plan gratis.
import { describe, expect, test } from '@jest/globals';
import { CICLOS_GRATIS, CICLOS_PLUS, SAVIA_PLUS_COBRANDO, ciclosVisibles, tieneSaviaPlus } from '../src/lib/plus';
import { tendenciaCiclos, textoTendencia } from '../src/lib/tendencia';

const ciclos = (largos: number[]) => largos.map((length, i) => ({ start: `2026-${String(1 + Math.floor(i / 2)).padStart(2, '0')}-${i % 2 ? '15' : '01'}`, length }));

describe('Tendencia de los ciclos', () => {
  test('sin ciclos no hay tendencia', () => {
    expect(tendenciaCiclos([], 12)).toBeNull();
  });

  test('con menos de 6 ciclos muestra promedio y rango, sin rumbo', () => {
    const t = tendenciaCiclos(ciclos([28, 30, 29]), 12)!;
    expect(t.promedio).toBe(29);
    expect(t.rango).toEqual([28, 30]);
    expect(t.rumbo).toBeNull();
    expect(textoTendencia(t)).toBe('En tus últimos 3 ciclos: 29 días en promedio, entre 28 y 30.');
  });

  test('se vienen alargando', () => {
    const t = tendenciaCiclos(ciclos([28, 28, 28, 32, 33, 32]), 12)!;
    expect(t.rumbo).toBe('alargando');
    expect([t.antes, t.ahora]).toEqual([28, 32]);
    expect(textoTendencia(t)).toContain('se vienen alargando (de unos 28 a 32 días)');
  });

  test('se vienen acortando', () => {
    expect(tendenciaCiclos(ciclos([33, 32, 33, 28, 29, 28]), 12)!.rumbo).toBe('acortando');
  });

  test('una diferencia chica cuenta como estable', () => {
    expect(tendenciaCiclos(ciclos([28, 29, 28, 30, 30, 29]), 12)!.rumbo).toBe('estable');
  });

  test('toma solo los últimos que se pueden ver', () => {
    const t = tendenciaCiclos(ciclos([40, 40, 40, 28, 29, 30]), 3)!;
    expect(t.ciclos.map((c) => c.length)).toEqual([28, 29, 30]);
    expect(t.rumbo).toBeNull();
  });
});

describe('Savia+', () => {
  test('mientras no se cobre, todas ven los 12 ciclos', () => {
    expect(SAVIA_PLUS_COBRANDO).toBe(false);
    expect(tieneSaviaPlus()).toBe(true);
    expect(ciclosVisibles()).toBe(CICLOS_PLUS);
  });

  test('los límites son 3 gratis y 12 en Savia+', () => {
    expect([CICLOS_GRATIS, CICLOS_PLUS]).toEqual([3, 12]);
  });
});
