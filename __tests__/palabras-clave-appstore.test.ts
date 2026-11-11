// Las palabras clave de App Store viven en docs/app-store-iphone.md: máximo 100 caracteres y sin frases de anticoncepción.
import { describe, expect, it } from '@jest/globals';
import { readFileSync } from 'fs';
import { join } from 'path';

const doc = readFileSync(join(__dirname, '..', 'docs', 'app-store-iphone.md'), 'utf-8');
const linea = /Palabras clave de App Store[^\n]*\n+`([^`]+)`/.exec(doc)?.[1] ?? '';

describe('Palabras clave de App Store', () => {
  it('están en la guía', () => expect(linea.length).toBeGreaterThan(0));
  it('no pasan de 100 caracteres ni llevan espacios', () => {
    expect(linea.length).toBeLessThanOrEqual(100);
    expect(linea).not.toMatch(/\s/);
  });
  it('no usan palabras prohibidas por la ficha de salud', () => {
    expect(linea.toLowerCase()).not.toMatch(/anticonce|seguro|evitar|fertil|savia/);
  });
});
