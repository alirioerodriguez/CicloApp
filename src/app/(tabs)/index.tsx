// Pantalla "Hoy": estado del ciclo + registro del día.
import { router } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';
import { Text } from '../../components/Texto';
import { HoyEmbarazo } from '../../components/HoyEmbarazo';
import { HoyMeno } from '../../components/HoyMeno';
import { HoyPosparto } from '../../components/HoyPosparto';
import { Logo } from '../../components/Logo';
import { ModoCard } from '../../components/ModoCard';
import { DayEditor } from '../../components/DayEditor';
import { Body, Button, Card, Columnas, Label, Muted, Screen } from '../../components/ui';
import { useLayout } from '../../lib/layout';
import { CUIDATE } from '../../content/cuidate';
import { LOGROS, PASTILLA_AYER, VACIOS, saludo } from '../../content/textos';
import { detectAlertas } from '../../lib/alertas';
import { pillStatus, sinAtrasos, unlockedLogros } from '../../lib/cycle';
import { addDays, diffDays, inDays, longDate, shortDate, today } from '../../lib/dates';
import { useStore } from '../../lib/store';
import { fonts, serif, useColors } from '../../lib/theme';
import { QuizEntrada } from '../../components/QuizEntrada';

function Status() {
  const c = useColors();
  const { summary: s, data, startPeriodToday } = useStore();
  const t = today();

  if (!s.lastStart) {
    return (
      <Card tint={c.rosaSuave}>
        <Body>Aún no hay períodos registrados. Cuando te venga, toca el botón y la app empieza a predecir.</Body>
        <Button label="Me vino hoy" onPress={startPeriodToday} />
      </Card>
    );
  }

  let big: string;
  let unit: string;
  let line: string;
  if (s.inPeriod) {
    big = String(s.cycleDay);
    unit = 'día de período';
    line = 'Cuídate mucho estos días';
  } else if (s.lateDays > 0 && (sinAtrasos(data.settings) || (s.ventana && s.ventana[1] >= t))) {
    // Sin hablar de "retraso": ciclos irregulares o la usuaria pidió no ver esos avisos.
    big = String(s.cycleDay);
    unit = 'día del ciclo';
    line = s.ventana && s.ventana[1] >= t ? `Dentro de tu ventana probable (hasta el ${shortDate(s.ventana[1])}).` : 'Tu período puede llegar en cualquier momento.';
  } else if (s.lateDays > 0) {
    big = String(s.lateDays);
    unit = s.lateDays === 1 ? 'día de retraso' : 'días de retraso';
    line = s.lateDays > 20 ? '¿Se te pasó registrar? Márcalo en el calendario.' : 'Los retrasos de unos días son comunes. Si te preocupa, consúltalo.';
  } else {
    big = String(s.daysToNext);
    unit = s.daysToNext === 1 ? 'día para tu período' : 'días para tu período';
    line = s.ventana ? `Ventana probable: entre el ${shortDate(s.ventana[0])} y el ${shortDate(s.ventana[1])}` : `Estimado para el ${longDate(s.nextStart!)}`;
  }
  const phase = s.phase ? CUIDATE[s.phase] : null;
  const pill = pillStatus(data.settings, t);
  const pct = s.cycleDay ? Math.min(1, s.cycleDay / s.avgCycle) : 0;

  return (
    <Card tint={s.inPeriod ? c.rosaSuave : c.card} style={{ alignItems: 'center', paddingVertical: 24 }}>
      <View style={{ width: 168, height: 168, borderRadius: 84, borderWidth: 10, borderColor: c.line, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ position: 'absolute', top: -10, left: -10, right: -10, bottom: -10, borderRadius: 84, borderWidth: 10, borderColor: 'transparent', borderTopColor: c.rosa, borderRightColor: pct > 0.25 ? c.rosa : 'transparent', borderBottomColor: pct > 0.5 ? c.rosa : 'transparent', borderLeftColor: pct > 0.75 ? c.rosa : 'transparent', transform: [{ rotate: '-45deg' }] }} />
        <Text style={{ fontFamily: serif, fontSize: 56, color: c.text, lineHeight: 62 }}>{big}</Text>
        <Text style={{ fontSize: 13, color: c.muted, textAlign: 'center', maxWidth: 120, fontFamily: fonts.regular }}>{unit}</Text>
      </View>
      <Body style={{ textAlign: 'center', marginTop: 6 }}>{line}</Body>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        <Tag text={`Día ${s.cycleDay} del ciclo`} />
        {phase && <Tag text={phase.nombre} />}
        {s.fertileStart && !s.inPeriod && <Tag text={`Fértil (estimado): ${shortDate(s.fertileStart)}–${shortDate(s.fertileEnd!)}`} />}
        {pill && <Tag text={pill.active ? `${pill.dayInPack}/${pill.packLength}` : `Descanso · día ${pill.dayInPack}`} />}
        {pill && <Tag text={`Blíster nuevo ${inDays(diffDays(pill.nextPackStart, t))}`} />}
      </View>
      {!s.inPeriod && <Button small kind="soft" label="Me vino hoy" onPress={startPeriodToday} />}
    </Card>
  );
}

