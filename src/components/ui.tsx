// Piezas visuales reutilizables.
import * as Haptics from 'expo-haptics';
import { Children, cloneElement, isValidElement, useEffect, useRef, type ReactNode } from 'react';
import { Alert, Animated, Easing, Platform, Pressable, ScrollView, StyleSheet, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { Text } from './Texto';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLayout } from '../lib/layout';
import { t } from '../lib/region';
import { fonts, radius, serif, useColors } from '../lib/theme';
import { Icono } from './Icono';

// Las fuentes personalizadas no se "engordan" solas: se elige la variante según el fontWeight.
export function font(style?: StyleProp<TextStyle>, base: keyof typeof fonts = 'regular'): TextStyle {
  const flat = StyleSheet.flatten(style) ?? {};
  if (flat.fontFamily) return flat;
  const w = String(flat.fontWeight ?? '');
  const key = w === '700' || w === '800' || w === 'bold' ? 'bold' : w === '600' ? 'semibold' : w === '500' ? 'medium' : base;
  const { fontWeight: _omit, ...rest } = flat;
  return { ...rest, fontFamily: fonts[key] };
}

export function tap() {
  if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
}

// Alert con botones no funciona en web; ahí se usa el confirm del navegador.
export function confirm(title: string, message: string, ok: string): Promise<boolean> {
  [title, message, ok] = [t(title), t(message), t(ok)];
  if (Platform.OS === 'web') return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  return new Promise((resolve) =>
    Alert.alert(title, message, [
      { text: t('Cancelar'), style: 'cancel', onPress: () => resolve(false) },
      { text: ok, style: 'destructive', onPress: () => resolve(true) },
    ]),
  );
}

export function notify(title: string, message: string) {
  [title, message] = [t(title), t(message)];
  if (Platform.OS === 'web') window.alert(`${title}\n\n${message}`);
  else Alert.alert(title, message);
}

// `angosta`: pantallas de lectura o formularios que no ganan nada con todo el ancho del escritorio.
export function Screen({ children, title, subtitle, right, angosta }: { children: ReactNode; title?: string; subtitle?: string; right?: ReactNode; angosta?: boolean }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const L = useLayout();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{
        padding: L.padding,
        paddingTop: insets.top + (L.ancho ? 28 : 14),
        paddingBottom: 40,
        gap: 14,
        maxWidth: angosta ? Math.min(L.maxWidth, 760) : L.maxWidth,
        width: '100%',
        alignSelf: 'center',
      }}
      keyboardShouldPersistTaps="handled"
    >
      {title ? (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 2 }}>
          <View style={{ flex: 1 }}>
            {subtitle ? <Text style={{ color: c.rosa, fontSize: 12, fontFamily: fonts.bold, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{subtitle}</Text> : null}
            <Text style={{ fontFamily: serif, fontSize: 32, color: c.text, letterSpacing: -0.5 }}>{title}</Text>
          </View>
          {right}
        </View>
      ) : null}
      {children}
    </ScrollView>
  );
}

// Dos columnas en tablet y escritorio; en el teléfono se apilan (primero la izquierda).
export function Columnas({ izquierda, derecha, desde = 'tablet' }: { izquierda: ReactNode; derecha: ReactNode; desde?: 'tablet' | 'escritorio' }) {
  const L = useLayout();
  // `desde="escritorio"` es para columnas con contenido denso (como el registro del día): piden más ancho.
  const dos = desde === 'tablet' ? L.dosColumnas : L.contenido >= 800;
  if (!dos) {
    return (
      <>
        {izquierda}
        {derecha}
      </>
    );
  }
  return (
    <View style={{ flexDirection: 'row', gap: L.tamano === 'escritorio' ? 24 : 16, alignItems: 'flex-start' }}>
      <View style={{ flex: 1, gap: 14, minWidth: 0 }}>{izquierda}</View>
      <View style={{ flex: 1, gap: 14, minWidth: 0 }}>{derecha}</View>
    </View>
  );
}

