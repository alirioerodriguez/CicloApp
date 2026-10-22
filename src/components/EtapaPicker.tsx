// Lista de los 6 modos de vida (diseño 8a). Se usa al crear la cuenta y en Perfil.
import { Pressable, View } from 'react-native';
import { Text } from './Texto';
import { ETAPAS } from '../content/etapas';
import type { Etapa } from '../lib/types';
import { fonts, radius, useColors } from '../lib/theme';
import { tap } from './ui';
import { IconoBurbuja } from './Icono';

export function EtapaPicker({ value, onChange }: { value: Etapa; onChange: (e: Etapa) => void }) {
  const c = useColors();
  return (
    <View style={{ gap: 10 }}>
      {ETAPAS.map((e) => {
        const on = e.id === value;
        return (
          <Pressable
            key={e.id}
            accessibilityRole="radio"
            accessibilityState={{ selected: on, disabled: !e.disponible }}
            disabled={!e.disponible}
            onPress={() => {
              tap();
              onChange(e.id);
            }}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              paddingVertical: 14,
              paddingHorizontal: 16,
              borderRadius: radius.lg,
              borderWidth: on ? 2 : 1,
              borderColor: on ? c.rosa : c.line,
              backgroundColor: on ? c.rosaSuave : c.card,
              opacity: e.disponible ? (pressed ? 0.8 : 1) : 0.5,
            })}
          >
            <IconoBurbuja e={e.emoji} size={40} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: c.text }}>{e.label}</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: c.muted }}>{e.sub}</Text>
              {!e.disponible && (
                <Text style={{ alignSelf: 'flex-start', marginTop: 4, fontFamily: fonts.semibold, fontSize: 11.5, color: c.muted, borderWidth: 1, borderColor: c.line, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 }}>
                  Muy pronto
                </Text>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
