// Elegir marca (opcional) y esquema del blíster, con un dibujo para confirmarlo.
import { TextInput, View } from 'react-native';
import { MARCAS } from '../content/pastillas';
import { PILL_PACKS, PILL_TYPE_OPTIONS } from '../lib/cycle';
import { radius, useColors } from '../lib/theme';
import type { PillType } from '../lib/types';
import { Chip, Label, Muted } from './ui';

export function Blister({ type }: { type: PillType }) {
  const c = useColors();
  const pack = PILL_PACKS[type];
  return (
    // 7 por fila, como un blíster real: 7 × 20 + 6 huecos × 6 + 2 × 10 de padding.
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, width: 7 * 20 + 6 * 6 + 20, alignSelf: 'center', padding: 10, borderRadius: radius.md, backgroundColor: c.bg }}>
      {Array.from({ length: pack.length }, (_, i) => {
        const active = i < pack.active;
        const none = !active && !pack.breakTakes;
        return (
          <View
            key={i}
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: active ? (pack.soloProgestageno ? c.lavanda : c.rosa) : 'transparent',
              borderWidth: active ? 0 : 1.5,
              borderColor: c.muted,
              borderStyle: none ? 'dashed' : 'solid',
              opacity: none ? 0.5 : 1,
            }}
          />
        );
      })}
    </View>
  );
}

export function PillPicker({ name, type, onName, onType }: { name: string; type: PillType; onName: (v: string) => void; onType: (v: PillType) => void }) {
  const c = useColors();
  const pack = PILL_PACKS[type];
  const input = { borderRadius: radius.md, backgroundColor: c.bg, borderWidth: 1, borderColor: c.line, padding: 12, fontSize: 16, color: c.text };
  return (
    <View style={{ gap: 10 }}>
      <Label>¿Cuál es tu pastilla? (opcional)</Label>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {MARCAS.map((m) => (
          <Chip
            key={m.nombre}
            label={m.nombre}
            color={c.lavanda}
            selected={name === m.nombre}
            onPress={() => {
              onName(m.nombre);
              onType(m.esquema);
            }}
          />
        ))}
      </View>
      <TextInput value={name} onChangeText={onName} placeholder="U otra marca" placeholderTextColor={c.muted} style={input} />

      <Label>¿Cómo es tu blíster?</Label>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {PILL_TYPE_OPTIONS.map((o) => (
          <Chip key={o.value} label={o.label} selected={type === o.value} onPress={() => onType(o.value)} />
        ))}
      </View>
      <Blister type={type} />
      <Muted style={{ textAlign: 'center' }}>
        {pack.soloProgestageno ? '● con hormona (solo progestágeno)' : '● con hormona'} · ○ placebo{pack.breakTakes ? '' : ' / sin pastilla'}
      </Muted>
      <Muted>{pack.sangrado}</Muted>
      <Muted style={{ fontWeight: '700' }}>Confírmalo en tu blíster: la misma marca puede venir distinta según el país.</Muted>
    </View>
  );
}
