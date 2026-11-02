// Widget de iPhone (expo-widgets): cuántos días faltan para el período, o la cuenta del blíster, el embarazo o el posparto.
// Los textos los arma la app con `cuenta()` (src/widget/textos.ts), igual que en Android; acá solo se dibujan.
// La función con 'widget' corre en el widget de iOS: no puede importar ni usar nada de afuera, por eso los colores van adentro.
import { Text, VStack } from '@expo/ui/swift-ui';
import { containerBackground, font, foregroundStyle, lineLimit, widgetURL } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

export interface PropsPeriodo {
  grande: string;
  unidad: string;
  pie: string;
  color: 'rosa' | 'lila' | 'salvia' | 'texto';
}

const SaviaPeriodo = (props: PropsPeriodo, environment: WidgetEnvironment) => {
  'widget';
  const oscuro = environment.colorScheme === 'dark';
  const paleta = oscuro
    ? { fondo: '#231A21', texto: '#F6EEF1', suave: '#B9A8B2', rosa: '#F0A3C4', lila: '#BDB3F5', salvia: '#A8D4B4' }
    : { fondo: '#FBF5F2', texto: '#2A1E28', suave: '#7A6873', rosa: '#C24E7A', lila: '#8F7FE0', salvia: '#5E9A73' };
  const acento = props.color === 'texto' ? paleta.texto : paleta[props.color];
  const mediano = environment.widgetFamily === 'systemMedium';
  return (
    <VStack alignment="leading" spacing={4} modifiers={[containerBackground(paleta.fondo, 'widget'), widgetURL('ciclo:///')]}>
      <Text modifiers={[font({ weight: 'bold', size: 12 }), foregroundStyle(paleta.suave)]}>Savia</Text>
      <Text modifiers={[font({ weight: 'bold', size: props.grande.length > 4 ? 26 : mediano ? 44 : 38 }), foregroundStyle(acento), lineLimit(1)]}>{props.grande}</Text>
      <Text modifiers={[font({ size: mediano ? 15 : 13 }), foregroundStyle(paleta.texto), lineLimit(2)]}>{props.unidad}</Text>
      <Text modifiers={[font({ size: 12 }), foregroundStyle(paleta.suave), lineLimit(1)]}>{props.pie}</Text>
    </VStack>
  );
};

export default createWidget('SaviaPeriodo', SaviaPeriodo, { grande: '🌸', unidad: 'Abre Savia para ver tu cuenta', pie: ' ', color: 'texto' });
