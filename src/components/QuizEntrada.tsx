// Acceso al quiz "¿Cómo estás de verdad?" desde Hoy, en todos los modos.
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Text } from './Texto';
import { RESULTADOS } from '../content/quiz';
import { today } from '../lib/dates';
import { useStore } from '../lib/store';
import { useColors } from '../lib/theme';
import { IconoBurbuja } from './Icono';
import { Card, Label, Muted } from './ui';

export function QuizEntrada() {
  const c = useColors();
  const { data } = useStore();
  const hoy = data.quiz[today()];
  return (
    <Pressable accessibilityRole="button" onPress={() => router.push('/quiz')}>
      {({ pressed }) => (
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, opacity: pressed ? 0.85 : 1 }}>
          <IconoBurbuja e="🌷" size={42} />
          <View style={{ flex: 1 }}>
            <Label>¿Cómo estás de verdad?</Label>
            <Muted>{hoy ? `Hoy: ${RESULTADOS[hoy.nivel].titulo.toLowerCase()}` : '4 preguntas · 1 minuto · tu flor de hoy'}</Muted>
          </View>
          <Text style={{ color: c.muted, fontSize: 20 }}>›</Text>
        </Card>
      )}
    </Pressable>
  );
}
