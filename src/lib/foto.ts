// Foto de perfil: la que ella elige (achicada a 256 px para que el respaldo no pese) o la de su cuenta de Google.
// La foto elegida queda en sus datos (en el teléfono y en su respaldo); no se comparte con nadie.
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

export const LADO_FOTO = 256;

/** Qué foto mostrar: primero la que eligió, después la de su cuenta. Sin ninguna, null (se muestra la inicial). */
export function fotoParaMostrar(propia: string | null | undefined, deCuenta: string | null | undefined): string | null {
  if (propia && propia.startsWith('data:image/')) return propia;
  if (deCuenta && /^https:\/\//.test(deCuenta)) return deCuenta;
  return null;
}

/** La inicial del nombre (o del mail) para cuando no hay foto. */
export function inicial(nombre: string | null | undefined, mail?: string | null): string {
  const base = (nombre || '').trim() || (mail || '').trim();
  return base ? base[0].toLocaleUpperCase('es') : '🌸';
}

/** Abre la galería, recorta en cuadrado y devuelve la foto achicada como data URI JPEG. null si canceló. */
export async function elegirFoto(): Promise<string | null> {
  const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 1 });
  if (r.canceled || !r.assets?.length) return null;
  const a = r.assets[0];
  // Cuadrado: se recorta al centro por si el teléfono no ofreció el recorte (iPhone sin edición, web)
  const lado = Math.min(a.width || LADO_FOTO, a.height || LADO_FOTO);
  const ctx = ImageManipulator.manipulate(a.uri);
  if (a.width && a.height && a.width !== a.height) ctx.crop({ originX: Math.round((a.width - lado) / 2), originY: Math.round((a.height - lado) / 2), width: lado, height: lado });
  const imagen = await ctx.resize({ width: LADO_FOTO, height: LADO_FOTO }).renderAsync();
  const guardada = await imagen.saveAsync({ format: SaveFormat.JPEG, compress: 0.8, base64: true });
  return guardada.base64 ? `data:image/jpeg;base64,${guardada.base64}` : null;
}
