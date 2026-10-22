// Cuenta y respaldo en la nube con Neon (Postgres + Managed Better Auth, plan gratis).
// La URL va en .env como EXPO_PUBLIC_NEON_URL: es la URL HTTPS de la base de datos (no la cadena de conexión
// con contraseña). De ella salen las URLs de Neon Auth y del Data API. Lo que protege los datos son las reglas RLS.
import 'react-native-url-polyfill/auto';
import { createClient, defaultDeriveNeonUrls, SupabaseAuthAdapter } from '@neondatabase/neon-js';
import { Platform } from 'react-native';

// Por defecto, el proyecto "savia" en Neon (plan Free). Es pública: sin usuario ni contraseña.
const url = process.env.EXPO_PUBLIC_NEON_URL ?? 'https://ep-old-bar-b5e0wyej.c-7.us-east-2.aws.neon.tech/neondb';

export const nubeConfigurada = !!url;

function crear() {
  const u = defaultDeriveNeonUrls(url);
  // El adaptador "Supabase" da la misma API de sesión: signInWithPassword, onAuthStateChange, etc.
  return createClient({ auth: { adapter: SupabaseAuthAdapter(), url: u.auth }, dataApi: { url: u.dataApi } });
}

export const neon = nubeConfigurada ? crear() : null;

// Google funciona en la web: Neon Auth redirige a Google y vuelve a la app.
export const googleDisponible = nubeConfigurada && Platform.OS === 'web';

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

export async function signInGoogle(): Promise<void> {
  if (!neon) throw new Error('Falta configurar la nube.');
  const { error } = await neon.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
  if (error) throw new Error(mensajeError(error.message));
}

export async function resetPassword(email: string): Promise<void> {
  if (!neon) throw new Error('Falta configurar la nube.');
  const { error } = await neon.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: Platform.OS === 'web' ? window.location.origin : undefined,
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

export async function pullRemote(userId: string): Promise<{ data: unknown; updatedAt: string } | null> {
  if (!neon) return null;
  const { data, error } = await neon.from('ciclo_data').select('data, updated_at').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  const fila = data as { data: unknown; updated_at: string } | null;
  return fila ? { data: fila.data, updatedAt: fila.updated_at } : null;
}

export async function pushRemote(userId: string, payload: unknown, updatedAt: string): Promise<void> {
  if (!neon) return;
  const { error } = await neon.from('ciclo_data').upsert({ user_id: userId, data: payload, updated_at: updatedAt });
  if (error) throw error;
}

export async function deleteRemote(userId: string): Promise<void> {
  if (!neon) return;
  const { error } = await neon.from('ciclo_data').delete().eq('user_id', userId);
  if (error) throw error;
}
