// Blíster digital, parte 6: widget de inicio (Android).
import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CLAVE_ACTIVA } from '../src/lib/blister';
import { emptyData } from '../src/lib/store';
import type { AppData } from '../src/lib/types';
import { resumenWidget } from '../src/widget/datosWidget';

jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'es', regionCode: 'VE' }] }));
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('../src/lib/nube', () => ({ nubeConfigurada: false, neon: null }));
jest.mock('expo-task-manager', () => ({ defineTask: jest.fn() }));
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  registerTaskAsync: jest.fn(() => Promise.resolve(null)),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  setNotificationCategoryAsync: jest.fn(() => Promise.resolve(null)),
  BackgroundNotificationTaskResult: { NewData: 0, NoData: 1, Failed: 2 },
}));
jest.mock('react-native-android-widget', () => ({
  registerWidgetTaskHandler: jest.fn(),
  requestWidgetUpdate: jest.fn(() => Promise.resolve()),
  FlexWidget: () => null,
  TextWidget: () => null,
}));

function datos(): AppData {
  const d = emptyData();
  d.settings = { ...d.settings, onboarded: true, pillMode: true };
  d.blister = { tipo: '21-7', inicio: '2026-10-01', hora: '21:00', tipoPastilla: 'combinada' };
  return d;
}

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});

describe('Datos del widget', () => {
  test('chico: "Pastilla 14/21", estado de hoy y hora', () => {
    const d = datos();
    const r = resumenWidget(d, '2026-10-14');
    expect(r).toMatchObject({ activo: true, tipo: 'activa', n: 14, de: 21, hora: '21:00', estadoHoy: 'pendiente', horaToma: null });
  });

  test('mediano: la fila de 7 del blíster en la que cae hoy, con sus estados', () => {
    const d = datos();
    d.tomasPastilla = {
      '2026-10-08': { fecha: '2026-10-08', estado: 'tomada', hora: '21:00' },
      '2026-10-09': { fecha: '2026-10-09', estado: 'tarde', hora: '10:00' },
    };
    const r = resumenWidget(d, '2026-10-10');
    if (!r.activo) throw new Error('debería estar activo');
    expect(r.semana.map((x) => x.fecha)).toEqual(['2026-10-08', '2026-10-09', '2026-10-10', '2026-10-11', '2026-10-12', '2026-10-13', '2026-10-14']);
    expect(r.semana.map((x) => x.estado)).toEqual(['tomada', 'tarde', 'pendiente', 'futura', 'futura', 'futura', 'futura']);
    expect(r.semana[2].hoy).toBe(true);
    expect(r.semana[0].inicial).toBe('J'); // 8 de octubre de 2026 es jueves
  });

  test('en el descanso muestra "Descanso" y los alvéolos punteados', () => {
    const r = resumenWidget(datos(), '2026-10-24');
    if (!r.activo) throw new Error('debería estar activo');
    expect(r).toMatchObject({ tipo: 'descanso', n: 3, de: 7, estadoHoy: 'descanso' });
    expect(r.semana.every((x) => x.estado === 'descanso')).toBe(true);
  });

  test('con la pastilla apagada o sin blíster, el widget invita a configurarlo', () => {
    const d = datos();
    d.settings = { ...d.settings, pillMode: false };
    expect(resumenWidget(d, '2026-10-14')).toEqual({ activo: false });
    expect(resumenWidget(null, '2026-10-14')).toEqual({ activo: false });
  });
});

describe('Botón del widget', () => {
  test('tocar el check marca la toma de hoy y vuelve a dibujar el widget', async () => {
    const { tareaWidget } = require('../src/widget/tareaWidget') as typeof import('../src/widget/tareaWidget');
    const { today } = require('../src/lib/dates') as typeof import('../src/lib/dates');
    const d = datos();
    d.blister = { ...d.blister!, inicio: today() };
    await AsyncStorage.setItem(CLAVE_ACTIVA, 'ciclo:data:v1');
    await AsyncStorage.setItem('ciclo:data:v1', JSON.stringify(d));
    const renderWidget = jest.fn();
    await tareaWidget({
      widgetInfo: { widgetName: 'PastillaChico', widgetId: 1, width: 110, height: 110, screenInfo: { screenHeightDp: 800, screenWidthDp: 400, density: 2, densityDpi: 320, fontScale: 1 } },
      widgetAction: 'WIDGET_CLICK',
      clickAction: 'MARCAR_PASTILLA',
      renderWidget,
    });
    const guardado = JSON.parse((await AsyncStorage.getItem('ciclo:data:v1'))!);
    expect(guardado.tomasPastilla[today()]).toBeTruthy();
    expect(renderWidget).toHaveBeenCalledTimes(1);
  });
});
