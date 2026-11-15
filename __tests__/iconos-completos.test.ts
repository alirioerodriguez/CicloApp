// Ningún icono se queda en blanco: cada respuesta del quiz tiene icono, y cada icono del mapa tiene su dibujo.
import { describe, expect, jest, test } from '@jest/globals';
jest.mock('react-native-svg', () => ({}));
jest.mock('../src/lib/theme', () => ({ useColors: () => ({}) }));
import { iconoDe } from '../src/components/Icono';
import { TRAZOS } from '../src/components/trazos-iconos';
import { preguntas } from '../src/content/quiz';
import { ETAPAS } from '../src/content/etapas';

describe('Iconos completos', () => {
  test('cada respuesta del quiz, en todas las etapas, tiene icono con dibujo', () => {
    for (const etapa of ['ciclo', 'embarazo', 'posparto', 'meno'] as const)
      for (const q of preguntas(etapa))
        for (const [e, titulo] of q.opciones) {
          const nombre = iconoDe(e);
          expect([titulo, nombre && !!TRAZOS[nombre]]).toEqual([titulo, true]);
        }
  });
  test('las etapas tienen icono con dibujo', () => {
    for (const x of ETAPAS) expect([x.label, !!TRAZOS[iconoDe(x.emoji) ?? '']]).toEqual([x.label, true]);
  });
});
