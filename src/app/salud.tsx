// "Salud ginecológica": controles, autoexamen de mamas, dolor de ovarios y registro de quistes.
import { router } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { Text } from '../components/Texto';
import { MonthGrid } from '../components/MonthGrid';
import { Body, Button, Card, Chip, Divider, Label, Muted, Row, Screen, Stepper, confirm, notify } from '../components/ui';
import { AUTOEXAMEN, TIPOS_CONTROL, TIPOS_QUISTE, URGENTE_QUISTE } from '../content/salud';
import { shareReport } from '../lib/backup';
import { MONTHS, addDays, fromISO, inDays, shortDate, today } from '../lib/dates';
import { addMonths, diasHasta, ovarioHistorial, proximoAutoexamen } from '../lib/salud';
import { newId, useStore } from '../lib/store';
import { fonts, radius, serif, useColors } from '../lib/theme';
import type { Control, ISODate, Quiste } from '../lib/types';
import { t } from '../lib/region';

function DateBadge({ date }: { date: ISODate }) {
  const c = useColors();
  const d = fromISO(date);
  const otherYear = d.getFullYear() !== new Date().getFullYear();
  return (
    <View style={{ width: 52, paddingVertical: 6, borderRadius: radius.md, backgroundColor: c.rosaSuave, alignItems: 'center' }}>
      <Text style={{ fontFamily: serif, fontSize: 22, color: c.text }}>{d.getDate()}</Text>
      <Text style={{ fontFamily: fonts.bold, fontSize: 10.5, color: c.text, textTransform: 'uppercase' }}>{MONTHS[d.getMonth()].slice(0, 3)}</Text>
      {otherYear && <Text style={{ fontFamily: fonts.regular, fontSize: 10, color: c.muted }}>{d.getFullYear()}</Text>}
    </View>
  );
}

function Controles() {
  const c = useColors();
  const { data, update } = useStore();
  const [adding, setAdding] = useState(false);
  const [tipo, setTipo] = useState<string>('anual');
  const [fecha, setFecha] = useState<ISODate | null>(null);
  const [nota, setNota] = useState('');
  const proximos = data.controles.filter((x) => x.fecha).sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
  const hechos = data.controles.filter((x) => !x.fecha);

  const save = () => {
    if (!fecha) return;
    const t = TIPOS_CONTROL.find((x) => x.id === tipo)!;
    const nuevo: Control = { id: newId(), tipo, titulo: t.titulo, nota: nota.trim(), fecha, hechos: [] };
    update((d) => ({ ...d, controles: [...d.controles, nuevo] }));
    setAdding(false);
    setFecha(null);
    setNota('');
  };

  const done = (ctl: Control) => {
    const rep = TIPOS_CONTROL.find((x) => x.id === ctl.tipo)?.repetirMeses ?? 0;
    update((d) => ({
      ...d,
      controles: d.controles.map((x) => (x.id === ctl.id ? { ...x, hechos: [...x.hechos, today()], fecha: rep ? addMonths(today(), rep) : '' } : x)),
    }));
  };
  const postpone = (ctl: Control) =>
    update((d) => ({ ...d, controles: d.controles.map((x) => (x.id === ctl.id ? { ...x, fecha: addDays(x.fecha, 7) } : x)) }));
  const remove = async (ctl: Control) => {
    if (await confirm('¿Borrar este control?', ctl.titulo, 'Borrar')) update((d) => ({ ...d, controles: d.controles.filter((x) => x.id !== ctl.id) }));
  };

  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Label style={{ flex: 1 }}>Tus controles</Label>
        <Button small kind="soft" label={adding ? 'Cancelar' : '+ Agregar'} onPress={() => setAdding((v) => !v)} />
      </View>
      {adding && (
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {TIPOS_CONTROL.map((t) => (
              <Chip key={t.id} emoji={t.emoji} label={t.titulo} selected={tipo === t.id} onPress={() => setTipo(t.id)} />
            ))}
          </View>
          <Muted>¿Qué día es?</Muted>
          <MonthGrid selected={fecha} onPress={setFecha} marks={fecha ? { [fecha]: { ovulation: true } } : {}} />
          <TextInput
            value={nota}
            onChangeText={setNota}
            placeholder={t('Nota (ej.: seguimiento del quiste derecho)')}
            placeholderTextColor={c.muted}
            style={{ borderRadius: radius.md, backgroundColor: c.bg, padding: 12, fontSize: 15, color: c.text, fontFamily: fonts.regular }}
          />
          <Button label="Guardar control" onPress={save} disabled={!fecha} />
        </View>
      )}
      {!proximos.length && !adding && <Muted>Agrega tu próximo control (PAP, ecografía, control anual) y te avisamos unos días antes.</Muted>}
      {proximos.map((ctl) => {
        const n = diasHasta(ctl.fecha);
        return (
          <View key={ctl.id} style={{ flexDirection: 'row', gap: 12, paddingVertical: 6 }}>
            <DateBadge date={ctl.fecha} />
            <View style={{ flex: 1, gap: 4 }}>
              <Body style={{ fontWeight: '700' }}>{ctl.titulo}</Body>
              {ctl.nota ? <Muted>{ctl.nota}</Muted> : null}
              <Muted style={{ color: n < 0 ? c.durazno : c.muted }}>{n < 0 ? `Pasó hace ${-n} días` : n === 0 ? 'Es hoy' : `En ${n} días`}</Muted>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                <Chip label="Ya lo hice ✓" color={c.salvia} onPress={() => done(ctl)} />
                <Chip label="+1 semana" onPress={() => postpone(ctl)} />
                <Chip label="Borrar" onPress={() => remove(ctl)} />
              </View>
            </View>
          </View>
        );
      })}
      {hechos.length > 0 && <Muted>Hechos: {hechos.map((h) => `${h.titulo} (${shortDate(h.hechos[h.hechos.length - 1])})`).join(' · ')}</Muted>}
    </Card>
  );
}


