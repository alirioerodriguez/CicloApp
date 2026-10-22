// Calendario de bochornos (diseño 7j): cada día se colorea según cuántos bochornos tuvo.
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { addDays, longDate, today, toISO } from '../lib/dates';
import { useStore } from '../lib/store';
import { fonts, serif, useColors } from '../lib/theme';
import { Body, Button, Card, Columnas, Muted, Screen, tap } from './ui';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DIAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const NARANJA = '#E9A15F';

// Color según cantidad: transparente sin registro, neutro con 0, naranja cada vez más intenso.
function tono(n: number | null, base: string): { bg: string; alpha: number } {
  if (n == null) return { bg: 'transparent', alpha: 1 };
  if (n === 0) return { bg: base, alpha: 1 };
  return { bg: NARANJA, alpha: n <= 2 ? 0.35 : n <= 4 ? 0.65 : 1 };
}

export function CalendarioMeno() {
  const c = useColors();
  const { data } = useStore();
  const t = today();
  const [mes, setMes] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [sel, setSel] = useState(t);

  const primero = toISO(mes);
  const offset = (mes.getDay() + 6) % 7; // lunes primero
  const diasMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
  const celdas: (string | null)[] = [...Array(offset).fill(null), ...Array.from({ length: diasMes }, (_, i) => addDays(primero, i))];
  const mover = (n: number) => setMes(new Date(mes.getFullYear(), mes.getMonth() + n, 1));

  const l = data.logs[sel];
  const n = l?.bochornos ?? null;
  const sudores = (l?.despertoPor.includes('calor') ?? false);
  const titulo = sel > t ? 'Aún no llega' : n == null ? 'Sin registro' : n === 0 ? 'Sin bochornos' : `${n} ${n === 1 ? 'bochorno' : 'bochornos'}`;
  const texto =
    sel > t
      ? 'Podrás registrar este día cuando llegue.'
      : n == null
        ? 'Ese día no anotaste bochornos.'
        : `${sudores ? 'Te despertaron sudores de noche. ' : ''}${n >= 5 ? 'Un día intenso. ¿Dormiste poco o tomaste café?' : n === 0 ? 'Un día tranquilo.' : 'Día moderado.'}`;

  const leyenda = [
    { c: c.line, t: 'Sin bochornos', a: 1 },
    { c: NARANJA, t: '1 a 2', a: 0.35 },
    { c: NARANJA, t: '3 a 4', a: 0.65 },
    { c: NARANJA, t: '5 o más', a: 1 },
    { c: c.lavanda, t: 'Sudores de noche', a: 1 },
  ];

  return (
    <Screen title="Calendario">
      <Columnas
        desde="escritorio"
        izquierda={
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Pressable accessibilityRole="button" accessibilityLabel="Mes anterior" onPress={() => mover(-1)} hitSlop={8} style={{ padding: 6 }}>
                <Text style={{ color: c.text, fontSize: 20 }}>‹</Text>
              </Pressable>
              <Text style={{ flex: 1, textAlign: 'center', fontFamily: serif, fontSize: 20, color: c.text }}>
                {MESES[mes.getMonth()]} {mes.getFullYear()}
              </Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Mes siguiente" onPress={() => mover(1)} hitSlop={8} style={{ padding: 6 }}>
                <Text style={{ color: c.text, fontSize: 20 }}>›</Text>
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row' }}>
              {DIAS.map((d, i) => (
                <Text key={i} style={{ flex: 1, textAlign: 'center', fontFamily: fonts.semibold, fontSize: 12, color: c.muted }}>
                  {d}
                </Text>
              ))}
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {celdas.map((d, i) => {
                if (!d) return <View key={`v${i}`} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} />;
                const log = data.logs[d];
                const k = tono(log?.bochornos ?? null, c.line);
                const esSel = d === sel;
                const sudor = log?.despertoPor.includes('calor');
                return (
                  <View key={d} style={{ width: `${100 / 7}%`, aspectRatio: 1, padding: 3 }}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${longDate(d)}: ${log?.bochornos ?? 'sin registro'} bochornos`}
                      onPress={() => {
                        tap();
                        setSel(d);
                      }}
                      style={{ flex: 1, borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: esSel ? 2 : d === t ? 2 : 0, borderColor: esSel ? c.text : c.rosa }}
                    >
                      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 999, backgroundColor: k.bg, opacity: k.alpha }} />
                      <Text style={{ fontFamily: fonts.semibold, fontSize: 13, color: d > t ? c.muted : c.text }}>{Number(d.slice(8))}</Text>
                      {sudor && <View style={{ position: 'absolute', top: 2, right: 2, width: 7, height: 7, borderRadius: 4, backgroundColor: c.lavanda }} />}
                    </Pressable>
                  </View>
                );
              })}
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {leyenda.map((x) => (
                <View key={x.t} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: x.c, opacity: x.a }} />
                  <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: c.muted }}>{x.t}</Text>
                </View>
              ))}
            </View>
          </Card>
        }
        derecha={
          <>
            <Card>
              <Text style={{ fontFamily: fonts.bold, fontSize: 11.5, letterSpacing: 1.5, color: c.muted, textTransform: 'uppercase' }}>{longDate(sel)}</Text>
              <Text style={{ fontFamily: serif, fontSize: 24, color: c.text }}>{titulo}</Text>
              <Body>{texto}</Body>
              {sel <= t && <Button small kind="soft" label="Ver o editar ese día" onPress={() => router.push(`/dia/${sel}`)} />}
            </Card>
            <Muted>Los bochornos de hoy se anotan en Hoy o en el registro completo de síntomas.</Muted>
          </>
        }
      />
    </Screen>
  );
}
