import { router } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { ConsultaMedica } from '../../components/ConsultaMedica';
import { ControlesEmbarazo } from '../../components/ControlesEmbarazo';
import { ResumenMeno } from '../../components/ResumenMeno';
import { Bar, Body, Button, Card, Grilla, Label, Muted, Screen } from '../../components/ui';
import { detectAlertas } from '../../lib/alertas';
import { moodById, symptomById } from '../../content/catalogo';
import { LOGROS, VACIOS, confianza } from '../../content/textos';
import { painByCycleDay, pillAdherence, symptomWindows, topCounts, unlockedLogros } from '../../lib/cycle';
import { diffDays, shortDate, today } from '../../lib/dates';
import { useStore } from '../../lib/store';
import { fonts, serif, useColors } from '../../lib/theme';
import { Icono } from '../../components/Icono';

function Tile({ value, label, tint }: { value: string; label: string; tint: string }) {
  const c = useColors();
  return (
    <View style={{ flex: 1, minWidth: 140, backgroundColor: tint, borderRadius: 18, padding: 14, gap: 2 }}>
      <Text style={{ fontFamily: serif, fontSize: 30, color: c.text }}>{value}</Text>
      <Text style={{ fontSize: 12.5, color: c.muted, fontFamily: fonts.semibold }}>{label}</Text>
    </View>
  );
}

export default function Estadisticas() {
  const { data } = useStore();
  // En posparto esta pestaña es directamente el modo consulta.
  if (data.settings.etapa === 'posparto') return <ConsultaMedica enPestana />;
  if (data.settings.etapa === 'embarazo') return <ControlesEmbarazo />;
  if (data.settings.etapa === 'meno') return <ResumenMeno />;
  return <Resumen />;
}

