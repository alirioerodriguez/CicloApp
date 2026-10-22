// Navegación de Savia: abajo en el teléfono y al costado desde la tablet (como HonorApp),
// con los iconos y el orden del diseño.
import type { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ANCHO_BARRA } from '../lib/layout';
import { fonts, radius, serif, useColors } from '../lib/theme';
import { Logo } from './Logo';
import { NavIcon, type NavIconId } from './NavIcon';
import { tap } from './ui';

type BarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const ICONO: Record<string, NavIconId> = { index: 'hoy', calendario: 'calendario', cuidate: 'cuidate', estadisticas: 'resumen', perfil: 'perfil' };

export function BarraNav({ state, descriptors, navigateToTab, lateral }: BarProps & { lateral: boolean }) {
  const c = useColors();
  const insets = useSafeAreaInsets();

  const items = state.routes.map((route, i) => {
    const activa = state.index === i;
    const titulo = descriptors[route.key]?.options.title ?? route.name;
    const color = activa ? c.rosa : c.muted;
    const ir = () => {
      tap();
      if (!activa) navigateToTab(route.key);
    };
    return lateral ? (
      <Pressable
        key={route.key}
        accessibilityRole="tab"
        accessibilityState={{ selected: activa }}
        accessibilityLabel={titulo}
        onPress={ir}
        style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: radius.md,
          backgroundColor: activa ? c.rosaSuave : hovered || pressed ? c.bg : 'transparent',
        })}
      >
        <NavIcon id={ICONO[route.name] ?? 'hoy'} color={activa ? c.rosa : c.text} />
        <Text style={{ fontFamily: activa ? fonts.bold : fonts.semibold, fontSize: 15, color: activa ? c.text : c.muted }}>{titulo}</Text>
      </Pressable>
    ) : (
      <Pressable
        key={route.key}
        accessibilityRole="tab"
        accessibilityState={{ selected: activa }}
        accessibilityLabel={titulo}
        onPress={ir}
        style={{ flex: 1, alignItems: 'center', gap: 3, paddingTop: 4 }}
      >
        <View style={{ paddingHorizontal: 16, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: activa ? c.rosaSuave : 'transparent' }}>
          <NavIcon id={ICONO[route.name] ?? 'hoy'} color={color} />
        </View>
        <Text numberOfLines={1} style={{ fontFamily: activa ? fonts.bold : fonts.semibold, fontSize: 11, color }}>
          {titulo}
        </Text>
      </Pressable>
    );
  });

  if (lateral) {
    return (
      <View style={{ width: ANCHO_BARRA, backgroundColor: c.card, borderRightWidth: 1, borderRightColor: c.line, paddingTop: insets.top + 24, paddingHorizontal: 14, gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, marginBottom: 24 }}>
          <Logo size={34} />
          <Text style={{ fontFamily: serif, fontSize: 26, color: c.text, letterSpacing: -0.3 }}>savia</Text>
        </View>
        {items}
      </View>
    );
  }
  return (
    <View style={{ flexDirection: 'row', backgroundColor: c.card, borderTopWidth: 1, borderTopColor: c.line, paddingTop: 6, paddingBottom: insets.bottom + 8, paddingHorizontal: 6 }}>
      {items}
    </View>
  );
}
