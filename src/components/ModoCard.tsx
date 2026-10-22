// Tarjeta del modo en Hoy: ciclo especial (8b) o busco un embarazo (8c).
import { Text, View } from 'react-native';
import { CONDICIONES_ESPECIAL } from '../content/etapas';
import { addDays, diffDays, shortDate, today } from '../lib/dates';
import { useStore } from '../lib/store';
import { fonts, serif, useColors } from '../lib/theme';
import { Body, Card, Chip, Muted } from './ui';

export function ModoCard() {
  const { data } = useStore();
  if (data.settings.etapa === 'especial') return <Especial />;
  if (data.settings.etapa === 'ttc') return <BuscoEmbarazo />;
  return null;
}

function Titulo({ title, sub }: { title: string; sub: string }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
      <Text style={{ flex: 1, fontFamily: serif, fontSize: 20, color: c.text }}>{title}</Text>
      <Text style={{ fontFamily: fonts.medium, fontSize: 12.5, color: c.muted }}>{sub}</Text>
    </View>
  );
}

function Especial() {
  const c = useColors();
  const { data, getLog, setLog } = useStore();
  const t = today();
  const log = getLog(t);
  const conds = CONDICIONES_ESPECIAL.filter((k) => data.settings.condiciones.includes(k.id)).map((k) => k.label);
  const sintoma = (id: string) => setLog(t, { symptoms: log.symptoms.includes(id) ? log.symptoms.filter((x) => x !== id) : [...log.symptoms, id] });
  return (
    <Card tint={c.lavandaSuave}>
      <Titulo title="Modo ciclo especial" sub={conds.join(' · ') || 'Sin condición'} />
      <Body>Sin alertas de atraso. ¿Hoy hubo sangrado? Elige si es manchado o flujo, aunque lleves más de 14 días.</Body>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Chip label="Manchado" selected={log.flow === 1} onPress={() => setLog(t, { flow: log.flow === 1 ? 0 : 1 })} />
        <Chip label="Flujo" selected={log.flow >= 2} onPress={() => setLog(t, { flow: log.flow >= 2 ? 0 : 2 })} />
        <Chip label="Dolor pélvico" selected={log.symptoms.includes('dolor_pelvico')} onPress={() => sintoma('dolor_pelvico')} />
        <Chip label="Inflamación" selected={log.symptoms.includes('hinchazon')} onPress={() => sintoma('hinchazon')} />
      </View>
      <Muted>El manchado no cuenta como período: así tus predicciones no se mueven por un día suelto.</Muted>
    </Card>
  );
}

function BuscoEmbarazo() {
  const c = useColors();
  const { data, summary: s, getLog, setLog } = useStore();
  const t = today();
  const log = getLog(t);
  const quiere = data.settings.ttcRegistro;

  let sub = 'Marca tu último período';
  let texto = 'Registra tu período para estimar tu ventana fértil.';
  if (s.fertileStart && s.fertileEnd && s.ovulation && s.lastStart) {
    const d1 = diffDays(s.fertileStart, s.lastStart) + 1;
    const d2 = diffDays(s.fertileEnd, s.lastStart) + 1;
    const dentro = t >= s.fertileStart && t <= s.fertileEnd;
    const pico = Math.abs(diffDays(t, s.ovulation)) <= 1;
    if (dentro) {
      sub = `Días ${d1} a ${d2} · ${pico ? 'alta' : 'media'}`;
      texto = 'Registra tus señales de hoy para afinar tu ovulación.';
    } else if (t < s.fertileStart) {
      sub = `Empieza en ${diffDays(s.fertileStart, t)} ${diffDays(s.fertileStart, t) === 1 ? 'día' : 'días'}`;
      texto = `Tu ventana fértil estimada va del ${shortDate(s.fertileStart)} al ${shortDate(s.fertileEnd)}. Anota tus señales desde ya.`;
    } else {
      const proxima = addDays(s.fertileStart, s.avgCycle);
      sub = 'Fuera de la ventana';
      texto = `Tu próxima ventana fértil estimada empieza cerca del ${shortDate(proxima)}.`;
    }
  }

  // Lo que dicen las señales de hoy.
  const pistas: string[] = [];
  if (log.lh === 'pos') pistas.push('LH positivo: la ovulación suele llegar en 24 a 36 horas.');
  if (log.moco === 'elastico') pistas.push('Moco elástico y transparente: es una señal de días fértiles.');

  return (
    <Card tint={c.salviaSuave}>
      <Titulo title="Ventana fértil" sub={sub} />
      <Body>{texto}</Body>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {quiere.includes('moco') && <Chip label="Moco elástico" selected={log.moco === 'elastico'} onPress={() => setLog(t, { moco: log.moco === 'elastico' ? null : 'elastico' })} />}
        {quiere.includes('temp') && log.temp != null && <Chip label={`Temp. ${log.temp.toFixed(1).replace('.', ',')} °C`} selected />}
        {quiere.includes('lh') && <Chip label="LH positivo" selected={log.lh === 'pos'} onPress={() => setLog(t, { lh: log.lh === 'pos' ? null : 'pos' })} />}
        {quiere.includes('relacion') && <Chip label="Relación" selected={log.intimidad} onPress={() => setLog(t, { intimidad: !log.intimidad })} />}
      </View>
      {pistas.map((p) => (
        <Muted key={p}>{p}</Muted>
      ))}
      <Muted>Es una estimación. Nunca te avisaremos de un embarazo por un simple atraso.</Muted>
    </Card>
  );
}
