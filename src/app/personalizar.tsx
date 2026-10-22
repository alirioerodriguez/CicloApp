// "Personalizar la app": tono y modo Noche / Día, en su propia pantalla desde Perfil.
import { router } from 'expo-router';
import { Button, Card, Screen } from '../components/ui';
import { TonePicker } from '../components/TonePicker';

export default function Personalizar() {
  const volver = () => (router.canGoBack() ? router.back() : router.replace('/perfil'));
  return (
    <Screen angosta title="Personalizar la app" right={<Button small kind="soft" label="Volver" onPress={volver} />}>
      <Card>
        <TonePicker />
      </Card>
    </Screen>
  );
}
