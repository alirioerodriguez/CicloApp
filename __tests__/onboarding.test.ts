// Bienvenida: los pasos de cada camino y el modo con el que arranca la app (que no empiece en Ciclo tras elegir Pastilla).
import { describe, expect, jest, test } from '@jest/globals';
import { summarize } from '../src/lib/cycle';
import { anticonceptivoFinal, flujoOnboarding, modoInicial, type RespuestasOnboarding } from '../src/lib/onboarding';
import { DEFAULT_SETTINGS, emptyData, normalize, seedFirstPeriod } from '../src/lib/store';

jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'es', regionCode: 'VE' }] }));
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('../src/lib/nube', () => ({ nubeConfigurada: false, neon: null }));

const base: RespuestasOnboarding = {
  name: ' Ana ', edad: 27, etapa: 'ciclo', anti: null, condiciones: [], regularidad: null,
  cycleLength: 30, periodLength: 5, pillName: ' Yasmin ', pillType: '21-7', packStart: '2026-10-20', pillHour: 21,
};

describe('Pasos de la bienvenida', () => {
  test('ciclo pregunta por la pastilla antes del período', () => {
    expect(flujoOnboarding('ciclo', null)).toEqual(['bienvenida', 'cuenta', 'pastilla', 'periodo', 'duracion', 'listo']);
    expect(flujoOnboarding('ciclo', 'ninguno')).toEqual(['bienvenida', 'cuenta', 'pastilla', 'periodo', 'duracion', 'listo']);
  });

  test('con pastilla se saltan el último período y la duración del ciclo', () => {
    expect(flujoOnboarding('ciclo', 'pastilla')).toEqual(['bienvenida', 'cuenta', 'pastilla', 'listo']);
  });

  test('la pastilla queda en el mismo lugar con o sin respuesta (no se salta pasos al contestar)', () => {
    expect(flujoOnboarding('ciclo', null).indexOf('pastilla')).toBe(flujoOnboarding('ciclo', 'pastilla').indexOf('pastilla'));
  });

  test('las otras etapas no cambian por la pastilla', () => {
    expect(flujoOnboarding('ttc', 'pastilla')).toContain('periodo');
    expect(flujoOnboarding('especial', 'pastilla')).toContain('periodo');
    expect(flujoOnboarding('embarazo', 'pastilla')).toEqual(['bienvenida', 'cuenta', 'embarazo', 'listo']);
    expect(flujoOnboarding('meno', null)).toEqual(['bienvenida', 'cuenta', 'meno', 'listo']);
  });
});

describe('Modo con el que arranca la app', () => {
  test('eligió Pastilla: arranca en modo pastilla, con blíster y sin aviso de período', () => {
    const m = modoInicial(DEFAULT_SETTINGS, { ...base, anti: 'pastilla' }, true);
    expect(m.etapa).toBe('ciclo');
    expect(m.anticonceptivo).toBe('pastilla');
    expect(m.pillMode).toBe(true);
    expect(m.pillPackStart).toBe('2026-10-20');
    expect(m.pillName).toBe('Yasmin');
    expect(m.reminders.pill).toEqual({ on: true, hour: 21, minute: 0 });
    expect(m.reminders.pack.on).toBe(true);
    expect(m.reminders.period.on).toBe(false);
  });

  test('eligió No: modo ciclo, sin pastilla y con aviso de período', () => {
    const m = modoInicial(DEFAULT_SETTINGS, { ...base, anti: 'ninguno' }, true);
    expect(m.pillMode).toBe(false);
    expect(m.anticonceptivo).toBe('ninguno');
    expect(m.pillPackStart).toBeNull();
    expect(m.reminders.pill.on).toBe(false);
    expect(m.reminders.period.on).toBe(true);
    expect(m.name).toBe('Ana');
  });

  test('sin permiso de notificaciones no prende ningún aviso', () => {
    const m = modoInicial(DEFAULT_SETTINGS, { ...base, anti: 'pastilla' }, false);
    expect([m.reminders.pill.on, m.reminders.pack.on, m.reminders.period.on]).toEqual([false, false, false]);
  });

  test('buscando embarazo, embarazada o en la menopausia la pastilla no aplica', () => {
    for (const etapa of ['ttc', 'embarazo', 'meno'] as const) {
      expect(anticonceptivoFinal(etapa, 'pastilla')).toBe('ninguno');
      expect(modoInicial(DEFAULT_SETTINGS, { ...base, etapa, anti: 'pastilla' }, true).pillMode).toBe(false);
    }
  });

  test('con pastilla no se predicen días fértiles; sin pastilla sí', () => {
    const conRegistro = (anti: 'pastilla' | 'ninguno') => {
      const d = emptyData();
      d.settings = { ...d.settings, ...modoInicial(d.settings, { ...base, anti }, false) };
      d.logs = seedFirstPeriod(d.logs, '2026-10-10', 5);
      return summarize(normalize(d), '2026-10-25');
    };
    const pastilla = conRegistro('pastilla');
    expect([pastilla.fertileStart, pastilla.fertileEnd, pastilla.ovulation]).toEqual([null, null, null]);
    expect(conRegistro('ninguno').fertileStart).not.toBeNull();
  });
});
