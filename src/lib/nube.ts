// Cuenta y respaldo en la nube con Neon (Postgres + Managed Better Auth, plan gratis).
// La URL va en .env como EXPO_PUBLIC_NEON_URL: es la URL HTTPS de la base de datos (no la cadena de conexión
// con contraseña). De ella salen las URLs de Neon Auth y del Data API. Lo que protege los datos son las reglas RLS.
import 'react-native-url-polyfill/auto';
import { createClient, defaultDeriveNeonUrls, SupabaseAuthAdapter } from '@neondatabase/neon-js';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { cifrarConLlave, descifrarConLlave, esSobre, type Llave, type Sobre } from './cifrado';

// Por defecto, el proyecto "savia" en Neon (plan Free). Es pública: sin usuario ni contraseña.
const url = process.env.EXPO_PUBLIC_NEON_URL ?? 'https://ep-old-bar-b5e0wyej.c-7.us-east-2.aws.neon.tech/neondb';

export const nubeConfigurada = !!url;

// Versión web publicada: el ingreso con Google del celular pasa por ella (ver signInGoogle).
export const WEB = 'https://cicloapp.vercel.app';
const urlAuth = url ? defaultDeriveNeonUrls(url).auth : '';

function crear() {
  const u = defaultDeriveNeonUrls(url);
  // El adaptador "Supabase" da la misma API de sesión: signInWithPassword, onAuthStateChange, etc.
  return createClient({ auth: { adapter: SupabaseAuthAdapter(), url: u.auth }, dataApi: { url: u.dataApi } });
}

export const neon = nubeConfigurada ? crear() : null;

// Google y Apple: en la web, Neon Auth redirige al proveedor y vuelve a la página. En el celular se abre la
// versión web en una ventana segura del sistema; esa página entra con el proveedor y vuelve a la app con un
// código de un solo uso (neon_auth_session_verifier), que la app canjea por la sesión. Ver index.js.
export type Proveedor = 'google' | 'apple';
export const googleDisponible = nubeConfigurada;
// Apple exige «Iniciar sesión con Apple» en iPhone si hay Google (regla 4.8). En la web y en Android se muestra
// solo con EXPO_PUBLIC_APPLE_LOGIN=1, cuando las credenciales de Apple ya están cargadas en Neon Auth.
export const appleDisponible = nubeConfigurada && (Platform.OS === 'ios' || process.env.EXPO_PUBLIC_APPLE_LOGIN === '1');

// ---------- Cuenta ----------

export async function signIn(email: string, password: string): Promise<void> {
  if (!neon) throw new Error('Falta configurar la nube.');
  const { error } = await neon.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw new Error(mensajeError(error.message));
}

// Devuelve true si la cuenta quedó lista; false si hay que confirmar el correo primero.
export async function signUp(email: string, password: string): Promise<boolean> {
  if (!neon) throw new Error('Falta configurar la nube.');
  const { data, error } = await neon.auth.signUp({ email: email.trim(), password });
  if (error) throw new Error(mensajeError(error.message));
  return !!data.session;
}