// Grilla de tarjetas: 1 columna en el teléfono, 2 en tablet y hasta `max` en escritorio.
export function Grilla({ children, max = 3 }: { children: ReactNode; max?: number }) {
  const L = useLayout();
  const cols = L.tresColumnas ? max : L.dosColumnas ? Math.min(2, max) : 1;
  if (cols === 1) return <>{children}</>;
  const items = Children.toArray(children);
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
      {items.map((child, i) => (
        <View key={i} style={{ flexBasis: `${100 / cols - 3}%`, flexGrow: 1, minWidth: 0 }}>
          {/* Las tarjetas de una misma fila quedan del mismo alto. */}
          {isValidElement<{ style?: StyleProp<ViewStyle> }>(child) ? cloneElement(child, { style: [child.props.style, { flexGrow: 1 }] }) : child}
        </View>
      ))}
    </View>
  );
}

export function Card({ children, style, tint }: { children: ReactNode; style?: StyleProp<ViewStyle>; tint?: string }) {
  const c = useColors();
  return (
    <View style={[{ backgroundColor: tint ?? c.card, borderRadius: radius.lg, padding: 18, borderWidth: StyleSheet.hairlineWidth, borderColor: c.line, gap: 10 }, style]}>
      {children}
    </View>
  );
}

export function Label({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const c = useColors();
  return <Text style={font([{ fontSize: 15, color: c.text }, style], 'bold')}>{children}</Text>;
}

export function Muted({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const c = useColors();
  return <Text style={font([{ fontSize: 13.5, color: c.muted, lineHeight: 19 }, style])}>{children}</Text>;
}

export function Body({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const c = useColors();
  return <Text style={font([{ fontSize: 15, color: c.text, lineHeight: 22 }, style])}>{children}</Text>;
}

export function Chip({ label, emoji, selected, onPress, color }: { label: string; emoji?: string; selected?: boolean; onPress?: () => void; color?: string }) {
  const c = useColors();
  const accent = color ?? c.rosa;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 13,
        borderRadius: radius.pill,
        borderWidth: 1.5,
        borderColor: selected ? accent : c.line,
        backgroundColor: selected ? accent + '33' : c.card,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {emoji ? <Icono e={emoji} size={16} color={selected ? accent : c.muted} /> : null}
      <Text style={{ fontSize: 13.5, fontFamily: selected ? fonts.bold : fonts.medium, color: c.text }}>{label}</Text>
    </Pressable>
  );
}

export function Button({ label, onPress, kind = 'primary', small, disabled }: { label: string; onPress: () => void; kind?: 'primary' | 'soft' | 'ghost' | 'danger'; small?: boolean; disabled?: boolean }) {
  const c = useColors();
  const bg = { primary: c.rosa, soft: c.rosaSuave, ghost: 'transparent', danger: 'transparent' }[kind];
  const fg = { primary: c.onAccent, soft: c.text, ghost: c.rosa, danger: '#D0506A' }[kind];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => ({
        backgroundColor: bg,
        paddingVertical: small ? 9 : 14,
        paddingHorizontal: small ? 14 : 20,
        borderRadius: radius.pill,
        alignItems: 'center',
        opacity: disabled ? 0.4 : pressed ? 0.75 : 1,
        borderWidth: kind === 'ghost' || kind === 'danger' ? 1.5 : 0,
        borderColor: kind === 'danger' ? '#D0506A55' : c.rosa + '66',
      })}
    >
      <Text style={{ color: fg, fontFamily: fonts.bold, fontSize: small ? 13.5 : 15.5 }}>{label}</Text>
    </Pressable>
  );
}

export function Stepper({ value, onChange, min = 0, max = 99, step = 1, format }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; format?: (v: number) => string }) {
  const c = useColors();
  const btn = (txt: string, next: number, disabled: boolean) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={txt === '−' ? 'menos' : 'más'}
      disabled={disabled}
      onPress={() => {
        tap();
        onChange(next);
      }}
      style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: c.rosaSuave, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.35 : 1 }}
    >
      <Text style={{ fontSize: 20, color: c.text, fontFamily: fonts.semibold, marginTop: -2 }}>{txt}</Text>
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      {btn('−', Math.max(min, value - step), value <= min)}
      <Text style={{ minWidth: 54, textAlign: 'center', fontSize: 17, fontFamily: fonts.bold, color: c.text, fontVariant: ['tabular-nums'] }}>{format ? format(value) : value}</Text>
      {btn('+', Math.min(max, value + step), value >= max)}
    </View>
  );
}

