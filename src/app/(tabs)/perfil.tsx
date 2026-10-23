import * as LocalAuthentication from 'expo-local-authentication';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, TextInput, View } from 'react-native';
import { Text } from '../../components/Texto';
import { EtapaPicker } from '../../components/EtapaPicker';
import { SEMANA_MAX, SEMANA_MIN, fppDesdeSemanas, semanasEmbarazo } from '../../content/embarazo';
import { ETAPAS_MENO } from '../../content/menopausia';
import { ALIMENTACIONES, PARTOS, nacimientoHace, semanasPosparto } from '../../content/posparto';
import { CONDICIONES } from '../../content/condiciones';
import { ANTICONCEPTIVOS, CAMBIO_ETAPA, CONDICIONES_ESPECIAL, NOTA_ESPECIAL, NOTA_HORMONAL, SENALES_TTC, SIN_OVULACION, TEXTO_TTC } from '../../content/etapas';
import { Body, Button, Card, Chip, Columnas, Divider, Label, Muted, Row, Screen, Stepper, Toggle, confirm, notify } from '../../components/ui';
import { NO_DISPOSITIVO } from '../../content/info';
import { exportBackup, pickBackup, shareReport } from '../../lib/backup';
import { diffDays, longDate, timeLabel, today } from '../../lib/dates';
import { ensurePermission, notificationsSupported } from '../../lib/notifications';
import { useAuth } from '../../lib/auth';
import { useStore } from '../../lib/store';
import { signOut } from '../../lib/nube';
import { radius, useColors } from '../../lib/theme';
import type { Settings } from '../../lib/types';
import { IconoBurbuja } from '../../components/Icono';
import { t } from '../../lib/region';
import { SelectorRegion } from '../../components/ElegirPais';
import { AnimoEnPdf } from '../../components/AnimoEnPdf';
import { BlisterAjustes } from '../../components/BlisterAjustes';

const WATER_HOURS = [8, 10, 12, 14, 16, 18, 20];

