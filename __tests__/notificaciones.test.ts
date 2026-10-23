// Blíster digital, parte 5: recordatorios de la pastilla y botón "Ya la tomé" sin abrir la app.
import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { CLAVE_ACTIVA } from '../src/lib/blister';
import { summarize } from '../src/lib/cycle';
import { rescheduleAll } from '../src/lib/notifications';
import { emptyData } from '../src/lib/store';
import { guardarTomaSinApp, idSegundoAviso } from '../src/lib/tareaPastilla';
import type { AppData } from '../src/lib/types';

jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'es', regionCode: 'VE' }] }));
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('../src/lib/nube', () => ({ nubeConfigurada: false, neon: null }));
jest.mock('expo-task-manager', () => ({ defineTask: jest.fn() }));
jest.mock('react-native-android-widget', () => ({ requestWidgetUpdate: jest.fn(() => Promise.resolve()), FlexWidget: () => null, TextWidget: () => null }));
jest.mock('react-native', () => ({ Platform: { OS: 'android', select: (o: Record<string, unknown>) => o.android ?? o.default } }));
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  registerTaskAsync: jest.fn(() => Promise.resolve(null)),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('id')),
  setNotificationCategoryAsync: jest.fn(() => Promise.resolve(null)),
  BackgroundNotificationTaskResult: { NewData: 0, NoData: 1, Failed: 2 },
  SchedulableTriggerInputTypes: { DATE: 'date', DAILY: 'daily' },
  AndroidImportance: { HIGH: 4 },
}));

const N = Notifications as unknown as Record<string, jest.Mock>;

function datos(): AppData {
  const d = emptyData();
  d.settings = { ...d.settings, onboarded: true, pillMode: true, reminders: { ...d.settings.reminders, pill: { on: true, hour: 21, minute: 0 }, pack: { on: true, hour: 9 }, period: { ...d.settings.reminders.period, on: false } } };
  d.blister = { tipo: '21-7', inicio: '2026-10-01', hora: '21:00', tipoPastilla: 'combinada' };
  return d;
}

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});

describe('Botón "Ya la tomé" con la app cerrada', () => {
  test('guarda la toma en los datos de la usuaria activa y cancela el segundo aviso', async () => {
    await AsyncStorage.setItem(CLAVE_ACTIVA, 'ciclo:data:v1:u1');
    await AsyncStorage.setItem('ciclo:data:v1:u1', JSON.stringify(datos()));
    expect(await guardarTomaSinApp('2026-10-14', '21:10', '2026-10-14')).toBe(true);
    const guardado = JSON.parse((await AsyncStorage.getItem('ciclo:data:v1:u1'))!);
    expect(guardado.tomasPastilla['2026-10-14']).toEqual({ fecha: '2026-10-14', estado: 'tomada', hora: '21:10' });
    expect(await AsyncStorage.getItem('ciclo:data:v1:u1:updatedAt')).toBeTruthy();
    expect(N.cancelScheduledNotificationAsync).toHaveBeenCalledWith(idSegundoAviso('2026-10-14'));
  });

  test('pasada la ventana queda como tarde, y no pisa una toma ya registrada', async () => {
    const d = datos();
    d.tomasPastilla['2026-10-15'] = { fecha: '2026-10-15', estado: 'tomada', hora: '21:01' };
    await AsyncStorage.setItem(CLAVE_ACTIVA, 'ciclo:data:v1');
    await AsyncStorage.setItem('ciclo:data:v1', JSON.stringify(d));
    await guardarTomaSinApp('2026-10-14', '09:30', '2026-10-15'); // la de ayer, marcada hoy: 12,5 h tarde
    await guardarTomaSinApp('2026-10-15', '23:00', '2026-10-15');
    const g = JSON.parse((await AsyncStorage.getItem('ciclo:data:v1'))!);
    expect(g.tomasPastilla['2026-10-14'].estado).toBe('tarde');
    expect(g.tomasPastilla['2026-10-15'].hora).toBe('21:01');
  });

  test('sin datos o sin blíster no hace nada', async () => {
    expect(await guardarTomaSinApp('2026-10-14')).toBe(false);
  });
});

describe('Programación de recordatorios', () => {
  test('aviso diario con botón, segundo aviso 1 h después, y salta descanso y días marcados', async () => {
    jest.useFakeTimers({ now: new Date(2026, 9, 14, 8, 0) });
    const d = datos();
    d.tomasPastilla['2026-10-15'] = { fecha: '2026-10-15', estado: 'tomada', hora: '21:00' };
    await rescheduleAll(d, summarize(d, '2026-10-14'));
    const llamadas = N.scheduleNotificationAsync.mock.calls.map((c) => c[0] as { identifier?: string; content: { categoryIdentifier?: string; data?: { fecha: string } }; trigger: { date?: Date; delivery?: string } });
    const pastilla = llamadas.filter((c) => c.identifier?.startsWith('pastilla-'));
    const ids = pastilla.map((c) => c.identifier);
    expect(ids).toContain('pastilla-2026-10-14');
    expect(ids).toContain('pastilla-tarde-2026-10-14');
    expect(ids).not.toContain('pastilla-2026-10-15'); // ya marcada
    expect(ids).not.toContain('pastilla-2026-10-24'); // día de descanso
    const hoy = pastilla.find((c) => c.identifier === 'pastilla-2026-10-14')!;
    const tarde = pastilla.find((c) => c.identifier === 'pastilla-tarde-2026-10-14')!;
    expect(hoy.content.categoryIdentifier).toBe('pastilla');
    expect(hoy.content.data?.fecha).toBe('2026-10-14');
    expect(hoy.trigger.delivery).toBe('alarmClock');
    expect(tarde.trigger.date!.getTime() - hoy.trigger.date!.getTime()).toBe(60 * 60000);
    expect(N.setNotificationCategoryAsync).toHaveBeenCalled();
    jest.useRealTimers();
  });

  test('aviso el día antes del blíster nuevo (28 oct a las 9)', async () => {
    jest.useFakeTimers({ now: new Date(2026, 9, 14, 8, 0) });
    const d = datos();
    await rescheduleAll(d, summarize(d, '2026-10-14'));
    const fechas = N.scheduleNotificationAsync.mock.calls.map((c) => (c[0] as { content: { title: string }; trigger: { date?: Date } }));
    const blister = fechas.filter((c) => c.content.title === 'Blíster').map((c) => c.trigger.date!.toString());
    expect(blister).toContain(new Date(2026, 9, 28, 9, 0).toString());
    expect(blister).toContain(new Date(2026, 9, 21, 9, 0).toString()); // día antes del descanso
    jest.useRealTimers();
  });

  test('con la pastilla apagada no se programa nada de pastilla', async () => {
    jest.useFakeTimers({ now: new Date(2026, 9, 14, 8, 0) });
    const d = datos();
    d.settings = { ...d.settings, pillMode: false };
    await rescheduleAll(d, summarize(d, '2026-10-14'));
    const ids = N.scheduleNotificationAsync.mock.calls.map((c) => (c[0] as { identifier?: string }).identifier ?? '');
    expect(ids.some((i) => i.startsWith('pastilla'))).toBe(false);
    jest.useRealTimers();
  });
});
