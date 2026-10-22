// Tarjeta de ejercicio con mini animación; abre el ejercicio completo.
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import type { Ejercicio } from '../content/ejercicios';
import { fonts, radius, useColors } from '../lib/theme';
import { Figura } from './Figura';

export function EjercicioCard({ ej }: { ej: Ejercicio }) {
  const c = useColors();
  const nivel = { suave: 'Suave', moderada: 'Moderada', activa: 'Activa' }[ej.intensidad];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={ej.nombre}
      onPress={() => router.push(`/ejercicio/${ej.id}`)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: c.card,
        borderRadius: radius.lg,
        padding: 8,
        borderWidth: 1,
        borderColor: c.line,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View style={{ backgroundColor: c.bg, borderRadius: radius.md }}>
        <Figura a={ej.a} b={ej.b} bendF={ej.bendF} bendB={ej.bendB} segundosPorRep={ej.segundosPorRep} frontal={ej.frontal} size={92} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={{ fontFamily: fonts.bold, fontSize: 15, color: c.text }}>
          {ej.nombre}
        </Text>
        <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: c.rosa }}>{ej.dosis}</Text>
        <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: c.muted }}>Intensidad: {nivel}</Text>
      </View>
      <Text style={{ color: c.muted, fontSize: 22, marginRight: 6 }}>›</Text>
    </Pressable>
  );
}
