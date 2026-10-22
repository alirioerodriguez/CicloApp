// Respiración guiada de 1 minuto: inhala 4 s, sostén 2 s, exhala 6 s (exhalar más largo ayuda a calmarse).
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Text, View } from 'react-native';
import { Body, Button, Muted, Screen, tap } from '../components/ui';
import { fonts, serif, useColors } from '../lib/theme';

const FASES = [
  { label: 'Inhala', segundos: 4, to: 1 },
  { label: 'Sostén', segundos: 2, to: 1 },
  { label: 'Exhala', segundos: 6, to: 0.55 },
];
const CICLOS = 5;

export default function Respirar() {
  const c = useColors();
  const scale = useRef(new Animated.Value(0.55)).current;
  const [activo, setActivo] = useState(false);
  const [fase, setFase] = useState(0);
  const [ciclo, setCiclo] = useState(1);
  const [fin, setFin] = useState(false);

  useEffect(() => {
    if (!activo) return;
    const f = FASES[fase];
    tap();
    const anim = Animated.timing(scale, {
      toValue: f.to,
      duration: f.segundos * 1000,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: Platform.OS !== 'web',
    });
    anim.start(({ finished }) => {
      if (!finished) return;
      if (fase < FASES.length - 1) setFase(fase + 1);
      else if (ciclo < CICLOS) {
        setCiclo(ciclo + 1);
        setFase(0);
      } else {
        setActivo(false);
        setFin(true);
      }
    });
    return () => anim.stop();
  }, [activo, fase, ciclo, scale]);

  const empezar = () => {
    setFin(false);
    setCiclo(1);
    setFase(0);
    scale.setValue(0.55);
    setActivo(true);
  };

  return (
    <Screen angosta title="Respira conmigo" right={<Button small kind="soft" label="Cerrar" onPress={() => (router.canGoBack() ? router.back() : router.replace('/ejercicios'))} />}>
      <Body>Exhalar más largo que inhalar ayuda al cuerpo a soltar la tensión. Siéntate o acuéstate cómoda.</Body>
      <View style={{ height: 300, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={{ width: 240, height: 240, borderRadius: 120, backgroundColor: c.rosaSuave, transform: [{ scale }], alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: c.rosa, opacity: 0.85 }} />
        </Animated.View>
        <View style={{ position: 'absolute', alignItems: 'center' }}>
          <Text style={{ fontFamily: serif, fontSize: 30, color: c.dark ? c.bg : c.text }}>{fin ? '¡Muy bien!' : activo ? FASES[fase].label : 'Lista'}</Text>
          {activo && <Text style={{ fontFamily: fonts.bold, color: c.dark ? c.bg : c.text }}>{FASES[fase].segundos} s</Text>}
        </View>
      </View>
      {activo ? <Muted style={{ textAlign: 'center' }}>Respiración {ciclo} de {CICLOS}</Muted> : null}
      {!activo && <Button label={fin ? 'Otra vez' : 'Empezar (1 minuto)'} onPress={empezar} />}
      {activo && <Button kind="soft" label="Detener" onPress={() => setActivo(false)} />}
      <Muted style={{ textAlign: 'center' }}>Si sientes mareo, vuelve a respirar normal.</Muted>
    </Screen>
  );
}