// Devuelve false si la usuaria cerró la ventana del proveedor sin terminar.
export async function signInSocial(proveedor: Proveedor, volverA?: string): Promise<boolean> {
  if (!neon) throw new Error('Falta configurar la nube.');
  const nombre = proveedor === 'apple' ? 'Apple' : 'Google';
  if (Platform.OS === 'web') {
    const { error } = await neon.auth.signInWithOAuth({ provider: proveedor, options: { redirectTo: volverA ?? window.location.origin } });
    if (error) throw new Error(mensajeError(error.message));
    return true;
  }
  const r = await WebBrowser.openAuthSessionAsync(`${WEB}/?ingresoApp=${proveedor}`, 'ciclo://auth');
  if (r.type !== 'success') return false;
  const codigo = /[?&]neon_auth_session_verifier=([^&#]+)/.exec(r.url)?.[1];
  if (!codigo) throw new Error(`No se pudo entrar con ${nombre}. Prueba de nuevo.`);
  // El servidor de Neon Auth canjea el código por la sesión y la deja guardada en el teléfono (cookie)
  const res = await fetch(`${urlAuth}/get-session?neon_auth_session_verifier=${codigo}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`No se pudo entrar con ${nombre}. Prueba de nuevo.`);
  await refrescarSesion?.();
  return true;
}

export const signInGoogle = (volverA?: string) => signInSocial('google', volverA);
export const signInApple = (volverA?: string) => signInSocial('apple', volverA);

// La pone AuthProvider (lib/auth.tsx) para avisar que hay sesión nueva después de Google o Apple en el celular
let refrescarSesion: (() => Promise<void>) | null = null;
export function alCambiarSesion(f: (() => Promise<void>) | null) {
  refrescarSesion = f;
}

export async function resetPassword(email: string): Promise<void> {
  if (!neon) throw new Error('Falta configurar la nube.');
  const { error } = await neon.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: Platform.OS === 'web' ? window.location.origin : 'https://cicloapp.vercel.app',
  });
  if (error) throw new Error(mensajeError(error.message));
}

// Los errores vienen en inglés: se traducen los más comunes.
function mensajeError(m: string): string {
  if (/invalid (login )?credentials|invalid email or password/i.test(m)) return 'El correo o la contraseña no coinciden.';
  if (/not (been )?confirmed|verify your email|email not verified/i.test(m)) return 'Todavía no confirmaste tu correo. Revisa tu bandeja de entrada.';
  if (/already (registered|exists)|user exists/i.test(m)) return 'Ya existe una cuenta con ese correo. Prueba entrar.';
  if (/password.*(short|at least|least)/i.test(m)) return 'La contraseña debe tener al menos 8 caracteres.';
  if (/rate limit|too many/i.test(m)) return 'Demasiados intentos. Espera un momento y vuelve a probar.';
  if (/invalid email/i.test(m)) return 'Ese correo no parece válido.';
  if (/network|fetch/i.test(m)) return 'Sin conexión. Revisa tu internet.';
  return m;
}

export async function signOut(): Promise<void> {
  await neon?.auth.signOut();
}

// ---------- Respaldo en la nube ----------
// Una fila por usuaria en la tabla ciclo_data (user_id, data jsonb, updated_at). RLS: cada una ve solo la suya.

// Si la usuaria activó el cifrado, `data` es un «sobre» (AES-256-GCM, ver lib/cifrado.ts) y el servidor no puede leer nada.
export interface Remoto {
  /** null cuando hay un respaldo cifrado y todavía no se puso la frase. */
  data: unknown;
  updatedAt: string;
  /** El respaldo de la nube está cifrado. */
  cifrado: boolean;
}

// Con `llave` abre el sobre (si la frase no era la correcta, tira ErrorCifrado). Sin llave y con un respaldo
// cifrado devuelve { data: null, cifrado: true }: quien llama no debe subir nada encima de eso.
export async function pullRemote(userId: string, llave?: Llave | null): Promise<Remoto | null> {
  if (!neon) return null;
  const { data, error } = await neon.from('ciclo_data').select('data, updated_at').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  const fila = data as { data: unknown; updated_at: string } | null;
  if (!fila) return null;
  if (!esSobre(fila.data)) return { data: fila.data, updatedAt: fila.updated_at, cifrado: false };
  if (!llave) return { data: null, updatedAt: fila.updated_at, cifrado: true };
  return { data: descifrarConLlave(fila.data, llave, 'nube'), updatedAt: fila.updated_at, cifrado: true };
}

// El sobre cifrado tal cual está en la nube (sin abrirlo), para derivar la llave con su sal. null si no hay o no está cifrado.
export async function leerSobreRemoto(userId: string): Promise<{ sobre: Sobre; updatedAt: string } | null> {
  if (!neon) return null;
  const { data, error } = await neon.from('ciclo_data').select('data, updated_at').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  const fila = data as { data: unknown; updated_at: string } | null;
  return fila && esSobre(fila.data) ? { sobre: fila.data, updatedAt: fila.updated_at } : null;
}

// Con `llave` lo que sube ya va cifrado desde el teléfono.
export async function pushRemote(userId: string, payload: unknown, updatedAt: string, llave?: Llave | null): Promise<void> {
  if (!neon) return;
  const data = llave ? cifrarConLlave(payload, llave, 'nube') : payload;
  const { error } = await neon.from('ciclo_data').upsert({ user_id: userId, data, updated_at: updatedAt });
  if (error) throw error;
}

// Cierra la cuenta. Primero con la función de la web (api/borrar-usuario), que borra el usuario con la API
// de Neon; si no está configurada, prueba `delete-user` de Neon Auth. Devuelve false si ninguna pudo: los
// datos ya se borraron antes y la usuaria puede pedir el cierre por correo.
export async function borrarUsuario(): Promise<boolean> {
  if (!neon) return false;
  try {
    const { data } = await neon.auth.getSession();
    const token = (data.session as { access_token?: string } | null)?.access_token;
    if (token) {
      const base = Platform.OS === 'web' ? '' : WEB;
      const r = await fetch(`${base}/api/borrar-usuario`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) return true;
    }
  } catch {
    // Sin conexión o sin la función: se prueba lo de Neon Auth.
  }
  try {
    const ba = (neon.auth as unknown as { getBetterAuthInstance(): { deleteUser(o?: object): Promise<{ error?: { message?: string } | null } | null> } }).getBetterAuthInstance();
    const r = await ba.deleteUser({});
    return !r?.error;
  } catch {
    return false;
  }
}

export async function deleteRemote(userId: string): Promise<void> {
  if (!neon) return;
  const { error } = await neon.from('ciclo_data').delete().eq('user_id', userId);
  if (error) throw error;
}

// ---------- Modo pareja ----------
// Tabla pareja (neon/pareja.sql): una fila por usuaria con su resumen. La pareja la lee cuando canjea el código.

export async function crearCodigoPareja(userId: string, codigo: string, resumen: unknown): Promise<void> {
  if (!neon) throw new Error('Falta configurar la nube.');
  const expira = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
  const { error } = await neon.from('pareja').upsert({ owner_id: userId, codigo, codigo_expira: expira, resumen, updated_at: new Date().toISOString() });
  if (error) throw new Error(mensajeError(error.message));
}

export interface EstadoPareja {
  conectada: boolean;
  codigo: string | null;
  expira: string | null;
}

export async function estadoPareja(userId: string): Promise<EstadoPareja | null> {
  if (!neon) return null;
  const { data, error } = await neon.from('pareja').select('pareja_id, codigo, codigo_expira').eq('owner_id', userId).maybeSingle();
  if (error) throw error;
  const f = data as { pareja_id: string | null; codigo: string | null; codigo_expira: string | null } | null;
  if (!f) return null;
  const vigente = !!f.codigo && !!f.codigo_expira && new Date(f.codigo_expira) > new Date();
  return { conectada: !!f.pareja_id, codigo: vigente ? f.codigo : null, expira: vigente ? f.codigo_expira : null };
}

// Solo actualiza: si ella dejó de compartir (fila borrada), no vuelve a crearla.
export async function subirResumenPareja(userId: string, resumen: unknown): Promise<void> {
  if (!neon) return;
  const { error } = await neon.from('pareja').update({ resumen, updated_at: new Date().toISOString() }).eq('owner_id', userId);
  if (error) throw error;
}

export async function dejarDeCompartir(userId: string): Promise<void> {
  if (!neon) return;
  const { error } = await neon.from('pareja').delete().eq('owner_id', userId);
  if (error) throw error;
}

// La pareja canjea el código. Devuelve el resumen, o null si el código no existe o venció.
export async function canjearCodigo(codigo: string): Promise<unknown | null> {
  if (!neon) throw new Error('Falta configurar la nube.');
  const { data, error } = await neon.rpc('canjear_codigo_pareja', { c: codigo });
  if (error) throw new Error(mensajeError(error.message));
  return data ?? null;
}

// La pareja lee el resumen. undefined = sin conexión con nadie (ella dejó de compartir).
export async function leerResumenPareja(userId: string): Promise<unknown | undefined> {
  if (!neon) return undefined;
  const { data, error } = await neon.from('pareja').select('resumen').eq('pareja_id', userId).maybeSingle();
  if (error) throw error;
  return (data as { resumen: unknown } | null)?.resumen ?? undefined;
}

export async function soltarPareja(): Promise<void> {
  if (!neon) return;
  const { error } = await neon.rpc('soltar_pareja');
  if (error) throw error;
}
