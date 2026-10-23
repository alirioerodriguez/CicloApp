// Formulario de registro de un día. Se usa en "Hoy" y al tocar un día del calendario.
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Text } from './Texto';
import { FLOW_LABELS, MOODS, SYMPTOMS } from '../content/catalogo';
import { CUIDATE } from '../content/cuidate';
import { MOCOS } from '../content/etapas';
import { URGENTE } from '../content/info';
import { sinHormona } from '../lib/blister';
import { summarize } from '../lib/cycle';
import { useStore } from '../lib/store';
import { fonts, radius, useColors } from '../lib/theme';
import type { DayLog, ISODate } from '../lib/types';
import { Card, Chip, Label, Muted, Row, Stepper, tap } from './ui';
import { t } from '../lib/region';

const OVARIOS: { id: DayLog['ovario']; label: string }[] = [
  { id: null, label: 'Sin dolor' },
  { id: 'izq', label: 'Izquierdo' },
  { id: 'der', label: 'Derecho' },
  { id: 'ambos', label: 'Ambos' },
];

const SENOS = [
  { id: 'seno_izq', label: 'Dolor seno izquierdo' },
  { id: 'seno_der', label: 'Dolor seno derecho' },
  { id: 'bulto', label: 'Noté un bulto o cambio' },
];