function Autoexamen() {
  const c = useColors();
  const { data, summary, update } = useStore();
  const next = proximoAutoexamen(data, summary);
  const last = [...data.autoexamenes].sort().pop();
  const hoyHecho = last === today();
  return (
    <Card tint={c.lavandaSuave}>
      <Label>Autoexamen de mamas</Label>
      <Muted>{AUTOEXAMEN.resumen}</Muted>
      {AUTOEXAMEN.pasos.map((p, i) => (
        <View key={p} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: c.rosa, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: c.onAccent, fontFamily: fonts.bold, fontSize: 12 }}>{i + 1}</Text>
          </View>
          <Body style={{ flex: 1 }}>{p}</Body>
        </View>
      ))}
      <Button
        label={hoyHecho ? 'Hecho hoy ✓' : 'Lo hice hoy'}
        kind={hoyHecho ? 'soft' : 'primary'}
        disabled={hoyHecho}
        onPress={() => update((d) => ({ ...d, autoexamenes: [...d.autoexamenes, today()] }))}
      />
      <Muted style={{ textAlign: 'center' }}>
        {last ? `Último: ${shortDate(last)} · ` : ''}Próximo: {shortDate(next)} ({inDays(diasHasta(next))})
      </Muted>
      <Muted style={{ color: c.text }}>{AUTOEXAMEN.aviso}</Muted>
    </Card>
  );
}

function Ovarios() {
  const c = useColors();
  const { data, summary } = useStore();
  const hist = ovarioHistorial(data, summary);
  const izq = hist.filter((h) => h.lado === 'izq' || h.lado === 'ambos').length;
  const der = hist.filter((h) => h.lado === 'der' || h.lado === 'ambos').length;
  const lado = { izq: 'Izquierdo', der: 'Derecho', ambos: 'Ambos' } as const;
  return (
    <Card>
      <Label>Dolor de ovarios</Label>
      <Muted>Últimos 2 ciclos. Se registra en "Ovarios y senos" al anotar tu día.</Muted>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[
          ['Izquierdo', izq],
          ['Derecho', der],
        ].map(([l, n]) => (
          <View key={l} style={{ flex: 1, backgroundColor: c.rosaSuave, borderRadius: radius.md, padding: 12 }}>
            <Text style={{ fontFamily: serif, fontSize: 26, color: c.text }}>{n}</Text>
            <Muted>{l} · días</Muted>
          </View>
        ))}
      </View>
      {izq + der > 2 && izq !== der && (
        <Body>El {der > izq ? 'derecho' : 'izquierdo'} te dolió más seguido. Es un dato útil para tu ginecóloga.</Body>
      )}
      {hist.slice(0, 6).map((h) => (
        <Row key={h.date} label={shortDate(h.date)} hint={`${lado[h.lado]}${h.cycleDay ? ` · día ${h.cycleDay} del ciclo` : ''}`}>
          <Text style={{ fontFamily: fonts.bold, color: c.text }}>{h.pain ? `${h.pain}/10` : '—'}</Text>
        </Row>
      ))}
      {!hist.length && <Muted>Aún no hay registros de dolor de ovario.</Muted>}
    </Card>
  );
}

