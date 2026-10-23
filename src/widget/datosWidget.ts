// Datos del widget de inicio (Android): se leen de lo guardado, porque el widget corre sin la app abierta.
// Lógica pura en `resumenWidget` para poder probarla; `leerDatosWidget` busca los datos de la usuaria activa.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CLAVE_ACTIVA, diaDelBlister, encabezado, estadoDelDia, normalizarBlister, normalizarTomas, type EstadoDia } from '../lib/blister';
import { addDays, fromISO, inicialesSemana, today } from '../lib/dates';
import type { ISODate } from '../lib/types';

export interface DiaWidget {
  fecha: ISODate;
  inicial: string;
  numero: number;
  estado: EstadoDia;
  placebo: boolean;
  hoy: boolean;
}

export type ResumenWidget =
  | { activo: false }
  | {
      activo: true;
      tipo: 'activa' | 'placebo' | 'descanso';
      n: number;
      de: number;
      hora: string;
      estadoHoy: EstadoDia;
      horaToma: string | null;
      semana: DiaWidget[]; // la fila de 7 del blíster en la que cae hoy
    };

export function resumenWidget(raw: unknown, hoy: ISODate = today()): ResumenWidget {
  const datos = (raw ?? {}) as { settings?: { pillMode?: boolean }; blister?: unknown; tomasPastilla?: unknown };
  const b = normalizarBlister(datos.blister);
  if (!datos.settings?.pillMode || !b) return { activo: false };
  const tomas = normalizarTomas(datos.tomasPastilla);
  const dia = diaDelBlister(b, hoy);
  const enc = encabezado(b, hoy);
  const fila = Math.floor((dia.numero - 1) / 7);
  const semana: DiaWidget[] = [];
  for (let i = fila * 7; i < Math.min(fila * 7 + 7, dia.total); i++) {
    const fecha = addDays(dia.inicioBlister, i);
    const d = diaDelBlister(b, fecha);
    semana.push({
      fecha,
      inicial: inicialesSemana()[(fromISO(fecha).getDay() + 6) % 7],
      numero: d.numero,
      estado: estadoDelDia(b, tomas, fecha, hoy),
      placebo: d.alveolo === 'placebo',
      hoy: fecha === hoy,
    });
  }
  return { activo: true, ...enc, hora: b.hora, estadoHoy: estadoDelDia(b, tomas, hoy, hoy), horaToma: tomas[hoy]?.hora ?? null, semana };
}

export async function leerDatosWidget(): Promise<ResumenWidget> {
  try {
    const clave = await AsyncStorage.getItem(CLAVE_ACTIVA);
    const raw = clave ? await AsyncStorage.getItem(clave) : null;
    return resumenWidget(raw ? JSON.parse(raw) : null);
  } catch {
    return { activo: false };
  }
}
