// Eliminar la cuenta: el usuario de Neon Auth se borra si el servidor lo permite; si no, se avisa (los datos ya se borraron).
import { beforeEach, describe, expect, jest, test } from '@jest/globals';

const mockDeleteUser = jest.fn<(o?: object) => Promise<{ error?: { message?: string } | null } | null>>();

jest.mock('@neondatabase/neon-js', () => ({
  defaultDeriveNeonUrls: () => ({ auth: 'https://auth.example', dataApi: 'https://data.example' }),
  SupabaseAuthAdapter: () => ({}),
  createClient: () => ({ auth: { getBetterAuthInstance: () => ({ deleteUser: mockDeleteUser }) } }),
}));
jest.mock('expo-web-browser', () => ({ openAuthSessionAsync: jest.fn() }));
jest.mock('react-native-url-polyfill/auto', () => ({}));

import { borrarUsuario } from '../src/lib/nube';

beforeEach(() => mockDeleteUser.mockReset());

describe('Cerrar el usuario', () => {
  test('el servidor lo permite: queda cerrado', async () => {
    mockDeleteUser.mockResolvedValue({ error: null });
    expect(await borrarUsuario()).toBe(true);
    expect(mockDeleteUser).toHaveBeenCalledTimes(1);
  });

  test('el servidor no lo tiene habilitado: se avisa para pedirlo por correo', async () => {
    mockDeleteUser.mockResolvedValue({ error: { message: 'Delete user is disabled' } });
    expect(await borrarUsuario()).toBe(false);
  });

  test('sin conexión: no rompe, se avisa', async () => {
    mockDeleteUser.mockRejectedValue(new Error('Network request failed'));
    expect(await borrarUsuario()).toBe(false);
  });
});
