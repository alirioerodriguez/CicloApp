// Widget de iPhone (expo-widgets): la pastilla de hoy del blíster y si ya la tomaste.
// Si hoy toca y no está marcada, lleva el botón «Ya la tomé». El botón cambia el widget al instante y guarda la hora
// en la línea de tiempo del widget; la app la pasa al blíster cuando se abre (o al toque, si estaba abierta):
// ver tomasDelWidget en datosIOS.ts y el efecto de _layout.tsx. Los textos los arma la app (src/widget/textos.ts).
// La función con 'widget' corre en el widget de iOS: no puede importar ni usar nada de afuera.
import { Button, HStack, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { buttonStyle, containerBackground, controlSize, font, foregroundStyle, lineLimit, tint, widgetURL } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

export interface PropsPastilla {
  activo: boolean;
  titulo: string; // «Pastilla 14/21», «Placebo 23/28», «Descanso 3/7»
  estado: string; // «Tomada a las 21:04», «Hoy a las 21:00», «Aún no tomaste tu pastilla», «Hoy no te toca pastilla.»
  marca: 'tomada' | 'tarde' | 'pendiente' | 'olvidada' | 'descanso';
  fecha: string; // el día de esta entrada (AAAA-MM-DD)
  boton: boolean; // hoy toca y todavía no se marcó
  atrasada?: boolean; // ya pasó su hora
  tomadaWidget: string | null; // hora (HH:MM) en que la marcó desde el widget; la app la lee al abrirse
  botonTexto?: string; // «Ya la tomé», ya traducido
}

const SaviaPastilla = (props: PropsPastilla, environment: WidgetEnvironment) => {
  'widget';
  const oscuro = environment.colorScheme === 'dark';
  const paleta = oscuro
    ? { fondo: '#231A21', texto: '#F6EEF1', suave: '#B9A8B2', rosa: '#F0A3C4', salvia: '#A8D4B4', durazno: '#F6C58F', boton: '#F0A3C4' }
    : { fondo: '#FBF5F2', texto: '#2A1E28', suave: '#7A6873', rosa: '#C24E7A', salvia: '#5E9A73', durazno: '#D98A3D', boton: '#7E2F52' };
  if (!props.activo) {
    return (
      <VStack alignment="leading" spacing={6} modifiers={[containerBackground(paleta.fondo, 'widget'), widgetURL('ciclo:///')]}>
        <Text modifiers={[font({ weight: 'bold', size: 15 }), foregroundStyle(paleta.texto)]}>Savia</Text>
        <Text modifiers={[font({ size: 13 }), foregroundStyle(paleta.suave), lineLimit(3)]}>{props.estado}</Text>
      </VStack>
    );
  }
  const simbolo = props.marca === 'tomada' || props.marca === 'tarde' ? '✓' : props.marca === 'pendiente' ? '○' : '–';
  const color = props.marca === 'tomada' ? paleta.salvia : props.marca === 'tarde' ? paleta.durazno : props.marca === 'pendiente' ? paleta.rosa : paleta.suave;
  // Lo que devuelve se mezcla con las props de esta entrada y queda guardado en el widget.
  const tomar = () => {
    const d = new Date();
    const hora = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    return { marca: 'tomada', estado: `✓ ${hora}`, boton: false, atrasada: false, tomadaWidget: hora };
  };
  return (
    <VStack alignment="leading" spacing={4} modifiers={[containerBackground(paleta.fondo, 'widget'), widgetURL('ciclo:///')]}>
      <HStack>
        <Text modifiers={[font({ weight: 'bold', size: 16 }), foregroundStyle(paleta.texto), lineLimit(1)]}>{props.titulo}</Text>
        <Spacer />
        {props.boton ? null : <Text modifiers={[font({ weight: 'bold', size: 22 }), foregroundStyle(color)]}>{simbolo}</Text>}
      </HStack>
      <Text modifiers={[font({ weight: props.atrasada ? 'bold' : 'regular', size: 13 }), foregroundStyle(props.atrasada ? paleta.rosa : paleta.suave), lineLimit(2)]}>{props.estado}</Text>
      <Spacer />
      {props.boton ? <Button target="tomar" onPress={tomar} label={props.botonTexto || 'Ya la tomé'} modifiers={[buttonStyle('borderedProminent'), controlSize('regular'), tint(paleta.boton)]} /> : null}
    </VStack>
  );
};

export default createWidget('SaviaPastilla', SaviaPastilla, { activo: false, titulo: '', estado: 'Abre Savia para ver tu pastilla de hoy.', marca: 'pendiente', fecha: '', boton: false, tomadaWidget: null });
