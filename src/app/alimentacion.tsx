import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Body, Button, Card, Chip, Columnas, Label, Muted, Screen } from '../components/ui';
import { ALIMENTOS, AVISO_PASTILLA, CATEGORIAS, CON_MODERACION, TIP_HIERRO, type Categoria } from '../content/alimentos';
import { CUIDATE } from '../content/cuidate';
import { useStore } from '../lib/store';
import { useColors } from '../lib/theme';

export default function Alimentacion() {
  const c = useColors();
  const { summary: s, data } = useStore();
  const [cat, setCat] = useState<Categoria | null>(null);
  const [myPhase, setMyPhase] = useState(false);

  const list = ALIMENTOS.filter((a) => (!cat || a.categorias.includes(cat)) && (!myPhase || !s.phase || a.fases.includes(s.phase)));
  // Lo de la fase actual primero; con "Para mi fase", solo eso y lo general.
  const moderar = CON_MODERACION.filter((m) => !myPhase || !m.fases || (s.phase && m.fases.includes(s.phase))).sort(
    (a, b) => Number(!!(s.phase && b.fases?.includes(s.phase))) - Number(!!(s.phase && a.fases?.includes(s.phase))),
  );

  return (
    <Screen
      title="Alimentación"
      right={<Button small kind="soft" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/cuidate'))} />}
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Chip label="Todos" selected={!cat} onPress={() => setCat(null)} />
        {CATEGORIAS.map((k) => (
          <Chip key={k.id} label={k.label} selected={cat === k.id} onPress={() => setCat(cat === k.id ? null : k.id)} />
        ))}
        {s.phase && (
          <Chip emoji={CUIDATE[s.phase].emoji} label="Para mi fase" color={c.salvia} selected={myPhase} onPress={() => setMyPhase((v) => !v)} />
        )}
      </View>

      <Columnas
        desde="escritorio"
        izquierda={
      <Card>
        {list.length === 0 && <Muted>Nada con esos filtros.</Muted>}
        {list.map((f, i) => (
          <View key={f.nombre} style={{ flexDirection: 'row', gap: 12, paddingVertical: 6, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
            <Text style={{ fontSize: 26 }}>{f.emoji}</Text>
            <View style={{ flex: 1, gap: 2 }}>
              <Body style={{ fontWeight: '700' }}>{f.nombre}</Body>
              <Muted>{f.porque}</Muted>
            </View>
          </View>
        ))}
      </Card>
        }
        derecha={
          <>
      <Card tint={c.salviaSuave}>
        <Label>🩸 Truco para el hierro</Label>
        <Body>{TIP_HIERRO}</Body>
      </Card>

      <Card tint={c.duraznoSuave}>
        <Label>Con moderación</Label>
        {moderar.map((m) => (
          <View key={m.texto} style={{ gap: 2 }}>
            <Body>
              {m.emoji} {m.texto}
            </Body>
            {m.fases ? <Muted>{m.fases.map((f) => CUIDATE[f].nombre).join(', ')}{s.phase && m.fases.includes(s.phase) ? ' · tu fase actual' : ''}</Muted> : null}
          </View>
        ))}
      </Card>

      {data.settings.pillMode && (
        <Card tint={c.lavandaSuave}>
          <Label>💊 Si tomas pastilla</Label>
          <Body>{AVISO_PASTILLA}</Body>
        </Card>
      )}
          </>
        }
      />
      <Muted style={{ textAlign: 'center' }}>Información general. Si tienes anemia u otra condición, sigue lo que te indique tu médico.</Muted>
    </Screen>
  );
}
