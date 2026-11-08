import { describe, expect, test } from '@jest/globals';
import { borrarUsuario, type Dependencias } from '../api/_borrar-usuario';

const pedido = { metodo: 'POST', autorizacion: 'Bearer tok', origen: null as string | null };

function dep(cambios: Partial<Dependencias> = {}): Dependencias & { urls: string[] } {
  const urls: string[] = [];
  return {
    urls,
    clave: 'clave-de-prueba',
    verificar: async (t) => {
      if (t !== 'tok') throw new Error('token inválido');
      return 'usuaria-123';
    },
    borrar: async (url) => {
      urls.push(url);
      return 200;
    },
    ...cambios,
  };
}

describe('api/borrar-usuario', () => {
  test('borra solo el usuario del token', async () => {
    const d = dep();
    const r = await borrarUsuario(pedido, d);
    expect(r).toEqual({ estado: 200, cuerpo: { ok: true } });
    expect(d.urls).toEqual(['https://console.neon.tech/api/v2/projects/weathered-flower-98694554/branches/br-sweet-voice-b5rx95m8/auth/users/usuaria-123']);
  });

  test('sin sesión o con un token falso no borra nada', async () => {
    const d = dep();
    expect((await borrarUsuario({ ...pedido, autorizacion: null }, d)).estado).toBe(401);
    expect((await borrarUsuario({ ...pedido, autorizacion: 'Bearer otro' }, d)).estado).toBe(401);
    expect(d.urls).toEqual([]);
  });

  test('un id raro en el token no llega a la URL', async () => {
    const d = dep({ verificar: async () => '../../projects' });
    expect((await borrarUsuario(pedido, d)).estado).toBe(401);
    expect(d.urls).toEqual([]);
  });

  test('sin la clave en Vercel avisa y la app sigue con su plan B', async () => {
    const r = await borrarUsuario(pedido, dep({ clave: undefined }));
    expect(r).toEqual({ estado: 503, cuerpo: { ok: false, motivo: 'sin-configurar' } });
  });

  test('rechaza otro método y otra web', async () => {
    expect((await borrarUsuario({ ...pedido, metodo: 'GET' }, dep())).estado).toBe(405);
    expect((await borrarUsuario({ ...pedido, origen: 'https://otra.app' }, dep())).estado).toBe(403);
    expect((await borrarUsuario({ ...pedido, origen: 'https://cicloapp.vercel.app' }, dep())).estado).toBe(200);
  });

  test('si el usuario ya no existe, cuenta como borrado; si Neon falla, no', async () => {
    expect((await borrarUsuario(pedido, dep({ borrar: async () => 404 }))).cuerpo.ok).toBe(true);
    expect((await borrarUsuario(pedido, dep({ borrar: async () => 500 }))).estado).toBe(502);
    expect((await borrarUsuario(pedido, dep({ borrar: async () => { throw new Error('red'); } }))).estado).toBe(502);
  });
});