function Resumen() {
  const c = useColors();
  const { data, summary: s } = useStore();
  const logs = useMemo(() => Object.values(data.logs), [data.logs]);
  const pain = useMemo(() => painByCycleDay(data, s.periods), [data, s.periods]);
  const moods = useMemo(() => topCounts(logs, 'moods'), [logs]);
  const symptoms = useMemo(() => topCounts(logs, 'symptoms'), [logs]);
  const windows = useMemo(() => symptomWindows(data, s.periods).slice(0, 4), [data, s.periods]);
  const adherence = pillAdherence(data);

  const first = Object.keys(data.logs).sort()[0];
  const months = first ? Math.max(1, Math.round(diffDays(today(), first) / 30.4)) : 0;
  const lastCycles = s.cycles.slice(-8);
  const maxCycle = Math.max(35, ...lastCycles.map((x) => x.length));
  const painMax = Math.max(...pain.map((p) => p ?? 0));
  const painDays = pain.findLastIndex((p) => p != null) + 1;

  if (logs.length < 3) {
    return (
      <Screen title="Resumen">
        <Button kind="soft" label="Modo consulta médica" onPress={() => router.push('/consulta')} />
        <Card tint={c.lavandaSuave} style={{ alignItems: 'center', paddingVertical: 30 }}>
          <Icono e="🌱" size={40} />
          <Label style={{ textAlign: 'center' }}>{VACIOS.estadisticas.titulo}</Label>
          <Body style={{ textAlign: 'center' }}>{VACIOS.estadisticas.texto}</Body>
        </Card>
        <Logros />
      </Screen>
    );
  }

  return (
    <Screen title="Resumen">
      <Button kind="soft" label="Modo consulta médica" onPress={() => router.push('/consulta')} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        <Tile value={`${s.avgCycle} d`} label="Ciclo promedio" tint={c.rosaSuave} />
        <Tile value={`${s.avgPeriod} d`} label="Período promedio" tint={c.lavandaSuave} />
        <Tile value={String(s.cycles.length)} label="Ciclos completos" tint={c.salviaSuave} />
        <Tile value={String(months)} label={months === 1 ? 'Mes registrando' : 'Meses registrando'} tint={c.duraznoSuave} />
      </View>
      <Muted>{confianza(s.cycles.length)} de tu ciclo: mientras más ciclos registres, más se ajusta a ti.</Muted>

      <Grilla max={2}>
      <Alertas />

      {s.regular != null && (
        <Card>
          <Body>
            {s.regular
              ? `Tus ciclos son bastante regulares: entre ${s.cycleRange![0]} y ${s.cycleRange![1]} días.`
              : `Tus ciclos varían entre ${s.cycleRange![0]} y ${s.cycleRange![1]} días. Es común, pero si varía mucho seguido puedes comentarlo con tu ginecóloga.`}
          </Body>
        </Card>
      )}

      {lastCycles.length > 0 && (
        <Card>
          <Label>Duración de tus últimos ciclos</Label>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 150, paddingTop: 16 }}>
            {lastCycles.map((cy) => (
              <View key={cy.start} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 11.5, color: c.text, fontFamily: fonts.bold }}>{cy.length}</Text>
                <View style={{ width: '100%', maxWidth: 34, height: (cy.length / maxCycle) * 100, backgroundColor: c.rosa, borderRadius: 8 }} />
                <Text style={{ fontSize: 10, color: c.muted, fontFamily: fonts.regular }}>{shortDate(cy.start)}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {painMax > 0 && (
        <Card>
          <Label>Dolor promedio según el día del ciclo</Label>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 110 }}>
            {pain.slice(0, Math.max(painDays, 7)).map((p, i) => (
              <View key={i} style={{ flex: 1, height: p ? Math.max(4, (p / 10) * 100) : 2, backgroundColor: p == null ? c.line : p <= 3 ? c.salvia : p <= 6 ? c.durazno : c.rosa, borderRadius: 3 }} />
            ))}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Muted>Día 1</Muted>
            <Muted>Día {Math.max(painDays, 7)}</Muted>
          </View>
        </Card>
      )}

      {windows.length > 0 && (
        <Card tint={c.lavandaSuave}>
          <Label>Tus patrones</Label>
          {windows.map((w) => (
            <Body key={w.id}>
              {symptomById(w.id).label}: {w.from === w.to ? `suele aparecer el día ${w.from}` : `suele aparecer entre el día ${w.from} y el ${w.to}`} del ciclo.
            </Body>
          ))}
        </Card>
      )}

      {moods.length > 0 && (
        <Card>
          <Label>Ánimos más frecuentes</Label>
          {moods.map((m) => (
            <Bar key={m.id} label={moodById(m.id).label} value={m.count} max={moods[0].count} right={`${m.count} días`} color={c.lavanda} />
          ))}
        </Card>
      )}

      {symptoms.length > 0 && (
        <Card>
          <Label>Síntomas más frecuentes</Label>
          {symptoms.map((x) => (
            <Bar key={x.id} label={symptomById(x.id).label} value={x.count} max={symptoms[0].count} right={`${x.count} días`} color={c.rosa} />
          ))}
        </Card>
      )}

      {adherence && adherence.expected > 0 && (
        <Card tint={c.salviaSuave}>
          <Label>Pastilla, últimos 30 días</Label>
          <Bar label="Tomas registradas" value={adherence.taken} max={adherence.expected} right={`${adherence.taken} de ${adherence.expected}`} color={c.salvia} />
        </Card>
      )}
      </Grilla>

      <Logros />
    </Screen>
  );
}

function Alertas() {
  const c = useColors();
  const { data, summary } = useStore();
  const alertas = useMemo(() => detectAlertas(data, summary), [data, summary]);
  if (!alertas.length) return null;
  return (
    <Card tint={c.duraznoSuave}>
      <Label>Para tu próxima consulta</Label>
      {alertas.map((a) => (
        <Body key={a.id}>
          {a.nivel === 'consulta' ? '• ' : ''}
          {a.texto}
        </Body>
      ))}
      <Button small kind="ghost" label="Cuándo consultar y señales de alerta →" onPress={() => router.push('/info')} />
      <Muted>Van también en el resumen PDF de Perfil. Son orientaciones, no un diagnóstico.</Muted>
    </Card>
  );
}

function Logros() {
  const { data, summary } = useStore();
  const ok = new Set(unlockedLogros(data, summary));
  return (
    <Card>
      <Label>Logros</Label>
      {LOGROS.filter((l) => l.id !== 'pastilla30' || data.settings.pillMode).map((l) => (
        <View key={l.id} style={{ opacity: ok.has(l.id) ? 1 : 0.45, gap: 2 }}>
          <Body style={{ fontWeight: '700' }}>{ok.has(l.id) ? l.titulo : `${l.titulo}`}</Body>
          <Muted>{l.texto}</Muted>
        </View>
      ))}
    </Card>
  );
}
