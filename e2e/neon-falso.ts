// Neon falso para la prueba de punta a punta del modo pareja. Corre sin servicios reales ni claves.
//
// Reemplaza, dentro del navegador (page.route), las dos cosas de Neon que usa la web:
//   · Neon Auth (Better Auth): /sign-up/email, /sign-in/email, /get-session, /token, /sign-out
//   · Data API (PostgREST): tablas ciclo_data y pareja, y las funciones canjear_codigo_pareja y soltar_pareja
//
// La base vive en memoria y copia las reglas de neon/pareja.sql y neon/ciclo_data.sql: cada pedido lleva el token
// de quien lo hace (como en Neon), y las políticas RLS se aplican con ese usuario, no con "quien llama a la prueba".
// Si alguien cambia neon/pareja.sql, hay que cambiar también las funciones de abajo (están marcadas con «SQL»).
import type { BrowserContext, Route } from '@playwright/test';

export interface Usuario {
  id: string;
  email: string;
  password: string;
}

export interface FilaPareja {
  owner_id: string;
  codigo: string | null;
  codigo_expira: string | null;
  pareja_id: string | null;
  resumen: unknown;
  updated_at: string;
}

interface FilaCiclo {
  user_id: string;
  data: unknown;
  updated_at: string;
}

export interface Pedido {
  quien: string | null; // id de usuario según el token, o null si no hay sesión
  metodo: string;
  ruta: string; // sin el prefijo del proyecto, por ejemplo /rest/v1/pareja
  consulta: string;
  cuerpo: string;
  respuesta: string; // lo que Neon le devolvió al navegador
}

const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
const jwtDe = (id: string) => `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ sub: id, role: 'authenticated', exp: 4102444800 })}.firma`;
const idDeJwt = (auth: string | undefined): string | null => {
  const t = auth?.replace(/^Bearer /i, '').split('.');
  if (!t || t.length !== 3) return null;
  try {
    return (JSON.parse(Buffer.from(t[1], 'base64url').toString()) as { sub?: string }).sub ?? null;
  } catch {
    return null;
  }
};

export class NeonFalso {
  usuarios: Usuario[] = [];
  pareja: FilaPareja[] = [];
  ciclo: FilaCiclo[] = [];
  pedidos: Pedido[] = [];
  /** Hora de la base de datos (el now() del SQL). Se puede adelantar para vencer códigos. */
  ahora = new Date('2026-11-14T15:00:00Z').getTime();
  private contador = 0;

  adelantarHoras(h: number) {
    this.ahora += h * 3600 * 1000;
  }

  /** Crea una cuenta (como si ya se hubiera registrado) y devuelve sus datos de ingreso. */
  crearUsuario(email: string, password = 'clave-de-prueba-123'): Usuario {
    const u = { id: `usuario-${++this.contador}-${email.split('@')[0]}`, email, password };
    this.usuarios.push(u);
    return u;
  }

  /**
   * Conecta un navegador (contexto) a este Neon falso. Cada contexto tiene su propia sesión, como cada teléfono.
   * Con `usuario`, el teléfono ya tiene la sesión abierta (como una usuaria que entró ayer).
   */
  async instalar(context: BrowserContext, usuario?: Usuario) {
    const sesion: { id: string | null } = { id: usuario?.id ?? null };
    await context.route(/\.neon\.tech\//, (route) => this.atender(route, sesion));
  }

  // ---------- HTTP ----------

  private async atender(route: Route, sesion: { id: string | null }) {
    const req = route.request();
    const url = new URL(req.url());
    const origen = req.headers()['origin'] ?? '*';
    const cors = {
      'access-control-allow-origin': origen,
      'access-control-allow-credentials': 'true',
      'access-control-allow-headers': req.headers()['access-control-request-headers'] ?? '*',
      'access-control-allow-methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
      'access-control-expose-headers': 'set-auth-jwt,content-range',
    };
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });

