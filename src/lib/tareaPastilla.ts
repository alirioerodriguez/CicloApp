// Botón "Ya la tomé" de la notificación de la pastilla: marca la toma sin abrir la app.
// Equivale al BroadcastReceiver de Android: expo-task-manager carga el JS en segundo plano y corre la tarea.
// Por eso este módulo se importa en index.js, antes que la app (la tarea tiene que existir al arrancar).
// En iPhone esa ruta no existe: allí el botón abre la app y la marca (ver registrarAccionesPastilla).
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { CLAVE_ACTIVA, clasificarToma, normalizarBlister, normalizarTomas } from './blister';
import { nowTime, today } from './dates';
import type { ISODate } from './types';
import { actualizarWidgets } from '../widget/actualizarWidgets';

export const TAREA_PASTILLA = 'savia-pastilla';
export const ACCION_TOMADA = 'ya-la-tome';
export const CATEGORIA_PASTILLA = 'pastilla';
export const CATEGORIA_DISCRETA = 'pastilla-discreta';

export const idRecordatorio = (fecha: ISODate) => `pastilla-${fecha}`;
export const idSegundoAviso = (fecha: ISODate) => `pastilla-tarde-${fecha}`;

// Escribe la toma directo en el almacenamiento (la app puede estar cerrada). Si ya estaba, no la toca.
export async function guardarTomaSinApp(fecha: ISODate, hora: string = nowTime(), hoy: ISODate = today()): Promise<boolean> {
  const clave = await AsyncStorage.getItem(CLAVE_ACTIVA);
  if (!clave) return false;
  const raw = await AsyncStorage.getItem(clave);
  if (!raw) return false;
  const datos = JSON.parse(raw) as Record<string, unknown>;
  const blister = normalizarBlister(datos.blister);
  if (!blister) return false;
  const tomas = normalizarTomas(datos.tomasPastilla);
  if (!tomas[fecha]) {
    tomas[fecha] = { fecha, estado: clasificarToma(blister, hora, fecha, hoy), hora };
    await AsyncStorage.multiSet([
      [clave, JSON.stringify({ ...datos, tomasPastilla: tomas })],
      [`${clave}:updatedAt`, new Date().toISOString()],
    ]);
  }
  // Ya no hace falta el segundo aviso de ese día, y el widget muestra el check.
  await Notifications.cancelScheduledNotificationAsync(idSegundoAviso(fecha)).catch(() => {});
  await actualizarWidgets();
  return true;
}

// Fecha de la toma que trae la notificación (data.fecha) o, si falta, hoy.
export function fechaDeRespuesta(r: Notifications.NotificationResponse): ISODate | null {
  const f = r.notification.request.content.data?.fecha;
  return typeof f === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(f) ? f : null;
}

// Categorías con el botón: una normal y otra para el modo discreto (no dice "pastilla" en la pantalla bloqueada).
export async function registrarAccionesPastilla(boton: string, botonDiscreto: string) {
  const opciones = { opensAppToForeground: Platform.OS === 'ios' };
  await Notifications.setNotificationCategoryAsync(CATEGORIA_PASTILLA, [{ identifier: ACCION_TOMADA, buttonTitle: boton, options: opciones }]);
  await Notifications.setNotificationCategoryAsync(CATEGORIA_DISCRETA, [{ identifier: ACCION_TOMADA, buttonTitle: botonDiscreto, options: opciones }]);
}

if (Platform.OS !== 'web') {
  TaskManager.defineTask<Notifications.NotificationTaskPayload>(TAREA_PASTILLA, async ({ data }) => {
    if (!data || !('actionIdentifier' in data) || data.actionIdentifier !== ACCION_TOMADA) return Notifications.BackgroundNotificationTaskResult.NoData;
    const fecha = fechaDeRespuesta(data);
    if (!fecha) return Notifications.BackgroundNotificationTaskResult.NoData;
    await guardarTomaSinApp(fecha);
    await Notifications.dismissNotificationAsync(data.notification.request.identifier).catch(() => {});
    return Notifications.BackgroundNotificationTaskResult.NewData;
  });
  Notifications.registerTaskAsync(TAREA_PASTILLA).catch(() => {});
}
