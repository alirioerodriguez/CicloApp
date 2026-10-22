import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Body, Button, Card, Chip, Columnas, Grilla, Label, Muted, Screen } from '../../components/ui';
import { CuidateEmbarazo } from '../../components/CuidateEmbarazo';
import { CuidatePosparto } from '../../components/CuidatePosparto';
import { EjercicioCard } from '../../components/EjercicioCard';
import { ALIMENTOS } from '../../content/alimentos';
import { POR_FASE, ejercicioById } from '../../content/ejercicios';
import { CUIDATE, faseCorta, pick } from '../../content/cuidate';
import { diffDays, today } from '../../lib/dates';
import { useStore } from '../../lib/store';
import { serif, useColors } from '../../lib/theme';
import type { Phase } from '../../lib/types';

export default function Cuidate() {
  const { data } = useStore();
  if (data.settings.etapa === 'posparto') return <CuidatePosparto />;
  if (data.settings.etapa === 'embarazo') return <CuidateEmbarazo />;
  return <CuidateCiclo />;
}

function CuidateCiclo() {
  const c = useColors();
  const { summary: s, data } = useStore();
  const realPhase: Phase = s.phase ?? (data.settings.pillMode ? 'pastilla' : 'folicular');
  const [phase, setPhase] = useState<Phase | null>(null);
  const shown = phase ?? realPhase;
  const content = CUIDATE[shown];
  const [shuffle, setShuffle] = useState(0);
  const seed = diffDays(today(), '2024-01-01') + shuffle;
  const mimo = pick(content.mimos, seed);
  const foods = ALIMENTOS.filter((a) => a.fases.includes(shown));

  const tint: Record<Phase, string> = { menstrual: c.rosaSuave, folicular: c.salviaSuave, ovulatoria: c.duraznoSuave, lutea: c.lavandaSuave, pastilla: c.salviaSuave };
  const phases: Phase[] = data.settings.pillMode ? ['menstrual', 'pastilla'] : ['menstrual', 'folicular', 'ovulatoria', 'lutea'];

  return (
    <Screen title="Cuídate hoy">
      <Card tint={tint[shown]} style={{ paddingVertical: 22 }}>
        <Text style={{ fontSize: 40 }}>{content.emoji}</Text>
        <Text style={{ fontFamily: serif, fontSize: 26, color: c.text }}>{content.nombre}</Text>
        <Body>{content.resumen}</Body>
        <Muted>{content.comun}</Muted>
        {phase && phase !== realPhase ? <Muted>Estás viendo otra fase. Hoy estás en: {CUIDATE[realPhase].nombre.toLowerCase()}.</Muted> : null}
      </Card>

      <Grilla>
        <Card>
          <Label>✨ Recomendación del día</Label>
          <Body>{pick(content.recomendaciones, seed)}</Body>
        </Card>

        <Card>
          <Label>💗 Un mimo para hoy</Label>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 34 }}>{mimo.emoji}</Text>
            <Body style={{ flex: 1 }}>{mimo.texto}</Body>
          </View>
        </Card>

        <Card tint={c.lavandaSuave}>
          <Text style={{ fontFamily: 'Fraunces_400Regular_Italic', fontSize: 21, color: c.text, lineHeight: 29 }}>“{pick(content.frases, seed)}”</Text>
        </Card>
      </Grilla>

      <Button label="🔄 Otra idea" kind="soft" onPress={() => setShuffle((x) => x + 1)} />

      <Columnas
        izquierda={
          <>
            <Label style={{ marginTop: 4 }}>🧘‍♀️ Movimiento para hoy</Label>
            <Muted>{POR_FASE[shown].intro}</Muted>
            {POR_FASE[shown].ids.slice(0, 2).map((id) => (
              <EjercicioCard key={id} ej={ejercicioById(id)!} />
            ))}
            <Button small kind="ghost" label="Ver todos los ejercicios y el alivio inmediato →" onPress={() => router.push('/ejercicios')} />
          </>
        }
        derecha={
      <Card>
        <Label>🍽️ Comidas que te pueden ayudar ahora</Label>
        {foods.slice(0, 4).map((f) => (
          <View key={f.nombre} style={{ flexDirection: 'row', gap: 10 }}>
            <Text style={{ fontSize: 22 }}>{f.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Body style={{ fontWeight: '700' }}>{f.nombre}</Body>
              <Muted>{f.porque}</Muted>
            </View>
          </View>
        ))}
        <Button small kind="ghost" label="Ver toda la alimentación →" onPress={() => router.push('/alimentacion')} />
      </Card>
        }
      />

      <Label style={{ marginTop: 6 }}>Explorar otras fases</Label>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {phases.map((p) => (
          <Chip key={p} emoji={CUIDATE[p].emoji} label={faseCorta(p)} selected={shown === p} onPress={() => setPhase(p === realPhase ? null : p)} />
        ))}
      </View>

      <Button kind="soft" label="🩺 Cuándo consultar y qué alivia de verdad" onPress={() => router.push('/info')} />

      <Muted style={{ textAlign: 'center', marginTop: 10 }}>Ideas de bienestar general, no reemplazan consejo médico.</Muted>
    </Screen>
  );
}
