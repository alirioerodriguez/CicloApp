// Cambio de etapa desde Perfil: qué se ajusta, qué se le cuenta antes de guardar y las ayudas después.
import { describe, expect, jest, test } from '@jest/globals';
import { ajustesDeEtapa, transicion } from '../src/lib/transicion';
import { DEFAULT_SETTINGS } from '../src/lib/store';
import type { Settings } from '../src/lib/types';

jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'es', regionCode: 'VE' }] }));
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('../src/lib/nube', () => ({ nubeConfigurada: false, neon: null }));

const ajustes = (p: Partial<Settings>): Settings => ({ ...DEFAULT_SETTINGS, onboarded: true, ...p });

describe('Qué se ajusta', () => {
  test('a embarazo: sin pastilla y semana 12 si no hay fecha', () => {
    const a = ajustesDeEtapa(ajustes({ etapa: 'ciclo', pillMode: true, anticonceptivo: 'pastilla' }), 'embarazo', '2026-11-02');
    expect(a).toMatchObject({ etapa: 'embarazo', pillMode: false, anticonceptivo: 'ninguno' });
    expect(a.embarazo?.fpp).toBeTruthy();
  });

  test('a posparto sin fecha de nacimiento: hoy', () => {
    expect(ajustesDeEtapa(ajustes({ etapa: 'embarazo' }), 'posparto', '2026-11-02').posparto?.nacimiento).toBe('2026-11-02');
  });

  test('a ciclo especial sin condición: SOP por defecto', () => {
    expect(ajustesDeEtapa(ajustes({ etapa: 'ciclo', condiciones: [] }), 'especial', '2026-11-02').condiciones).toContain('sop');
  });
});

describe('Qué se le cuenta antes de guardar', () => {
  test('siempre que el historial queda', () => {
    expect(transicion(ajustes({ etapa: 'ciclo' }), 'meno').cambios[0]).toMatch(/historial/);
  });

  test('misma etapa: nada que contar', () => {
    expect(transicion(ajustes({ etapa: 'ciclo' }), 'ciclo').cambios).toEqual([]);
  });

  test('de ciclo con pastilla a embarazo: se deja de predecir y se apagan los recordatorios de la pastilla', () => {
    const t = transicion(ajustes({ etapa: 'ciclo', pillMode: true }), 'embarazo');
    expect(t.cambios.join(' ')).toMatch(/Dejamos de predecir/);
    expect(t.cambios.join(' ')).toMatch(/pastilla/);
    expect(t.registrarPeriodo).toBe(false);
  });

  test('de posparto a ciclo: vuelve la predicción y se ofrece registrar el período', () => {
    const t = transicion(ajustes({ etapa: 'posparto' }), 'ciclo');
    expect(t.cambios.join(' ')).toMatch(/Vuelve la predicción/);
    expect(t.registrarPeriodo).toBe(true);
    expect(t.ofrecerPerdida).toBe(false);
  });

  test('de embarazo a ciclo: se ofrece con cuidado el camino de una pérdida', () => {
    const t = transicion(ajustes({ etapa: 'embarazo' }), 'ciclo');
    expect(t.ofrecerPerdida).toBe(true);
    expect(t.registrarPeriodo).toBe(true);
  });

  test('de embarazo a posparto: no se habla de pérdida', () => {
    expect(transicion(ajustes({ etapa: 'embarazo' }), 'posparto').ofrecerPerdida).toBe(false);
  });
});
