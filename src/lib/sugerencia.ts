// «Queremos escucharte»: arma la sugerencia que se manda al panel de Alirio (App de apps, api/sugerir).
// Las mismas reglas que valida el panel, para avisar antes de mandar. No viaja nada de su ciclo: solo lo que escribe.
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const SUGERIR_URL = 'https://app-de-apps-alirio.vercel.app/api/sugerir';
export type TipoSugerencia = 'idea' | 'problema' | 'otra';

type Cuerpo = { app: 'savia'; tipo: TipoSugerencia; texto: string; mail: string | null; web: string; version: string };

export function armarSugerencia(d: { tipo: TipoSugerencia; texto: string; mail: string; web?: string; version?: string }): { cuerpo: Cuerpo } | { error: string } {
  const texto = d.texto.trim();
  const mail = d.mail.trim();
  if (texto.length < 3) return { error: 'Escribe un poco más, así entendemos qué nos quieres contar.' };
  if (texto.length > 2000) return { error: 'Es muy largo: hasta 2000 letras.' };
  if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) return { error: 'Revisa el mail: tiene que ser como nombre@ejemplo.com.' };
  return { cuerpo: { app: 'savia', tipo: d.tipo, texto, mail: mail || null, web: d.web ?? '', version: d.version ?? 'savia' } };
}

/** Versión que acompaña la sugerencia, para saber en cuál apareció un problema. */
export function versionApp(): string {
  return `${Platform.OS} ${Constants.expoConfig?.version ?? ''}`.trim();
}

/** Manda la sugerencia. true si llegó. */
export async function mandarSugerencia(cuerpo: Cuerpo): Promise<boolean> {
  try {
    const r = await fetch(SUGERIR_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) });
    return r.ok;
  } catch {
    return false;
  }
}
