// Logo de "Ciclo": el anillo abierto es el ciclo que se repite; la gota marca el inicio del período.
import { useContext } from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { ThemePrefs, TONOS } from '../lib/theme';

export function Logo({ size = 48 }: { size?: number }) {
  const { tono } = useContext(ThemePrefs);
  const t = TONOS.find((x) => x.id === tono) ?? TONOS[0];
  const r = 30;
  const c = 2 * Math.PI * r;
  const gap = c * 0.16; // abertura arriba, donde cae la gota
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle
        cx={50}
        cy={60}
        r={r}
        stroke={t.suave}
        strokeWidth={11}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${c - gap} ${gap}`}
        // El trazo empieza a las 3; se gira para que la abertura quede arriba.
        transform={`rotate(${-90 + (gap / c) * 180} 50 60)`}
      />
      <Path d="M50 6 C50 6 36 24 36 32 a14 14 0 0 0 28 0 C64 24 50 6 50 6 Z" fill={t.profundo} />
    </Svg>
  );
}
