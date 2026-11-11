// Android: el permiso de alarmas exactas se lee para reprogramar los avisos si cambia.
import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'es', regionCode: 'AR' }] }));
const mockGetExact = jest.fn<() => Promise<{ granted: boolean }>>();
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  registerTaskAsync: () => Promise.resolve(),
  setNotificationCategoryAsync: () => Promise.resolve(),
  BackgroundNotificationTaskResult: {},
  getExactAlarmPermissionsAsync: () => mockGetExact(),
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));
jest.mock('expo-task-manager', () => ({ defineTask: jest.fn() }));
jest.mock('../src/lib/nube', () => ({ nubeConfigurada: false, neon: null }));

import { Platform } from 'react-native';
import { alarmasExactasConcedidas } from '../src/lib/notifications';

describe('alarmasExactasConcedidas', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  beforeEach(() => {
    mockGetExact.mockReset();
    jest.replaceProperty(Platform, 'OS', 'android');
  });

  test('devuelve true o false según el permiso', async () => {
    mockGetExact.mockResolvedValueOnce({ granted: true });
    expect(await alarmasExactasConcedidas()).toBe(true);
    mockGetExact.mockResolvedValueOnce({ granted: false });
    expect(await alarmasExactasConcedidas()).toBe(false);
  });

  test('si el sistema no lo soporta, devuelve null y no rompe', async () => {
    mockGetExact.mockRejectedValueOnce(new Error('no soportado'));
    expect(await alarmasExactasConcedidas()).toBeNull();
  });

  test('en iPhone no aplica', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    expect(await alarmasExactasConcedidas()).toBeNull();
    expect(mockGetExact).not.toHaveBeenCalled();
  });
});
