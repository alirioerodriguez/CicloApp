// Iconos de línea (Lucide, trazo 1,8 como el diseño de Savia), dibujados con react-native-svg. La app no muestra emojis:
// el contenido guarda un emoji como "clave" y aquí se traduce a su icono.
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';
import { TRAZOS, type NodoIcono } from './trazos-iconos';
import { useColors } from '../lib/theme';

export { iconoDe } from './mapaIconos';
import { iconoDe } from './mapaIconos';

const ELEMENTOS: Record<string, typeof Path> = { path: Path, circle: Circle, rect: Rect, line: Line, polyline: Polyline } as never;

function Trazo({ nombre, size, color, strokeWidth }: { nombre: string; size: number; color: string; strokeWidth: number }) {
  const nodos: NodoIcono[] = TRAZOS[nombre] ?? [];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {nodos.map(([tag, attrs], i) => {
        const E = ELEMENTOS[tag];
        return E ? <E key={i} {...(attrs as object)} /> : null;
      })}
    </Svg>
  );
}

/** Icono a partir de la clave emoji del contenido. Si no hay traducción, no muestra nada. */
export function Icono({ e, size = 20, color, strokeWidth = 1.8 }: { e?: string | null; size?: number; color?: string; strokeWidth?: number }) {
  const c = useColors();
  const nombre = iconoDe(e);
  if (!nombre) return null;
  return <Trazo nombre={nombre} size={size} color={color ?? c.rosa} strokeWidth={strokeWidth} />;
}

/** Icono dentro de una burbuja suave, para listas y tarjetas. */
export function IconoBurbuja({ e, size = 38, color, fondo }: { e?: string | null; size?: number; color?: string; fondo?: string }) {
  const c = useColors();
  const nombre = iconoDe(e);
  if (!nombre) return null;
  return (
    <Burbuja size={size} fondo={fondo ?? c.rosaSuave}>
      <Trazo nombre={nombre} size={Math.round(size * 0.5)} color={color ?? c.text} strokeWidth={1.8} />
    </Burbuja>
  );
}

function Burbuja({ size, fondo, children }: { size: number; fondo: string; children: ReactNode }) {
  return <View style={{ width: size, height: size, borderRadius: size * 0.32, backgroundColor: fondo, alignItems: 'center', justifyContent: 'center' }}>{children}</View>;
}
