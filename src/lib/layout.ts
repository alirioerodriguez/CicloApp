// Tamaño de pantalla: teléfono, tablet o escritorio (en la web, o una tablet apaisada).
import { useWindowDimensions } from 'react-native';

export type Tamano = 'telefono' | 'tablet' | 'escritorio';

export const BREAK_TABLET = 700;
export const BREAK_ESCRITORIO = 1024;
export const ANCHO_BARRA = 232;

export function useLayout() {
  const { width, height } = useWindowDimensions();
  const tamano: Tamano = width >= BREAK_ESCRITORIO ? 'escritorio' : width >= BREAK_TABLET ? 'tablet' : 'telefono';
  const maxWidth = tamano === 'escritorio' ? 1080 : tamano === 'tablet' ? 760 : 640;
  const padding = tamano === 'escritorio' ? 36 : tamano === 'tablet' ? 28 : 18;
  // Desde la tablet las pestañas van en una barra lateral (como HonorApp), que le quita ancho al contenido.
  const barraLateral = tamano !== 'telefono';
  const contenido = Math.min(maxWidth, width - (barraLateral ? ANCHO_BARRA : 0)) - padding * 2;
  return {
    width,
    height,
    tamano,
    ancho: tamano !== 'telefono',
    maxWidth,
    padding,
    barraLateral,
    contenido,
    // Dos columnas solo si cada una queda de al menos 340 px.
    dosColumnas: contenido >= 700,
    // Tres columnas para grillas de tarjetas, cada una de al menos 300 px.
    tresColumnas: contenido >= 960,
  };
}