    const esAuth = url.hostname.includes('neonauth');
    const ruta = url.pathname.replace(/^\/neondb/, '').replace(/^\/auth/, '') || '/';
    const cuerpo = req.postData() ?? '';
    const quien = esAuth ? sesion.id : idDeJwt(req.headers()['authorization']);
    let status = 200;
    let json: unknown;
    const extra: Record<string, string> = {};
    try {
      if (esAuth) ({ status, json } = this.auth(req.method(), ruta, cuerpo, sesion, extra));
      else ({ status, json } = this.datos(req.method(), ruta, url.searchParams, cuerpo, quien, req.headers()['accept'] ?? ''));
    } catch (e) {
      status = 500;
      json = { message: (e as Error).message };
    }
    const texto = json === undefined ? '' : JSON.stringify(json);
    this.pedidos.push({ quien, metodo: req.method(), ruta: esAuth ? `auth${ruta}` : ruta, consulta: url.search, cuerpo, respuesta: texto });
    await route.fulfill({ status, headers: { ...cors, ...extra, 'content-type': 'application/json' }, body: texto });
  }

  // ---------- Neon Auth ----------

  private auth(metodo: string, ruta: string, cuerpo: string, sesion: { id: string | null }, extra: Record<string, string>) {
    const usuario = (u: Usuario) => ({ id: u.id, email: u.email, name: u.email.split('@')[0], emailVerified: true, image: null, createdAt: '2026-11-01T00:00:00Z', updatedAt: '2026-11-01T00:00:00Z' });
    const completa = (u: Usuario) => ({
      session: { id: `s-${u.id}`, token: `t-${u.id}`, userId: u.id, expiresAt: '2100-01-01T00:00:00Z', createdAt: '2026-11-01T00:00:00Z', updatedAt: '2026-11-01T00:00:00Z' },
      user: usuario(u),
    });
    if (ruta === '/get-session') {
      const u = this.usuarios.find((x) => x.id === sesion.id);
      if (u) extra['set-auth-jwt'] = jwtDe(u.id);
      return { status: 200, json: u ? completa(u) : null };
    }
    if (ruta === '/token') {
      const u = this.usuarios.find((x) => x.id === sesion.id);
      return u ? { status: 200, json: { token: jwtDe(u.id) } } : { status: 401, json: { message: 'No hay sesión' } };
    }
    if (ruta === '/sign-out') {
      sesion.id = null;
      return { status: 200, json: { success: true } };
    }
    if (ruta === '/sign-in/email' || ruta === '/sign-up/email') {
      const b = JSON.parse(cuerpo || '{}') as { email: string; password: string };
      let u = this.usuarios.find((x) => x.email === b.email);
      if (ruta === '/sign-up/email') {
        if (u) return { status: 422, json: { message: 'User already exists', code: 'USER_ALREADY_EXISTS' } };
        u = this.crearUsuario(b.email, b.password);
      } else if (!u || u.password !== b.password) {
        return { status: 401, json: { message: 'Invalid email or password', code: 'INVALID_EMAIL_OR_PASSWORD' } };
      }
      sesion.id = u.id;
      extra['set-auth-jwt'] = jwtDe(u.id);
      return { status: 200, json: { redirect: false, token: `t-${u.id}`, ...completa(u) } };
    }
    return { status: 404, json: { message: `Neon falso: sin ruta de auth ${metodo} ${ruta}` } };
  }

  // ---------- Data API (PostgREST + RLS) ----------

  private datos(metodo: string, ruta: string, q: URLSearchParams, cuerpo: string, uid: string | null, accept: string) {
    if (!uid) return { status: 401, json: { code: '42501', message: 'permission denied (sin sesión)' } };
    const ok = (json: unknown, status = 200) => ({ status, json });
    const como = (filas: unknown[]) => {
      if (accept.includes('vnd.pgrst.object')) {
        if (filas.length === 1) return ok(filas[0]);
        return { status: 406, json: { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned', details: `The result contains ${filas.length} rows` } };
      }
      return ok(filas);
    };
    const eq = (campo: string) => q.get(campo)?.replace(/^eq\./, '');
    const body = (): Record<string, unknown> => JSON.parse(cuerpo || '{}');
    const colonas = <T extends object>(f: T): Partial<T> => {
      const sel = q.get('select');
      if (!sel || sel === '*') return f;
      return Object.fromEntries(sel.split(',').map((c) => [c.trim(), (f as Record<string, unknown>)[c.trim()]])) as Partial<T>;
    };
    const ahoraISO = () => new Date(this.ahora).toISOString();

    // --- tabla pareja · SQL: políticas "duena" y "pareja lee" ---
    if (ruta === '/rest/v1/pareja') {
      const visibles = this.pareja.filter((f) => f.owner_id === uid || f.pareja_id === uid);
      const propias = (): FilaPareja[] => {
        const o = eq('owner_id');
        return this.pareja.filter((f) => f.owner_id === uid && (!o || f.owner_id === o));
      };
      if (metodo === 'GET') {
        const o = eq('owner_id');
        const p = eq('pareja_id');
        return como(visibles.filter((f) => (!o || f.owner_id === o) && (!p || f.pareja_id === p)).map(colonas));
      }
      if (metodo === 'POST') {
        // upsert de la dueña: with check (auth.user_id() = owner_id)
        const b = body();
        if (b.owner_id !== uid) return { status: 403, json: { code: '42501', message: 'new row violates row-level security policy for table "pareja"' } };
        if (b.codigo && this.pareja.some((f) => f.codigo === b.codigo && f.owner_id !== uid)) return { status: 409, json: { code: '23505', message: 'duplicate key value violates unique constraint' } };
        const previa = this.pareja.find((f) => f.owner_id === uid);
        const fila: FilaPareja = { owner_id: uid, codigo: null, codigo_expira: null, pareja_id: null, resumen: null, updated_at: ahoraISO(), ...previa, ...(b as object) } as FilaPareja;
        this.pareja = [...this.pareja.filter((f) => f.owner_id !== uid), fila];
        return ok(undefined, 201);
      }
      if (metodo === 'PATCH') {
        const b = body();
        for (const f of propias()) Object.assign(f, b);
        return ok(undefined, 204);
      }
      if (metodo === 'DELETE') {
        const borrar = new Set(propias());
        this.pareja = this.pareja.filter((f) => !borrar.has(f));
        return ok(undefined, 204);
      }
    }

    // --- SQL: canjear_codigo_pareja(c) — security definer ---
    if (ruta === '/rest/v1/rpc/canjear_codigo_pareja' && metodo === 'POST') {
      const c = String((body() as { c?: string }).c ?? '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      const f = this.pareja.find((x) => x.codigo === c && x.codigo_expira && new Date(x.codigo_expira).getTime() > this.ahora && x.owner_id !== uid);
      if (!f) return ok(null);
      f.pareja_id = uid;
      f.codigo = null;
      f.codigo_expira = null;
      return ok(f.resumen);
    }

    // --- SQL: soltar_pareja() — security definer ---
    if (ruta === '/rest/v1/rpc/soltar_pareja' && metodo === 'POST') {
      for (const f of this.pareja) if (f.pareja_id === uid) f.pareja_id = null;
      return ok(undefined, 204);
    }

    // --- tabla ciclo_data · SQL: cada una ve solo su fila ---
    if (ruta === '/rest/v1/ciclo_data') {
      if (metodo === 'GET') {
        const u = eq('user_id');
        return como(this.ciclo.filter((f) => f.user_id === uid && (!u || f.user_id === u)).map(colonas));
      }
      if (metodo === 'POST') {
        const b = body() as unknown as FilaCiclo;
        if (b.user_id !== uid) return { status: 403, json: { code: '42501', message: 'new row violates row-level security policy for table "ciclo_data"' } };
        this.ciclo = [...this.ciclo.filter((f) => f.user_id !== uid), b];
        return ok(undefined, 201);
      }
      if (metodo === 'DELETE') {
        this.ciclo = this.ciclo.filter((f) => f.user_id !== uid);
        return ok(undefined, 204);
      }
    }

    return { status: 404, json: { message: `Neon falso: sin ruta de datos ${metodo} ${ruta}${q.size ? `?${q}` : ''}` } };
  }
}
