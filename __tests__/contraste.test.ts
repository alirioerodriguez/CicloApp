// Contraste WCAG 2.2 AA (≥ 4,5:1 para texto normal) de los colores de la app, en Día y Noche y con los 12 tonos.
import { describe, expect, it } from '@jest/globals';
import { TONOS, construirColores, type Colors } from '../src/lib/theme';

type RGBA = { r: number; g: number; b: number; a: number };

/** «#RRGGBB», «#RRGGBBAA» o «rgba(r,g,b,a)». */
function leer(color: string): RGBA {
  const rgba = /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/.exec(color);
  if (rgba) return { r: +rgba[1], g: +rgba[2], b: +rgba[3], a: +rgba[4] };
  const hex = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(color);
  if (!hex) throw new Error(`Color desconocido: ${color}`);
  const n = parseInt(hex[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: hex[2] ? parseInt(hex[2], 16) / 255 : 1 };
}

/** Color con transparencia puesto sobre un fondo opaco. */
function sobre(frente: string, fondo: string): RGBA {
  const f = leer(frente);
  const b = leer(fondo);
  return { r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a), a: 1 };
}

function luminancia({ r, g, b }: RGBA): number {
  const c = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

export function contraste(frente: string, fondo: string): number {
  const a = luminancia(sobre(frente, fondo));
  const b = luminancia(leer(fondo));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const AA = 4.5;
const modos = [
  { nombre: 'Día', dark: false },
  { nombre: 'Noche', dark: true },
];

describe('cálculo de contraste', () => {
  it('coincide con valores conocidos de WCAG', () => {
    expect(contraste('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contraste('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
    expect(contraste('#777777', '#FFFFFF')).toBeCloseTo(4.48, 2); // el famoso gris que no llega a AA
    expect(contraste('#767676', '#FFFFFF')).toBeCloseTo(4.54, 2);
  });

  it('pone la transparencia sobre el fondo antes de medir', () => {
    // Negro al 50 % sobre blanco = gris medio (sRGB ~127,5), contra blanco: ~4,0.
    expect(contraste('rgba(0,0,0,0.5)', '#FFFFFF')).toBeCloseTo(4.0, 1);
    expect(contraste('#00000080', '#FFFFFF')).toBeCloseTo(4.0, 1);
    expect(contraste('rgba(0,0,0,0.5)', '#FFFFFF')).toBeLessThan(AA); // por eso el 0,58 original no alcanzaba
  });
});

describe.each(modos)('contraste AA en modo $nombre', ({ dark }) => {
  const todos = TONOS.map((t) => ({ tono: t.id, c: construirColores(t.id, dark) }));
  const base = todos[0].c;

  it('el texto principal se lee sobre el fondo y sobre las tarjetas', () => {
    expect(contraste(base.text, base.bg)).toBeGreaterThanOrEqual(AA);
    expect(contraste(base.text, base.card)).toBeGreaterThanOrEqual(AA);
  });

  it('el texto secundario («muted») se lee sobre el fondo y sobre las tarjetas', () => {
    expect(contraste(base.muted, base.bg)).toBeGreaterThanOrEqual(AA);
    expect(contraste(base.muted, base.card)).toBeGreaterThanOrEqual(AA);
  });

  it('el texto secundario también se lee sobre los fondos suaves de las tarjetas de color', () => {
    for (const fondo of [base.lavandaSuave, base.salviaSuave, base.duraznoSuave]) {
      expect(contraste(base.muted, fondo)).toBeGreaterThanOrEqual(AA);
      expect(contraste(base.text, fondo)).toBeGreaterThanOrEqual(AA);
    }
  });

  it.each(todos)('con el tono $tono: el color de acento como texto se lee sobre el fondo y las tarjetas', ({ c }) => {
    expect(contraste(c.rosa, c.bg)).toBeGreaterThanOrEqual(AA);
    expect(contraste(c.rosa, c.card)).toBeGreaterThanOrEqual(AA);
  });

  it.each(todos)('con el tono $tono: el texto de los botones de acento se lee sobre el acento', ({ c }: { c: Colors }) => {
    expect(contraste(c.onAccent, c.rosa)).toBeGreaterThanOrEqual(AA);
  });
});
