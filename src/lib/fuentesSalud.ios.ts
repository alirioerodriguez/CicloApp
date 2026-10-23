// iPhone: Apple Salud (HealthKit). Ahí guardan sus datos el Apple Watch, Oura, Garmin y otras apps.
// Solo lectura. La temperatura de la muñeca al dormir necesita Apple Watch Series 8 / Ultra o más nuevo.
import {
  isHealthDataAvailable,
  queryCategorySamples,
  queryQuantitySamples,
  queryStatisticsCollectionForQuantity,
  requestAuthorization,
} from '@kingstinct/react-native-healthkit';
import { Linking } from 'react-native';
import { desviosDesdeAbsolutos } from './reloj';
import { Acumulador, diaDe, finDia, inicioDia, type FuenteSalud } from './fuentesSalud.comun';
import type { ISODate } from './types';

export type { EstadoFuente, FuenteSalud } from './fuentesSalud.comun';

const PASOS = 'HKQuantityTypeIdentifierStepCount';
const FC = 'HKQuantityTypeIdentifierHeartRate';
const FC_REPOSO = 'HKQuantityTypeIdentifierRestingHeartRate';
const VFC = 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN';
const MUNECA = 'HKQuantityTypeIdentifierAppleSleepingWristTemperature';
const BASAL = 'HKQuantityTypeIdentifierBasalBodyTemperature';
const SUENO = 'HKCategoryTypeIdentifierSleepAnalysis';

// Valores de sueño de Apple: 0 en cama, 1 dormida (sin detalle), 2 despierta, 3 central, 4 profundo, 5 REM.
const DORMIDA = [1, 3, 4, 5];

const seguro = async <T,>(f: () => Promise<readonly T[]>): Promise<readonly T[]> => {
  try {
    return await f();
  } catch {
    return [];
  }
};

type ConFuente = { sourceRevision?: { source?: { bundleIdentifier?: string } } };

export const fuenteSalud: FuenteSalud = {
  fuente: 'apple',
  nombre: 'Apple Salud',

  estado: async () => (isHealthDataAvailable() ? 'disponible' : 'no'),

  // Apple no dice qué permisos se negaron (por privacidad): si alguno falta, ese dato simplemente no llega.
  conectar: async () => requestAuthorization({ toRead: [PASOS, FC, FC_REPOSO, VFC, MUNECA, BASAL, SUENO] }),

  leer: async (desde: ISODate, hasta: ISODate) => {
    const acc = new Acumulador();
    const filter = { date: { startDate: inicioDia(desde), endDate: finDia(hasta) } };

    // Pasos por día sin duplicar entre iPhone y reloj; pulso promedio del día.
    for (const r of await seguro(() => queryStatisticsCollectionForQuantity(PASOS, ['cumulativeSum'], inicioDia(desde), { day: 1 }, { filter, unit: 'count' }))) {
      if (r.startDate && r.sumQuantity?.quantity) acc.agregar(diaDe(r.startDate), 'pasos', r.sumQuantity.quantity);
    }
    for (const r of await seguro(() => queryStatisticsCollectionForQuantity(FC, ['discreteAverage'], inicioDia(desde), { day: 1 }, { filter, unit: 'count/min' }))) {
      if (r.startDate && r.averageQuantity?.quantity) acc.agregar(diaDe(r.startDate), 'fcMedia', r.averageQuantity.quantity);
    }
    for (const s of await seguro(() => queryQuantitySamples(FC_REPOSO, { limit: 0, filter, unit: 'count/min' }))) acc.agregar(diaDe(s.startDate), 'fcReposo', s.quantity);
    for (const s of await seguro(() => queryQuantitySamples(VFC, { limit: 0, filter, unit: 'ms' }))) acc.agregar(diaDe(s.startDate), 'vfc', s.quantity);
    for (const s of await seguro(() => queryQuantitySamples(BASAL, { limit: 0, filter, unit: 'degC' }))) acc.agregar(diaDe(s.startDate), 'tempBasal', s.quantity);

    // Sueño: el iPhone y el reloj pueden registrar la misma noche; se toma la fuente con más minutos.
    const porFuente: Record<string, Record<ISODate, number>> = {};
    for (const s of await seguro(() => queryCategorySamples(SUENO, { limit: 0, filter }))) {
      if (!DORMIDA.includes(Number(s.value))) continue;
      const f = (s as unknown as ConFuente).sourceRevision?.source?.bundleIdentifier ?? 'x';
      const dia = diaDe(s.endDate);
      const m = (porFuente[f] ??= {});
      m[dia] = (m[dia] ?? 0) + (s.endDate.getTime() - s.startDate.getTime()) / 60000;
    }
    const sueno: Record<ISODate, number> = {};
    for (const m of Object.values(porFuente)) for (const [d, min] of Object.entries(m)) sueno[d] = Math.max(sueno[d] ?? 0, min);
    for (const [d, min] of Object.entries(sueno)) acc.agregar(d, 'sueno', min);

    // Temperatura de la muñeca: Apple la da en °C; se pasa a desvío sobre su propia línea base.
    const abs: Record<ISODate, number> = {};
    for (const s of await seguro(() => queryQuantitySamples(MUNECA, { limit: 0, filter, unit: 'degC' }))) abs[diaDe(s.endDate)] = s.quantity;
    for (const [d, v] of Object.entries(desviosDesdeAbsolutos(abs))) acc.agregar(d, 'tempPiel', v);

    return acc.resultado(['pasos', 'sueno']);
  },

  // Los permisos de Salud se cambian en Ajustes del iPhone › Salud › Acceso a datos.
  abrirAjustes: () => {
    Linking.openURL('x-apple-health://').catch(() => Linking.openSettings());
  },
};
