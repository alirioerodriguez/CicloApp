// Con el teléfono en inglés, el PDF para la médica y las notificaciones salen en inglés.
import { describe, expect, jest, test } from '@jest/globals';
import { reportHtml } from '../src/lib/backup';
import { summarize } from '../src/lib/cycle';
import { addDays } from '../src/lib/dates';
import { emptyData, emptyLog } from '../src/lib/store';
import { NOTIF, fill } from '../src/content/textos';

jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'en', regionCode: 'US' }] }));
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('../src/lib/nube', () => ({ nubeConfigurada: false, neon: null }));

describe('Inglés', () => {
  test('el PDF para la médica sale en inglés', () => {
    const d = emptyData();
    for (const inicio of ['2026-08-01', '2026-08-29', '2026-09-26']) {
      for (let i = 0; i < 4; i++) {
        const f = addDays(inicio, i);
        d.logs[f] = { ...emptyLog(f), flow: 3, pain: 5, symptoms: ['colicos'] };
      }
    }
    const html = reportHtml(d, summarize(d, '2026-10-05'));
    expect(html).toContain('lang="en"');
    expect(html).toContain('Cycle summary');
    expect(html).toContain('Gynecology visit report');
    expect(html).toContain('Last menstrual period');
    expect(html).toContain('Average cycle');
    expect(html).toContain('Cycles logged');
    expect(html).toContain('Does not include intimacy, personal notes, mood or dream journal.');
    expect(html).not.toMatch(/Resumen de ciclo|Datos clave|días|Generado/);
  });

  test('las notificaciones con días salen en inglés', () => {
    const conDias = NOTIF.periodo.find((x) => x.includes('{dias}'))!;
    const texto = fill(conDias, 3);
    expect(texto).toContain('3');
    expect(texto).not.toMatch(/período|días/);
  });
});
