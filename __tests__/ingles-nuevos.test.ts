// Con el teléfono en inglés, la tendencia de los ciclos y el cambio de etapa también salen en inglés.
import { describe, expect, jest, test } from '@jest/globals';
import { t } from '../src/lib/region';
import { tendenciaCiclos, textoTendencia } from '../src/lib/tendencia';
import { transicion } from '../src/lib/transicion';
import { DEFAULT_SETTINGS } from '../src/lib/store';

jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'en', regionCode: 'US' }] }));
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('../src/lib/nube', () => ({ nubeConfigurada: false, neon: null }));

const ciclos = (largos: number[]) => largos.map((length, i) => ({ start: `2026-01-${String(i + 1).padStart(2, '0')}`, length }));

describe('Inglés en lo nuevo', () => {
  test('tendencia de los ciclos', () => {
    expect(t(textoTendencia(tendenciaCiclos(ciclos([28, 28, 28, 32, 33, 32]), 12)!))).toBe(
      'In your last 6 cycles: 30 days on average, between 28 and 33. Lately they have been getting longer (from about 28 to 32 days).',
    );
    expect(t(textoTendencia(tendenciaCiclos(ciclos([28, 30, 29]), 12)!))).toBe('In your last 3 cycles: 29 days on average, between 28 and 30.');
  });

  test('cambio de etapa', () => {
    const tr = transicion({ ...DEFAULT_SETTINGS, etapa: 'posparto' }, 'ciclo');
    expect(tr.cambios.map(t)).toEqual(['Your history stays saved: nothing is deleted.', 'Period prediction is back: it adjusts as you log.']);
  });
});
