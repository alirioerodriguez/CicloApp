// "Hoy" en modo posparto (diseño 8d): loquios, lactancia, sueño, cicatriz y recuperación.
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from './Texto';
import Svg, { Circle } from 'react-native-svg';
import { MOODS } from '../content/catalogo';
import { ejercicioById } from '../content/ejercicios';
import {
  ALERTA_LOQUIOS,
  CICATRIZ,
  CICATRIZ_ALERTA,
  CUIDADO_CICATRIZ,
  LOQUIOS,
  etapaPosparto,
  semanasPosparto,
} from '../content/posparto';
import { saludo } from '../content/textos';
import { addDays, longDate, nowTime, today } from '../lib/dates';
import { useStore } from '../lib/store';
import { fonts, radius, serif, useColors } from '../lib/theme';
import type { Toma } from '../lib/types';
import { EjercicioCard } from './EjercicioCard';
import { Logo } from './Logo';
import { EtapaChip } from './EtapaChip';
import { Body, Card, Chip, Columnas, Label, Muted, Row, Screen, Stepper, tap } from './ui';
import { Icono } from './Icono';
import { QuizEntrada } from './QuizEntrada';
import { t as traducir } from '../lib/region';

const ANIMO_BAJO = ['triste', 'abrumada', 'ansiosa', 'irritable'];

