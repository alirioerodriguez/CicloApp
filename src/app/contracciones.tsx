// Contador de contracciones: duración, intervalo y la regla 5-1-1.
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../components/Texto';
import { Body, Button, Card, Label, Muted, Screen, tap } from '../components/ui';
import { REGLA_511, REGLA_511_YA } from '../content/embarazo';
import { fonts, serif, useColors } from '../lib/theme';

interface Contraccion {
  inicio: number; // ms
  duracion: number; // ms
}

const mmss = (ms: number) => {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
const hora = (ms: number) => {
  const d = new Date(ms);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export default function Contracciones() {
  const c = useColors();
  const [lista, setLista] = useState<Contraccion[]>([]);
  const [empezo, setEmpezo] = useState<number | null>(null);
  const [ahora, setAhora] = useState(Date.now());

  useEffect(() => {
    if (!empezo) return;
    const id = setInterval(() => setAhora(Date.now()), 500);
    return () => clearInterval(id);
  }, [empezo]);

  const alternar = () => {
    tap();
    const t = Date.now();
    if (empezo) {
      setLista([...lista, { inicio: empezo, duracion: t - empezo }]);
      setEmpezo(null);
    } else {
      setEmpezo(t);
      setAhora(t);
    }
  };

  // Regla 5-1-1 con las últimas contracciones: cada 5 minutos o menos y de 1 minuto o más.
  const ultimas = lista.slice(-6);
  const intervalos = ultimas.slice(1).map((x, i) => (x.inicio - ultimas[i].inicio) / 60000);
  const promIntervalo = intervalos.length ? intervalos.reduce((a, b) => a + b, 0) / intervalos.length : Infinity;
  const promDuracion = ultimas.length ? ultimas.reduce((a, x) => a + x.duracion, 0) / ultimas.length / 1000 : 0;
  const ir = ultimas.length >= 3 && promIntervalo <= 5 && promDuracion >= 60;

  return (
    <Screen angosta title="Contracciones" right={<Button small kind="soft" label="Cerrar" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />}>
      <Body>Toca al empezar cada contracción y otra vez al terminar. Te mostramos cuánto duran y cada cuánto vienen.</Body>
      <View style={{ alignItems: 'center', marginVertical: 8 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={empezo ? 'Terminó la contracción' : 'Empezó una contracción'}
          onPress={alternar}
          style={({ pressed }) => ({
            width: 220,
            height: 220,
            borderRadius: 110,
            backgroundColor: empezo ? c.lavanda : c.rosa,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: pressed ? 0.96 : 1 }],
          })}
        >
          <Text style={{ fontFamily: serif, fontSize: 52, color: c.onAccent }}>{empezo ? mmss(ahora - empezo) : lista.length ? mmss(lista[lista.length - 1].duracion) : '0:00'}</Text>
          <Text style={{ fontFamily: fonts.bold, fontSize: 15, color: c.onAccent }}>{empezo ? 'Toca al terminar' : 'Toca al empezar'}</Text>
        </Pressable>
      </View>

      <Card tint={ir ? c.duraznoSuave : c.lavandaSuave}>
        <Body style={ir ? { fontWeight: '700' } : undefined}>{ir ? REGLA_511_YA : REGLA_511}</Body>
      </Card>

      {lista.length > 0 && (
        <Card style={{ gap: 0 }}>
          <View style={{ flexDirection: 'row', paddingBottom: 6 }}>
            <Label style={{ flex: 1 }}>Hora</Label>
            <Label style={{ flex: 1 }}>Duración</Label>
            <Label style={{ flex: 1 }}>Intervalo</Label>
          </View>
          {[...lista].reverse().map((x, i, arr) => {
            const prev = arr[i + 1];
            return (
              <View key={x.inicio} style={{ flexDirection: 'row', paddingVertical: 8, borderTopWidth: 1, borderTopColor: c.line }}>
                <Body style={{ flex: 1 }}>{hora(x.inicio)}</Body>
                <Body style={{ flex: 1 }}>{mmss(x.duracion)}</Body>
                <Body style={{ flex: 1 }}>{prev ? `${Math.round((x.inicio - prev.inicio) / 60000)} min` : '—'}</Body>
              </View>
            );
          })}
        </Card>
      )}
      {lista.length > 0 && <Button kind="ghost" label="Borrar la lista" onPress={() => setLista([])} />}
      <Muted>La lista no se guarda: es para este momento.</Muted>
    </Screen>
  );
}
