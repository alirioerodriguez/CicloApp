// Cliente de Supabase: cuenta con correo y contraseña, y respaldo de los datos de cada usuaria en la nube.
// La URL y la clave publicable van en .env (EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_KEY).
// La clave publicable puede ir en la app: lo que protege los datos son las reglas RLS de la tabla.
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY ?? '';

export const supabaseConfigured = !!url && !!key;

export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(url, key, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        // En la web, lee la sesión de la URL al volver del enlace de confirmación o de nueva contraseña.
        detectSessionInUrl: Platform.OS === 'web',
      },
    })
  : null;

// En el teléfono, el token se renueva solo mientras la app está abierta.
if (supabase && Platform.OS !== 'web') {
  AppState.addEventListener('change', (s) => {
    if (s === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}

// ---------- Cuenta con correo y contraseña ----------

export async function signIn(email: string, password: string): Promise<void> {
  if (!supabase) throw new Error('Falta configurar Supabase.');
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw new Error(mensajeError(error.message));
}

// Devuelve true si la cuenta quedó lista; false si hay que confirmar el correo primero.
export async function signUp(email: string, password: string): Promise<boolean> {
  if (!supabase) throw new Error('Falta configurar Supabase.');
  const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
  if (error) throw new Error(mensajeError(error.message));
  return !!data.session;
}

export async function resetPassword(email: string): Promise<void> {
  if (!supabase) throw new Error('Falta configurar Supabase.');
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: Platform.OS === 'web' ? window.location.origin : undefined,
  });
  if (error) throw new Error(mensajeError(error.message));
}

// Los errores de Supabase vienen en inglés: se traducen los más comunes.
function mensajeError(m: string): string {
  if (/invalid login credentials/i.test(m)) return 'El correo o la contraseña no coinciden.';
  if (/email not confirmed/i.test(m)) return 'Todavía no confirmaste tu correo. Revisa tu bandeja de entrada.';
  if (/already registered|already been registered/i.test(m)) return 'Ya existe una cuenta con ese correo. Prueba entrar.';
  if (/password should be at least/i.test(m)) return 'La contraseña debe tener al menos 6 caracteres.';
  if (/rate limit|too many/i.test(m)) return 'Demasiados intentos. Espera un momento y vuelve a probar.';
  if (/invalid email|unable to validate email/i.test(m)) return 'Ese correo no parece válido.';
  if (/network|fetch/i.test(m)) return 'Sin conexión. Revisa tu internet.';
  return m;
}

export async function signOut(): Promise<void> {
  await supabase?.auth.signOut();
}

// ---------- Respaldo en la nube ----------
// Una fila por usuaria en la tabla ciclo_data (user_id, data jsonb, updated_at). RLS: cada una ve solo la suya.

export async function pullRemote(userId: string): Promise<{ data: unknown; updatedAt: string } | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('ciclo_data').select('data, updated_at').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data ? { data: data.data, updatedAt: data.updated_at } : null;
}

export async function pushRemote(userId: string, payload: unknown, updatedAt: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('ciclo_data').upsert({ user_id: userId, data: payload, updated_at: updatedAt });
  if (error) throw error;
}

export async function deleteRemote(userId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('ciclo_data').delete().eq('user_id', userId);
  if (error) throw error;
}