export function HoyPosparto() {
  const c = useColors();
  const { data, getLog, setLog } = useStore();
  const t = today();
  const log = getLog(t);
  const set = (patch: Parameters<typeof setLog>[1]) => setLog(t, patch);
  const pp = data.settings.posparto;
  const semanas = semanasPosparto(pp);
  const etapa = etapaPosparto(semanas);
  const name = data.settings.name;
  const hello = saludo(new Date().getHours(), 'general');

  // Anillo: avanza durante el cuarto trimestre (12 semanas).
  const R = 42;
  const C = 2 * Math.PI * R;
  const avance = Math.min(semanas, 12) / 12;

  const pecho = pp.alimentacion !== 'formula';
  const ultima = log.tomas[log.tomas.length - 1];
  const ladoTexto = { izq: 'izquierdo', der: 'derecho', biberon: 'biberón' };
  const anotar = (lado: Toma['lado']) => {
    tap();
    set({ tomas: [...log.tomas, { lado, hora: nowTime() }] });
  };

  const cicatriz = CICATRIZ[pp.parto];

  // "Notamos que…": días con poco sueño y ánimo bajo en las últimas 2 semanas.
  const notamos = useMemo(() => {
    let dias = 0;
    for (let i = 1; i <= 14; i++) {
      const l = data.logs[addDays(t, -i)];
      if (l && l.sleep != null && l.sleep < 4 && l.moods.some((m) => ANIMO_BAJO.includes(m))) dias++;
    }
    return dias >= 2 ? 'Los días que duermes menos de 4 horas registras el ánimo más bajo. Pide relevo una noche esta semana.' : null;
  }, [data.logs, t]);

  return (
    <Screen subtitle={longDate(t)} title={`${traducir(hello.titulo)}${name ? `, ${name}` : ''}`} right={<Logo size={32} />}>
      <EtapaChip />
      <Body style={{ marginTop: -6 }}>Hoy la protagonista también eres tú.</Body>

      <Columnas
        desde="escritorio"
        izquierda={
          <>
            <Card tint={c.rosaSuave} style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View style={{ width: 110, height: 110, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={110} height={110} viewBox="0 0 100 100" style={{ position: 'absolute' }}>
                  <Circle cx={50} cy={50} r={R} fill="none" stroke={c.card} strokeWidth={8} />
                  <Circle cx={50} cy={50} r={R} fill="none" stroke={c.rosa} strokeWidth={8} strokeLinecap="round" strokeDasharray={`${(C * avance).toFixed(1)} ${C.toFixed(1)}`} transform="rotate(-90 50 50)" />
                </Svg>
                <Text style={{ fontFamily: serif, fontSize: 34, color: c.text, lineHeight: 38 }}>{semanas}</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: c.muted }}>{semanas === 1 ? 'semana' : 'semanas'}</Text>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontFamily: fonts.bold, fontSize: 11.5, letterSpacing: 1.5, color: c.muted, textTransform: 'uppercase' }}>{semanas <= 12 ? 'Cuarto trimestre' : 'Posparto'}</Text>
                <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: c.text }}>{etapa.titulo}</Text>
                <Muted style={{ color: c.text }}>{etapa.linea}</Muted>
              </View>
            </Card>

            <QuizEntrada />

            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Label style={{ flex: 1 }}>Sangrado (loquios)</Label>
                <Muted>Es normal hasta 6 semanas</Muted>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {LOQUIOS.map((o) => (
                  <Chip key={o.id} label={o.label} selected={log.loquios === o.id} onPress={() => set({ loquios: log.loquios === o.id ? null : o.id })} />
                ))}
              </View>
              {log.loquios === 'rojo' && semanas >= 2 && <Body style={{ color: c.duraznoTexto, fontWeight: '600' }}>{ALERTA_LOQUIOS}</Body>}
            </Card>

            <Card>
              <Label>Tu cicatriz</Label>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {cicatriz.map((o) => (
                  <Chip key={o} label={o} selected={log.cicatriz === o} onPress={() => set({ cicatriz: log.cicatriz === o ? null : o })} />
                ))}
              </View>
              <Muted style={log.cicatriz && CICATRIZ_ALERTA.includes(log.cicatriz) ? { color: c.duraznoTexto, fontFamily: fonts.semibold } : undefined}>{CUIDADO_CICATRIZ}</Muted>
            </Card>

            <Card>
              <Label>¿Cómo te sientes?</Label>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {MOODS.map((m) => (
                  <Chip
                    key={m.id}
                    emoji={m.emoji}
                    label={m.label}
                    color={c.lavanda}
                    selected={log.moods.includes(m.id)}
                    onPress={() => set({ moods: log.moods.includes(m.id) ? log.moods.filter((x) => x !== m.id) : [...log.moods, m.id] })}
                  />
                ))}
              </View>
            </Card>
          </>
        }
        derecha={
          <>
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Label style={{ flex: 1 }}>{pecho ? 'Lactancia' : 'Tomas'}</Label>
                <Muted>
                  {log.tomas.length} {log.tomas.length === 1 ? 'toma' : 'tomas'} hoy{ultima && pecho ? ` · última: ${ladoTexto[ultima.lado]}` : ''}
                </Muted>
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {(pecho ? (['izq', 'der'] as const) : (['biberon'] as const)).map((lado) => {
                  const on = ultima?.lado === lado;
                  return (
                    <Pressable
                      key={lado}
                      accessibilityRole="button"
                      accessibilityLabel={`Anotar toma: ${ladoTexto[lado]}`}
                      onPress={() => anotar(lado)}
                      style={({ pressed }) => ({
                        flex: 1,
                        alignItems: 'center',
                        paddingVertical: 12,
                        borderRadius: radius.md,
                        borderWidth: on ? 2 : 1,
                        borderColor: on ? c.rosa : c.line,
                        backgroundColor: on ? c.rosaSuave : c.bg,
                        opacity: pressed ? 0.8 : 1,
                      })}
                    >
                      <Text style={{ fontFamily: fonts.bold, fontSize: 15, color: c.text }}>{lado === 'izq' ? 'Izquierdo' : lado === 'der' ? 'Derecho' : 'Anotar biberón'}</Text>
                      <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: c.muted }}>{on ? `Última toma · ${ultima!.hora}` : 'Toca al empezar'}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {pp.alimentacion === 'mixta' && <Chip label="+ Biberón" onPress={() => anotar('biberon')} />}
              {ultima && (
                <Pressable accessibilityRole="button" onPress={() => set({ tomas: log.tomas.slice(0, -1) })} hitSlop={8}>
                  <Text style={{ fontFamily: fonts.semibold, fontSize: 13, color: c.muted }}>Deshacer la última</Text>
                </Pressable>
              )}
              <Row label="Sueño anoche" hint="Aunque sea por ratos">
                <Stepper value={log.sleep ?? 4} onChange={(v) => set({ sleep: v })} min={0} max={12} step={0.5} format={(v) => `${String(v).replace('.', ',')} h`} />
              </Row>
            </Card>

            <Pressable accessibilityRole="button" onPress={() => router.push('/cuidate')}>
              <Card tint={c.lavandaSuave} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Icono e="💗" size={24} />
                <View style={{ flex: 1 }}>
                  <Label>¿Cómo está tu corazón?</Label>
                  <Muted>4 preguntas basadas en la escala de Edimburgo</Muted>
                </View>
                <Text style={{ color: c.muted, fontSize: 20 }}>›</Text>
              </Card>
            </Pressable>

            {notamos && (
              <Card style={{ flexDirection: 'row', gap: 12 }}>
                <Icono e="🔎" size={22} />
                <View style={{ flex: 1 }}>
                  <Label>Notamos que…</Label>
                  <Body>{notamos}</Body>
                </View>
              </Card>
            )}

            <Label style={{ marginTop: 4 }}>Tu recuperación de hoy</Label>
            {semanas <= 6 && (
              <Pressable accessibilityRole="button" onPress={() => router.push('/respirar')}>
                <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Icono e="🫁" size={24} />
                  <View style={{ flex: 1 }}>
                    <Label>Respira conmigo</Label>
                    <Muted>Respiración diafragmática · 1 minuto</Muted>
                  </View>
                  <Text style={{ color: c.muted, fontSize: 20 }}>›</Text>
                </Card>
              </Pressable>
            )}
            {etapa.ids.map((id) => {
              const ej = ejercicioById(id);
              return ej ? <EjercicioCard key={id} ej={ej} /> : null;
            })}
            <Muted>Avanza de etapa solo con el visto bueno de tu médica.</Muted>
          </>
        }
      />
    </Screen>
  );
}
