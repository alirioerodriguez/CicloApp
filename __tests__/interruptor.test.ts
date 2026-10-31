// Interruptor estilo iPhone: medidas y recorrido de la perilla.
import { describe, expect, jest, test } from '@jest/globals';

jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'es', regionCode: 'VE' }] }));
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('expo-haptics', () => ({ selectionAsync: jest.fn(() => Promise.resolve()) }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }));

import { INTERRUPTOR, recorridoPerilla } from '../src/components/ui';

describe('Interruptor como el del iPhone', () => {
  test('mide 51 × 31 con una perilla de 27 y 2 de margen', () => {
    expect(INTERRUPTOR).toMatchObject({ ancho: 51, alto: 31, perilla: 27, margen: 2 });
    expect(INTERRUPTOR.margen * 2 + INTERRUPTOR.perilla).toBe(INTERRUPTOR.alto);
  });
  test('apagado la perilla queda a la izquierda y prendido llega al otro margen (20 px)', () => {
    expect(recorridoPerilla(false, false)).toBe(0);
    expect(recorridoPerilla(true, false)).toBe(20);
  });
  test('al apretarlo la perilla se ensancha a 33 y prendido no se sale de la pista', () => {
    expect(INTERRUPTOR.perillaApretada).toBe(33);
    const { ancho, margen, perillaApretada } = INTERRUPTOR;
    expect(INTERRUPTOR.margen + recorridoPerilla(true, true) + perillaApretada + margen).toBe(ancho);
  });
});
