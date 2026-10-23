// Blíster digital, parte 1: posición en el blíster, tomas a tiempo o tarde, olvidos y migración.
import { describe, expect, jest, test } from '@jest/globals';
import { clasificarToma, diaDelBlister, encabezado, estadoDelDia, migrarBlister, tocaTomar } from '../src/lib/blister';
import { emptyData, emptyLog, normalize } from '../src/lib/store';
import type { BlisterConfig } from '../src/lib/types';

jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'es', regionCode: 'VE' }] }));
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('../src/lib/nube', () => ({ nubeConfigurada: false, neon: null }));

const base: BlisterConfig = { tipo: '21-7', inicio: '2026-10-01', hora: '21:00', tipoPastilla: 'combinada' };

describe('Posición en el blíster', () => {
  test('21 + 7: día 14 activo, día 22 descanso, y el siguiente arranca solo', () => {
    expect(diaDelBlister(base, '2026-10-14')).toMatchObject({ numero: 14, total: 28, alveolo: 'activa', siguienteInicio: '2026-10-29' });
    expect(diaDelBlister(base, '2026-10-22')).toMatchObject({ numero: 22, alveolo: 'descanso' });
    expect(diaDelBlister(base, '2026-10-29')).toMatchObject({ numero: 1, inicioBlister: '2026-10-29' });
    expect(tocaTomar(base, '2026-10-22')).toBe(false);
  });

  test('24 + 4 placebo y personalizado 26 + 2', () => {
    const p: BlisterConfig = { ...base, tipo: '24-4' };
    expect(diaDelBlister(p, '2026-10-25').alveolo).toBe('placebo');
    expect(tocaTomar(p, '2026-10-25')).toBe(true);
    const q: BlisterConfig = { ...base, tipo: 'personalizado', activas: 26, inactivas: 2, inactivasPlacebo: true };
    expect(diaDelBlister(q, '2026-10-27')).toMatchObject({ numero: 27, total: 28, alveolo: 'placebo' });
  });

  test('28 continuo nunca tiene descanso', () => {
    const c: BlisterConfig = { ...base, tipo: '28' };
    for (let i = 0; i < 28; i++) expect(diaDelBlister(c, `2026-10-${String(i + 1).padStart(2, '0')}`).alveolo).toBe('activa');
  });

  test('encabezado: "Pastilla 14 de 21" y "Descanso 3 de 7"', () => {
    expect(encabezado(base, '2026-10-14')).toEqual({ tipo: 'activa', n: 14, de: 21 });
    expect(encabezado(base, '2026-10-24')).toEqual({ tipo: 'descanso', n: 3, de: 7 });
  });
});

describe('Tomas', () => {
  test('ventana de "tarde": 12 h combinada, 3 h solo progestágeno', () => {
    const temprano: BlisterConfig = { ...base, hora: '08:00' };
    expect(clasificarToma(temprano, '19:59')).toBe('tomada');
    expect(clasificarToma(temprano, '20:01')).toBe('tarde');
    const pop: BlisterConfig = { ...temprano, tipoPastilla: 'progestageno' };
    expect(clasificarToma(pop, '11:00')).toBe('tomada');
    expect(clasificarToma(pop, '11:01')).toBe('tarde');
  });

  test('día pasado sin marcar = olvidada; hoy = pendiente; descanso no cuenta', () => {
    const tomas = { '2026-10-10': { fecha: '2026-10-10', estado: 'tomada' as const, hora: '21:05' } };
    const hoy = '2026-10-14';
    expect(estadoDelDia(base, tomas, '2026-10-10', hoy)).toBe('tomada');
    expect(estadoDelDia(base, tomas, '2026-10-11', hoy)).toBe('olvidada');
    expect(estadoDelDia(base, tomas, '2026-10-14', hoy)).toBe('pendiente');
    expect(estadoDelDia(base, tomas, '2026-10-15', hoy)).toBe('futura');
    expect(estadoDelDia(base, tomas, '2026-10-23', '2026-10-30')).toBe('descanso');
  });
});

describe('Migración sin perder datos', () => {
  test('pillType, pillPackStart y pillTaken pasan al blíster nuevo; DayLog queda igual', () => {
    const d = emptyData();
    d.settings = { ...d.settings, pillMode: true, pillType: 'pop', pillPackStart: '2026-10-01', reminders: { ...d.settings.reminders, pill: { on: true, hour: 8, minute: 30 } } };
    d.logs['2026-10-02'] = { ...emptyLog('2026-10-02'), pillTaken: true, pillTime: '08:40', pain: 3 };
    d.logs['2026-10-03'] = { ...emptyLog('2026-10-03'), pillTaken: true, pillTime: '13:00' };
    const viejo = JSON.parse(JSON.stringify(d));
    delete viejo.blister;
    delete viejo.tomasPastilla;
    const n = normalize(viejo);
    expect(n.blister).toEqual({ tipo: '28', inicio: '2026-10-01', hora: '08:30', tipoPastilla: 'progestageno' });
    expect(n.tomasPastilla['2026-10-02']).toEqual({ fecha: '2026-10-02', estado: 'tomada', hora: '08:40' });
    expect(n.tomasPastilla['2026-10-03'].estado).toBe('tarde'); // 4,5 h tarde con solo progestágeno
    expect(n.logs['2026-10-02']).toMatchObject({ pillTaken: true, pillTime: '08:40', pain: 3 });
  });

  test('lo ya guardado en el registro nuevo no se pisa y sin blíster queda vacío', () => {
    const settings = { ...emptyData().settings, pillPackStart: null };
    const r = migrarBlister({ settings, logs: {}, blister: null, tomasPastilla: { '2026-10-05': { fecha: '2026-10-05', estado: 'olvidada', hora: null } } });
    expect(r.blister).toBeNull();
    expect(r.tomasPastilla['2026-10-05'].estado).toBe('olvidada');
    const datosSucios = normalize({ settings: {}, logs: {}, blister: { tipo: 'raro', inicio: 'ayer' }, tomasPastilla: { nofecha: {} } });
    expect(datosSucios.blister).toBeNull();
    expect(datosSucios.tomasPastilla).toEqual({});
  });
});
