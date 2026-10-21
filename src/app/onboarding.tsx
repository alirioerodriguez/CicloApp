// Bienvenida: la primera vez que se abre la app.
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { MonthGrid } from '../components/MonthGrid';
import { Logo } from '../components/Logo';
import { PillPicker } from '../components/PillPicker';
import { Body, Button, Card, Label, Muted, Row, Screen, Stepper } from '../components/ui';
import { AVISO_ANTICONCEPTIVO } from '../content/textos';
import { longDate, timeLabel, today } from '../lib/dates';
import { ensurePermission, notificationsSupported } from '../lib/notifications';
import { supabaseConfigured } from '../lib/supabase';
import { seedFirstPeriod, useStore } from '../lib/store';
import { radius, serif, useColors } from '../lib/theme';
import type { ISODate, PillType } from '../lib/types';

const STEPS = 5;

export default function Onboarding() {
  const c = useColors();
  const { data, replaceAll } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(data.settings.name);
  const [lastStart, setLastStart] = useState<ISODate | null>(null);
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [pillMode, setPillMode] = useState<boolean | null>(null);
  const [pillName, setPillName] = useState('');
  const [pillType, setPillType] = useState<PillType>('21-7');
  const [packStart, setPackStart] = useState<ISODate | null>(null);
  const [pillHour, setPillHour] = useState(21);

  const input = { borderRadius: radius.md, backgroundColor: c.card, borderWidth: 1, borderColor: c.line, padding: 14, fontSize: 17, color: c.text };

  const finish = async () => {
    const granted = notificationsSupported ? await ensurePermission().catch(() => false) : false;
    const s = data.settings;
    replaceAll({
      ...data,
      settings: {
        ...s,
        onboarded: true,
        name: name.trim(),
        cycleLength,
        periodLength,
        pillMode: !!pillMode,
        pillName: pillName.trim(),
        pillType,
        pillPackStart: pillMode ? packStart : null,
        reminders: {
          ...s.reminders,
          pill: { on: !!pillMode && granted, hour: pillHour, minute: 0 },
          period: { ...s.reminders.period, on: granted },
          pack: { ...s.reminders.pack, on: !!pillMode && granted },
        },
      },
      logs: lastStart ? seedFirstPeriod(data.logs, lastStart, periodLength) : data.logs,
    });
    router.replace(data.settings.tutorialVisto ? '/' : '/tutorial');
  };

  const next = () => setStep((s) => Math.min(STEPS - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <Screen>
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
        {Array.from({ length: STEPS }, (_, i) => (
          <View key={i} style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: i <= step ? c.rosa : c.line }} />
        ))}
      </View>

      {step === 0 && (
        <>
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <Logo size={96} />
          </View>
          <Text style={{ fontFamily: serif, fontSize: 32, color: c.text, textAlign: 'center' }}>Hola, te damos la bienvenida a Ciclo</Text>
          <Body style={{ textAlign: 'center' }}>Registra tu período, entiende tu cuerpo y cuídate a tu ritmo. {supabaseConfigured ? 'Tus datos quedan respaldados en tu cuenta.' : 'Todo se guarda en este teléfono, sin cuentas.'}</Body>
          <Card>
            <Label>¿Cómo te llamo? (opcional)</Label>
            <TextInput value={name} onChangeText={setName} placeholder="Tu nombre" placeholderTextColor={c.muted} style={input} autoCapitalize="words" />
          </Card>
          <Button label="Empezar" onPress={next} />
        </>
      )}

      {step === 1 && (
        <>
          <Text style={{ fontFamily: serif, fontSize: 28, color: c.text }}>¿Cuándo empezó tu último período?</Text>
          <Muted>Toca el primer día de sangrado. Si no estás segura, elige el más cercano.</Muted>
          <Card>
            <MonthGrid maxDate={today()} selected={lastStart} onPress={setLastStart} marks={lastStart ? { [lastStart]: { period: true } } : {}} />
          </Card>
          {lastStart && <Body style={{ textAlign: 'center' }}>Elegiste el {longDate(lastStart)}</Body>}
          <Button label="Continuar" onPress={next} disabled={!lastStart} />
          <Button label="No me acuerdo" kind="ghost" onPress={() => { setLastStart(null); next(); }} />
          <Button label="Atrás" kind="ghost" small onPress={back} />
        </>
      )}

      {step === 2 && (
        <>
          <Text style={{ fontFamily: serif, fontSize: 28, color: c.text }}>¿Cada cuántos días te viene?</Text>
          <Muted>Si no sabes, deja 28 y 5. La app irá aprendiendo de tus registros y ajustando sola.</Muted>
          <Card>
            <Row label="Duración del ciclo" hint="De un período al siguiente">
              <Stepper value={cycleLength} onChange={setCycleLength} min={20} max={45} format={(v) => `${v} d`} />
            </Row>
            <Row label="Duración del período" hint="Días de sangrado">
              <Stepper value={periodLength} onChange={setPeriodLength} min={2} max={10} format={(v) => `${v} d`} />
            </Row>
          </Card>
          <Button label="Continuar" onPress={next} />
          <Button label="Atrás" kind="ghost" small onPress={back} />
        </>
      )}

      {step === 3 && (
        <>
          <Text style={{ fontFamily: serif, fontSize: 28, color: c.text }}>¿Tomas pastilla anticonceptiva?</Text>
          <Muted>Si la tomas, la app no muestra días fértiles (con la pastilla no aplican) y te ayuda a recordarla.</Muted>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}><Button label="Sí" kind={pillMode === true ? 'primary' : 'soft'} onPress={() => setPillMode(true)} /></View>
            <View style={{ flex: 1 }}><Button label="No" kind={pillMode === false ? 'primary' : 'soft'} onPress={() => setPillMode(false)} /></View>
          </View>
          {pillMode && (
            <>
              <Card>
                <PillPicker name={pillName} type={pillType} onName={setPillName} onType={setPillType} />
                <Row label="Recordarme a las" hint="Puedes cambiarlo luego en Perfil">
                  <Stepper value={pillHour} onChange={setPillHour} min={0} max={23} format={(h) => timeLabel(h, 0)} />
                </Row>
              </Card>
              <Card>
                <Label>¿Qué día empezaste el blíster actual?</Label>
                <Muted>Así la app sabe qué pastilla te toca y cuándo es tu descanso. Puedes saltarlo.</Muted>
                <MonthGrid maxDate={today()} selected={packStart} onPress={setPackStart} marks={packStart ? { [packStart]: { ovulation: true } } : {}} />
              </Card>
            </>
          )}
          <Button label="Continuar" onPress={next} disabled={pillMode === null} />
          <Button label="Atrás" kind="ghost" small onPress={back} />
        </>
      )}

      {step === 4 && (
        <>
          <Text style={{ fontFamily: serif, fontSize: 28, color: c.text }}>Todo listo{name.trim() ? `, ${name.trim()}` : ''} 🌷</Text>
          <Card tint={c.rosaSuave}>
            <Label>Tu privacidad, primero 🔒</Label>
            <Body>{supabaseConfigured ? '• Tus datos se guardan en tu teléfono y se respaldan en tu cuenta: solo tú puedes verlos.' : '• Tus datos se guardan solo en este teléfono.'}</Body>
            <Body>• Sin publicidad. Nunca vendemos ni compartimos tus datos.</Body>
            <Body>• Puedes respaldarlos o borrarlos cuando quieras desde Perfil.</Body>
          </Card>
          <Muted>La app te acompaña, pero no reemplaza a tu médico. {AVISO_ANTICONCEPTIVO}</Muted>
          {notificationsSupported && <Muted>Al continuar te pediremos permiso para enviarte recordatorios (pastilla, período, agua). Puedes ajustarlos cuando quieras.</Muted>}
          <Button label="Entrar a mi app" onPress={finish} />
          <Button label="Atrás" kind="ghost" small onPress={back} />
        </>
      )}
    </Screen>
  );
}