export function Row({ label, hint, children }: { label: string; hint?: string; children?: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 }}>
      <View style={{ flex: 1 }}>
        <Body style={{ fontWeight: '600' }}>{label}</Body>
        {hint ? <Muted>{hint}</Muted> : null}
      </View>
      {children}
    </View>
  );
}

// Medidas del interruptor del iPhone: pista de 51×31, perilla de 27 con 2 de margen, que se ensancha a 33 al apretarla.
export const INTERRUPTOR = { ancho: 51, alto: 31, perilla: 27, margen: 2, perillaApretada: 33 } as const;
/** Cuánto se corre la perilla (en px) desde la izquierda: apagado = 0; prendido = hasta el otro margen, menos lo que se ensancha. */
export function recorridoPerilla(prendido: boolean, apretado: boolean): number {
  const { ancho, perilla, margen, perillaApretada } = INTERRUPTOR;
  const w = apretado ? perillaApretada : perilla;
  return prendido ? ancho - 2 * margen - w : 0;
}

/** Interruptor con la forma y el movimiento del de iPhone en los tres sistemas (el nativo de Android es distinto). */
export function Interruptor({ value, onValueChange, accessibilityLabel, disabled }: { value: boolean; onValueChange: (v: boolean) => void; accessibilityLabel?: string; disabled?: boolean }) {
  const c = useColors();
  const { ancho, alto, perilla, margen, perillaApretada } = INTERRUPTOR;
  const x = useRef(new Animated.Value(recorridoPerilla(value, false))).current;
  const w = useRef(new Animated.Value(perilla)).current;
  const apretado = useRef(false);
  const mover = (prendido: boolean, ap: boolean) => {
    Animated.parallel([
      Animated.timing(x, { toValue: recorridoPerilla(prendido, ap), duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(w, { toValue: ap ? perillaApretada : perilla, duration: 160, useNativeDriver: false }),
    ]).start();
  };
  useEffect(() => mover(value, apretado.current), [value]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled: !!disabled }}
      disabled={disabled}
      hitSlop={{ top: 7, bottom: 7, left: 4, right: 4 }}
      onPressIn={() => { apretado.current = true; mover(value, true); }}
      onPressOut={() => { apretado.current = false; mover(value, false); }}
      onPress={() => { tap(); onValueChange(!value); }}
      style={{ width: ancho, height: alto, borderRadius: alto / 2, justifyContent: 'center', backgroundColor: value ? c.rosa : c.line, opacity: disabled ? 0.45 : 1 }}
    >
      <Animated.View
        style={{
          width: w, height: perilla, borderRadius: perilla / 2, backgroundColor: '#fff', marginLeft: margen, transform: [{ translateX: x }],
          shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3,
        }}
      />
    </Pressable>
  );
}

export function Toggle({ label, hint, value, onChange }: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Row label={label} hint={hint}>
      <Interruptor value={value} onValueChange={onChange} accessibilityLabel={label} />
    </Row>
  );
}

export function Divider() {
  const c = useColors();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.line, marginVertical: 4 }} />;
}

// Barra horizontal simple para estadísticas.
export function Bar({ value, max, color, label, right }: { value: number; max: number; color: string; label: string; right: string }) {
  const c = useColors();
  const pct = max > 0 ? Math.max(4, (value / max) * 100) : 0;
  return (
    <View style={{ gap: 5 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: c.text, fontSize: 14, fontFamily: fonts.medium }}>{label}</Text>
        <Text style={{ color: c.muted, fontSize: 13, fontFamily: fonts.regular, fontVariant: ['tabular-nums'] }}>{right}</Text>
      </View>
      <View style={{ height: 10, borderRadius: 5, backgroundColor: c.line, overflow: 'hidden' }}>
        <View style={{ width: `${pct}%`, height: '100%', borderRadius: 5, backgroundColor: color }} />
      </View>
    </View>
  );
}
