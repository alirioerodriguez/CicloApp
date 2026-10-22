// Logo de Savia · "Flor de etapas": cuatro pétalos en sentido horario desde arriba
// (ciclo, embarazo, posparto y menopausia) y un hueco al centro, la semilla.
import { useEffect, useId, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, View } from 'react-native';
import Svg, { Circle, Defs, Mask, Path, Rect } from 'react-native-svg';
import { useColors } from '../lib/theme';

export type LogoVariant = 'color' | 'oscuro' | 'ciruela' | 'tinta' | 'blanco';

const FILLS: Record<LogoVariant, [string, string, string, string]> = {
  color: ['#C24E7A', '#F0B877', '#8FBF9F', '#A99CF2'],
  oscuro: ['#F0A3C4', '#F6C58F', '#A8D4B4', '#BDB3F5'],
  ciruela: ['#7E2F52', '#7E2F52', '#7E2F52', '#7E2F52'],
  tinta: ['#2A1E28', '#2A1E28', '#2A1E28', '#2A1E28'],
  blanco: ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
};

const PETALOS = [
  'M50 50C38 40 38 18 50 8C62 18 62 40 50 50Z', // arriba · ciclo
  'M50 50C60 38 82 38 92 50C82 62 60 62 50 50Z', // derecha · embarazo
  'M50 50C62 60 62 82 50 92C38 82 38 60 50 50Z', // abajo · posparto
  'M50 50C40 62 18 62 8 50C18 38 40 38 50 50Z', // izquierda · menopausia
];

// Un pétalo con el hueco central recortado (máscara, no un círculo de color).
function Petalo({ d, fill, size, id }: { d: string; fill: string; size: number; id: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute' }}>
      <Defs>
        <Mask id={id}>
          <Rect width="100" height="100" fill="#fff" />
          <Circle cx="50" cy="50" r="8" fill="#000" />
        </Mask>
      </Defs>
      <Path d={d} fill={fill} mask={`url(#${id})`} />
    </Svg>
  );
}

/**
 * `animated`: apertura de pétalos (700 ms, escalonados 150 ms en sentido horario) y luego un leve vaivén.
 * Solo para bienvenida y carga; en encabezados va quieto. Respeta "Reducir movimiento".
 */
export function Logo({ size = 48, variant, animated = false }: { size?: number; variant?: LogoVariant; animated?: boolean }) {
  const c = useColors();
  const fills = FILLS[variant ?? (c.dark ? 'oscuro' : 'color')];
  const base = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [quieto, setQuieto] = useState(!animated);
  const abrir = useRef(PETALOS.map(() => new Animated.Value(animated ? 0 : 1))).current;
  const vaiven = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;
    let vivo = true;
    let loop: Animated.CompositeAnimation | null = null;
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reducir) => {
        if (!vivo) return;
        if (reducir) {
          abrir.forEach((v) => v.setValue(1));
          setQuieto(true);
          return;
        }
        Animated.stagger(
          150,
          abrir.map((v) => Animated.timing(v, { toValue: 1, duration: 700, easing: Easing.bezier(0.3, 1.4, 0.5, 1), useNativeDriver: true })),
        ).start();
        loop = Animated.loop(
          Animated.sequence([
            Animated.timing(vaiven, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(vaiven, { toValue: -1, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          ]),
        );
        setTimeout(() => vivo && loop?.start(), 1600);
      });
    return () => {
      vivo = false;
      loop?.stop();
    };
  }, [animated, abrir, vaiven]);

  const giro = vaiven.interpolate({ inputRange: [-1, 1], outputRange: ['-4deg', '4deg'] });

  return (
    <Animated.View
      accessibilityRole="image"
      accessibilityLabel="Savia"
      style={{ width: size, height: size, transform: quieto ? [] : [{ rotate: giro }] }}
    >
      {PETALOS.map((d, i) =>
        quieto ? (
          <View key={i} style={{ position: 'absolute', width: size, height: size }}>
            <Petalo d={d} fill={fills[i]} size={size} id={`${base}h${i}`} />
          </View>
        ) : (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              opacity: abrir[i].interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 1], extrapolate: 'clamp' }),
              // El centro de la vista es la base del pétalo: crece y gira desde ahí.
              transform: [
                { scale: abrir[i] },
                { rotate: abrir[i].interpolate({ inputRange: [0, 1], outputRange: ['-25deg', '0deg'] }) },
              ],
            }}
          >
            <Petalo d={d} fill={fills[i]} size={size} id={`${base}h${i}`} />
          </Animated.View>
        ),
      )}
    </Animated.View>
  );
}
