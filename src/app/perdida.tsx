// Pérdida (diseño 8h): acompañamiento sin avisos.
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Body, Button, Card, Muted, Screen } from '../components/ui';
import { PERDIDA_CUIDADOS, PERDIDA_TEXTO, PERDIDA_TITULO } from '../content/confianza';
import { serif, useColors } from '../lib/theme';
import { Icono, IconoBurbuja } from '../components/Icono';

export default function Perdida() {
  const c = useColors();
  return (
    <Screen angosta>
      <View style={{ alignItems: 'center', gap: 12, marginTop: 24 }}>
        <View style={{ width: 104, height: 104, borderRadius: 52, backgroundColor: c.lavandaSuave, alignItems: 'center', justifyContent: 'center' }}>
          <Icono e="🤍" size={44} color={c.text} />
        </View>
        <Text style={{ fontFamily: serif, fontSize: 30, color: c.text, textAlign: 'center' }}>{PERDIDA_TITULO}</Text>
        <Body style={{ textAlign: 'center' }}>{PERDIDA_TEXTO}</Body>
      </View>
      <Card style={{ gap: 0 }}>
        {PERDIDA_CUIDADOS.map((x, i) => (
          <View key={x.titulo} style={{ flexDirection: 'row', gap: 12, paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
            <IconoBurbuja e={x.emoji} size={34} />
            <View style={{ flex: 1, gap: 2 }}>
              <Body style={{ fontWeight: '700' }}>{x.titulo}</Body>
              <Muted>{x.texto}</Muted>
            </View>
          </View>
        ))}
      </Card>
      <Button label="Volver a mi inicio" onPress={() => router.replace('/')} />
    </Screen>
  );
}
