// La sesión de la web no se cierra sola por una falla de red (pedido de Alirio, 15/11/2026).
// Neon Auth avisa «INITIAL_SESSION» sin sesión cuando la consulta falla; antes eso la sacaba de su cuenta.
import { describe, expect, jest, test } from '@jest/globals';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('../src/lib/nube', () => ({ nubeConfigurada: true, neon: null, alCambiarSesion: () => {} }));
import { MANTENER, trasEvento, trasLeer } from '../src/lib/auth';

const yo = { user: { id: 'u1', email: 'a@b.com' } };

describe('Sesión estable', () => {
  test('una falla al consultar la sesión no la cierra', () => {
    expect(trasLeer({ data: { session: null }, error: { message: 'Failed to fetch' } })).toBe(MANTENER);
    expect(trasLeer(undefined)).toBe(MANTENER);
  });
  test('si el servidor contesta sin error, manda lo que dice', () => {
    expect(trasLeer({ data: { session: yo }, error: null })).toEqual(yo);
    expect(trasLeer({ data: { session: null }, error: null })).toBeNull(); // venció o la cerró en otro lado
  });
  test('un INITIAL_SESSION vacío no la cierra; SIGNED_OUT sí', () => {
    expect(trasEvento('INITIAL_SESSION', null)).toBe(MANTENER);
    expect(trasEvento('TOKEN_REFRESHED', null)).toBe(MANTENER);
    expect(trasEvento('SIGNED_OUT', null)).toBeNull();
    expect(trasEvento('SIGNED_IN', yo)).toEqual(yo);
  });
});
