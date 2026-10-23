// Android: Health Connect. Ahí sincronizan Samsung Health, Google Fit, Fitbit, Xiaomi, Oura y otras apps,
// así que con un solo permiso se leen los datos del reloj que use cada una. Solo lectura.
import {
  aggregateGroupByPeriod,
  getSdkStatus,
  initialize,
  openHealthConnectSettings,
  readRecords,
  requestPermission,
  SdkAvailabilityStatus,
  SleepStageType,
  type RecordType,
} from 'react-native-health-connect';
import { Acumulador, diaDe, finDia, inicioDia, type FuenteSalud } from './fuentesSalud.comun';
import type { ISODate } from './types';

export type { EstadoFuente, FuenteSalud } from './fuentesSalud.comun';

const TIPOS: RecordType[] = ['Steps', 'HeartRate', 'RestingHeartRate', 'HeartRateVariabilityRmssd', 'SleepSession', 'SkinTemperature', 'BasalBodyTemperature'];

async function listo(): Promise<boolean> {
  try {
    return (await getSdkStatus()) === SdkAvailabilityStatus.SDK_AVAILABLE && (await initialize());
  } catch {
    return false;
  }
}

// Lee todas las páginas de un tipo de registro.
async function todos<T extends RecordType>(tipo: T, desde: ISODate, hasta: ISODate) {
  const filtro = { operator: 'between' as const, startTime: inicioDia(desde).toISOString(), endTime: finDia(hasta).toISOString() };
  const out = [];
  let pageToken: string | undefined;
  do {
    const r = await readRecords(tipo, { timeRangeFilter: filtro, pageSize: 1000, pageToken });
    out.push(...r.records);
    pageToken = r.pageToken || undefined;
  } while (pageToken);
  return out;
}

// Sin permiso para un tipo, Health Connect lanza un error: ese tipo se salta.
const seguro = async <T,>(f: () => Promise<T[]>): Promise<T[]> => {
  try {
    return await f();
  } catch {
    return [];
  }
};

export const fuenteSalud: FuenteSalud = {
  fuente: 'healthconnect',
  nombre: 'Health Connect',

  estado: async () => {
    try {
      const s = await getSdkStatus();
      if (s === SdkAvailabilityStatus.SDK_AVAILABLE) return 'disponible';
      if (s === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) return 'instalar';
      return 'no';
    } catch {
      return 'no';
    }
  },

  conectar: async () => {
    if (!(await listo())) return false;
    const dados = await requestPermission([
      ...TIPOS.map((recordType) => ({ accessType: 'read' as const, recordType })),
      { accessType: 'read', recordType: 'ReadHealthDataHistory' },
    ]);
    return dados.length > 0;
  },

  leer: async (desde, hasta) => {
    if (!(await listo())) return {};
    const acc = new Acumulador();
    const filtro = { operator: 'between' as const, startTime: inicioDia(desde).toISOString(), endTime: finDia(hasta).toISOString() };
    const porDia = { period: 'DAYS' as const, length: 1 };

    // Pasos y pulso: agregados por día (Health Connect quita duplicados entre teléfono y reloj).
    for (const g of await seguro(() => aggregateGroupByPeriod({ recordType: 'Steps', timeRangeFilter: filtro, timeRangeSlicer: porDia }))) {
      if (g.result.COUNT_TOTAL) acc.agregar(diaDe(g.startTime), 'pasos', g.result.COUNT_TOTAL);
    }
    for (const g of await seguro(() => aggregateGroupByPeriod({ recordType: 'HeartRate', timeRangeFilter: filtro, timeRangeSlicer: porDia }))) {
      if (g.result.BPM_AVG) acc.agregar(diaDe(g.startTime), 'fcMedia', g.result.BPM_AVG);
    }
    for (const r of await seguro(() => todos('RestingHeartRate', desde, hasta))) acc.agregar(diaDe(r.time), 'fcReposo', r.beatsPerMinute);
    for (const r of await seguro(() => todos('HeartRateVariabilityRmssd', desde, hasta))) acc.agregar(diaDe(r.time), 'vfc', r.heartRateVariabilityMillis);

    // Sueño: minutos dormidos (sin despierta ni fuera de la cama), para el día en que se despierta.
    for (const r of await seguro(() => todos('SleepSession', desde, hasta))) {
      const etapas = r.stages ?? [];
      const despierta: number[] = [SleepStageType.AWAKE, SleepStageType.OUT_OF_BED];
      const min = etapas.length
        ? etapas.filter((e) => !despierta.includes(e.stage)).reduce((a, e) => a + (Date.parse(e.endTime) - Date.parse(e.startTime)) / 60000, 0)
        : (Date.parse(r.endTime) - Date.parse(r.startTime)) / 60000;
      acc.agregar(diaDe(r.endTime), 'sueno', min);
    }

    // Temperatura de la piel al dormir (Galaxy Watch, Pixel Watch, Fitbit, Oura): ya viene como desvío.
    for (const r of await seguro(() => todos('SkinTemperature', desde, hasta))) {
      const ds = r.deltas.map((d) => d.delta.inCelsius).filter((x) => Number.isFinite(x));
      if (ds.length) acc.agregar(diaDe(r.endTime), 'tempPiel', ds.reduce((a, b) => a + b, 0) / ds.length);
    }
    for (const r of await seguro(() => todos('BasalBodyTemperature', desde, hasta))) acc.agregar(diaDe(r.time), 'tempBasal', r.temperature.inCelsius);

    // El sueño de varias sesiones (siesta + noche) se suma; lo demás se promedia.
    return acc.resultado(['pasos', 'sueno']);
  },

  abrirAjustes: () => openHealthConnectSettings(),
};
