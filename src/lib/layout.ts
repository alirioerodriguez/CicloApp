// Tamaño de pantalla: teléfono, tablet o escritorio (en la web, o una tablet apaisada).
import { useWindowDimensions } from 'react-native';

export type Tamano = 'telefono' | 'tablet' | 'escritorio';

export const BREAK_TABLET = 700;
export const BREAK_ESCRITORIO = 1024;

export function useLayout() {
  const { width, height } = useWindowDimensions();
  const tamano: Tamano = width >= BREAK_ESCRITORIO ? 'escritorio' : width >= BREAK_TABLET ? 'tablet' : 'telefono';
  return {
    width,
    height,
    tamano,
    ancho: tamano !== 'telefono',
    // Ancho máximo del contenido y margen lateral de cada pantalla.
    maxWidth: tamano === 'escritorio' ? 1080 : tamano === 'tablet' ? 760 : 640,
    padding: tamano === 'escritorio' ? 36 : tamano === 'tablet' ? 28 : 18,
    // En escritorio las pestañas van en una barra lateral.
    barraLateral: tamano === 'escritorio',
  };
}
