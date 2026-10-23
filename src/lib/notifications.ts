// Recordatorios locales: se programan en el teléfono y suenan con la app cerrada.
// Cada vez que se abre la app o cambia un ajuste, se borran y se vuelven a programar.
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { diaDelBlister, esquema, proximaPausa, tocaTomar } from './blister';
import type { Summary } from './cycle';
import { CATEGORIA_DISCRETA, CATEGORIA_PASTILLA, idRecordatorio, idSegundoAviso, registrarAccionesPastilla } from './tareaPastilla';
import { NOTIF, fill } from '../content/textos';
import { proximoAutoexamen } from './salud';
import { addDays, diffDays, fromISO, today } from './dates';
import { t as tr } from './region';
import type { AppData, ISODate } from './types';

const CHANNEL = 'recordatorios';
export const notificationsSupported = Platform.OS !== 'web';

if (notificationsSupported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function ensurePermission(): Promise<boolean> {
  if (!notificationsSupported) return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: tr('Recordatorios'),
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: '#E7799F',
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: false, allowSound: true },
  });
  return asked.granted;
}

function at(date: ISODate, hour: number, minute = 0): Date {
  const d = fromISO(date);
  d.setHours(hour, minute, 0, 0);
  return d;
}

// Título y texto se traducen al idioma y país elegidos (lib/region).
// `id` permite cancelar un aviso puntual (el segundo aviso de la pastilla); `categoria` agrega el botón "Ya la tomé".
// `exacta`: en Android usa AlarmManager.setAlarmClock(), que el sistema no corre de hora (si hay permiso de alarmas exactas).
async function once(title: string, body: string, date: Date, extra: { id?: string; categoria?: string; data?: Record<string, string>; exacta?: boolean } = {}) {
  if (date.getTime() <= Date.now()) return;
  await Notifications.scheduleNotificationAsync({
    identifier: extra.id,
    content: { title: tr(title), body: tr(body), categoryIdentifier: extra.categoria, data: extra.data },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId: CHANNEL, delivery: extra.exacta ? 'alarmClock' : 'bestEffort' },
  });
}

// Android 12+: las alarmas exactas necesitan un permiso aparte. Se pide al activar el recordatorio de la pastilla;
// sin él, el aviso llega igual, aunque puede correrse unos minutos.
export async function pedirAlarmasExactas(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    const actual = await Notifications.getExactAlarmPermissionsAsync();
    if (!actual.granted && actual.canAskAgain !== false) await Notifications.requestExactAlarmPermissionsAsync();
  } catch {
    // Versiones de Android sin este permiso: no hace falta.
  }
}

async function daily(title: string, body: string, hour: number, minute: number) {
  await Notifications.scheduleNotificationAsync({
    content: { title: tr(title), body: tr(body) },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId: CHANNEL },
  });
}


// Rota los mensajes un día a la vez para que no se repitan siempre.
const rotate = (list: string[], seed: number) => list[((seed % list.length) + list.length) % list.length];
const dayNum = (d: ISODate) => diffDays(d, '2024-01-01');

// iOS permite unas 64 notificaciones pendientes: se programan 20 días y se renuevan al abrir la app.
const PILL_DAYS = 20;
const LATE_MINUTES = 60;

