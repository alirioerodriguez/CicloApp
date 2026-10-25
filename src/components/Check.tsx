// Fila con casilla para listas de pendientes, controles, exámenes y bolso.
import { Pressable, View } from 'react-native';
import { Text } from './Texto';
import { fonts, radius, useColors } from '../lib/theme';
import { tap } from './ui';

export function Check({ label, sub, on, onPress, chip, chipResaltado, textoHecho = 'Hecho' }: { label: string; sub?: string; on: boolean; onPress: () => void; chip?: string; chipResaltado?: boolean; textoHecho?: string }) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: c.line, opacity: pressed ? 0.7 : 1 })}
    >
      {/* Interruptor estilo iPhone (toda la fila se toca; esto solo muestra el estado) */}
      <View style={{ width: 46, height: 28, borderRadius: 14, padding: 3, backgroundColor: on ? c.rosa : c.line, justifyContent: 'center' }}>
        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', alignSelf: on ? 'flex-end' : 'flex-start', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 2 }} />
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
          {on ? textoHecho : chip}
        </Text>
      )}
    </Pressable>
  );
}
