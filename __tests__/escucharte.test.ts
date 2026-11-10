import { describe, expect, it, jest } from '@jest/globals';
jest.mock('expo-constants', () => ({ expoConfig: { version: '1.0.0' } }));
import { armarSugerencia } from '../src/lib/sugerencia';

describe('«Queremos escucharte»', () => {
  it('arma la sugerencia limpia, con el mail opcional', () => {
    expect(armarSugerencia({ tipo: 'idea', texto: '  Ver mi ciclo en el reloj  ', mail: '', version: 'android 1.0.0' })).toEqual({
      cuerpo: { app: 'savia', tipo: 'idea', texto: 'Ver mi ciclo en el reloj', mail: null, web: '', version: 'android 1.0.0' },
    });
  });

  it('avisa si el mensaje es muy corto, muy largo o el mail está mal escrito', () => {
    expect(armarSugerencia({ tipo: 'otra', texto: 'a', mail: '' })).toHaveProperty('error');
    expect(armarSugerencia({ tipo: 'idea', texto: 'x'.repeat(2001), mail: '' })).toHaveProperty('error');
    expect(armarSugerencia({ tipo: 'idea', texto: 'Linda app', mail: 'ana@' })).toHaveProperty('error');
  });
});