function Tag({ text }: { text: string }) {
  const c = useColors();
  return (
    <View style={{ backgroundColor: c.bg, paddingVertical: 5, paddingHorizontal: 11, borderRadius: 99 }}>
      <Text style={{ fontSize: 12.5, color: c.text, fontFamily: fonts.semibold }}>{text}</Text>
    </View>
  );
}

// Aviso si ayer tocaba pastilla y no se marcó (solo si viene marcándola, para no molestar al empezar).
function missedPillYesterday(data: ReturnType<typeof useStore>['data']): boolean {
  if (!data.settings.pillMode) return false;
  const y = addDays(today(), -1);
  const st = pillStatus(data.settings, y);
  if ((st && !st.takesToday) || data.logs[y]?.pillTaken) return false;
  for (let i = 2; i <= 7; i++) if (data.logs[addDays(today(), -i)]?.pillTaken) return true;
  return false;
}

export default function Hoy() {
  const { data } = useStore();
  if (data.settings.etapa === 'posparto') return <HoyPosparto />;
  if (data.settings.etapa === 'embarazo') return <HoyEmbarazo />;
  if (data.settings.etapa === 'meno') return <HoyMeno />;
  return <HoyCiclo />;
}

function HoyCiclo() {
  const c = useColors();
  const L = useLayout();
  const { data, summary: s, updateSettings } = useStore();
  const name = data.settings.name;
  const estado = !s.lastStart ? 'general' : s.inPeriod ? 'periodo' : s.lateDays > 0 ? 'retraso' : 'sinPeriodo';
  const hello = saludo(new Date().getHours(), estado);
  const firstDay = Object.keys(data.logs).length === 0;
  const consultas = useMemo(() => detectAlertas(data, s).filter((a) => a.nivel === 'consulta').length, [data, s]);

  const nuevos = useMemo(() => {
    const vistos = new Set(data.settings.logrosVistos);
    const ok = new Set(unlockedLogros(data, s));
    // De a uno, para no abrumar si se desbloquean varios juntos (por ejemplo, al restaurar un respaldo).
    return LOGROS.filter((l) => ok.has(l.id) && !vistos.has(l.id)).slice(0, 1);
  }, [data, s]);

  return (
    <Screen subtitle={longDate(today())} title={`${hello.titulo}${name ? `, ${name}` : ''}`} right={<Logo size={32} />}>
      <Body style={{ marginTop: -6 }}>{hello.texto}</Body>

      <Columnas
        desde="escritorio"
        izquierda={
          <>
      {nuevos.map((l) => (
        <Card key={l.id} tint={c.duraznoSuave}>
          <Label>{l.titulo}</Label>
          <Body>{l.texto}</Body>
          <Button small kind="soft" label="¡Gracias!" onPress={() => updateSettings({ logrosVistos: [...data.settings.logrosVistos, l.id] })} />
        </Card>
      ))}

      {firstDay && (
        <Card tint={c.lavandaSuave}>
          <Label>{VACIOS.primerDia.titulo}</Label>
          <Body>{VACIOS.primerDia.texto}</Body>
        </Card>
      )}

      {missedPillYesterday(data) && (
        <Card tint={c.duraznoSuave}>
          <Body>{PASTILLA_AYER[0]}</Body>
          <Muted>Si sí la tomaste, márcala en el calendario (día de ayer).</Muted>
        </Card>
      )}

      {consultas > 0 && (
        <Card>
          <Body>Tienes {consultas === 1 ? 'un tema' : `${consultas} temas`} para comentar en tu próxima consulta.</Body>
          <Button small kind="ghost" label="Ver en Resumen →" onPress={() => router.push('/estadisticas')} />
        </Card>
      )}

      {(data.logs[today()]?.pain ?? 0) >= 7 && (
        <Card tint={c.rosaSuave}>
          <Label>Hoy te duele bastante</Label>
          <Body>Respira un minuto, ponte calor en el vientre y prueba un movimiento suave. Si el dolor no te deja hacer tu día, coméntalo con tu ginecóloga.</Body>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Button small label="Respirar" onPress={() => router.push('/respirar')} />
            </View>
            <View style={{ flex: 1 }}>
              <Button small kind="soft" label="Alivio" onPress={() => router.push('/ejercicios')} />
            </View>
          </View>
        </Card>
      )}

      <Status />
      <ModoCard />
      <QuizEntrada />
          </>
        }
        derecha={
          <>
            <Text style={{ fontFamily: serif, fontSize: 22, color: c.text, marginTop: L.tamano === 'escritorio' ? 0 : 8 }}>Tu día</Text>
            <DayEditor date={today()} />
          </>
        }
      />
    </Screen>
  );
}
