// Consentimiento al crear la cuenta: qué texto aceptó, cuándo y que declaró tener 18 años o más.
// Se acepta en el login (antes de que exista su cuenta), así que queda pendiente en el teléfono y pasa a sus
// datos (y a su copia) la primera vez que entra. Lo piden la Ley 1581 de Colombia (arts. 7 y 9) y la LFPDPPP de México.
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Consentimiento } from './types';

// Cambiar la versión cada vez que cambie el texto de la casilla de Login.tsx.
export const VERSION_CONSENTIMIENTO = '2026-11-10';
const PENDIENTE = 'ciclo:consentimiento-pendiente';

export function registroConsentimiento(ahora: Date = new Date()): Consentimiento {
  return { fecha: ahora.toISOString(), version: VERSION_CONSENTIMIENTO, mayorDeEdad: true };
}

export async function guardarConsentimientoPendiente(): Promise<void> {
  await AsyncStorage.setItem(PENDIENTE, JSON.stringify(registroConsentimiento())).catch(() => {});
}

/** El consentimiento que aceptó en este teléfono, si hay uno sin pasar a su cuenta. Lo borra al leerlo. */
export async function tomarConsentimientoPendiente(): Promise<Consentimiento | null> {
  try {
    const raw = await AsyncStorage.getItem(PENDIENTE);
    if (!raw) return null;
    await AsyncStorage.removeItem(PENDIENTE);
    const c = JSON.parse(raw) as Consentimiento;
    return typeof c?.fecha === 'string' && typeof c?.version === 'string' ? c : null;
  } catch {
    return null;
  }
}
