// Pregunta rápida de regularidad del onboarding: qué condiciones agrega y cómo cambia la predicción.
import { describe, expect, jest, test } from '@jest/globals';
import { summarize } from '../src/lib/cycle';
import { REGULARIDAD, condicionesDeRegularidad, conRegularidad } from '../src/lib/regularidad';
import { emptyData, emptyLog } from '../src/lib/store';

jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'es', regionCode: 'VE' }] }));
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('../src/lib/nube', () => ({ nubeConfigurada: false, neon: null }));

describe('Regularidad del ciclo (onboarding)', () => {
  test('cada respuesta agrega lo que corresponde', () => {
    expect(condicionesDeRegularidad('igual')).toEqual([]);
    expect(condicionesDeRegularidad('noSe')).toEqual([]);
    expect(condicionesDeRegularidad(null)).toEqual([]);
    expect(condicionesDeRegularidad('cambia')).toEqual(['irregular']);
    expect(condicionesDeRegularidad('sop')).toEqual(['sop']);
  });

  test('suma a las condiciones existentes sin repetir', () => {
    expect(conRegularidad(['tiroides'], 'cambia')).toEqual(['tiroides', 'irregular']);
    expect(conRegularidad(['irregular'], 'cambia')).toEqual(['irregular']);
    expect(conRegularidad(['tiroides'], null)).toEqual(['tiroides']);
  });

  test('hay cuatro opciones y la de «No sé» está', () => {
    expect(REGULARIDAD.map((o) => o.id)).toEqual(['igual', 'cambia', 'sop', 'noSe']);
  });

  test('con «cambia bastante» o «SOP» la predicción es un rango; con «casi siempre igual», una fecha', () => {
    const base = () => {
      const d = emptyData();
      d.settings = { ...d.settings, onboarded: true, etapa: 'ciclo', cycleLength: 28, periodLength: 5 };
      for (let i = 0; i < 5; i++) { const f = `2026-10-0${i + 1}`; d.logs[f] = { ...emptyLog(f), flow: 3 }; }
      return d;
    };
    const ventana = (r: Parameters<typeof conRegularidad>[1]) => {
      const d = base();
      d.settings.condiciones = conRegularidad([], r);
      return summarize(d, '2026-10-10').ventana;
    };
    expect(ventana('igual')).toBeNull();
    expect(ventana('noSe')).toBeNull();
    expect(ventana('cambia')).not.toBeNull();
    expect(ventana('sop')).not.toBeNull();
  });
});