function toggle(list: string[], id: string) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export function DayEditor({ date }: { date: ISODate }) {
  const c = useColors();
  const { getLog, setLog, data } = useStore();
  const log = getLog(date);
  const set = (patch: Parameters<typeof setLog>[1]) => setLog(date, patch);
  const [note, setNote] = useState(log.note);
  useEffect(() => setNote(log.note), [date]); // eslint-disable-line react-hooks/exhaustive-deps

  // Los síntomas típicos de la fase de ese día salen primero.
  const phaseId = useMemo(() => summarize(data, date).phase, [data, date]);
  const phase = phaseId ? CUIDATE[phaseId] : null;
  const symptoms = useMemo(() => {
    const common = phase?.sintomasComunes ?? [];
    return [...SYMPTOMS].sort((a, b) => Number(common.includes(b.id)) - Number(common.includes(a.id)));
  }, [phase]);
  const ttc = data.settings.etapa === 'ttc' ? data.settings.ttcRegistro : [];

  // Con pastilla, el sangrado de los días de placebo o descanso es por deprivación.
  const deprivacion = !!(data.settings.pillMode && data.blister && sinHormona(data.blister, date));

  const painColor = (n: number) => (n <= 3 ? c.salvia : n <= 6 ? c.durazno : c.rosa);

  return (
    <View style={{ gap: 14 }}>
      {/* La pastilla se marca en el blíster digital (tarjeta de Hoy), no en el registro del día. */}
      <Card>
        <Label>Flujo</Label>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {FLOW_LABELS.map((l, i) => {
            const on = log.flow === i;
            return (
              <Pressable
                key={l}
                accessibilityRole="button"
                accessibilityLabel={`Flujo ${l}`}
                accessibilityState={{ selected: on }}
                onPress={() => {
                  tap();
                  set({ flow: i });
                }}
                style={{ alignItems: 'center', gap: 4, flex: 1, paddingVertical: 8, borderRadius: radius.md, backgroundColor: on ? c.rosaSuave : 'transparent' }}
              >
                <View style={{ height: 30, justifyContent: 'center' }}>
                  <Text style={{ fontSize: i === 0 ? 18 : 11 + i * 4, opacity: i === 0 ? 0.5 : 1 }}>{i === 0 ? '○' : ''}</Text>
                </View>
                <Text style={{ fontSize: 11.5, color: on ? c.text : c.muted, fontFamily: on ? fonts.bold : fonts.medium }}>{l}</Text>
              </Pressable>
            );
          })}
        </View>
        {log.flow >= 1 && deprivacion ? (
          <Muted>Es un día sin hormona de tu blíster: este sangrado es por deprivación, no un período.</Muted>
        ) : (
          log.flow === 1 && (
            <Muted>
              Lo anotamos como manchado: no reinicia tu ciclo. Si hoy empezó tu período, elige Leve o más.
            </Muted>
          )
        )}
        {log.flow >= 4 && <Muted style={{ color: c.text }}>{URGENTE[0]}</Muted>}
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Label>Dolor</Label>
          <Text style={{ fontFamily: fonts.bold, color: log.pain ? painColor(log.pain) : c.muted }}>{log.pain ? `${log.pain} / 10` : 'Sin dolor'}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {Array.from({ length: 11 }, (_, n) => (
            <Pressable
              key={n}
              accessibilityRole="button"
              accessibilityLabel={`Dolor ${n}`}
              hitSlop={4}
              onPress={() => {
                tap();
                set({ pain: n });
              }}
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: n > 0 && n <= log.pain ? painColor(log.pain) : c.line,
                borderWidth: n === log.pain ? 2 : 0,
                borderColor: c.text,
              }}
            >
              <Text style={{ fontSize: 11, fontFamily: fonts.bold, color: n > 0 && n <= log.pain ? c.onAccent : c.muted }}>{n}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {ttc.length > 0 && (ttc.includes('moco') || ttc.includes('temp') || ttc.includes('lh')) && (
        <Card tint={c.salviaSuave}>
          <Label>Señales de fertilidad</Label>
          {ttc.includes('moco') && (
            <>
              <Muted>Moco cervical</Muted>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {MOCOS.map((m) => (
                  <Chip key={m.id} label={m.label} color={c.salvia} selected={log.moco === m.id} onPress={() => set({ moco: log.moco === m.id ? null : m.id })} />
                ))}
              </View>
              {log.moco ? <Muted>{MOCOS.find((m) => m.id === log.moco)?.hint}</Muted> : null}
            </>
          )}
          {ttc.includes('temp') && (
            <Row label="Temperatura basal" hint="Al despertar, antes de levantarte">
              {log.temp == null ? (
                <Chip label="Anotar" onPress={() => set({ temp: 36.5 })} />
              ) : (
                <Stepper value={Math.round(log.temp * 10)} onChange={(v) => set({ temp: v / 10 })} min={340} max={390} format={(v) => `${(v / 10).toFixed(1).replace('.', ',')} °C`} />
              )}
            </Row>
          )}
          {ttc.includes('lh') && (
            <Row label="Test de ovulación (LH)">
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <Chip label="Negativo" color={c.salvia} selected={log.lh === 'neg'} onPress={() => set({ lh: log.lh === 'neg' ? null : 'neg' })} />
                <Chip label="Positivo" color={c.salvia} selected={log.lh === 'pos'} onPress={() => set({ lh: log.lh === 'pos' ? null : 'pos' })} />
              </View>
            </Row>
          )}
        </Card>
      )}

      <Card>
        <Label>¿Cómo te sientes?</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {MOODS.map((m) => (
            <Chip key={m.id} emoji={m.emoji} label={m.label} color={c.lavanda} selected={log.moods.includes(m.id)} onPress={() => set({ moods: toggle(log.moods, m.id) })} />
          ))}
        </View>
      </Card>

      <Card>
        <Label>Síntomas</Label>
        {phase ? <Muted>{phase.comun}</Muted> : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {symptoms.map((s) => (
            <Chip key={s.id} emoji={s.emoji} label={s.label} selected={log.symptoms.includes(s.id)} onPress={() => set({ symptoms: toggle(log.symptoms, s.id) })} />
          ))}
        </View>
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Label style={{ flex: 1 }}>Ovarios y senos</Label>
          <Pressable onPress={() => router.push('/salud')} hitSlop={8}>
            <Text style={{ color: c.rosa, fontFamily: fonts.bold, fontSize: 13 }}>Ver historial</Text>
          </Pressable>
        </View>
        <Muted>¿Te dolió algún ovario?</Muted>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {OVARIOS.map((o) => (
            <Chip key={o.label} label={o.label} color={c.lavanda} selected={log.ovario === o.id} onPress={() => set({ ovario: o.id })} />
          ))}
        </View>
        <Muted>¿Y los senos?</Muted>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {SENOS.map((o) => (
            <Chip key={o.id} label={o.label} color={o.id === 'bulto' ? c.durazno : c.lavanda} selected={log.senos.includes(o.id)} onPress={() => set({ senos: toggle(log.senos, o.id) })} />
          ))}
        </View>
        {log.senos.includes('bulto') && <Muted style={{ color: c.text }}>Anótalo y consúltalo pronto. La mayoría de los cambios no son graves, pero hay que revisarlos.</Muted>}
      </Card>

      <Card tint={log.intimidad ? c.rosaSuave : undefined}>
        <Row label="Intimidad" hint="Se marca con un fueguito en tu calendario. Nunca va en el PDF.">
          <Chip label={log.intimidad ? 'Marcado' : 'Marcar'} selected={log.intimidad} onPress={() => set({ intimidad: !log.intimidad })} />
        </Row>
      </Card>

      <Card>
        <Row label="Agua" hint="Vasos">
          <Stepper value={log.water} onChange={(v) => set({ water: v })} max={20} />
        </Row>
        <Row label="Sueño" hint={log.sleep == null ? 'Opcional' : 'Horas'}>
          {log.sleep == null ? (
            <Chip label="Anotar" onPress={() => set({ sleep: 7 })} />
          ) : (
            <Stepper value={log.sleep} onChange={(v) => set({ sleep: v < 0.5 ? null : v })} min={0} max={14} step={0.5} format={(v) => `${v} h`} />
          )}
        </Row>
      </Card>

      <Card>
        <Label>Nota</Label>
        <TextInput
          value={note}
          onChangeText={(t) => {
            setNote(t);
            set({ note: t });
          }}
          placeholder={t('Algo que quieras recordar de hoy…')}
          placeholderTextColor={c.muted}
          multiline
          style={{ minHeight: 80, color: c.text, fontSize: 15, fontFamily: fonts.regular, textAlignVertical: 'top', backgroundColor: c.bg, borderRadius: radius.md, padding: 12 }}
        />
        <Muted>Todo se guarda solo, en tu teléfono.</Muted>
      </Card>
    </View>
  );
}
