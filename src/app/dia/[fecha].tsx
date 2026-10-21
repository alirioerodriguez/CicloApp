import { router, useLocalSearchParams } from 'expo-router';
import { DayEditor } from '../../components/DayEditor';
import { Button, Screen } from '../../components/ui';
import { longDate, today } from '../../lib/dates';

export default function Dia() {
  const { fecha } = useLocalSearchParams<{ fecha: string }>();
  const date = /^\d{4}-\d{2}-\d{2}$/.test(fecha ?? '') ? fecha! : today();
  const close = () => (router.canGoBack() ? router.back() : router.replace('/calendario'));
  return (
    <Screen angosta subtitle={date === today() ? 'Hoy' : date > today() ? 'Día futuro' : 'Registro'} title={longDate(date)} right={<Button small kind="soft" label="Cerrar" onPress={close} />}>
      <DayEditor date={date} />
      <Button label="Listo" onPress={close} />
    </Screen>
  );
}