function LinkRow({ emoji, label, hint, to }: { emoji: string; label: string; hint: string; to: Href }) {
  const c = useColors();
  return (
    <Pressable accessibilityRole="button" onPress={() => router.push(to)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, opacity: pressed ? 0.6 : 1 })}>
      <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: c.rosaSuave, alignItems: 'center', justifyContent: 'center' }}>
        <IconoBurbuja e={emoji} size={22} fondo="transparent" color={c.rosa} />
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
  const { data, summary, updateSettings, replaceAll, resetAll, sync } = useStore();
  const { session } = useAuth();
  const s = data.settings;
  const r = s.reminders;
  const [cambio, setCambio] = useState(false);
  const [etapaSel, setEtapaSel] = useState(s.etapa);

  // La etapa se cambia solo al tocar Guardar: suele durar mucho tiempo y no se debe mover por un toque.
  const guardarEtapa = () => {
    const etapa = etapaSel;
    const conCond = s.condiciones.some((x) => CONDICIONES_ESPECIAL.some((k) => k.id === x));
    if (etapa === 'especial' && !conCond) updateSettings({ etapa, condiciones: [...s.condiciones, 'sop'] });
    // Buscando un embarazo o en menopausia no se usa anticonceptivo.
    else if (etapa === 'ttc' || etapa === 'meno') updateSettings({ etapa, anticonceptivo: 'ninguno', pillMode: false });
    // Sin fecha probable de parto, se empieza en la semana 12 y se ajusta abajo.
    else if (etapa === 'embarazo') updateSettings({ etapa, anticonceptivo: 'ninguno', pillMode: false, embarazo: s.embarazo.fpp ? s.embarazo : { fpp: fppDesdeSemanas(12) } });
    else if (etapa === 'posparto' && !s.posparto.nacimiento) updateSettings({ etapa, posparto: { ...s.posparto, nacimiento: today() } });
    else updateSettings({ etapa });
    setCambio(true);
  };

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
      <Columnas
        izquierda={
          <>
      <Card>
        <Label>Tú</Label>
        <TextInput value={s.name} onChangeText={(name) => updateSettings({ name })} placeholder={t('Tu nombre')} placeholderTextColor={c.muted} style={input} />
        <Row label="Tu edad" hint="Para darte ideas acordes a ti">
          <Stepper value={s.edad ?? 29} onChange={(edad) => updateSettings({ edad })} min={10} max={80} />
        </Row>
        <Divider />
        <SelectorRegion />
      </Card>

      <Card>
        <Label>Tu etapa</Label>
        <Muted>Savia se arma según la etapa que estás viviendo. Elige y toca Guardar: se queda así hasta que tú la cambies, y tu historial no se pierde.</Muted>
        <EtapaPicker
          value={etapaSel}
          onChange={(etapa) => {
            setEtapaSel(etapa);
            setCambio(false);
          }}
        />
        {etapaSel !== s.etapa && (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Button label="Guardar etapa" onPress={guardarEtapa} />
            </View>
            <Button kind="ghost" label="Cancelar" onPress={() => setEtapaSel(s.etapa)} />
          </View>
        )}
        {cambio && etapaSel === s.etapa && <Body style={{ color: c.salvia, fontWeight: '600' }}>✓ Guardado. {CAMBIO_ETAPA}</Body>}
        {s.silencioEmbarazo && (
          <Toggle
            label="Avisos del embarazo en pausa"
            hint="Sin sugerencias de prueba ni avisos de atraso. Apágalo cuando quieras volver a verlos."
            value={s.silencioEmbarazo}
            onChange={(silencioEmbarazo) => updateSettings({ silencioEmbarazo })}
          />
        )}

        {s.etapa === 'especial' && (
          <>
            <Divider />
            <Body style={{ fontWeight: '600' }}>¿Qué hace especial a tu ciclo?</Body>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {CONDICIONES_ESPECIAL.map((k) => (
                <Chip
                  key={k.id}
                  label={k.label}
                  color={c.lavanda}
                  selected={s.condiciones.includes(k.id)}
                  onPress={() => updateSettings({ condiciones: s.condiciones.includes(k.id) ? s.condiciones.filter((x) => x !== k.id) : [...s.condiciones, k.id] })}
                />
              ))}
            </View>
            <Body style={{ fontWeight: '600' }}>Anticonceptivo</Body>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {ANTICONCEPTIVOS.map((k) => (
                <Chip key={k.id} label={k.label} color={c.lavanda} selected={s.anticonceptivo === k.id} onPress={() => updateSettings({ anticonceptivo: k.id, pillMode: k.id === 'pastilla' })} />
              ))}
            </View>
            <Muted>{SIN_OVULACION.includes(s.anticonceptivo) ? NOTA_HORMONAL : NOTA_ESPECIAL}</Muted>
          </>
        )}

        {s.etapa === 'embarazo' && s.embarazo.fpp && (
          <>
            <Divider />
            <Row label="Semanas de embarazo" hint={`Fecha probable de parto: ${longDate(s.embarazo.fpp)}`}>
              <Stepper value={semanasEmbarazo(s.embarazo.fpp)} onChange={(v) => updateSettings({ embarazo: { fpp: fppDesdeSemanas(v) } })} min={SEMANA_MIN} max={SEMANA_MAX} />
            </Row>
          </>
        )}

        {s.etapa === 'meno' && (
          <>
            <Divider />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {ETAPAS_MENO.map((e) => (
                <Chip key={e.id} label={e.nombre} selected={s.meno.etapa === e.id} onPress={() => updateSettings({ meno: { ...s.meno, etapa: e.id } })} />
              ))}
            </View>
            <Toggle label="Uso tratamiento hormonal (TRH)" value={s.meno.trh} onChange={(trh) => updateSettings({ meno: { ...s.meno, trh } })} />
          </>
        )}

        {s.etapa === 'posparto' && (
          <>
            <Divider />
            <Row label="Semanas desde el parto" hint={s.posparto.nacimiento ? `Nació el ${longDate(s.posparto.nacimiento)}` : undefined}>
              <Stepper
                value={semanasPosparto(s.posparto)}
                onChange={(v) => updateSettings({ posparto: { ...s.posparto, nacimiento: nacimientoHace(v) } })}
                min={0}
                max={104}
              />
            </Row>
            <Body style={{ fontWeight: '600' }}>Tu parto fue</Body>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {PARTOS.map((k) => (
                <Chip key={k.id} label={k.label} selected={s.posparto.parto === k.id} onPress={() => updateSettings({ posparto: { ...s.posparto, parto: k.id } })} />
              ))}
            </View>
            <Body style={{ fontWeight: '600' }}>Alimentas a tu bebé con</Body>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {ALIMENTACIONES.map((k) => (
                <Chip key={k.id} label={k.label} selected={s.posparto.alimentacion === k.id} onPress={() => updateSettings({ posparto: { ...s.posparto, alimentacion: k.id } })} />
              ))}
            </View>
          </>
        )}

        {s.etapa === 'ttc' && (
          <>
            <Divider />
            <Body style={{ fontWeight: '600' }}>¿Qué quieres registrar?</Body>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {SENALES_TTC.map((k) => (
                <Chip
                  key={k.id}
                  label={k.label}
                  color={c.salvia}
                  selected={s.ttcRegistro.includes(k.id)}
                  onPress={() => updateSettings({ ttcRegistro: s.ttcRegistro.includes(k.id) ? s.ttcRegistro.filter((x) => x !== k.id) : [...s.ttcRegistro, k.id] })}
                />
              ))}
            </View>
            <Muted>{TEXTO_TTC}</Muted>
          </>
        )}
      </Card>

      <Card style={{ gap: 4 }}>
        <Label>Más para ti</Label>
        <LinkRow emoji="🎨" label="Personalizar la app" hint="Color, modo noche o día" to="/personalizar" />
        <LinkRow emoji="📋" label="Modo consulta médica" hint="Resumen para tu médica y exportar tus datos" to="/consulta" />
        <LinkRow emoji="🤝" label="Tu red de apoyo" hint={s.red.on ? `Compartes con ${s.red.nombre || 'alguien de confianza'}` : 'Comparte lo que elijas con tu pareja'} to="/red" />
        {(s.etapa === 'ttc' || s.etapa === 'embarazo') && <LinkRow emoji="🌙" label="Un cambio en tu embarazo" hint="Nació tu bebé, una pérdida o prefieres no decir" to="/cambio" />}
        <LinkRow emoji="🩺" label="Salud ginecológica" hint="Controles, autoexamen, ovarios y quistes" to="/salud" />
        <LinkRow emoji="🧘‍♀️" label="Ejercicios y alivio" hint="Movimiento por fase y respiración" to="/ejercicios" />
        <LinkRow emoji="🌙" label="Diario de sueños" hint={`${data.dreams.length} ${data.dreams.length === 1 ? 'sueño' : 'sueños'}`} to="/suenos" />
        <LinkRow emoji="🧪" label="Ayúdanos a mejorar" hint="Pruebas cortas para mejorar la app" to="/pruebas" />
        <LinkRow emoji="📖" label="Ver el tutorial" hint="Todo lo que puedes hacer en Savia" to="/tutorial" />
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
        <BlisterAjustes />
      </Card>
          </>
        }
        derecha={
          <>
      <Card>
        <Label>Recordatorios</Label>
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
            <Toggle label="Registrar mi día" hint="Un empujoncito suave cada noche" value={r.registro.on} onChange={(on) => (on ? withPermission(() => setReminders({ registro: { ...r.registro, on } })) : setReminders({ registro: { ...r.registro, on } }))} />
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
            <Toggle label="Autoexamen de mamas" hint="Una vez al mes, unos días después del período" value={r.autoexamen.on} onChange={(on) => (on ? withPermission(() => setReminders({ autoexamen: { ...r.autoexamen, on } })) : setReminders({ autoexamen: { ...r.autoexamen, on } }))} />
            <Toggle label="Controles médicos" hint="Ecografía, PAP y control anual" value={r.controles.on} onChange={(on) => (on ? withPermission(() => setReminders({ controles: { ...r.controles, on } })) : setReminders({ controles: { ...r.controles, on } }))} />
            {r.controles.on && (
              <Row label="Avisarme antes">
                <Stepper value={r.controles.daysBefore} onChange={(v) => setReminders({ controles: { ...r.controles, daysBefore: v } })} min={1} max={14} format={(v) => `${v} d`} />
              </Row>
            )}
            <Divider />
            <Toggle label="Notificaciones discretas" hint='En la pantalla bloqueada dice solo "Savia", sin mencionar pastilla ni período' value={s.discreet} onChange={(discreet) => updateSettings({ discreet })} />
            <Divider />
            <Toggle label="Tomar agua" value={r.water.on} onChange={(on) => (on ? withPermission(() => setReminders({ water: { ...r.water, on } })) : setReminders({ water: { ...r.water, on } }))} />
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
            label="Proteger con huella / Face ID"
            hint="Pide desbloquear al abrir la app"
            value={s.lock}
            onChange={async (lock) => {
              if (lock) {
                const ok = (await LocalAuthentication.hasHardwareAsync()) && (await LocalAuthentication.isEnrolledAsync());
                if (!ok) return notify('No disponible', 'Tu teléfono no tiene huella ni Face ID configurados.');
                const res = await LocalAuthentication.authenticateAsync({ promptMessage: t('Confirma para activar el bloqueo') });
                if (!res.success) return;
              }
              updateSettings({ lock });
            }}
          />
        </Card>
      )}

      {session && (
        <Card>
          <Label>Tu cuenta</Label>
          <Body>{session.user.email}</Body>
          <Muted>
            {{ local: 'Solo en este teléfono', sincronizando: 'Guardando en tu cuenta…', 'al-dia': '✓ Respaldado en tu cuenta', 'sin-conexion': 'Sin conexión: se respalda cuando vuelva internet' }[sync]}
          </Muted>
          <Button
            small
            kind="ghost"
            label="Cerrar sesión"
            onPress={async () => {
              if (await confirm('¿Cerrar sesión?', 'Tus datos quedan guardados en tu cuenta. Para verlos de nuevo, entra con tu correo y contraseña.', 'Cerrar sesión')) signOut();
            }}
          />
        </Card>
      )}

      <Card tint={backupAge == null || backupAge > 30 ? c.duraznoSuave : undefined}>
        <Label>Tus datos</Label>
        <Muted>
          Tus datos se respaldan solos en tu cuenta. Además puedes guardar una copia en un archivo.{' '}
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
                notify('Listo', 'Tus datos se restauraron.');
              }
            } catch (e) {
              notify('Ese archivo no sirve', e instanceof Error ? e.message : String(e));
            }
          }}
        />
        <Divider />
        <Body style={{ fontWeight: '600' }}>Resumen para tu médico</Body>
        <Muted>Un PDF con tus ciclos, sangrado, dolor y síntomas, para llevar a la consulta.</Muted>
        <AnimoEnPdf />
        <Button kind="soft" label="Crear resumen PDF" onPress={() => shareReport(data, summary).catch((e) => notify('No se pudo crear', String(e)))} />
      </Card>
          </>
        }
      />

      <Button
        kind="danger"
        label="Borrar todos mis datos"
        onPress={async () => {
          if (await confirm('¿Borrar todo?', 'Se eliminarán todos tus registros y ajustes, en este teléfono y en tu cuenta. No se puede deshacer.', 'Borrar')) {
            resetAll();
            router.replace('/onboarding');
          }
        }}
      />
      <Button kind="ghost" small label="Cuándo consultar · fuentes" onPress={() => router.push('/info')} />
      <Muted style={{ textAlign: 'center' }}>{NO_DISPOSITIVO}</Muted>
      <Muted style={{ textAlign: 'center' }}>Hecha con cariño · v1.0</Muted>
    </Screen>
  );
}
