// Tu flor de hoy (diseño 7c): 10 pétalos con los colores de tus respuestas, que se abren al aparecer
// y se mecen suave. Sin animación si el sistema pide reducir movimiento.
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { useColors } from '../lib/theme';

const PETALO = 'M0 0 C 22 -18, 24 -62, 0 -84 C -24 -62, -22 -18, 0 0Z';
const PETALO_INT = 'M0 0 C 13 -10, 14 -38, 0 -52 C -14 -38, -13 -10, 0 0Z';

export function Flor({ colores, abierta = true, size = 260 }: { colores: string[]; abierta?: boolean; size?: number }) {
  const c = useColors();
  const crecer = useRef(new Animated.Value(abierta ? 0 : 1)).current;
  const vaiven = useRef(new Animated.Value(0)).current;
  const [quieta, setQuieta] = useState(false);

  useEffect(() => {
    let vivo = true;
    let loop: Animated.CompositeAnimation | null = null;
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reducir) => {
        if (!vivo) return;
        if (reducir) {
          crecer.setValue(1);
          setQuieta(true);
          return;
        }
        Animated.timing(crecer, { toValue: 1, duration: 1100, easing: Easing.bezier(0.3, 1.3, 0.5, 1), useNativeDriver: true }).start();
        loop = Animated.loop(
          Animated.sequence([
            Animated.timing(vaiven, { toValue: 1, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(vaiven, { toValue: -1, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          ]),
        );
        loop.start();
      });
    return () => {
      vivo = false;
      loop?.stop();
    };
  }, [crecer, vaiven]);

  const giro = vaiven.interpolate({ inputRange: [-1, 1], outputRange: ['-3deg', '3deg'] });
  const cols = colores.length ? colores : [c.rosaSuave];

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Tallo y hoja, quietos */}
      <Svg width={size} height={size} viewBox="0 0 280 280" style={{ position: 'absolute' }}>
        {abierta && <Path d="M140 150 C 138 200, 146 230, 140 272" fill="none" stroke="#8FBF9F" strokeWidth={5} strokeLinecap="round" />}
        {abierta && <Path d="M141 228 C 160 212, 178 214, 186 222 C 172 234, 156 236, 141 228Z" fill="#8FBF9F" />}
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          const r = 112 + (i % 3) * 8;
          return <Circle key={i} cx={140 + Math.sin(a) * r} cy={140 - Math.cos(a) * r} r={2.2 + (i % 2)} fill={c.rosa} opacity={0.7} />;
        })}
      </Svg>
      <Animated.View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          opacity: crecer.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 1] }),
          transform: quieta ? [] : [{ scale: crecer }, { rotate: giro }],
        }}
      >
        <Svg width={size} height={size} viewBox="0 0 280 280">
          <G transform="translate(140 140)">
            {Array.from({ length: 10 }, (_, j) => (
              <G key={`e${j}`} rotation={j * 36}>
                <Path d={PETALO} fill={abierta ? cols[j % cols.length] : c.rosaSuave} opacity={0.92} />
              </G>
            ))}
            {Array.from({ length: 8 }, (_, k) => (
              <G key={`i${k}`} rotation={k * 45 + 22}>
                <Path d={PETALO_INT} fill={abierta ? '#FFFFFF' : c.card} opacity={0.7} />
              </G>
            ))}
            <Circle r={18} fill={c.rosaSuave} />
            <Circle r={7} fill={c.rosa} />
          </G>
        </Svg>
      </Animated.View>
    </View>
  );
}
