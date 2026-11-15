// Frases de «¿Cómo estás de verdad?» según lo que respondió: una por respuesta, combinaciones y cierre del día.
import { describe, expect, jest, test } from '@jest/globals';
import { preguntas, type Pregunta } from '../src/content/quiz';
import { COMBOS, FRASES, LECTURAS, fraseDelDia, lecturas } from '../src/content/quizLecturas';

jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'en', regionCode: 'US' }] }));
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('../src/lib/nube', () => ({ nubeConfigurada: false, neon: null }));
import { t } from '../src/lib/region';

const ETAPAS = ['ciclo', 'embarazo', 'posparto', 'meno'] as const;
const qs = preguntas('ciclo');
const idx = (k: Pregunta['k'], titulo: string) => qs.find((q) => q.k === k)!.opciones.findIndex((o) => o[1] === titulo);

describe('Frases según las respuestas', () => {
  test('cada respuesta de cada etapa tiene su frase', () => {
    for (const etapa of ETAPAS)
      for (const q of preguntas(etapa)) {
        if (q.k === 'pide') continue;
        for (const o of q.opciones) expect([`${q.k}:${o[1]}`, !!LECTURAS[`${q.k}:${o[1]}`]]).toEqual([`${q.k}:${o[1]}`, true]);
      }
  });

  test('si dos respuestas se explican entre sí, eso va primero', () => {
    const r = lecturas(qs, { animo: [idx('animo', 'Ansiosa o triste')], compania: [idx('compania', 'Sola')], cuerpo: [idx('cuerpo', 'Hinchazón')] });
    expect(r[0]).toMatch(/triste y sola/);
    // no repite por separado lo que ya dijo la combinación
    expect(r.some((x) => x === LECTURAS['compania:Sola'])).toBe(false);
    expect(r).toContain(LECTURAS['cuerpo:Hinchazón']);
  });

  test('cansancio + carga, irritable + mal dormir', () => {
    const r = lecturas(qs, { sueno: [idx('sueno', 'Agotada')], carga: [idx('carga', 'Desbordada')], animo: [idx('animo', 'Irritable')] });
    expect(r[0]).toMatch(/Mucha carga y poco descanso/);
    expect(r[1]).toMatch(/irritabilidad/);
    expect(r.length).toBeLessThanOrEqual(3);
  });

  test('lo que más pesa va antes; lo tranquilo no se mezcla con lo que pesa', () => {
    const r = lecturas(qs, { sueno: [idx('sueno', 'Descansé bien')], cuerpo: [idx('cuerpo', 'Cólicos o dolor')], cuidado: [idx('cuidado', 'Casi no me muevo')] });
    expect(r[0]).toMatch(/movimiento suave/); // combinación: casi no me muevo + dolor
    expect(r).toContain(LECTURAS['cuerpo:Cólicos o dolor']);
    expect(r).not.toContain(LECTURAS['sueno:Descansé bien']);
  });

  test('si todo está tranquilo, lo reconoce', () => {
    const r = lecturas(qs, { sueno: [0], animo: [0], carga: [0] });
    expect(r[0]).toMatch(/equilibrio/);
  });

  test('sin respuestas (o «No sé»), no inventa nada', () => {
    expect(lecturas(qs, { sueno: 'x', animo: 'x' })).toEqual([]);
  });

  test('la frase de cierre cambia con el día y es del nivel correcto', () => {
    const dias = ['2026-11-15', '2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20'];
    const vistas = new Set(dias.map((d) => fraseDelDia('ajuste', d)));
    expect(vistas.size).toBeGreaterThan(2);
    vistas.forEach((f) => expect(FRASES.ajuste).toContain(f));
  });

  test('todo está en inglés', () => {
    const textos = [...Object.values(LECTURAS), ...COMBOS.map((c) => c.texto), ...Object.values(FRASES).flat(), 'Lo que nos cuentas'];
    for (const x of textos) expect([x, t(x) !== x]).toEqual([x, true]);
  });
});
