// "Hoy" en modo embarazo (diseño 7d): semana, tamaño del bebé, esta semana, pendientes y herramientas.
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from './Texto';
import Svg, { Circle } from 'react-native-svg';
import { SEMANA_MIN, TRIMESTRES, bebe, desarrollo, pendientes, proximoControl, trimestre } from '../content/embarazo';
import { saludo } from '../content/textos';
import { longDate, today } from '../lib/dates';
import { useEmbarazo } from '../lib/embarazo';
import { useStore } from '../lib/store';
import { fonts, radius, serif, useColors } from '../lib/theme';
import { Check } from './Check';
import { Logo } from './Logo';
import { Body, Card, Columnas, Label, Muted, Screen, tap } from './ui';
import { Icono } from './Icono';
import { QuizEntrada } from './QuizEntrada';
import { t as traducir } from '../lib/region';

const HERRAMIENTAS: { emoji: string; titulo: string; sub: string; to: Href }[] = [
  { emoji: '👣', titulo: 'Patadas', sub: 'Cuenta sus movimientos', to: '/patadas' },
  { emoji: '⏱️', titulo: 'Contracciones', sub: 'Mide duración y frecuencia', to: '/contracciones' },
  { emoji: '📝', titulo: 'Registra tu día', sub: 'Síntomas, ánimo y agua', to: `/dia/${today()}` as Href },
  { emoji: '⚖️', titulo: 'Peso y presión', sub: 'En Controles', to: '/estadisticas' },
];