function Quistes() {
  const c = useColors();
  const { data, update } = useStore();
  const [form, setForm] = useState<null | { id?: string; ovario: Quiste['ovario']; tipo: string; mm: number; nota: string }>(null);
  const input = { borderRadius: radius.md, backgroundColor: c.bg, padding: 12, fontSize: 15, color: c.text, fontFamily: fonts.regular };

  const save = () => {
    if (!form) return;
    const medida = { fecha: today(), mm: form.mm };
    update((d) => {
      if (form.id) return { ...d, quistes: d.quistes.map((q) => (q.id === form.id ? { ...q, medidas: [...q.medidas, medida], nota: form.nota || q.nota } : q)) };
      return { ...d, quistes: [...d.quistes, { id: newId(), ovario: form.ovario, tipo: form.tipo, medidas: [medida], nota: form.nota }] };
    });
    setForm(null);
    notify('Guardado', 'La medida quedó registrada con fecha de hoy.');
  };

  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Label style={{ flex: 1 }}>Registro de quistes</Label>
        <Button small kind="soft" label={form && !form.id ? 'Cancelar' : '+ Agregar'} onPress={() => setForm(form && !form.id ? null : { ovario: 'der', tipo: 'Funcional', mm: 25, nota: '' })} />
      </View>
      {form && (
        <View style={{ gap: 10 }}>
          {!form.id && (
            <>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Chip label="Ovario izquierdo" selected={form.ovario === 'izq'} onPress={() => setForm({ ...form, ovario: 'izq' })} />
                <Chip label="Ovario derecho" selected={form.ovario === 'der'} onPress={() => setForm({ ...form, ovario: 'der' })} />
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {TIPOS_QUISTE.map((t) => (
                  <Chip key={t} label={t} color={c.lavanda} selected={form.tipo === t} onPress={() => setForm({ ...form, tipo: t })} />
                ))}
              </View>
            </>
          )}
          <Row label="Tamaño (ecografía de hoy)" hint="En milímetros">
            <Stepper value={form.mm} onChange={(mm) => setForm({ ...form, mm })} min={1} max={150} format={(v) => `${v} mm`} />
          </Row>
          <TextInput value={form.nota} onChangeText={(nota) => setForm({ ...form, nota })} placeholder={t('Lo que te indicó tu médica')} placeholderTextColor={c.muted} style={input} />
          <Button label="Guardar" onPress={save} />
        </View>
      )}
      {data.quistes.map((q) => {
        const m = q.medidas;
        const last = m[m.length - 1];
        const prev = m[m.length - 2];
        const trend = prev ? (last.mm < prev.mm ? 'Bajó de tamaño' : last.mm > prev.mm ? 'Subió de tamaño' : 'Sin cambios') : null;
        return (
          <View key={q.id} style={{ gap: 6 }}>
            <Divider />
            <Row label={`Ovario ${q.ovario === 'der' ? 'derecho' : 'izquierdo'}`} hint={`Tipo: ${q.tipo}`}>
              <Text style={{ fontFamily: serif, fontSize: 24, color: c.text }}>{last.mm} mm</Text>
            </Row>
            <Muted>{m.map((x) => `${x.mm} mm (${shortDate(x.fecha)})`).join(' → ')}</Muted>
            {trend && <Body style={{ fontWeight: '600' }}>{trend}</Body>}
            {q.nota ? <Muted>{q.nota}</Muted> : null}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Chip label="+ Nueva medida" onPress={() => setForm({ id: q.id, ovario: q.ovario, tipo: q.tipo, mm: last.mm, nota: '' })} />
              <Chip
                label="Borrar"
                onPress={async () => {
                  if (await confirm('¿Borrar este registro?', 'Se borran todas sus medidas.', 'Borrar')) update((d) => ({ ...d, quistes: d.quistes.filter((x) => x.id !== q.id) }));
                }}
              />
            </View>
          </View>
        );
      })}
      {!data.quistes.length && !form && <Muted>Si te detectaron un quiste, anota sus medidas para ver cómo cambia entre ecografías.</Muted>}
      <Muted style={{ color: c.text }}>{URGENTE_QUISTE}</Muted>
    </Card>
  );
}

export default function Salud() {
  const { data, summary } = useStore();
  return (
    <Screen angosta title="Salud ginecológica" right={<Button small kind="soft" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/perfil'))} />}>
      <Muted>Lo que anotas aquí es lo que más le sirve a tu ginecóloga.</Muted>
      <Controles />
      <Autoexamen />
      <Ovarios />
      <Quistes />
      <Button kind="soft" label="Llevar esto a mi consulta (PDF)" onPress={() => shareReport(data, summary).catch((e) => notify('No se pudo crear', String(e)))} />
    </Screen>
  );
}
