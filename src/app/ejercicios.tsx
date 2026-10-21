// Ejercicios por fase y kit de alivio (SOS).
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { EjercicioCard } from '../components/EjercicioCard';
import { Body, Button, Card, Chip, Label, Muted, Screen } from '../components/ui';
import { CUIDATE, faseCorta } from '../content/cuidate';
import { AVISO_EJERCICIO, EJERCICIOS, POR_FASE, SOS_IDS, ejercicioById } from '../content/ejercicios';
import { useStore } from '../lib/store';
import { useColors } from '../lib/theme';
import type { Phase } from '../lib/types';

export default function Ejercicios() {
  const c = useColors();
  const { summary, data } = useStore();
  const actual: Phase = summary.phase ?? (data.settings.pillMode ? 'pastilla' : 'folicular');
  const [fase, setFase] = useState<Phase | 'todos'>(actual);
  const fases: Phase[] = data.settings.pillMode ? ['menstrual', 'pastilla'] : ['menstrual', 'folicular', 'ovulatoria', 'lutea'];
  const lista = fase === 'todos' ? EJERCICIOS : POR_FASE[fase].ids.map((id) => ejercicioById(id)!).filter(Boolean);

  return (
    <Screen title="Ejercicios y alivio" right={<Button small kind="soft" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/cuidate'))} />}>
      <Card tint={c.rosaSuave}>
        <Label>🆘 Alivio inmediato</Label>
        <Body>¿Cólicos o ansiedad fuerte? Respira un minuto y prueba estos movimientos suaves. El calor local en el vientre también ayuda.</Body>
        <Button label="🫁 Respirar 1 minuto" onPress={() => router.push('/respirar')} />
        <View style={{ gap: 8 }}>
          {SOS_IDS.map((id) => (
            <EjercicioCard key={id} ej={ejercicioById(id)!} />
          ))}
        </View>
      </Card>

      <Label>Movimiento para tu fase</Label>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {fases.map((p) => (
          <Chip key={p} emoji={CUIDATE[p].emoji} label={`${faseCorta(p)}${p === actual ? ' · ahora' : ''}`} selected={fase === p} onPress={() => setFase(p)} />
        ))}
        <Chip label="Todos" selected={fase === 'todos'} onPress={() => setFase('todos')} />
      </View>
      {fase !== 'todos' && <Muted>{POR_FASE[fase].intro}</Muted>}
      <View style={{ gap: 10 }}>
        {lista.map((ej) => (
          <EjercicioCard key={ej.id} ej={ej} />
        ))}
      </View>
      <Muted style={{ textAlign: 'center' }}>{AVISO_EJERCICIO}</Muted>
    </Screen>
  );
}
