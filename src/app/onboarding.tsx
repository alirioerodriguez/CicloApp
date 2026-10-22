// Bienvenida y "Crea tu cuenta" (diseño 8a). Los pasos cambian según el modo que elija.
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Text } from '../components/Texto';
import { EtapaPicker } from '../components/EtapaPicker';
import { MonthGrid } from '../components/MonthGrid';
import { Logo } from '../components/Logo';
import { PillPicker } from '../components/PillPicker';
import { TonePicker } from '../components/TonePicker';
import { Body, Button, Card, Chip, Label, Muted, Row, Screen, Stepper, Toggle } from '../components/ui';
import { ETAPAS_MENO } from '../content/menopausia';
import { SEMANA_MAX, SEMANA_MIN, bebe, fppDesdeSemanas, semanasEmbarazo } from '../content/embarazo';
import { ALIMENTACIONES, PARTOS, nacimientoHace, semanasPosparto } from '../content/posparto';
import { ANTICONCEPTIVOS, CONDICIONES_ESPECIAL, NOTA_ESPECIAL, NOTA_HORMONAL, SENALES_TTC, SIN_OVULACION, TEXTO_TTC } from '../content/etapas';
import { AVISO_ANTICONCEPTIVO } from '../content/textos';
import { longDate, timeLabel, today } from '../lib/dates';
import { ensurePermission, notificationsSupported } from '../lib/notifications';
import { nubeConfigurada } from '../lib/nube';
import { seedFirstPeriod, useStore } from '../lib/store';
import { fonts, radius, serif, useColors } from '../lib/theme';
import type { Anticonceptivo, Condicion, Etapa, EtapaMeno, ISODate, PillType, Posparto, SenalTtc } from '../lib/types';
import { Icono } from '../components/Icono';
import { t } from '../lib/region';

type Paso = 'bienvenida' | 'cuenta' | 'periodo' | 'duracion' | 'pastilla' | 'especial' | 'ttc' | 'embarazo' | 'posparto' | 'meno' | 'listo';

const FLUJOS: Record<'ciclo' | 'especial' | 'ttc' | 'embarazo' | 'posparto' | 'meno', Paso[]> = {
  ciclo: ['bienvenida', 'cuenta', 'periodo', 'duracion', 'pastilla', 'listo'],
  especial: ['bienvenida', 'cuenta', 'periodo', 'especial', 'listo'],
  ttc: ['bienvenida', 'cuenta', 'periodo', 'duracion', 'ttc', 'listo'],
  embarazo: ['bienvenida', 'cuenta', 'embarazo', 'listo'],
  posparto: ['bienvenida', 'cuenta', 'posparto', 'listo'],
  meno: ['bienvenida', 'cuenta', 'meno', 'listo'],
};

