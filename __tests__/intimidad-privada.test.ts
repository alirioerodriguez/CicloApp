// Los días de relaciones son solo de ella: el calendario no los marca salvo que lo elija,
// y nunca viajan a la pareja. Y el consentimiento de la cuenta queda registrado con fecha, versión y mayoría de edad.
import { describe, expect, jest, test } from '@jest/globals';
import { calendarMarks, summarize } from '../src/lib/cycle';
import { registroConsentimiento, VERSION_CONSENTIMIENTO } from '../src/lib/consentimiento';
import { resumenPareja } from '../src/lib/pareja';
import { emptyData, emptyLog } from '../src/lib/store';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('../src/lib/nube', () => ({ nubeConfigurada: false, neon: null }));

const DIA = '2026-11-05';

function conRelacion() {
  const d = emptyData();
  d.logs[DIA] = { ...emptyLog(DIA), intimidad: true };
  d.settings.red = { ...d.settings.red, on: true, compartir: ['fase', 'periodo', 'energia', 'ayuda'] };
  return d;
}

describe('Las relaciones son solo de ella', () => {
  test('el calendario no las marca si no lo eligió', () => {
    const d = conRelacion();
    expect(d.settings.verIntimidad).toBe(false);
    expect(calendarMarks(d, summarize(d, '2026-11-10'), '2026-11-10')[DIA]?.intimidad).toBeFalsy();
  });

  test('si ella lo prende, las ve en su calendario', () => {
    const d = conRelacion();
    d.settings.verIntimidad = true;
    expect(calendarMarks(d, summarize(d, '2026-11-10'), '2026-11-10')[DIA]?.intimidad).toBe(true);
  });

  test('nunca viajan en el resumen de la pareja, aunque las vea en su calendario', () => {
    const d = conRelacion();
    d.settings.verIntimidad = true;
    const texto = JSON.stringify(resumenPareja(d, summarize(d, '2026-11-10')));
    expect(texto).not.toMatch(/intimidad|relaci|2026-11-05/);
  });
});

describe('Consentimiento de la cuenta', () => {
  test('guarda fecha, versión del texto y que tiene 18 años o más', () => {
    const c = registroConsentimiento(new Date('2026-11-10T12:00:00Z'));
    expect(c).toEqual({ fecha: '2026-11-10T12:00:00.000Z', version: VERSION_CONSENTIMIENTO, mayorDeEdad: true });
  });
});
