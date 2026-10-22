// Contador de patadas (diseño 7g): tocar cada movimiento hasta llegar a 10.
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Body, Button, Card, Muted, Screen, tap } from '../components/ui';
import { AVISO_PATADAS, META_PATADAS, TEXTO_PATADAS } from '../content/embarazo';
import { addDays, today } from '../lib/dates';
import { useEmbarazo } from '../lib/embarazo';
import { fonts, serif, useColors } from '../lib/theme';

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const enTexto = (s: number) => (s < 60 ? `${s} s` : `${Math.round(s / 60)} min`);

export default function Patadas() {
  const c = useColors();
  const { datos, guardarPatadas } = useEmbarazo();
  const [n, setN] = useState(0);
  const inicio = useRef<number | null>(null);
  const [seg, setSeg] = useState(0);
  const listo = n >= META_PATADAS;

  useEffect(() => {
    if (!inicio.current || listo) return;
    const id = setInterval(() => setSeg(Math.floor((Date.now() - inicio.current!) / 1000)), 1000);
    return () => clearInterval(id);
  }, [n, listo]);

  const contar = () => {
    if (listo) return;
    tap();
    if (!inicio.current) inicio.current = Date.now();
    const s = Math.floor((Date.now() - inicio.current) / 1000);
    setSeg(s);
    setN(n + 1);
    guardarPatadas(n + 1, s);
  };
  const reiniciar = () => {
    inicio.current = null;
    setN(0);
    setSeg(0);
  };

  const ayer = datos.patadas[addDays(today(), -1)];

  return (
    <Screen angosta title="Contar patadas" right={<Button small kind="soft" label="Cerrar" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />}>
      <Body>{TEXTO_PATADAS}</Body>
      <View style={{ alignItems: 'center', marginVertical: 8 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Contar movimiento. Llevas ${n} de ${META_PATADAS}`}
          onPress={contar}
          style={({ pressed }) => ({
            width: 240,
            height: 240,
            borderRadius: 120,
            borderWidth: 14,
            borderColor: c.rosaSuave,
            backgroundColor: listo ? c.salvia : c.rosa,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: pressed ? 0.96 : 1 }],
          })}
        >
          <Text style={{ fontFamily: serif, fontSize: 80, lineHeight: 88, color: c.onAccent }}>{n}</Text>
          <Text style={{ fontFamily: fonts.bold, fontSize: 15, color: c.onAccent }}>{listo ? '¡Listo! 💗' : `de ${META_PATADAS} movimientos`}</Text>
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Card style={{ flex: 1, gap: 2 }}>
          <Muted>Tiempo</Muted>
          <Text style={{ fontFamily: serif, fontSize: 26, color: c.text }}>{mmss(seg)}</Text>
        </Card>
        <Card style={{ flex: 1, gap: 2 }}>
          <Muted>Ayer</Muted>
          <Text style={{ fontFamily: serif, fontSize: 22, color: c.text }}>{ayer ? `${ayer.n} en ${enTexto(ayer.segundos)}` : '—'}</Text>
        </Card>
      </View>
      <Card tint={c.duraznoSuave}>
        <Body>{AVISO_PATADAS}</Body>
      </Card>
      <Button kind="soft" label="Empezar de nuevo" onPress={reiniciar} />
    </Screen>
  );
}
