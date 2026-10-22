// Iconos de la navegación, copiados del diseño de Savia (trazo 1,8, viewBox 24).
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type NavIconId = 'hoy' | 'calendario' | 'cuidate' | 'resumen' | 'perfil';

export function NavIcon({ id, color, size = 22 }: { id: NavIconId; color: string; size?: number }) {
  const p = { fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {id === 'hoy' && (
        <>
          <Circle cx={12} cy={12} r={2.6} {...p} />
          <Path d="M12 9.4C10 7.6 10 4.8 12 3c2 1.8 2 4.6 0 6.4zM14.6 12c1.8-2 4.6-2 6.4 0-1.8 2-4.6 2-6.4 0zM12 14.6c2 1.8 2 4.6 0 6.4-2-1.8-2-4.6 0-6.4zM9.4 12C7.6 14 4.8 14 3 12c1.8-2 4.6-2 6.4 0z" {...p} />
        </>
      )}
      {id === 'calendario' && (
        <>
          <Rect x={3.5} y={5} width={17} height={15.5} rx={3} {...p} />
          <Path d="M3.5 10h17M8 3v4M16 3v4" {...p} />
          <Circle cx={12} cy={15} r={1.4} fill={color} />
        </>
      )}
      {id === 'cuidate' && <Path d="M12 20.5s-7.5-4.4-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.8-7.5 10.2-7.5 10.2z" {...p} />}
      {id === 'resumen' && <Path d="M5 20v-7M12 20V5M19 20v-10" {...p} />}
      {id === 'perfil' && (
        <>
          <Circle cx={12} cy={8.5} r={4} {...p} />
          <Path d="M4.5 20.5c1.4-3.8 4.3-5.6 7.5-5.6s6.1 1.8 7.5 5.6" {...p} />
        </>
      )}
    </Svg>
  );
}
