import * as LocalAuthentication from 'expo-local-authentication';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, Text, TextInput, View } from 'react-native';
import { MonthGrid } from '../../components/MonthGrid';
import { TonePicker } from '../../components/TonePicker';
import { CONDICIONES } from '../../content/condiciones';
import { Body, Button, Card, Chip, Divider, Label, Muted, Row, Screen, Stepper, Toggle, confirm, notify } from '../../components/ui';
import { NO_DISPOSITIVO } from '../../content/info';
import { exportBackup, pickBackup, shareReport } from '../../lib/backup';
import { PillPicker } from '../../components/PillPicker';
import { pillStatus } from '../../lib/cycle';
import { diffDays, longDate, shortDate, timeLabel, today } from '../../lib/dates';
import { ensurePermission, notificationsSupported } from '../../lib/notifications';
import { useStore } from '../../lib/store';
import { radius, useColors } from '../../lib/theme';
import type { Settings } from '../../lib/types';

const WATER_HOURS = [8, 10, 12, 14, 16, 18, 20];

function LinkRow({ emoji, label, hint, to }: { emoji: string; label: string; hint: string; to: Href }) {
  const c = useColors();
  return (
    <Pressable accessibilityRole="button" onPress={() => router.push(to)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, opacity: pressed ? 0.6 : 1 })}>
      <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: c.rosaSuave, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 18 }}>{emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Body style={{ fontWeight: '600' }}>{label}</Body>
        <Muted>{hint}</Muted>
      </View>
      <Text style={{ color: c.muted, fontSize: 20 }}>›</Text>
    </Pressable>
  );
}

