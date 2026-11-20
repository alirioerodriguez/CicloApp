// El autoexamen guiado de Salud: sus textos nuevos también salen en inglés y el contenido de salud sigue siendo el mismo.
import { describe, expect, jest, test } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { t } from '../src/lib/region';
import { AUTOEXAMEN } from '../src/content/salud';

jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'en', regionCode: 'US' }] }));
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('../src/lib/nube', () => ({ nubeConfigurada: false, neon: null }));

describe('Autoexamen guiado', () => {
  test('los textos nuevos de la pantalla tienen inglés', () => {
    const pantalla = readFileSync(require.resolve('../src/app/salud.tsx'), 'utf8');
    for (const txt of ['Toca cada paso cuando lo hagas.', '¿Notaste algo distinto?', 'No, todo igual', 'Sí, algo cambió', 'Puedes agendar el control arriba, en «Tus controles», y anotar qué notaste.']) {
      expect(pantalla).toContain(txt);
      expect(t(txt)).not.toBe(txt);
    }
  });

  test('sigue con los mismos cinco pasos y el aviso para consultar', () => {
    expect(AUTOEXAMEN.pasos).toHaveLength(5);
    expect(AUTOEXAMEN.aviso).toMatch(/consulta pronto/);
  });
});
