// Widget de iPhone (expo-widgets) para quien acompaña: en qué fase está su pareja, cómo puede sentirse
// y qué hacer hoy (una cita, algo para comer, un mimo y, si ella lo comparte, una pista de cercanía).
// Chico: la fase y el período. Mediano: además la misión. Grande: los consejos del día.
// Los textos los arma la app (propsPareja en datosIOS.ts) y nunca llevan nada privado de ella.
// Sin emojis: el símbolo del sistema equivalente al ícono de la fase en la app (simboloDeEmoji).
// La función con 'widget' corre en el widget de iOS: no puede importar ni usar nada de afuera.
import { HStack, Image, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { containerBackground, font, foregroundStyle, lineLimit, widgetURL } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

export interface PropsPareja {
  conectada: boolean;
  simbolo: string; // SF Symbol de la fase («moon», «leaf», «sparkles»…)
  titulo: string; // «Ana está en su fase lútea»
  linea: string; // «Su período: en 10 días» (vacío si no lo comparte)
  como: string; // cómo puede sentirse
  mision: string;
  plan: string; // una cita
  plato: string;
  mimo: string; // un masaje o cuidado
  cercania: string; // pista sutil; vacía si ella no la comparte
  rotulos: { hoy: string; como: string; mision: string; plan: string; comer: string; mimo: string; cercania: string }; // ya traducidos
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
        <HStack spacing={6}>
          <Image systemName="heart" size={15} color={paleta.rosa} />
          <Text modifiers={[font({ weight: 'bold', size: 15 }), foregroundStyle(paleta.texto)]}>Savia</Text>
        </HStack>
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
    <VStack alignment="leading" spacing={grande ? 8 : 4} modifiers={marco}>
      <Image systemName={props.simbolo as never} size={chico ? 22 : 20} color={paleta.rosa} />
      <Text modifiers={[font({ weight: 'bold', size: chico ? 14 : 15 }), foregroundStyle(paleta.texto), lineLimit(chico ? 3 : 2)]}>{props.titulo}</Text>
      {props.linea ? <Text modifiers={[font({ size: 12 }), foregroundStyle(paleta.rosa), lineLimit(1)]}>{props.linea}</Text> : null}
      {chico ? <Spacer /> : null}
      {!chico && !grande ? consejo(props.rotulos.hoy, props.mision || props.plan || props.como, 2) : null}
      {grande ? consejo(props.rotulos.como, props.como, 2) : null}
      {grande ? consejo(props.rotulos.plan, props.plan, 1) : null}
      {grande ? consejo(props.rotulos.comer, props.plato, 1) : null}
      {grande ? consejo(props.rotulos.mimo, props.mimo, 2) : null}
      {grande ? consejo(props.rotulos.cercania, props.cercania, 3) : null}
      {grande && !props.cercania ? consejo(props.rotulos.mision, props.mision, 2) : null}
      {grande ? <Spacer /> : null}
    </VStack>
  );
};

export default createWidget('SaviaPareja', SaviaPareja, {
  conectada: false, simbolo: 'heart', titulo: 'Abre Savia para conectar con tu pareja.', linea: '', como: '', mision: '', plan: '', plato: '', mimo: '', cercania: '',
  rotulos: { hoy: 'HOY', como: 'CÓMO SE SIENTE', mision: 'TU MISIÓN DE HOY', plan: 'UNA CITA', comer: 'PARA COMER', mimo: 'UN MIMO', cercania: 'ENTRE USTEDES' },
});
