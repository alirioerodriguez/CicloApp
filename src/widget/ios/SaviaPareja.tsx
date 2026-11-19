// Widget de iPhone (expo-widgets) para quien acompaña: en qué fase está su pareja, cómo puede sentirse
// y qué hacer hoy (misión, un plan y algo para comer). Lo mismo que «Acompañar a mi pareja», en la pantalla de inicio.
// Chico: la fase y el período. Mediano: además la misión. Grande: todos los consejos del día.
// Los textos los arma la app (propsPareja en datosIOS.ts) y nunca llevan nada privado de ella.
// La función con 'widget' corre en el widget de iOS: no puede importar ni usar nada de afuera.
import { Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { containerBackground, font, foregroundStyle, lineLimit, widgetURL } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

export interface PropsPareja {
  conectada: boolean;
  emoji: string;
  titulo: string; // «Ana está en su fase lútea»
  linea: string; // «Su período: en 10 días» (vacío si no lo comparte)
  como: string; // cómo puede sentirse
  mision: string;
  plan: string;
  plato: string;
  rotulos: { hoy: string; como: string; mision: string; plan: string; comer: string }; // ya traducidos
}

const SaviaPareja = (props: PropsPareja, environment: WidgetEnvironment) => {
  'widget';
  const oscuro = environment.colorScheme === 'dark';
  const paleta = oscuro ? { fondo: '#231A21', texto: '#F6EEF1', suave: '#B9A8B2', rosa: '#F0A3C4' } : { fondo: '#FBF5F2', texto: '#2A1E28', suave: '#7A6873', rosa: '#C24E7A' };
  const familia = environment.widgetFamily;
  const grande = familia === 'systemLarge' || familia === 'systemExtraLarge';
  const chico = familia === 'systemSmall';
  const marco = [containerBackground(paleta.fondo, 'widget'), widgetURL('ciclo:///acompanar')];
  if (!props.conectada) {
    return (
      <VStack alignment="leading" spacing={6} modifiers={marco}>
        <Text modifiers={[font({ weight: 'bold', size: 15 }), foregroundStyle(paleta.texto)]}>Savia 💞</Text>
        <Text modifiers={[font({ size: 13 }), foregroundStyle(paleta.suave), lineLimit(4)]}>{props.titulo}</Text>
      </VStack>
    );
  }
  const consejo = (titulo: string, texto: string, lineas: number) =>
    texto ? (
      <VStack alignment="leading" spacing={1}>
        <Text modifiers={[font({ weight: 'bold', size: 11 }), foregroundStyle(paleta.suave)]}>{titulo}</Text>
        <Text modifiers={[font({ size: 13 }), foregroundStyle(paleta.texto), lineLimit(lineas)]}>{texto}</Text>
      </VStack>
    ) : null;
  return (
    <VStack alignment="leading" spacing={grande ? 10 : 4} modifiers={marco}>
      <Text modifiers={[font({ size: chico ? 22 : 20 })]}>{props.emoji}</Text>
      <Text modifiers={[font({ weight: 'bold', size: chico ? 14 : 15 }), foregroundStyle(paleta.texto), lineLimit(chico ? 3 : 2)]}>{props.titulo}</Text>
      {props.linea ? <Text modifiers={[font({ size: 12 }), foregroundStyle(paleta.rosa), lineLimit(1)]}>{props.linea}</Text> : null}
      {chico ? <Spacer /> : null}
      {!chico && !grande ? consejo(props.rotulos.hoy, props.mision || props.como, 2) : null}
      {grande ? consejo(props.rotulos.como, props.como, 3) : null}
      {grande ? consejo(props.rotulos.mision, props.mision, 3) : null}
      {grande ? consejo(props.rotulos.plan, props.plan, 2) : null}
      {grande ? consejo(props.rotulos.comer, props.plato, 2) : null}
      {grande ? <Spacer /> : null}
    </VStack>
  );
};

export default createWidget('SaviaPareja', SaviaPareja, { conectada: false, emoji: '💞', titulo: 'Abre Savia para conectar con tu pareja.', linea: '', como: '', mision: '', plan: '', plato: '', rotulos: { hoy: 'HOY', como: 'CÓMO SE SIENTE', mision: 'TU MISIÓN DE HOY', plan: 'UN PLAN', comer: 'PARA COMER' } });
