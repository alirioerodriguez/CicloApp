// "Hoy" en modo menopausia (diseño 7i): bochornos, cómo me siento, idea del día y próximo chequeo.
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import {
  CHEQUEOS_MENO,
  PLATOS_MENO,
  SENTIR,
  diasSinPeriodo,
  etapaMeno,
  etiquetaBochornos,
  ideaDelDia,
  mensajeSangrado,
} from '../content/menopausia';
import { saludo } from '../content/textos';
import { addDays, longDate, today } from '../lib/dates';
import { useStore } from '../lib/store';
import { fonts, radius, serif, useColors } from '../lib/theme';
import { Logo } from './Logo';
import { Platos } from './Platos';
import { Body, Button, Card, Columnas, Label, Muted, Screen, tap } from './ui';

export function HoyMeno() {
  const c = useColors();
  const { data, getLog, setLog } = useStore();
  const t = today();
  const log = getLog(t);
  const st = data.settings;
  const etapa = etapaMeno(st.meno.etapa);
  const bochornos = log.bochornos ?? 0;
  const dias = diasSinPeriodo(data);
  const hello = saludo(new Date().getHours(), 'general');
  const pendiente = CHEQUEOS_MENO.find((x) => !data.chequeosMeno.includes(x.id));
  const sentir = log.sentir ?? { sueno: -1, animo: -1, energia: -1 };

  // Anillo: se llena hasta 6 bochornos.
  const R = 70;
  const C = 2 * Math.PI * R;
  const avance = Math.min(bochornos, 6) / 6;

  // "Notamos que…": días con más bochornos y peor sueño en las últimas 2 semanas.
  const notamos = useMemo(() => {
    let juntos = 0;
    for (let i = 1; i <= 14; i++) {
      const l = data.logs[addDays(t, -i)];
      if (l && (l.bochornos ?? 0) >= 4 && ((l.despertares ?? 0) >= 2 || (l.sentir && l.sentir.sueno <= 1))) juntos++;
    }
    return juntos >= 2 ? 'Los días con más bochornos también duermes peor. Prueba una habitación más fresca y anota qué los dispara.' : null;
  }, [data.logs, t]);

  const sangradoHoy = log.flow > 0;

  return (
    <Screen subtitle={longDate(t)} title={`${hello.titulo}${st.name ? `, ${st.name}` : ''}`} right={<Logo size={32} />}>
      <Body style={{ marginTop: -6 }}>¿Cómo dormiste anoche?</Body>

      <Columnas
        izquierda={
          <>
            <Card tint={c.duraznoSuave} style={{ alignItems: 'center', gap: 12 }}>
              <View style={{ width: 170, height: 170, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={170} height={170} viewBox="0 0 170 170" style={{ position: 'absolute' }}>
                  <Circle cx={85} cy={85} r={R} fill="none" stroke={c.card} strokeWidth={10} />
                  <Circle cx={85} cy={85} r={R} fill="none" stroke={c.rosa} strokeWidth={10} strokeLinecap="round" strokeDasharray={`${(C * avance).toFixed(1)} ${C.toFixed(1)}`} transform="rotate(-90 85 85)" />
                </Svg>
                <Text style={{ fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.5, color: c.muted }}>BOCHORNOS HOY</Text>
                <Text style={{ fontFamily: serif, fontSize: 52, lineHeight: 58, color: c.text }}>{bochornos}</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: c.muted }}>{etiquetaBochornos(bochornos, log.intensidad)}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 10, alignSelf: 'stretch' }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Quitar un bochorno"
                  disabled={!bochornos}
                  onPress={() => {
                    tap();
                    setLog(t, { bochornos: Math.max(0, bochornos - 1) });
                  }}
                  style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center', opacity: bochornos ? 1 : 0.4 }}
                >
                  <Text style={{ fontFamily: fonts.bold, fontSize: 22, color: c.text }}>−</Text>
                </Pressable>
                <View style={{ flex: 1 }}>
                  <Button label="Tuve un bochorno" onPress={() => setLog(t, { bochornos: bochornos + 1 })} />
                </View>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                <Text style={{ fontFamily: fonts.semibold, fontSize: 12.5, color: c.text, backgroundColor: c.bg, borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 5, overflow: 'hidden' }}>{etapa.nombre}</Text>
                {dias != null && (
                  <Text style={{ fontFamily: fonts.semibold, fontSize: 12.5, color: c.text, backgroundColor: c.bg, borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 5, overflow: 'hidden' }}>
                    {dias} días sin período
                  </Text>
                )}
              </View>
            </Card>

            {sangradoHoy && st.meno.etapa === 'post' && (
              <Card tint={c.duraznoSuave}>
                <Body style={{ fontWeight: '700' }}>⚠️ {mensajeSangrado('post')}</Body>
              </Card>
            )}

            <Card>
              <Label>Hoy me siento</Label>
              {SENTIR.map((q) => (
                <View key={q.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ width: 64, fontFamily: fonts.semibold, fontSize: 14, color: c.text }}>{q.label}</Text>
                  <View style={{ flex: 1, flexDirection: 'row', gap: 6 }}>
                    {q.caras.map((cara, i) => {
                      const on = sentir[q.id] === i;
                      return (
                        <Pressable
                          key={i}
                          accessibilityRole="radio"
                          accessibilityLabel={`${q.label} ${i + 1} de 5`}
                          accessibilityState={{ selected: on }}
                          onPress={() => {
                            tap();
                            const base = log.sentir ?? { sueno: 2, animo: 2, energia: 2 };
                            setLog(t, { sentir: { ...base, [q.id]: i } });
                          }}
                          style={{ flex: 1, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.rosaSuave : c.bg, borderWidth: on ? 1.5 : 0, borderColor: c.rosa }}
                        >
                          <Text style={{ fontSize: 20 }}>{cara}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
              <Button kind="soft" label="Registro completo de síntomas" onPress={() => router.push('/menopausia')} />
            </Card>
          </>
        }
        derecha={
          <>
            {notamos && (
              <Card style={{ flexDirection: 'row', gap: 12 }}>
                <Text style={{ fontSize: 22 }}>🔎</Text>
                <View style={{ flex: 1 }}>
                  <Label>Notamos que…</Label>
                  <Body>{notamos}</Body>
                </View>
              </Card>
            )}

            <Card tint={c.lavandaSuave}>
              <Label>Idea para hoy</Label>
              <Body>{ideaDelDia()}</Body>
            </Card>

            <Pressable accessibilityRole="button" onPress={() => router.push('/menopausia')}>
              <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={{ fontSize: 26 }}>🩺</Text>
                <View style={{ flex: 1 }}>
                  <Label>{pendiente ? `Pendiente: ${pendiente.titulo}` : 'Tus controles están al día'}</Label>
                  <Muted>{pendiente ? 'Pídela en tu próxima consulta' : 'Revisa de nuevo en tu control anual'}</Muted>
                </View>
                <Text style={{ color: c.muted, fontSize: 20 }}>›</Text>
              </Card>
            </Pressable>

            <Label style={{ marginTop: 4 }}>Para comer hoy</Label>
            <Platos platos={PLATOS_MENO} />
          </>
        }
      />
    </Screen>
  );
}