export async function rescheduleAll(data: AppData, summary: Summary): Promise<void> {
  if (!notificationsSupported || !data.settings.onboarded) return;
  const perm = await Notifications.getPermissionsAsync();
  if (!perm.granted) return;
  await Notifications.cancelAllScheduledNotificationsAsync();

  const { settings } = data;
  const r = settings.reminders;
  const t = today();
  // Modo discreto: en la pantalla bloqueada no se lee "pastilla" ni "período".
  const msg = (title: string, body: string): [string, string] => (settings.discreet ? ['Savia', 'Tienes un recordatorio en tu app.'] : [title, body]);

  // Pastilla (blíster digital): a la hora del blíster, con el botón "Ya la tomé"; si no se marcó, otro aviso
  // una hora después. Salta los días de descanso y los ya marcados. Al marcarla, el segundo aviso se cancela.
  const b = settings.pillMode ? data.blister : null;
  if (b && r.pill.on) {
    await registrarAccionesPastilla(tr('Ya la tomé'), tr('Listo'));
    const categoria = settings.discreet ? CATEGORIA_DISCRETA : CATEGORIA_PASTILLA;
    const [h, m] = b.hora.split(':').map(Number);
    for (let i = 0; i < PILL_DAYS; i++) {
      const d = addDays(t, i);
      if (!tocaTomar(b, d) || data.tomasPastilla[d]) continue;
      const when = at(d, h, m);
      const datos = { tipo: 'pastilla', fecha: d };
      await once(...msg('Pastilla', rotate(NOTIF.pastilla, dayNum(d))), when, { id: idRecordatorio(d), categoria, data: datos, exacta: true });
      await once(...msg('Pastilla', NOTIF.pastillaAtrasada), new Date(when.getTime() + LATE_MINUTES * 60000), { id: idSegundoAviso(d), categoria, data: datos, exacta: true });
    }
  }

  // Blíster: aviso el día antes del blíster nuevo y de los días sin hormona.
  if (b && r.pack.on) {
    const e = esquema(b);
    const conDescanso = e.inactivas > 0 && e.inactiva === 'descanso';
    await once(...msg('Blíster', conDescanso ? NOTIF.blisterTrasDescanso : NOTIF.blisterNuevo), at(addDays(diaDelBlister(b, t).siguienteInicio, -1), r.pack.hour));
    const pausa = proximaPausa(b, t);
    if (pausa && !pausa.ahora) {
      await once(...msg('Blíster', conDescanso ? NOTIF.descansoSinPastilla : NOTIF.descansoPlacebo), at(addDays(pausa.desde, -1), r.pack.hour));
    }
  }

  // Período próximo (en embarazo, posparto y menopausia no se predice).
  if (r.period.on && !['posparto', 'embarazo', 'meno'].includes(settings.etapa) && summary.nextStart && summary.lateDays === 0) {
    const d = addDays(summary.nextStart, -r.period.daysBefore);
    const body = r.period.daysBefore === 1 ? NOTIF.periodoManana : fill(rotate(NOTIF.periodo, dayNum(d)), r.period.daysBefore);
    await once(...msg('Tu ciclo', body), at(d, r.period.hour));
  }

  // Agua: un mensaje distinto para cada hora.
  if (r.water.on) {
    for (const [i, h] of r.water.hours.entries()) await daily('Agua', rotate(NOTIF.agua, i), h, 0);
  }

  // Empujoncito diario para registrar el día.
  if (r.registro.on) await daily(...msg('Tu día', NOTIF.registro), r.registro.hour, r.registro.minute);

  // Autoexamen de mamas: unos días después del período.
  if (r.autoexamen.on) {
    await once(...msg('Autoexamen', NOTIF.autoexamen), at(proximoAutoexamen(data, summary), r.autoexamen.hour));
  }

  // Controles médicos: aviso unos días antes.
  if (r.controles.on) {
    for (const ctl of data.controles.filter((x) => x.fecha)) {
      await once(...msg('Control', fill(NOTIF.control, r.controles.daysBefore).replace('{control}', tr(ctl.titulo))), at(addDays(ctl.fecha, -r.controles.daysBefore), r.controles.hour));
    }
  }

  // Respaldo: recordatorio suave cada 30 días.
  const firstLog = Object.keys(data.logs).sort()[0] ?? t;
  let backupDay = addDays(settings.lastBackup ?? firstLog, 30);
  if (backupDay <= t) backupDay = addDays(t, 1);
  await once('Respaldo', rotate(NOTIF.respaldo, dayNum(backupDay)), at(backupDay, 12));
}
