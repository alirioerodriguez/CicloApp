// "Un cambio en tu embarazo" (diseño 8g): se cuenta solo lo que ella quiera y la app se adapta al instante.
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Body, Button, Card, Label, Muted, Screen, tap } from '../components/ui';
import { today } from '../lib/dates';
import { useStore } from '../lib/store';
import { useColors } from '../lib/theme';

export default function Cambio() {
  const c = useColors();
  const { data, updateSettings } = useStore();
  const s = data.settings;
  const volver = () => (router.canGoBack() ? router.back() : router.replace('/perfil'));

  const opciones = [
    {
      emoji: '🍼',
      label: 'Nació mi bebé',
      sub: 'Pasamos a tu posparto: tu recuperación y la lactancia',
      onPress: () => {
        updateSettings({ etapa: 'posparto', posparto: { ...s.posparto, nacimiento: today() }, anticonceptivo: 'ninguno', pillMode: false });
        router.replace('/');
      },
    },
    {
      emoji: '🤍',
      label: 'Tuve una pérdida',
      sub: 'Silenciamos todo y te acompañamos con cuidado',
      onPress: () => {
        updateSettings({ etapa: 'ciclo', silencioEmbarazo: true });
        router.replace('/perdida');
      },
    },
    {
      emoji: '🌙',
      label: 'Prefiero no decir',
      sub: 'Pausamos los avisos del embarazo',
      onPress: () => {
        updateSettings({ silencioEmbarazo: true });
        volver();
      },
    },
  ];

  return (
    <Screen angosta title="Un cambio en tu embarazo" right={<Button small kind="soft" label="Volver" onPress={volver} />}>
      <Body>Cuéntanos solo lo que quieras. Adaptamos la app al instante.</Body>
      {opciones.map((o) => (
        <Pressable
          key={o.label}
          accessibilityRole="button"
          onPress={() => {
            tap();
            o.onPress();
          }}
        >
          {({ pressed }) => (
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14, opacity: pressed ? 0.8 : 1 }}>
              <Text style={{ fontSize: 28 }}>{o.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Label>{o.label}</Label>
                <Muted>{o.sub}</Muted>
              </View>
              <Text style={{ color: c.muted, fontSize: 20 }}>›</Text>
            </Card>
          )}
        </Pressable>
      ))}
    </Screen>
  );
}
