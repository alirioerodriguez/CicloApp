// Voseo: en Argentina y Uruguay Savia habla de «vos»; en los demás países, de «tú» (ver VOZ.md).
import { describe, expect, jest, test } from '@jest/globals';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('../src/lib/nube', () => ({ nubeConfigurada: false, neon: null }));

// Carga la app como si el teléfono fuera de ese país y devuelve su t().
function enPais(region: string): (s: string) => string {
  let t!: (s: string) => string;
  jest.isolateModules(() => {
    jest.doMock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'es', regionCode: region }] }));
    t = (require('../src/lib/region') as typeof import('../src/lib/region')).t;
  });
  return t;
}

describe('Voseo en Argentina y Uruguay', () => {
  for (const pais of ['AR', 'UY']) {
    test(`${pais}: presente, imperativo y pronombres en vos`, () => {
      const t = enPais(pais);
      expect(t('Si tienes pastilla, tómala a la misma hora.')).toBe('Si tienes pastilla, tómala a la misma hora.'); // frase que no está en la app: queda igual
      expect(t('Escribe en un papel todo lo que tienes pendiente y elige solo una cosa para hoy. El resto puede esperar.')).toBe(
        'Escribí en un papel todo lo que tenés pendiente y elegí solo una cosa para hoy. El resto puede esperar.',
      );
      expect(t('Encárgate de la cena hoy sin preguntarle qué quiere: resuélvelo tú.')).toBe('Encargate de la cena hoy sin preguntarle qué quiere: resolvelo vos.');
      expect(t('Muchos traen hierro y ácido fólico añadidos; revisa la etiqueta y elige los de poca azúcar.')).toBe('Muchos traen hierro y ácido fólico añadidos; revisá la etiqueta y elegí los de poca azúcar.');
    });
  }

  test('también usa el vocabulario neutro (no el venezolano) antes de pasar a vos', () => {
    const t = enPais('AR');
    // «Patilla» es venezolano: en Argentina pasa por el neutro («Sandía») y queda así.
    expect(t('Patilla')).toBe('Sandía');
  });

  test('no toca el subjuntivo, el pasado ni lo que no es una orden', () => {
    const t = enPais('AR');
    expect(t('Toca la inyección')).toBe('Toca la inyección'); // «te toca», no «tocá»
    expect(t('Baja calidad, pero consistente: reduce la intensidad del dolor.')).toBe('Baja calidad, pero consistente: reduce la intensidad del dolor.');
    expect(t('Esto pasa en unos días: hoy no tomes decisiones grandes en caliente.')).toBe('Esto pasa en unos días: hoy no tomes decisiones grandes en caliente.');
    expect(t('Anotaste 3 sueños en tu diario.')).toBe('Anotaste 3 sueños en tu diario.');
    // Lo que hace el bebé en el modo embarazo es tercera persona, no una orden.
    expect(t('Abre y cierra los ojos, sueña y patea con fuerza.')).toBe('Abre y cierra los ojos, sueña y patea con fuerza.');
    expect(t('Registra tu período, entiende tu cuerpo y cuídate a tu ritmo.')).toBe('Registrá tu período, entendé tu cuerpo y cuidate a tu ritmo.');
  });

  test('las frases con datos variables también pasan a vos', () => {
    const t = enPais('AR');
    expect(t('Te comparto mi Savia 🌸 Descárgala en https://cicloapp.vercel.app, entra con tu cuenta, toca "Acompañar a mi pareja" y escribe este código: ABCD-EFGH')).toBe(
      'Te comparto mi Savia 🌸 Descargala en https://cicloapp.vercel.app, entrá con tu cuenta, tocá "Acompañar a mi pareja" y escribí este código: ABCD-EFGH',
    );
  });
});

describe('Tú en el resto', () => {
  for (const pais of ['VE', 'MX', 'CO', 'CL', 'PE']) {
    test(`${pais}: sigue en tú`, () => {
      const t = enPais(pais);
      expect(t('Encárgate de la cena hoy sin preguntarle qué quiere: resuélvelo tú.')).toBe('Encárgate de la cena hoy sin preguntarle qué quiere: resuélvelo tú.');
    });
  }
});

describe('Uruguay', () => {
  test('está en la lista de países y usa la comida de Argentina', () => {
    let lista!: typeof import('../src/lib/region').PAISES;
    let alimentosPara!: typeof import('../src/content/alimentos').alimentosPara;
    jest.isolateModules(() => {
      jest.doMock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'es', regionCode: 'UY' }] }));
      lista = (require('../src/lib/region') as typeof import('../src/lib/region')).PAISES;
      alimentosPara = (require('../src/content/alimentos') as typeof import('../src/content/alimentos')).alimentosPara;
    });
    expect(lista.map((p) => p.id)).toContain('UY');
    expect(alimentosPara('UY').map((a) => a.nombre)).toEqual(alimentosPara('AR').map((a) => a.nombre));
  });
});