export default function Perfil() {
  const c = useColors();
  const { data, summary, updateSettings, replaceAll, resetAll } = useStore();
  const s = data.settings;
  const r = s.reminders;
  const [pickPack, setPickPack] = useState(false);
  const pill = pillStatus(s);

  const setReminders = (patch: Partial<Settings['reminders']>) => updateSettings({ reminders: { ...r, ...patch } });

  // Al prender cualquier recordatorio, se pide permiso si hace falta.
  const withPermission = async (fn: () => void) => {
    if (await ensurePermission()) fn();
    else notify('Sin permiso', 'Activa las notificaciones para esta app en los ajustes del teléfono.');
  };

  const input = { borderRadius: radius.md, backgroundColor: c.bg, padding: 12, fontSize: 16, color: c.text };
  const backupAge = s.lastBackup ? diffDays(today(), s.lastBackup) : null;

  return (
    <Screen title="Perfil">
      <Card>
        <Label>Tú</Label>
        <TextInput value={s.name} onChangeText={(name) => updateSettings({ name })} placeholder="Tu nombre" placeholderTextColor={c.muted} style={input} />
      </Card>

      <Card>
        <TonePicker />
      </Card>

      <Card style={{ gap: 4 }}>
        <Label>Más para ti</Label>
        <LinkRow emoji="🩺" label="Salud ginecológica" hint="Controles, autoexamen, ovarios y quistes" to="/salud" />
        <LinkRow emoji="🧘‍♀️" label="Ejercicios y alivio" hint="Movimiento por fase y respiración" to="/ejercicios" />
        <LinkRow emoji="🌙" label="Diario de sueños" hint={`${data.dreams.length} ${data.dreams.length === 1 ? 'sueño' : 'sueños'}`} to="/suenos" />
        <LinkRow emoji="🧪" label="Ayúdanos a mejorar" hint="Pruebas cortas para mejorar la app" to="/pruebas" />
        <LinkRow emoji="📖" label="Ver el tutorial" hint="Todo lo que puedes hacer en Ciclo" to="/tutorial" />
        <LinkRow emoji="ℹ️" label="Cuándo consultar · fuentes" hint="Señales de alerta y qué alivia" to="/info" />
      </Card>

      <Card>
        <Label>Tu situación (opcional)</Label>
        <Muted>Si marcas ciclos irregulares, SOP o perimenopausia, la app muestra rangos en lugar de una fecha exacta.</Muted>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {CONDICIONES.map((k) => (
            <Chip
              key={k.id}
              label={k.label}
              color={c.lavanda}
              selected={s.condiciones.includes(k.id)}
              onPress={() => updateSettings({ condiciones: s.condiciones.includes(k.id) ? s.condiciones.filter((x) => x !== k.id) : [...s.condiciones, k.id] })}
            />
          ))}
        </View>
        <Toggle
          label="Sin avisos de retraso"
          hint="No mostrar alertas de retraso ni sugerencias de prueba de embarazo"
          value={s.ocultarRetrasos}
          onChange={(ocultarRetrasos) => updateSettings({ ocultarRetrasos })}
        />
      </Card>

      <Card>
        <Label>Tu ciclo</Label>
        <Row label="Duración del ciclo" hint={summary.learned ? `La app usa ${summary.avgCycle} días, aprendido de tus registros` : 'Se usa hasta tener 2 ciclos registrados'}>
          <Stepper value={s.cycleLength} onChange={(v) => updateSettings({ cycleLength: v })} min={20} max={45} format={(v) => `${v} d`} />
        </Row>
        <Row label="Duración del período">
          <Stepper value={s.periodLength} onChange={(v) => updateSettings({ periodLength: v })} min={2} max={10} format={(v) => `${v} d`} />
        </Row>
      </Card>

      <Card>
        <Toggle label="💊 Tomo pastilla anticonceptiva" hint="Oculta los días fértiles y activa el seguimiento del blíster" value={s.pillMode} onChange={(pillMode) => updateSettings({ pillMode })} />
        {s.pillMode && (
          <>
            <PillPicker name={s.pillName} type={s.pillType} onName={(pillName) => updateSettings({ pillName })} onType={(pillType) => updateSettings({ pillType })} />
            <Divider />
            <Row label="Blíster actual" hint={pill ? `Pastilla ${pill.dayInPack} de ${pill.packLength} · el próximo empieza el ${shortDate(pill.nextPackStart)}` : 'Aún no sabemos qué día empezaste'}>
              <Button small kind="soft" label={pickPack ? 'Cerrar' : 'Cambiar'} onPress={() => setPickPack((v) => !v)} />
            </Row>
            {pickPack && (
              <>
                <Button small label="Hoy empecé un blíster nuevo" onPress={() => { updateSettings({ pillPackStart: today() }); setPickPack(false); }} />
                <Muted>O toca el día en que empezaste el blíster actual:</Muted>
                <MonthGrid maxDate={today()} selected={s.pillPackStart} onPress={(d) => { updateSettings({ pillPackStart: d }); setPickPack(false); }} />
              </>
            )}
          </>
        )}
      </Card>

      <Card>
        <Label>🔔 Recordatorios</Label>
        {!notificationsSupported ? (
          <Muted>Los recordatorios funcionan en la app instalada en el teléfono (Android o iPhone).</Muted>
        ) : (
          <>
            {s.pillMode && (
              <>
                <Toggle label="Pastilla" hint="A la misma hora cada día, y otro aviso si pasa una hora sin marcarla. Salta los días de descanso." value={r.pill.on} onChange={(on) => (on ? withPermission(() => setReminders({ pill: { ...r.pill, on } })) : setReminders({ pill: { ...r.pill, on } }))} />
                {r.pill.on && (
                  <Row label="Hora">
                    <Stepper
                      value={r.pill.hour * 60 + r.pill.minute}
                      onChange={(v) => setReminders({ pill: { ...r.pill, hour: Math.floor(v / 60), minute: v % 60 } })}
                      min={0}
                      max={23 * 60 + 45}
                      step={15}
                      format={(v) => timeLabel(Math.floor(v / 60), v % 60)}
                    />
                  </Row>
                )}
                <Toggle label="Blíster nuevo y descanso" hint="Aviso el día antes" value={r.pack.on} onChange={(on) => (on ? withPermission(() => setReminders({ pack: { ...r.pack, on } })) : setReminders({ pack: { ...r.pack, on } }))} />
                <Divider />
              </>
            )}
            <Toggle label="Período próximo" value={r.period.on} onChange={(on) => (on ? withPermission(() => setReminders({ period: { ...r.period, on } })) : setReminders({ period: { ...r.period, on } }))} />
            {r.period.on && (
              <Row label="Avisarme antes">
                <Stepper value={r.period.daysBefore} onChange={(v) => setReminders({ period: { ...r.period, daysBefore: v } })} min={1} max={5} format={(v) => `${v} d`} />
              </Row>
            )}
            <Divider />
            <Toggle label="✍️ Registrar mi día" hint="Un empujoncito suave cada noche" value={r.registro.on} onChange={(on) => (on ? withPermission(() => setReminders({ registro: { ...r.registro, on } })) : setReminders({ registro: { ...r.registro, on } }))} />
            {r.registro.on && (
              <Row label="Hora">
                <Stepper
                  value={r.registro.hour * 60 + r.registro.minute}
                  onChange={(v) => setReminders({ registro: { ...r.registro, hour: Math.floor(v / 60), minute: v % 60 } })}
                  min={0}
                  max={23 * 60 + 30}
                  step={30}
                  format={(v) => timeLabel(Math.floor(v / 60), v % 60)}
                />
              </Row>
            )}
            <Toggle label="🎀 Autoexamen de mamas" hint="Una vez al mes, unos días después del período" value={r.autoexamen.on} onChange={(on) => (on ? withPermission(() => setReminders({ autoexamen: { ...r.autoexamen, on } })) : setReminders({ autoexamen: { ...r.autoexamen, on } }))} />
            <Toggle label="🩺 Controles médicos" hint="Ecografía, PAP y control anual" value={r.controles.on} onChange={(on) => (on ? withPermission(() => setReminders({ controles: { ...r.controles, on } })) : setReminders({ controles: { ...r.controles, on } }))} />
            {r.controles.on && (
              <Row label="Avisarme antes">
                <Stepper value={r.controles.daysBefore} onChange={(v) => setReminders({ controles: { ...r.controles, daysBefore: v } })} min={1} max={14} format={(v) => `${v} d`} />
              </Row>
            )}
            <Divider />
            <Toggle label="🤫 Notificaciones discretas" hint='En la pantalla bloqueada dice solo "Recordatorio 🌸", sin mencionar pastilla ni período' value={s.discreet} onChange={(discreet) => updateSettings({ discreet })} />
            <Divider />
            <Toggle label="💧 Tomar agua" value={r.water.on} onChange={(on) => (on ? withPermission(() => setReminders({ water: { ...r.water, on } })) : setReminders({ water: { ...r.water, on } }))} />
            {r.water.on && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {WATER_HOURS.map((h) => (
                  <Chip
                    key={h}
                    label={timeLabel(h, 0)}
                    color={c.lavanda}
                    selected={r.water.hours.includes(h)}
                    onPress={() => setReminders({ water: { ...r.water, hours: r.water.hours.includes(h) ? r.water.hours.filter((x) => x !== h) : [...r.water.hours, h].sort((a, b) => a - b) } })}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </Card>

      {Platform.OS !== 'web' && (
        <Card>
          <Toggle
            label="🔒 Proteger con huella / Face ID"
            hint="Pide desbloquear al abrir la app"
            value={s.lock}
            onChange={async (lock) => {
              if (lock) {
                const ok = (await LocalAuthentication.hasHardwareAsync()) && (await LocalAuthentication.isEnrolledAsync());
                if (!ok) return notify('No disponible', 'Tu teléfono no tiene huella ni Face ID configurados.');
                const res = await LocalAuthentication.authenticateAsync({ promptMessage: 'Confirma para activar el bloqueo' });
                if (!res.success) return;
              }
              updateSettings({ lock });
            }}
          />
        </Card>
      )}

      <Card tint={backupAge == null || backupAge > 30 ? c.duraznoSuave : undefined}>
        <Label>💾 Tus datos</Label>
        <Muted>
          Todo vive solo en este teléfono. Si lo cambias o se pierde, sin respaldo se pierde el historial.{' '}
          {s.lastBackup ? `Último respaldo: ${longDate(s.lastBackup)}.` : 'Aún no has hecho ningún respaldo.'}
        </Muted>
        <Button
          label="Respaldar mis datos"
          onPress={async () => {
            try {
              await exportBackup(data);
              updateSettings({ lastBackup: today() });
            } catch (e) {
              notify('No se pudo respaldar', String(e));
            }
          }}
        />
        <Button
          kind="ghost"
          label="Restaurar un respaldo"
          onPress={async () => {
            try {
              const backup = await pickBackup();
              if (!backup) return;
              const n = Object.keys(backup.logs).length;
              if (await confirm('¿Restaurar este respaldo?', `Tiene ${n} días registrados. Reemplazará lo que hay ahora en la app.`, 'Restaurar')) {
                replaceAll({ ...backup, settings: { ...backup.settings, onboarded: true } });
                notify('Listo 🌷', 'Tus datos se restauraron.');
              }
            } catch (e) {
              notify('Ese archivo no sirve', e instanceof Error ? e.message : String(e));
            }
          }}
        />
        <Divider />
        <Body style={{ fontWeight: '600' }}>📄 Resumen para tu médico</Body>
        <Muted>Un PDF con tus ciclos, duración, síntomas frecuentes y notas, para llevar a la consulta.</Muted>
        <Button kind="soft" label="Crear resumen PDF" onPress={() => shareReport(data, summary).catch((e) => notify('No se pudo crear', String(e)))} />
      </Card>

      <Button
        kind="danger"
        label="Borrar todos mis datos"
        onPress={async () => {
          if (await confirm('¿Borrar todo?', 'Se eliminarán todos tus registros y ajustes de este teléfono. No se puede deshacer.', 'Borrar')) {
            resetAll();
            router.replace('/onboarding');
          }
        }}
      />
      <Button kind="ghost" small label="🩺 Cuándo consultar · fuentes" onPress={() => router.push('/info')} />
      <Muted style={{ textAlign: 'center' }}>{NO_DISPOSITIVO}</Muted>
      <Muted style={{ textAlign: 'center' }}>Hecha con cariño 🌸 · v1.0</Muted>
    </Screen>
  );
}
