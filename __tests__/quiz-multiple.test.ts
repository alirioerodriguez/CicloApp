// «¿Cómo estás de verdad?»: varias respuestas por pregunta, sin combinaciones contradictorias, 3 preguntas nuevas
// y todo traducido al inglés.
import { describe, expect, jest, test } from '@jest/globals';
import { alternar, areas, elegidas, idea, nivel, preguntas, type Pregunta } from '../src/content/quiz';

jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'en', regionCode: 'US' }] }));
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('../src/lib/nube', () => ({ nubeConfigurada: false, neon: null }));
import { t } from '../src/lib/region';

// Palabras que se escriben igual en los dos idiomas
const IGUALES = new Set(['Irritable']);
const ETAPAS = ['ciclo', 'embarazo', 'posparto', 'meno'] as const;
const q = (k: Pregunta['k']) => preguntas('ciclo').find((x) => x.k === k)!;

describe('Quiz con respuesta múltiple', () => {
  test('mantiene las 4 preguntas de antes, en el mismo orden, y suma 3 nuevas antes de «Lo que necesitas»', () => {
    expect(preguntas('ciclo').map((x) => x.k)).toEqual(['sueno', 'animo', 'cuerpo', 'carga', 'cuidado', 'compania', 'pide']);
    expect(q('sueno').titulo).toBe('¿Cómo has dormido y cómo anda tu energía?');
    expect(areas(preguntas('ciclo'))).toHaveLength(6);
  });

  test('se pueden elegir varias que no se contradicen', () => {
    let r = alternar(q('animo'), undefined, 1);
    r = alternar(q('animo'), r, 2);
    r = alternar(q('animo'), r, 3);
    expect(elegidas(r)).toEqual([1, 2, 3]);
  });

  test('elegir una opción desmarca la que la contradice', () => {
    // «Descansé bien» y «Agotada»
    let r = alternar(q('sueno'), undefined, 0);
    r = alternar(q('sueno'), r, 3);
    expect(elegidas(r)).toEqual([3]);
    // «Me cuesta dormir» convive con «Agotada», pero «Más o menos» no
    r = alternar(q('sueno'), r, 2);
    r = alternar(q('sueno'), r, 1);
    expect(elegidas(r)).toEqual([1, 2]);
    // «Acompañada» y «Sola»
    expect(elegidas(alternar(q('compania'), [0, 1], 3))).toEqual([1, 3]);
    // «Como a mis horas» y «Me salteo comidas»
    expect(elegidas(alternar(q('cuidado'), [0, 3], 1))).toEqual([1, 3]);
  });

  test('ningún par incompatible puede quedar elegido, en ninguna etapa', () => {
    for (const etapa of ETAPAS)
      for (const p of preguntas(etapa)) {
        for (const [a, b] of p.incompatibles) {
          expect(p.opciones[a]).toBeDefined();
          expect(p.opciones[b]).toBeDefined();
          expect(elegidas(alternar(p, [a], b))).not.toContain(a);
        }
      }
  });

  test('tocar de nuevo desmarca; sin nada elegido la pregunta queda sin responder', () => {
    expect(alternar(q('animo'), [2], 2)).toBeUndefined();
  });

  test('cada área vale lo que más pesa de lo elegido', () => {
    const qs = preguntas('ciclo');
    const r = nivel(qs, { sueno: [1, 2], animo: [0], cuerpo: 'x', carga: [3], cuidado: [0, 3], compania: [1] });
    expect(r.valores).toEqual([2, 0, null, 3, 0, 1]);
    expect(r.nivel).toBe('ajuste'); // promedio 1,2
    expect(r.peor).toBe(3); // «Carga»
  });

  test('lee las respuestas guardadas antes (un solo número)', () => {
    const r = nivel(preguntas('ciclo'), { sueno: 0, animo: 0, cuerpo: 0 });
    expect(r.nivel).toBe('calma');
  });

  test('la idea del día sigue lo pedido o, si no, el área que más pesa', () => {
    expect(idea('ciclo', [1, 3], 0)[0]).toBe('🫖'); // pidió varias: la primera de la lista
    expect(idea('ciclo', undefined, 3)[0]).toBe('📋');
    expect(idea('ciclo', 'x', 5)[0]).toBe('💬');
  });

  test('todos los textos del quiz están en inglés', () => {
    for (const etapa of ETAPAS)
      for (const p of preguntas(etapa)) {
        for (const txt of [p.kicker, p.titulo, p.ayuda, p.nota, p.area, ...p.opciones.flatMap((o) => [o[1], o[2]])].filter(Boolean))
          if (!IGUALES.has(txt)) expect([txt, t(txt) !== txt]).toEqual([txt, true]);
      }
    expect(t('Pregunta 5 de 7 · Lo que llevas encima')).toBe("Question 5 of 7 · What you're carrying");
    expect(t('7 preguntas · 2 minutos · tu flor de hoy')).toBe("7 questions · 2 minutes · today's flower");
  });
});
