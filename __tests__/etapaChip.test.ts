// Chip de «Hoy»: dice el modo y dónde están los datos.
import { describe, expect, jest, test } from '@jest/globals';
import { ETAPAS } from '../src/content/etapas';
import { textoEtapa } from '../src/lib/etapaChip';

jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'es', regionCode: 'VE' }] }));
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

describe('Chip de etapa en Hoy', () => {
  test('sin cuenta dice que los datos están en este teléfono', () => {
    expect(textoEtapa('ciclo', false)).toEqual({ emoji: '🌸', etapa: 'Ciclo regular', datos: 'Datos en este teléfono' });
  });
  test('con cuenta dice que hay copia en la cuenta', () => {
    expect(textoEtapa('ciclo', true).datos).toBe('Con copia en tu cuenta');
  });
  test('hay texto para los 6 modos', () => {
    for (const e of ETAPAS) { const x = textoEtapa(e.id, false); expect(x.etapa).toBe(e.label); expect(x.emoji.length).toBeGreaterThan(0); }
  });
});
