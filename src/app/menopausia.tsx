// "Tu menopausia": registro completo de síntomas (escala MRS), sangrado, tratamiento y chequeos.
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Check } from '../components/Check';
import { Body, Button, Card, Chip, Columnas, Label, Muted, Row, Screen, Stepper, Toggle, tap } from '../components/ui';
import {
  CHEQUEOS_MENO,
  DESPERTO_POR,
  ETAPAS_MENO,
  INTENSIDADES,
  MRS,
  OTROS_SINTOMAS,
  SUPLEMENTOS,
  TIPOS_TRH,
  diasSinPeriodo,
  etapaMeno,
  mensajeSangrado,
  puntajeMrs,
} from '../content/menopausia';
import { lunes } from '../content/posparto';
import { today } from '../lib/dates';
import { useStore } from '../lib/store';
import { fonts, radius, serif, useColors } from '../lib/theme';

export default function Menopausia() {
  const c = useColors();
  const { data, getLog, setLog, updateSettings, update } = useStore();
  const t = today();
  const log = getLog(t);
  const m = data.settings.meno;
  const etapa = etapaMeno(m.etapa);
  const dias = diasSinPeriodo(data);
  const meses = dias == null ? null : Math.min(12, Math.floor(dias / 30));
  const semana = lunes();
  const resp = data.mrs[semana] ?? MRS.map(() => -1);
  const p = puntajeMrs(resp);
  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const responder = (q: number, n: number) => {
    tap();
    update((d) => {
      const actual = d.mrs[semana] ?? MRS.map(() => -1);
      return { ...d, mrs: { ...d.mrs, [semana]: actual.map((x, k) => (k === q ? n : x)) } };
    });
  };
  const setMeno = (patch: Partial<typeof m>) => updateSettings({ meno: { ...m, ...patch } });
  const volver = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <Screen title="Tu menopausia" subtitle="Una etapa, no un final" right={<Button small kind="soft" label="Volver" onPress={volver} />}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {ETAPAS_MENO.map((e) => (
          <Chip key={e.id} label={e.nombre} selected={m.etapa === e.id} onPress={() => setMeno({ etapa: e.id })} />
        ))}
      </View>

      <Columnas
        izquierda={
          <>
            <Card tint={c.duraznoSuave} style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontFamily: serif, fontSize: 40, color: c.text }}>{meses ?? '—'}</Text>
                <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: c.muted }}>de 12 meses</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Label>{etapa.nombre}</Label>
                {dias != null && <Muted style={{ color: c.text }}>{dias} días sin período</Muted>}
                <Muted>{etapa.linea}</Muted>
              </View>
            </Card>

            <Card>
              <Label>Bochornos de hoy</Label>
              <Row label="Cuántos" hint={log.bochornos ? undefined : 'Ninguno, qué bien'}>
                <Stepper value={log.bochornos ?? 0} onChange={(v) => setLog(t, { bochornos: v })} max={30} />
              </Row>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {INTENSIDADES.map((x) => (
                  <Chip key={x} label={x} selected={log.intensidad === x} onPress={() => setLog(t, { intensidad: log.intensidad === x ? null : x })} />
                ))}
              </View>
              <Row label="Despertares de noche">
                <Stepper value={log.despertares ?? 0} onChange={(v) => setLog(t, { despertares: v })} max={15} />
              </Row>
              <Muted>¿Qué te despertó?</Muted>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {DESPERTO_POR.map((x) => (
                  <Chip key={x.id} label={x.label} color={c.lavanda} selected={log.despertoPor.includes(x.id)} onPress={() => setLog(t, { despertoPor: toggle(log.despertoPor, x.id) })} />
                ))}
              </View>
            </Card>

            <Card>
              <Label>Otros síntomas de hoy</Label>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {OTROS_SINTOMAS.map((x) => (
                  <Chip key={x.id} label={x.label} selected={log.menoExtra.includes(x.id)} onPress={() => setLog(t, { menoExtra: toggle(log.menoExtra, x.id) })} />
                ))}
              </View>
              <Toggle label="🩸 Hoy tuve un sangrado" value={log.flow > 0} onChange={(on) => setLog(t, { flow: on ? 2 : 0 })} />
              {log.flow > 0 && <Body style={{ color: m.etapa === 'post' ? c.durazno : c.text, fontWeight: m.etapa === 'post' ? '700' : '400' }}>{mensajeSangrado(m.etapa)}</Body>}
            </Card>

            <Card>
              <Toggle label="Uso tratamiento hormonal (TRH)" hint="Lo puedes cambiar cuando quieras" value={m.trh} onChange={(trh) => setMeno({ trh })} />
              {m.trh && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {TIPOS_TRH.map((x) => (
                    <Chip key={x} label={x} selected={m.trhTipo === x} onPress={() => setMeno({ trhTipo: x })} />
                  ))}
                </View>
              )}
              <Muted>Suplementos o cuidados que usas</Muted>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {SUPLEMENTOS.map((x) => (
                  <Chip key={x.id} label={x.label} color={c.salvia} selected={m.suplementos.includes(x.id)} onPress={() => setMeno({ suplementos: toggle(m.suplementos, x.id) })} />
                ))}
              </View>
            </Card>
          </>
        }
        derecha={
          <>
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Label style={{ flex: 1 }}>¿Cómo te sentiste esta semana?</Label>
                <Muted>0 nada · 4 mucho</Muted>
              </View>
              <Muted>Basado en la escala MRS, que usan las médicas para medir síntomas de la menopausia.</Muted>
              {MRS.map((q, qi) => (
                <View key={q.label} style={{ gap: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: c.line }}>
                  <View>
                    <Body style={{ fontWeight: '600' }}>{q.label}</Body>
                    <Muted>{q.sub}</Muted>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {[0, 1, 2, 3, 4].map((n) => {
                      const on = resp[qi] === n;
                      return (
                        <Pressable
                          key={n}
                          accessibilityRole="radio"
                          accessibilityLabel={`${q.label} ${n}`}
                          accessibilityState={{ selected: on }}
                          onPress={() => responder(qi, n)}
                          style={{ flex: 1, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: on ? c.rosa : c.line, backgroundColor: on ? c.rosa : 'transparent' }}
                        >
                          <Text style={{ fontFamily: fonts.bold, color: on ? c.onAccent : c.muted }}>{n}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
              <Card tint={p.total > 16 ? c.duraznoSuave : c.bg} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 4 }}>
                <Text style={{ fontFamily: serif, fontSize: 36, color: c.text }}>{p.total}</Text>
                <View style={{ flex: 1 }}>
                  <Body style={{ fontWeight: '700' }}>{p.etiqueta}</Body>
                  <Muted>
                    de 44 · físicos {p.fisicos} · ánimo {p.animo} · íntimos {p.intimos}
                  </Muted>
                </View>
              </Card>
            </Card>

            <Card style={{ gap: 0 }}>
              <Label>Tus chequeos</Label>
              <Muted>Toca para marcar como al día.</Muted>
              {CHEQUEOS_MENO.map((x) => (
                <Check
                  key={x.id}
                  label={x.titulo}
                  sub={x.cuando}
                  on={data.chequeosMeno.includes(x.id)}
                  onPress={() => update((d) => ({ ...d, chequeosMeno: toggle(d.chequeosMeno, x.id) }))}
                  chip="Pendiente"
                  textoHecho="Al día"
                />
              ))}
            </Card>
            <Button label="Listo" onPress={volver} />
          </>
        }
      />
    </Screen>
  );
}
