// Fila con casilla para listas de pendientes, controles, exámenes y bolso.
import { Pressable, Text, View } from 'react-native';
import { fonts, radius, useColors } from '../lib/theme';
import { tap } from './ui';

export function Check({ label, sub, on, onPress, chip, chipResaltado }: { label: string; sub?: string; on: boolean; onPress: () => void; chip?: string; chipResaltado?: boolean }) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: on }}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: c.line, opacity: pressed ? 0.7 : 1 })}
    >
      <View style={{ width: 26, height: 26, borderRadius: 8, borderWidth: 1.5, borderColor: on ? c.rosa : c.line, backgroundColor: on ? c.rosa : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
        {on && <Text style={{ color: c.onAccent, fontFamily: fonts.bold, fontSize: 14 }}>✓</Text>}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: fonts.semibold, fontSize: 15, color: c.text, textDecorationLine: on ? 'line-through' : 'none', opacity: on ? 0.6 : 1 }}>{label}</Text>
        {sub ? <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: c.muted, lineHeight: 18 }}>{sub}</Text> : null}
      </View>
      {(chip || on) && (
        <Text
          style={{
            fontFamily: fonts.bold,
            fontSize: 12,
            color: c.text,
            backgroundColor: on ? c.salviaSuave : chipResaltado ? c.rosaSuave : c.bg,
            borderRadius: radius.pill,
            paddingHorizontal: 10,
            paddingVertical: 4,
            overflow: 'hidden',
          }}
        >
          {on ? 'Hecho' : chip}
        </Text>
      )}
    </Pressable>
  );
}