export function HoyEmbarazo() {
  const c = useColors();
  const { data } = useStore();
  const { semana, fpp, hecho, alternar } = useEmbarazo();
  const params = useLocalSearchParams<{ semana?: string }>();
  // Se puede mirar otra semana (desde "Tus 40 semanas" o con las flechas) sin cambiar la real.
  const [vista, setVista] = useState(semana);
  useEffect(() => {
    const p = Number(params.semana);
    setVista(p >= SEMANA_MIN && p <= 40 ? p : semana);
  }, [params.semana, semana]);

  const name = data.settings.name;
  const hello = saludo(new Date().getHours(), 'general');
  const b = bebe(vista);
  const dev = desarrollo(vista);
  const tri = TRIMESTRES[trimestre(vista) - 1];
  const ctl = proximoControl(semana);
  const faltan = Math.max(0, 40 - vista);
  const R = 88;
  const C = 2 * Math.PI * R;

  // Con los avisos del embarazo en pausa no se muestran tamaños ni semanas.
  if (data.settings.silencioEmbarazo) {
    return (
      <Screen angosta subtitle={longDate(today())} title={`${traducir(hello.titulo)}${name ? `, ${name}` : ''}`}>
        <Card tint={c.lavandaSuave}>
          <Label>Avisos del embarazo en pausa</Label>
          <Body>Cuando quieras volver a verlos, actívalos en Perfil. Mientras tanto, aquí puedes registrar tu día.</Body>
        </Card>
        <Pressable accessibilityRole="button" onPress={() => router.push(`/dia/${today()}`)}>
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Icono e="📝" size={22} />
            <Label style={{ flex: 1 }}>Registra tu día</Label>
            <Text style={{ color: c.muted, fontSize: 20 }}>›</Text>
          </Card>
        </Pressable>
      </Screen>
    );
  }

  const flecha = (txt: string, label: string, onPress: () => void, disabled: boolean) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => {
        tap();
        onPress();
      }}
      style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.3 : 1 }}
    >
      <Text style={{ color: c.text, fontSize: 18, fontFamily: fonts.bold }}>{txt}</Text>
    </Pressable>
  );

  return (
    <Screen subtitle={longDate(today())} title={`${traducir(hello.titulo)}${name ? `, ${name}` : ''}`} right={<Logo size={32} />}>
      <Body style={{ marginTop: -6 }}>¿Cómo amaneces tú y tu bebé?</Body>

      <Columnas
        izquierda={
          <>
            <Card tint={c.rosaSuave} style={{ alignItems: 'center', gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' }}>
                {flecha('‹', 'Semana anterior', () => setVista(vista - 1), vista <= SEMANA_MIN)}
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ fontFamily: fonts.bold, fontSize: 11.5, letterSpacing: 1.5, color: c.muted, textTransform: 'uppercase' }}>{tri.nombre}</Text>
                  <Text style={{ fontFamily: serif, fontSize: 22, color: c.text }}>Semana {vista}</Text>
                </View>
                {flecha('›', 'Semana siguiente', () => setVista(vista + 1), vista >= 40)}
              </View>
              <View style={{ width: 200, height: 200, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={200} height={200} viewBox="0 0 200 200" style={{ position: 'absolute' }}>
                  <Circle cx={100} cy={100} r={R} fill="none" stroke={c.card} strokeWidth={10} />
                  <Circle cx={100} cy={100} r={R} fill="none" stroke={c.rosa} strokeWidth={10} strokeLinecap="round" strokeDasharray={`${((C * vista) / 40).toFixed(1)} ${C.toFixed(1)}`} transform="rotate(-90 100 100)" />
                </Svg>
                <Icono e={b.emoji} size={56} />
                <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: c.muted, textAlign: 'center', maxWidth: 130 }}>Del tamaño de {b.fruta.replace(/^una? /, '')}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, alignSelf: 'stretch' }}>
                {[
                  ['Mide', b.cm],
                  ['Pesa', b.peso],
                  ['Faltan', `${faltan} sem`],
                ].map(([l, v]) => (
                  <View key={l} style={{ flex: 1, backgroundColor: c.bg, borderRadius: radius.md, paddingVertical: 10, paddingHorizontal: 8 }}>
                    <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: c.muted }}>{l}</Text>
                    <Text style={{ fontFamily: serif, fontSize: 16, color: c.text }}>{v}</Text>
                  </View>
                ))}
              </View>
              {fpp && (
                <Muted>
                  Fecha probable de parto: <Text style={{ fontFamily: fonts.bold, color: c.text }}>{longDate(fpp)}</Text>
                </Muted>
              )}
              {vista !== semana && (
                <Pressable onPress={() => setVista(semana)} hitSlop={8}>
                  <Text style={{ fontFamily: fonts.semibold, color: c.rosa }}>Volver a mi semana ({semana})</Text>
                </Pressable>
              )}
            </Card>

            <QuizEntrada />

            <Card>
              <Label>Esta semana</Label>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Icono e="👶" size={22} />
                <View style={{ flex: 1 }}>
                  <Body style={{ fontWeight: '700' }}>Tu bebé</Body>
                  <Body>{dev.bebe}</Body>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Icono e="🤍" size={22} />
                <View style={{ flex: 1 }}>
                  <Body style={{ fontWeight: '700' }}>Tú</Body>
                  <Body>{dev.tu}</Body>
                </View>
              </View>
            </Card>
          </>
        }
        derecha={
          <>
            <Pressable accessibilityRole="button" onPress={() => router.push('/estadisticas')}>
              <Card tint={c.lavandaSuave} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Icono e="🩺" size={24} />
                <View style={{ flex: 1 }}>
                  <Label>Próximo control: semana {ctl.semana}</Label>
                  <Muted>
                    {ctl.semana - semana <= 0 ? 'Esta semana' : `En ${ctl.semana - semana} semanas`} · {ctl.texto}
                  </Muted>
                </View>
                <Text style={{ color: c.muted, fontSize: 20 }}>›</Text>
              </Card>
            </Pressable>

            <Card style={{ gap: 0 }}>
              <Label>Pendientes</Label>
              {pendientes(semana).map(([t, d]) => (
                <Check key={t} label={t} sub={d} on={hecho(`todo:${t}`)} onPress={() => alternar(`todo:${t}`)} />
              ))}
            </Card>

            <Card style={{ gap: 0 }}>
              <Label>Herramientas</Label>
              {HERRAMIENTAS.map((h) => (
                <Pressable
                  key={h.titulo}
                  accessibilityRole="button"
                  onPress={() => router.push(h.to)}
                  style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: c.line, opacity: pressed ? 0.7 : 1 })}
                >
                  <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: c.rosaSuave, alignItems: 'center', justifyContent: 'center' }}>
                    <Icono e={h.emoji} size={18} color={c.text} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Body style={{ fontWeight: '600' }}>{h.titulo}</Body>
                    <Muted>{h.sub}</Muted>
                  </View>
                  <Text style={{ color: c.muted, fontSize: 20 }}>›</Text>
                </Pressable>
              ))}
            </Card>

            <Pressable accessibilityRole="button" onPress={() => router.push('/cambio')} hitSlop={8}>
              <Text style={{ fontFamily: fonts.semibold, fontSize: 13.5, color: c.muted }}>¿Hubo un cambio en tu embarazo? Cuéntanos →</Text>
            </Pressable>
          </>
        }
      />
    </Screen>
  );
}
