// Lógica de api/borrar-usuario: cierra la cuenta de Neon Auth de quien la pide, y de nadie más.
// La identidad sale del token (JWT) de la sesión, verificado con las llaves públicas de Neon Auth.
// La clave de la API de Neon vive solo en Vercel (NEON_API_KEY): nunca llega a la app.
// Los archivos que empiezan con «_» en api/ no se publican como funciones.

export const NEON_PROYECTO = 'weathered-flower-98694554'; // proyecto «savia»
export const NEON_RAMA = 'br-sweet-voice-b5rx95m8'; // rama «production»
export const JWKS_URL = 'https://ep-old-bar-b5e0wyej.neonauth.c-7.us-east-2.aws.neon.tech/neondb/auth/.well-known/jwks.json';
export const ORIGEN_WEB = 'https://cicloapp.vercel.app';

export type Respuesta = { estado: number; cuerpo: { ok: boolean; motivo?: string } };

export type Dependencias = {
  clave: string | undefined;
  // Devuelve el id de la usuaria (claim «sub») o lanza un error si el token no es válido.
  verificar: (token: string) => Promise<string>;
  // DELETE a la API de Neon; devuelve el código HTTP.
  borrar: (url: string, clave: string) => Promise<number>;
};

export async function borrarUsuario(
  pedido: { metodo: string; autorizacion: string | null; origen: string | null },
  dep: Dependencias,
): Promise<Respuesta> {
  if (pedido.metodo !== 'POST') return { estado: 405, cuerpo: { ok: false, motivo: 'metodo' } };
  // La app del celular no manda «Origin»; si viene, tiene que ser la web de Savia.
  if (pedido.origen && pedido.origen !== ORIGEN_WEB) return { estado: 403, cuerpo: { ok: false, motivo: 'origen' } };
  if (!dep.clave) return { estado: 503, cuerpo: { ok: false, motivo: 'sin-configurar' } };

  const token = /^Bearer\s+(.+)$/i.exec(pedido.autorizacion ?? '')?.[1];
  if (!token) return { estado: 401, cuerpo: { ok: false, motivo: 'sin-sesion' } };

  let id: string;
  try {
    id = await dep.verificar(token);
  } catch {
    return { estado: 401, cuerpo: { ok: false, motivo: 'sesion-invalida' } };
  }
  if (!/^[A-Za-z0-9_-]{1,100}$/.test(id)) return { estado: 401, cuerpo: { ok: false, motivo: 'sesion-invalida' } };

  const url = `https://console.neon.tech/api/v2/projects/${NEON_PROYECTO}/branches/${NEON_RAMA}/auth/users/${encodeURIComponent(id)}`;
  let codigo: number;
  try {
    codigo = await dep.borrar(url, dep.clave);
  } catch {
    return { estado: 502, cuerpo: { ok: false, motivo: 'neon' } };
  }
  // 404: el usuario ya no existe, que es lo que se quería.
  if ((codigo >= 200 && codigo < 300) || codigo === 404) return { estado: 200, cuerpo: { ok: true } };
  return { estado: 502, cuerpo: { ok: false, motivo: 'neon' } };
}
