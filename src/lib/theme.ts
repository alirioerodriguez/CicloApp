// Sistema visual del diseño "Ciclo": 12 tonos (suave + profundo) en modo Noche o Día.
// Fraunces para títulos y números, Plus Jakarta Sans para textos y botones.
import { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';

export const TONOS = [
  { id: 'rosa', nombre: 'Rosa', suave: '#F49DB4', profundo: '#B8325C' },
  { id: 'lavanda', nombre: 'Lavanda', suave: '#C3B6F7', profundo: '#6248C4' },
  { id: 'durazno', nombre: 'Durazno', suave: '#F7B79A', profundo: '#B4532A' },
  { id: 'coral', nombre: 'Coral', suave: '#FF9A8B', profundo: '#B83A2C' },
  { id: 'malva', nombre: 'Malva', suave: '#D9A3C9', profundo: '#8E3C7A' },
  { id: 'menta', nombre: 'Menta', suave: '#9FDCC8', profundo: '#2E7A63' },
  { id: 'cereza', nombre: 'Cereza', suave: '#F27C9B', profundo: '#A3123F' },
  { id: 'lila', nombre: 'Lila', suave: '#E0B0F0', profundo: '#8A3AA6' },
  { id: 'frambuesa', nombre: 'Frambuesa', suave: '#EE87B4', profundo: '#A21C5E' },
  { id: 'champagne', nombre: 'Champagne', suave: '#EBCB9E', profundo: '#8A6326' },
  { id: 'cielo', nombre: 'Cielo', suave: '#A9C8F5', profundo: '#2F5DA8' },
  { id: 'fucsia', nombre: 'Fucsia', suave: '#F58FD6', profundo: '#A0177E' },
] as const;

export type TonoId = (typeof TONOS)[number]['id'];
export type Modo = 'auto' | 'noche' | 'dia';

export interface Colors {
  bg: string;
  card: string;
  text: string;
  muted: string;
  line: string;
  rosa: string; // color de acento (sigue el tono elegido)
  rosaSuave: string;
  lavanda: string;
  lavandaSuave: string;
  salvia: string;
  salviaSuave: string;
  durazno: string;
  duraznoSuave: string;
  onAccent: string;
  dark: boolean;
}

function build(tonoId: TonoId, dark: boolean): Colors {
  const t = TONOS.find((x) => x.id === tonoId) ?? TONOS[0];
  if (dark) {
    return {
      dark,
      bg: '#1A1219',
      card: '#251A24',
      text: '#F6EEF3',
      muted: 'rgba(246,238,243,0.6)',
      line: 'rgba(246,238,243,0.12)',
      rosa: t.suave,
      rosaSuave: `${t.profundo}55`,
      lavanda: '#B9AEF0',
      lavandaSuave: '#2F2741',
      salvia: '#9FCDB7',
      salviaSuave: '#22322C',
      durazno: '#F2BF84',
      duraznoSuave: '#3D2E24',
      onAccent: '#1A1219',
    };
  }
  return {
    dark,
    bg: '#FBF7F4',
    card: '#FFFFFF',
    text: '#2A1F2B',
    muted: 'rgba(42,31,43,0.58)',
    line: 'rgba(42,31,43,0.12)',
    rosa: t.profundo,
    rosaSuave: `${t.suave}55`,
    lavanda: '#8F84D9',
    lavandaSuave: '#ECE8FB',
    salvia: '#6FA88E',
    salviaSuave: '#E3F1EA',
    durazno: '#E9A15F',
    duraznoSuave: '#FBEBD5',
    onAccent: '#FFFFFF',
  };
}

// La preferencia de tono y modo la pone el root layout leyendo los ajustes.
export const ThemePrefs = createContext<{ tono: TonoId; modo: Modo }>({ tono: 'rosa', modo: 'auto' });

export function useColors(): Colors {
  const { tono, modo } = useContext(ThemePrefs);
  const scheme = useColorScheme();
  const dark = modo === 'auto' ? scheme === 'dark' : modo === 'noche';
  return build(tono, dark);
}

export const radius = { sm: 10, md: 16, lg: 22, pill: 999 };

// Familias tipográficas (se cargan en el root layout).
export const serif = 'Fraunces_600SemiBold';
export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
};
