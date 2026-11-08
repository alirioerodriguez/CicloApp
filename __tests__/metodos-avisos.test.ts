// Avisos programados de anillo, parche e inyección: siempre en orden, desde hoy y sin saltarse un cambio.
import { describe, expect, jest, test } from '@jest/globals';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'en', regionCode: 'US' }] }));
import { proximosRecordatorios } from '../src/lib/metodosCalendario';

describe('proximosRecordatorios', () => {
  test('anillo puesto hoy: se saca a los 21 días y se pone uno nuevo a los 28', () => {
    const r = proximosRecordatorios('anillo', '2026-11-01', '2026-11-01', 3);
    expect(r.map((x) => [x.fecha, x.accion])).toEqual([
      ['2026-11-22', 'sacar_anillo'],
      ['2026-11-29', 'poner_anillo'],
      ['2026-12-20', 'sacar_anillo'],
    ]);
  });

  test('el mismo día del cambio cuenta como hoy', () => {
    const r = proximosRecordatorios('anillo', '2026-11-01', '2026-11-22', 1);
    expect(r[0]).toMatchObject({ fecha: '2026-11-22', accion: 'sacar_anillo', enDias: 0 });
  });

  test('parche: cambios los días 7 y 14, semana sin parche y parche nuevo', () => {
    const r = proximosRecordatorios('parche', '2026-11-01', '2026-11-03', 4);
    expect(r.map((x) => x.accion)).toEqual(['cambiar_parche', 'cambiar_parche', 'semana_sin_parche', 'poner_parche']);
    expect(r.map((x) => x.fecha)).toEqual(['2026-11-08', '2026-11-15', '2026-11-22', '2026-11-29']);
  });

  test('inyección trimestral: cada 13 semanas, con texto para el día del aviso', () => {
    const r = proximosRecordatorios('inyeccion_trimestral', '2026-11-01', '2026-11-08', 2);
    expect(r.map((x) => x.fecha)).toEqual(['2027-01-31', '2027-05-02']);
    expect(r[0].texto).toBe('Toca la inyección');
  });

  test('inyección mensual el día que toca', () => {
    const r = proximosRecordatorios('inyeccion_mensual', '2026-10-09', '2026-11-08', 2);
    expect(r.map((x) => [x.fecha, x.enDias])).toEqual([['2026-11-08', 0], ['2026-12-08', 30]]);
  });
});

describe('en inglés', () => {
  test('los avisos y la pantalla se traducen', () => {
    const { t } = require('../src/lib/region');
    expect(t('Toca la inyección')).toBe('Your shot is due');
    expect(t('Sacar el parche (semana sin parche)')).toBe('Remove the patch (patch-free week)');
    expect(t('Aviso a las 9:00.')).toBe('Reminder at 9:00.');
  });
});
