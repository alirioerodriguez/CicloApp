/// <reference types="node" />
// Función de Vercel: POST /api/borrar-usuario con «Authorization: Bearer <token de la sesión>».
// Borra el usuario de Neon Auth de la persona que llama. Ver api/_borrar-usuario.ts.
// El token se verifica con node:crypto (Ed25519, la llave pública de Neon Auth), sin dependencias.
import { createPublicKey, verify, type JsonWebKey, type KeyObject } from 'node:crypto';
import { JWKS_URL, borrarUsuario } from './_borrar-usuario';

let llaves: { cuando: number; porKid: Map<string, KeyObject> } | null = null;

async function llave(kid: string): Promise<KeyObject> {
  if (!llaves || Date.now() - llaves.cuando > 10 * 60 * 1000 || !llaves.porKid.has(kid)) {
    const r = await fetch(JWKS_URL);
    if (!r.ok) throw new Error('jwks');
    const { keys } = (await r.json()) as { keys: (JsonWebKey & { kid?: string })[] };
    llaves = { cuando: Date.now(), porKid: new Map(keys.filter((k) => k.kid).map((k) => [k.kid as string, createPublicKey({ key: k, format: 'jwk' })])) };
  }
  const k = llaves.porKid.get(kid);
  if (!k) throw new Error('kid');
  return k;
}

const b64 = (s: string) => Buffer.from(s, 'base64url');

async function verificar(token: string): Promise<string> {
  const [h, p, firma] = token.split('.');
  if (!h || !p || !firma) throw new Error('formato');
  const cabecera = JSON.parse(b64(h).toString('utf8')) as { alg?: string; kid?: string };
  if (cabecera.alg !== 'EdDSA' || !cabecera.kid) throw new Error('alg');
  if (!verify(null, Buffer.from(`${h}.${p}`), await llave(cabecera.kid), b64(firma))) throw new Error('firma');
  const datos = JSON.parse(b64(p).toString('utf8')) as { sub?: unknown; exp?: number; nbf?: number };
  const ahora = Math.floor(Date.now() / 1000);
  if (typeof datos.exp !== 'number' || datos.exp < ahora) throw new Error('vencido');
  if (typeof datos.nbf === 'number' && datos.nbf > ahora + 60) throw new Error('nbf');
  if (typeof datos.sub !== 'string') throw new Error('sub');
  return datos.sub;
}

async function responder(request: Request): Promise<Response> {
  const r = await borrarUsuario(
    { metodo: request.method, autorizacion: request.headers.get('authorization'), origen: request.headers.get('origin') },
    {
      clave: process.env.NEON_API_KEY,
      verificar,
      borrar: async (url, clave) => {
        const res = await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${clave}`, Accept: 'application/json' } });
        return res.status;
      },
    },
  );
  return Response.json(r.cuerpo, { status: r.estado, headers: { 'Cache-Control': 'no-store' } });
}

export const POST = responder;
export const GET = responder;
