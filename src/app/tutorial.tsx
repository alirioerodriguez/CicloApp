// Tutorial: tarjetas que explican todo lo que puede hacer la app.
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Figura } from '../components/Figura';
import { Logo } from '../components/Logo';
import { Button, tap } from '../components/ui';
import { ejercicioById } from '../content/ejercicios';
import { TUTORIAL } from '../content/tutorial';
import { useStore } from '../lib/store';
import { fonts, radius, serif, useColors } from '../lib/theme';

export default function Tutorial() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { updateSettings } = useStore();
  const [i, setI] = useState(0);
  const slide = TUTORIAL[i];
  const last = i === TUTORIAL.length - 1;
  const ej = slide.figura ? ejercicioById(slide.figura) : null;

  const terminar = () => {
    updateSettings({ tutorialVisto: true });
    router.replace('/');
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16, paddingHorizontal: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', maxWidth: 560, width: '100%', alignSelf: 'center' }}>
        <View style={{ flex: 1, flexDirection: 'row', gap: 5 }}>
          {TUTORIAL.map((_, k) => (
            <View key={k} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: k <= i ? c.rosa : c.line }} />
          ))}
        </View>
        {!last && (
          <Pressable onPress={terminar} hitSlop={10} style={{ marginLeft: 14 }}>
            <Text style={{ color: c.muted, fontFamily: fonts.semibold }}>Omitir</Text>
          </Pressable>
        )}
      </View>

      <View style={{ flex: 1, justifyContent: 'center', gap: 16, maxWidth: 560, width: '100%', alignSelf: 'center' }}>
        <View style={{ alignItems: 'center' }}>
          {slide.logo ? (
            <Logo size={96} animated />
          ) : ej ? (
            <View style={{ backgroundColor: c.card, borderRadius: radius.lg }}>
              <Figura a={ej.a} b={ej.b} bendF={ej.bendF} bendB={ej.bendB} segundosPorRep={ej.segundosPorRep} frontal={ej.frontal} size={170} />
            </View>
          ) : (
            <View style={{ width: 110, height: 110, borderRadius: 55, backgroundColor: c.rosaSuave, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 52 }}>{slide.emoji}</Text>
            </View>
          )}
        </View>
        <Text style={{ fontFamily: serif, fontSize: 30, color: c.text, textAlign: 'center' }}>{slide.titulo}</Text>
        <Text style={{ fontFamily: fonts.regular, fontSize: 16, color: c.muted, textAlign: 'center' }}>{slide.texto}</Text>
        <View style={{ gap: 10, backgroundColor: c.card, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: c.line }}>
          {slide.puntos.map((p) => (
            <View key={p} style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.rosa, marginTop: 7 }} />
              <Text style={{ flex: 1, fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: c.text }}>{p}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10, maxWidth: 560, width: '100%', alignSelf: 'center' }}>
        {i > 0 && (
          <View style={{ flex: 1 }}>
            <Button
              kind="ghost"
              label="Atrás"
              onPress={() => {
                tap();
                setI(i - 1);
              }}
            />
          </View>
        )}
        <View style={{ flex: 2 }}>
          <Button label={last ? 'Empezar a usar Savia' : 'Siguiente'} onPress={() => (last ? terminar() : setI(i + 1))} />
        </View>
      </View>
    </View>
  );
}
