// "Personaliza tu app": 12 tonos y modo Noche / Día / Automático.
import { Pressable, Text, View } from 'react-native';
import { useStore } from '../lib/store';
import { fonts, TONOS, useColors, type Modo } from '../lib/theme';
import { Chip, Label, Muted, tap } from './ui';

const MODOS: { id: Modo; label: string; emoji: string }[] = [
  { id: 'noche', label: 'Noche', emoji: '🌙' },
  { id: 'dia', label: 'Día', emoji: '☀️' },
  { id: 'auto', label: 'Como el teléfono', emoji: '📱' },
];

export function TonePicker() {
  const c = useColors();
  const { data, updateSettings } = useStore();
  const { tono, modo } = data.settings;
  return (
    <View style={{ gap: 10 }}>
      <Label>Personaliza tu app</Label>
      <Muted>Elige el tono que más te guste.</Muted>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' }}>
        {TONOS.map((t) => {
          const on = t.id === tono;
          return (
            <Pressable
              key={t.id}
              accessibilityRole="button"
              accessibilityLabel={`Tono ${t.nombre}`}
              accessibilityState={{ selected: on }}
              onPress={() => {
                tap();
                updateSettings({ tono: t.id });
              }}
              style={{ width: '22%', alignItems: 'center', gap: 4 }}
            >
              <View style={{ width: 42, height: 42, borderRadius: 21, padding: 3, borderWidth: 2, borderColor: on ? c.text : 'transparent' }}>
                <View style={{ flex: 1, borderRadius: 18, overflow: 'hidden', flexDirection: 'row' }}>
                  <View style={{ flex: 1, backgroundColor: t.suave }} />
                  <View style={{ flex: 1, backgroundColor: t.profundo }} />
                </View>
              </View>
              <Text style={{ fontSize: 11, color: on ? c.text : c.muted, fontFamily: on ? fonts.bold : fonts.regular }}>{t.nombre}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {MODOS.map((m) => (
          <Chip key={m.id} emoji={m.emoji} label={m.label} selected={modo === m.id} onPress={() => updateSettings({ modo: m.id })} />
        ))}
      </View>
    </View>
  );
}
