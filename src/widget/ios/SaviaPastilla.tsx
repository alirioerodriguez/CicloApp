// Widget de iPhone (expo-widgets): la pastilla de hoy del blíster y si ya la tomaste.
// Tocarlo abre la app para marcarla. No lleva botón «La tomé»: con la app cerrada, el toque cambiaría el widget
// pero no el blíster guardado, y la app creería que no la tomaste. Los textos los arma la app (src/widget/textos.ts).
import { Text, VStack } from '@expo/ui/swift-ui';
import { containerBackground, font, foregroundStyle, lineLimit, widgetURL } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

export interface PropsPastilla {
  activo: boolean;
  titulo: string; // «Pastilla 14/21», «Placebo 23/28», «Descanso 3/7»
  estado: string; // «Tomada a las 21:04», «Hoy a las 21:00», «Hoy no te toca pastilla.»
  marca: 'tomada' | 'tarde' | 'pendiente' | 'olvidada' | 'descanso';
}

const SaviaPastilla = (props: PropsPastilla, environment: WidgetEnvironment) => {
  'widget';
  const oscuro = environment.colorScheme === 'dark';
  const paleta = oscuro
    ? { fondo: '#231A21', texto: '#F6EEF1', suave: '#B9A8B2', rosa: '#F0A3C4', salvia: '#A8D4B4', durazno: '#F6C58F' }
    : { fondo: '#FBF5F2', texto: '#2A1E28', suave: '#7A6873', rosa: '#C24E7A', salvia: '#5E9A73', durazno: '#D98A3D' };
  const simbolo = props.marca === 'tomada' || props.marca === 'tarde' ? '✓' : props.marca === 'pendiente' ? '○' : '–';
  const color = props.marca === 'tomada' ? paleta.salvia : props.marca === 'tarde' ? paleta.durazno : props.marca === 'pendiente' ? paleta.rosa : paleta.suave;
  if (!props.activo) {
    return (
      <VStack alignment="leading" spacing={6} modifiers={[containerBackground(paleta.fondo, 'widget'), widgetURL('ciclo:///')]}>
        <Text modifiers={[font({ weight: 'bold', size: 15 }), foregroundStyle(paleta.texto)]}>Savia</Text>
        <Text modifiers={[font({ size: 13 }), foregroundStyle(paleta.suave), lineLimit(3)]}>{props.estado}</Text>
      </VStack>
    );
  }
  return (
    <VStack alignment="leading" spacing={4} modifiers={[containerBackground(paleta.fondo, 'widget'), widgetURL('ciclo:///')]}>
      <Text modifiers={[font({ weight: 'bold', size: 12 }), foregroundStyle(paleta.suave)]}>Savia</Text>
      <Text modifiers={[font({ weight: 'bold', size: 18 }), foregroundStyle(paleta.texto), lineLimit(1)]}>{props.titulo}</Text>
      <Text modifiers={[font({ weight: 'bold', size: 40 }), foregroundStyle(color)]}>{simbolo}</Text>
      <Text modifiers={[font({ size: 12.5 }), foregroundStyle(paleta.suave), lineLimit(2)]}>{props.estado}</Text>
    </VStack>
  );
};

export default createWidget('SaviaPastilla', SaviaPastilla, { activo: false, titulo: '', estado: 'Abre Savia para ver tu pastilla de hoy.', marca: 'pendiente' });
