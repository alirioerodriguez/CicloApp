// "Tu recuperación" en modo posparto (diseño 8e): plan por etapas.
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { ejercicioById } from '../content/ejercicios';
import { CUANDO_VUELVE_PERIODO, ETAPAS_POSPARTO, etapaPosparto, semanasPosparto } from '../content/posparto';
import { useStore } from '../lib/store';
import { fonts, serif, useColors } from '../lib/theme';
import { EjercicioCard } from './EjercicioCard';
import { Body, Button, Card, Grilla, Label, Muted, Screen } from './ui';

export function RecuperacionPosparto() {
  const c = useColors();
  const { data } = useStore();
  const semanas = semanasPosparto(data.settings.posparto);
  const actual = etapaPosparto(semanas);

  return (
    <Screen angosta title="Tu recuperación">
      <Body>Un plan por etapas para tu suelo pélvico, tu abdomen y tu energía. Avanza solo con el visto bueno de tu médica.</Body>

      {ETAPAS_POSPARTO.map((e) => {
        const ahora = e === actual;
        const hecho = semanas > e.hasta;
        return (
          <Card key={e.titulo} tint={ahora ? c.rosaSuave : undefined} style={ahora ? { borderColor: c.rosa, borderWidth: 1.5 } : undefined}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
              <Text style={{ flex: 1, fontFamily: serif, fontSize: 21, color: c.text }}>
                {e.titulo} · {e.nombre}
              </Text>
              <Text style={{ fontFamily: fonts.bold, fontSize: 12.5, color: ahora ? c.rosa : hecho ? c.salvia : c.muted }}>{ahora ? 'Ahora' : hecho ? 'Hecho' : 'Después'}</Text>
            </View>
            <Body>{e.texto}</Body>
            <Muted>{e.ejercicios}</Muted>
          </Card>
        );
      })}

      <Card tint={c.lavandaSuave}>
        <Label>¿Cuándo vuelve el período?</Label>
        <Body>{CUANDO_VUELVE_PERIODO}</Body>
      </Card>

      <Label style={{ marginTop: 4 }}>Para tu etapa</Label>
      {semanas <= 6 && <Button kind="soft" label="🫁 Respira conmigo" onPress={() => router.push('/respirar')} />}
      <Grilla max={2}>
        {actual.ids.map((id) => {
          const ej = ejercicioById(id);
          return ej ? <EjercicioCard key={id} ej={ej} /> : null;
        })}
      </Grilla>
    </Screen>
  );
}
