// "Cuándo consultar": señales de alerta, rangos normales, qué alivia, mitos y fuentes.
import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Text, View } from 'react-native';
import { Body, Button, Card, Label, Muted, Screen } from '../components/ui';
import { FUENTES } from '../content/fuentes';
import { ALIVIO, CRISIS, MITOS, NO_DISPOSITIVO, PASTILLA_OLVIDO, RANGOS, SPM, URGENTE, URGENTE_COMBINADA } from '../content/info';
import { RESTA_EFECTO } from '../content/pastillas';
import { PILL_PACKS } from '../lib/cycle';
import { useStore } from '../lib/store';
import { useColors } from '../lib/theme';

function List({ items }: { items: string[] }) {
  return (
    <>
      {items.map((t) => (
        <Body key={t}>• {t}</Body>
      ))}
    </>
  );
}

export default function Info() {
  const c = useColors();
  const { data } = useStore();
  const [fuentes, setFuentes] = useState(false);
  const pill = data.settings.pillMode;
  const combinada = pill && !PILL_PACKS[data.settings.pillType].soloProgestageno;

  return (
    <Screen angosta title="Cuándo consultar" right={<Button small kind="soft" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/cuidate'))} />}>
      <Card tint={c.rosaSuave}>
        <Label>🚨 Busca atención hoy</Label>
        <List items={combinada ? [...URGENTE, URGENTE_COMBINADA] : URGENTE} />
      </Card>

      <Card>
        <Label>🩺 Vale la pena comentarlo en tu consulta</Label>
        <List items={RANGOS} />
      </Card>

      <Card tint={c.lavandaSuave}>
        <Label>💜 SPM y TDPM</Label>
        <Body>{SPM}</Body>
        <Body style={{ fontWeight: '700' }}>{CRISIS}</Body>
      </Card>

      <Card tint={c.salviaSuave}>
        <Label>♨️ Qué alivia los cólicos (sin medicamentos)</Label>
        {ALIVIO.map((a) => (
          <View key={a.medida} style={{ gap: 1 }}>
            <Body style={{ fontWeight: '700' }}>{a.medida}</Body>
            <Muted>Evidencia: {a.evidencia}</Muted>
          </View>
        ))}
      </Card>

      <Card>
        <Label>🙅‍♀️ Mitos que no hace falta seguir</Label>
        <List items={MITOS} />
      </Card>

      {pill && (
        <Card tint={c.duraznoSuave}>
          <Label>💊 Sobre tu pastilla</Label>
          <Body>{RESTA_EFECTO}</Body>
          <Body>{PASTILLA_OLVIDO}</Body>
        </Card>
      )}

      <Muted>{NO_DISPOSITIVO}</Muted>

      <Button kind="ghost" small label={fuentes ? 'Ocultar fuentes' : `Ver las ${FUENTES.length} fuentes`} onPress={() => setFuentes((v) => !v)} />
      {fuentes && (
        <Card>
          {FUENTES.map((f, i) => (
            <Text
              key={f.titulo}
              onPress={f.url ? () => Linking.openURL(f.url!) : undefined}
              style={{ fontSize: 13, lineHeight: 18, color: f.url ? c.rosa : c.muted }}
            >
              {i + 1}. {f.titulo}
            </Text>
          ))}
        </Card>
      )}
    </Screen>
  );
}
