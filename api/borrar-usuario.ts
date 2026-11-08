// Función de Vercel: POST /api/borrar-usuario con «Authorization: Bearer <token de la sesión>».
// Borra el usuario de Neon Auth de la persona que llama. Ver api/_borrar-usuario.ts.
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { JWKS_URL, borrarUsuario } from './_borrar-usuario';

const llaves = createRemoteJWKSet(new URL(JWKS_URL));

async function responder(request: Request): Promise<Response> {
  const r = await borrarUsuario(
    { metodo: request.method, autorizacion: request.headers.get('authorization'), origen: request.headers.get('origin') },
    {
      clave: process.env.NEON_API_KEY,
      verificar: async (token) => {
        const { payload } = await jwtVerify(token, llaves);
        if (typeof payload.sub !== 'string') throw new Error('sin sub');
        return payload.sub;
      },
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