export default function Onboarding() {
  const c = useColors();
  const { data, replaceAll } = useStore();
  const s0 = data.settings;
  const [i, setI] = useState(0);
  const [name, setName] = useState(s0.name);
  const [edad, setEdad] = useState(s0.edad ?? 29);
  const [etapa, setEtapa] = useState<Etapa>(s0.etapa);
  const [lastStart, setLastStart] = useState<ISODate | null>(null);
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [anti, setAnti] = useState<Anticonceptivo | null>(null);
  const [condiciones, setCondiciones] = useState<Condicion[]>(s0.condiciones);
  const [ttc, setTtc] = useState<SenalTtc[]>(s0.ttcRegistro);
  const [pillName, setPillName] = useState('');
  const [pillType, setPillType] = useState<PillType>('21-7');
  const [packStart, setPackStart] = useState<ISODate | null>(null);
  const [pillHour, setPillHour] = useState(21);
  const [ppSemanas, setPpSemanas] = useState(s0.posparto.nacimiento ? semanasPosparto(s0.posparto) : 2);
  const [semanasEmb, setSemanasEmb] = useState(s0.embarazo.fpp ? semanasEmbarazo(s0.embarazo.fpp) : 12);
  const [menoEtapa, setMenoEtapa] = useState<EtapaMeno>(s0.meno.etapa);
  const [trh, setTrh] = useState(s0.meno.trh);
  const [parto, setParto] = useState<Posparto['parto']>(s0.posparto.parto);
  const [alimentacion, setAlimentacion] = useState<Posparto['alimentacion']>(s0.posparto.alimentacion);

  const flujo = FLUJOS[etapa];
  const meno = etapa === 'meno';
  const posparto = etapa === 'posparto';
  const embarazada = etapa === 'embarazo';
  const paso = flujo[Math.min(i, flujo.length - 1)];
  // Buscando un embarazo no se usa anticonceptivo.
  const antiFinal: Anticonceptivo = etapa === 'ttc' || embarazada || meno ? 'ninguno' : anti ?? 'ninguno';
  const pastilla = antiFinal === 'pastilla';

  const input = { borderRadius: radius.md, backgroundColor: c.bg, borderWidth: 1, borderColor: c.line, padding: 14, fontSize: 17, color: c.text, fontFamily: fonts.regular };

  const finish = async () => {
    const granted = notificationsSupported ? await ensurePermission().catch(() => false) : false;
    const condFinal = etapa === 'especial' ? condiciones : condiciones.filter((x) => !CONDICIONES_ESPECIAL.some((k) => k.id === x));
    replaceAll({
      ...data,
      settings: {
        ...s0,
        onboarded: true,
        name: name.trim(),
        edad,
        etapa,
        anticonceptivo: antiFinal,
        condiciones: condFinal,
        ttcRegistro: ttc,
        posparto: posparto ? { nacimiento: nacimientoHace(ppSemanas), parto, alimentacion } : s0.posparto,
        embarazo: embarazada ? { fpp: fppDesdeSemanas(semanasEmb) } : s0.embarazo,
        meno: meno ? { ...s0.meno, etapa: menoEtapa, trh } : s0.meno,
        cycleLength: etapa === 'especial' ? 35 : cycleLength,
        periodLength,
        pillMode: pastilla,
        pillName: pillName.trim(),
        pillType,
        pillPackStart: pastilla ? packStart : null,
        reminders: {
          ...s0.reminders,
          pill: { on: pastilla && granted, hour: pillHour, minute: 0 },
          period: { ...s0.reminders.period, on: granted && etapa !== 'especial' && !posparto && !embarazada && !meno },
          pack: { ...s0.reminders.pack, on: pastilla && granted },
        },
      },
      logs: lastStart ? seedFirstPeriod(data.logs, lastStart, periodLength) : data.logs,
    });
    router.replace(s0.tutorialVisto ? '/' : '/tutorial');
  };

  const next = () => (i < flujo.length - 1 ? setI(i + 1) : finish());
  const back = () => setI(Math.max(0, i - 1));
  const toggle = <T,>(list: T[], x: T) => (list.includes(x) ? list.filter((y) => y !== x) : [...list, x]);

  const opcion = <T extends string>(lista: { id: T; label: string }[], valor: T, set: (v: T) => void) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {lista.map((o) => (
        <Chip key={o.id} label={o.label} selected={valor === o.id} onPress={() => set(o.id)} />
      ))}
    </View>
  );

  const h1 = (t: string) => <Text style={{ fontFamily: serif, fontSize: 30, lineHeight: 36, color: c.text }}>{t}</Text>;

  const pillCard = pastilla && (
    <>
      <Card>
        <PillPicker name={pillName} type={pillType} onName={setPillName} onType={setPillType} />
        <Row label="Recordarme a las" hint="Puedes cambiarlo luego en Perfil">
          <Stepper value={pillHour} onChange={setPillHour} min={0} max={23} format={(h) => timeLabel(h, 0)} />
        </Row>
      </Card>
      <Card>
        <Label>¿Qué día empezaste el blíster actual?</Label>
        <Muted>Así sabemos qué pastilla te toca y cuándo es tu descanso. Puedes saltarlo.</Muted>
        <MonthGrid maxDate={today()} selected={packStart} onPress={setPackStart} marks={packStart ? { [packStart]: { ovulation: true } } : {}} />
      </Card>
    </>
  );

  const puedeSeguir = paso !== 'pastilla' || anti !== null;
  const etiqueta = paso === 'bienvenida' ? 'Empezar' : paso === 'listo' ? 'Entrar a mi app' : 'Siguiente';

  return (
    <Screen angosta>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <View style={{ flex: 1, flexDirection: 'row', gap: 6 }} accessibilityLabel={`Paso ${i + 1} de ${flujo.length}`}>
          {flujo.map((_, j) => (
            <View key={j} style={{ width: j === i ? 26 : 8, height: 8, borderRadius: 4, backgroundColor: j <= i ? c.rosa : c.line }} />
          ))}
        </View>
        {paso !== 'listo' && (
          <Pressable accessibilityRole="button" onPress={finish} hitSlop={10}>
            <Text style={{ fontFamily: fonts.semibold, color: c.muted, fontSize: 14.5 }}>Omitir</Text>
          </Pressable>
        )}
      </View>

      {paso === 'bienvenida' && (
        <>
          <View style={{ alignItems: 'center', marginTop: 24 }}>
            <Logo size={96} animated />
          </View>
          <Text style={{ fontFamily: serif, fontSize: 32, lineHeight: 38, color: c.text, textAlign: 'center' }}>Hola, te damos la bienvenida a Savia</Text>
          <Body style={{ textAlign: 'center' }}>La vida que eres y la vida que das. Te acompañamos en tu ciclo, tu embarazo y tu menopausia.</Body>
          <Muted style={{ textAlign: 'center' }}>{nubeConfigurada ? 'Tus datos quedan respaldados en tu cuenta.' : 'Sin cuentas ni nube: todo queda en tu teléfono.'}</Muted>
        </>
      )}

      {paso === 'cuenta' && (
        <>
          {h1('Crea tu cuenta')}
          <Body>Savia se arma según la etapa de vida que estás viviendo. La puedes cambiar cuando quieras.</Body>
          <Card>
            <Label>¿Cómo te llamamos?</Label>
            <TextInput value={name} onChangeText={setName} placeholder={t('Tu nombre')} placeholderTextColor={c.muted} style={input} autoCapitalize="words" autoComplete="given-name" />
          </Card>
          <Card>
            <Row label="Tu edad" hint={edad >= 45 ? 'Desde los 45 muchas mujeres entran en la perimenopausia' : 'Para darte ideas acordes a ti'}>
              <Stepper value={edad} onChange={setEdad} min={10} max={80} />
            </Row>
          </Card>
          <Label style={{ marginTop: 4 }}>¿En qué etapa estás?</Label>
          <EtapaPicker
            value={etapa}
            onChange={(e) => {
              setEtapa(e);
              if (e === 'especial' && !condiciones.some((x) => CONDICIONES_ESPECIAL.some((k) => k.id === x))) setCondiciones([...condiciones, 'sop']);
            }}
          />
          <Muted>Tu historial se queda contigo cuando cambies de modo.</Muted>
        </>
      )}

      {paso === 'periodo' && (
        <>
          {h1('¿Cuándo empezó tu último período?')}
          <Muted>Toca el primer día de sangrado. Si no te acuerdas exacto, elige el más cercano.</Muted>
          <Card>
            <MonthGrid maxDate={today()} selected={lastStart} onPress={setLastStart} marks={lastStart ? { [lastStart]: { period: true } } : {}} />
          </Card>
          {lastStart ? <Body style={{ textAlign: 'center' }}>Elegiste el {longDate(lastStart)}</Body> : <Button small kind="ghost" label="No me acuerdo" onPress={next} />}
        </>
      )}

      {paso === 'duracion' && (
        <>
          {h1('¿Cada cuántos días te viene?')}
          <Muted>Si no sabes, deja 28 y 5. Savia irá aprendiendo de tus registros y ajustando sola.</Muted>
          <Card>
            <Row label="Duración del ciclo" hint="De un período al siguiente">
              <Stepper value={cycleLength} onChange={setCycleLength} min={20} max={45} format={(v) => `${v} d`} />
            </Row>
            <Row label="Duración del período" hint="Días de sangrado">
              <Stepper value={periodLength} onChange={setPeriodLength} min={2} max={10} format={(v) => `${v} d`} />
            </Row>
          </Card>
        </>
      )}

      {paso === 'pastilla' && (
        <>
          {h1('¿Tomas pastilla anticonceptiva?')}
          <Muted>Si la tomas, no mostramos días fértiles (con la pastilla no aplican) y te ayudamos a recordarla.</Muted>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}><Button label="Sí" kind={pastilla ? 'primary' : 'soft'} onPress={() => setAnti('pastilla')} /></View>
            <View style={{ flex: 1 }}><Button label="No" kind={anti === 'ninguno' ? 'primary' : 'soft'} onPress={() => setAnti('ninguno')} /></View>
          </View>
          {pillCard}
        </>
      )}

      {paso === 'especial' && (
        <>
          {h1('¿Qué hace especial a tu ciclo?')}
          <Body>Elige todo lo que aplique. Apagamos las alertas de “atraso” y aceptamos ciclos de 35 a 90 días o más y sangrados largos.</Body>
          <Label>Condición</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {CONDICIONES_ESPECIAL.map((k) => (
              <Chip key={k.id} label={k.label} selected={condiciones.includes(k.id)} onPress={() => setCondiciones(toggle(condiciones, k.id))} />
            ))}
          </View>
          <Label>Anticonceptivo</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {ANTICONCEPTIVOS.map((k) => (
              <Chip key={k.id} label={k.label} selected={(anti ?? 'ninguno') === k.id} onPress={() => setAnti(k.id)} />
            ))}
          </View>
          <Card tint={c.lavandaSuave}>
            <Body>{anti && SIN_OVULACION.includes(anti) ? NOTA_HORMONAL : NOTA_ESPECIAL}</Body>
          </Card>
          {pillCard}
        </>
      )}

      {paso === 'ttc' && (
        <>
          {h1('¿Qué quieres registrar para buscar tu embarazo?')}
          <Body>{TEXTO_TTC}</Body>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {SENALES_TTC.map((k) => (
              <Chip key={k.id} label={k.label} selected={ttc.includes(k.id)} onPress={() => setTtc(toggle(ttc, k.id))} />
            ))}
          </View>
          <Muted>Puedes cambiarlo cuando quieras desde Perfil.</Muted>
        </>
      )}

      {paso === 'embarazo' && (
        <>
          {h1('¿De cuántas semanas estás?')}
          <Muted>Si no sabes, cuenta desde el primer día de tu último período.</Muted>
          <Card style={{ alignItems: 'center', gap: 12 }}>
            <Icono e={bebe(semanasEmb).emoji} size={52} />
            <Stepper value={semanasEmb} onChange={setSemanasEmb} min={SEMANA_MIN} max={SEMANA_MAX} format={(v) => `${v} semanas`} />
            <Body style={{ textAlign: 'center' }}>Tu bebé es del tamaño de {bebe(semanasEmb).fruta}</Body>
            <Muted>
              Fecha probable de parto: <Text style={{ fontFamily: fonts.bold, color: c.text }}>{longDate(fppDesdeSemanas(semanasEmb))}</Text>
            </Muted>
          </Card>
        </>
      )}

      {paso === 'meno' && (
        <>
          {h1('¿Cuándo fue tu último período?')}
          <Muted>La menopausia se confirma tras 12 meses seguidos sin período.</Muted>
          <View style={{ gap: 10 }}>
            {ETAPAS_MENO.map((e) => {
              const on = menoEtapa === e.id;
              return (
                <Pressable
                  key={e.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  onPress={() => setMenoEtapa(e.id)}
                  style={{ padding: 16, borderRadius: radius.lg, borderWidth: on ? 2 : 1, borderColor: on ? c.rosa : c.line, backgroundColor: on ? c.rosaSuave : c.card, gap: 2 }}
                >
                  <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: c.text }}>{e.cuando}</Text>
                  <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: c.muted }}>{e.nombre}</Text>
                </Pressable>
              );
            })}
          </View>
          <Card>
            <Toggle label="Uso tratamiento hormonal" hint="Lo puedes cambiar luego" value={trh} onChange={setTrh} />
          </Card>
        </>
      )}

      {paso === 'posparto' && (
        <>
          {h1('¿Hace cuánto nació tu bebé?')}
          <Body>Felicidades. Aquí la protagonista también eres tú.</Body>
          <Card>
            <Row label="Semanas desde el parto" hint="Cuarto trimestre: semanas 0 a 12">
              <Stepper value={ppSemanas} onChange={setPpSemanas} min={0} max={52} />
            </Row>
          </Card>
          <Label>Tu parto fue</Label>
          {opcion(PARTOS, parto, setParto)}
          <Label>Alimentas a tu bebé con</Label>
          {opcion(ALIMENTACIONES, alimentacion, setAlimentacion)}
        </>
      )}

      {paso === 'listo' && (
        <>
          {h1(`Todo listo${name.trim() ? `, ${name.trim()}` : ''}`)}
          <Card>
            <TonePicker />
          </Card>
          <Card tint={c.rosaSuave}>
            <Label>Tu privacidad, primero</Label>
            <Body>{nubeConfigurada ? '• Tus datos se guardan en tu teléfono y se respaldan en tu cuenta: solo tú puedes verlos.' : '• Tus datos se guardan solo en este teléfono.'}</Body>
            <Body>• Sin publicidad. Nunca vendemos ni compartimos tus datos.</Body>
            <Body>• Puedes respaldarlos o borrarlos cuando quieras desde Perfil.</Body>
          </Card>
          <Muted>Savia te acompaña, pero no reemplaza a tu médico. {etapa === 'ttc' || posparto || embarazada || meno ? '' : AVISO_ANTICONCEPTIVO}</Muted>
          {notificationsSupported && <Muted>Al continuar te pediremos permiso para enviarte recordatorios. Puedes ajustarlos cuando quieras.</Muted>}
        </>
      )}

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
        {i > 0 && (
          <View style={{ flex: 1 }}>
            <Button kind="soft" label="Atrás" onPress={back} />
          </View>
        )}
        <View style={{ flex: 2 }}>
          <Button label={etiqueta} onPress={next} disabled={!puedeSeguir} />
        </View>
      </View>
    </Screen>
  );
}
