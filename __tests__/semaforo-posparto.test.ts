// Semáforo de hoy en posparto: rojo para lo que pide llamar a la médica, amarillo para cuidarse, verde si va bien.
import { describe, expect, jest, test } from '@jest/globals';
import { semaforoPosparto } from '../src/content/posparto';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

const base = { loquios: null, cicatriz: null, sleep: null, moods: [] as string[] };

describe('Semáforo posparto', () => {
  test('sin nada anotado no inventa un color', () => {
    expect(semaforoPosparto(base, 3, null).color).toBe('sin');
  });

  test('verde cuando lo anotado está dentro de lo esperado', () => {
    expect(semaforoPosparto({ ...base, loquios: 'rosado', cicatriz: 'Bien', sleep: 6 }, 3, [0, 0, 0, 0]).color).toBe('verde');
  });

  test('el rojo abundante es normal al principio y alarma después de la semana 2', () => {
    expect(semaforoPosparto({ ...base, loquios: 'rojo' }, 1, null).color).toBe('verde');
    expect(semaforoPosparto({ ...base, loquios: 'rojo' }, 3, null).color).toBe('rojo');
  });

  test('cicatriz con pus o idea de hacerse daño: rojo', () => {
    expect(semaforoPosparto({ ...base, cicatriz: 'Supura' }, 2, null).color).toBe('rojo');
    expect(semaforoPosparto(base, 2, [0, 0, 0, 1]).color).toBe('rojo');
  });

  test('poco sueño, ánimo bajo o escala cargada: amarillo', () => {
    expect(semaforoPosparto({ ...base, sleep: 3 }, 2, null).color).toBe('amarillo');
    expect(semaforoPosparto({ ...base, moods: ['triste'] }, 2, null).color).toBe('amarillo');
    expect(semaforoPosparto(base, 2, [2, 2, 1, 0]).color).toBe('amarillo');
  });
});
