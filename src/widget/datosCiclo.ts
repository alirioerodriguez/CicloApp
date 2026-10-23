// Datos de los widgets del ciclo (Android): cuenta regresiva al período y el ciclo de hoy.
// Se leen de lo guardado porque el widget corre sin la app abierta. Lógica pura en `resumenCiclo`.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { semanasEmbarazo } from '../content/embarazo';
import { semanasPosparto } from '../content/posparto';
import { CLAVE_ACTIVA, diaDelBlister, proximaPausa } from '../lib/blister';
import { sinAtrasos, summarize } from '../lib/cycle';
import { addDays, diffDays, today } from '../lib/dates';
import { normalize } from '../lib/store';
import type { ISODate, Phase } from '../lib/types';

export type MarcaDia = 'periodo' | 'fertil' | 'nada';

export type ResumenCiclo =
  | { tipo: 'vacio' }
  | { tipo: 'meno' }
  | { tipo: 'embarazo'; semana: number; faltan: number | null }
  | { tipo: 'posparto'; semana: number }
  | { tipo: 'pastilla'; discreto: boolean; enPausa: boolean; diasParaPausa: number | null; dia: number; de: number }
  | {
      tipo: 'ciclo';
      discreto: boolean;
      dia: number;
      fase: Phase | null;
      enPeriodo: boolean;
      diasPara: number | null; // días al próximo período (0 = hoy o ya en la ventana)
      fecha: ISODate | null;
      rango: [ISODate, ISODate] | null; // ciclos irregulares
      atraso: number; // solo si ella quiere ver atrasos
      fertil: [ISODate, ISODate] | null;
      marcas: MarcaDia[]; // un elemento por día del ciclo actual
    };

export function resumenCiclo(raw: unknown, hoy: ISODate = today()): ResumenCiclo {
  if (!raw) return { tipo: 'vacio' };
  const data = normalize(raw);
  const st = data.settings;
  if (!st.onboarded || st.soloPareja) return { tipo: 'vacio' };
  if (st.etapa === 'meno') return { tipo: 'meno' };
  if (st.etapa === 'embarazo') return { tipo: 'embarazo', semana: semanasEmbarazo(st.embarazo.fpp, hoy), faltan: st.embarazo.fpp ? Math.max(0, diffDays(st.embarazo.fpp, hoy)) : null };
  if (st.etapa === 'posparto') return { tipo: 'posparto', semana: semanasPosparto(st.posparto, hoy) };

  // Con pastilla no hay período que predecir: se cuenta hacia los días sin hormona del blíster.
  if (st.pillMode && data.blister) {
    const p = proximaPausa(data.blister, hoy);
    const d = diaDelBlister(data.blister, hoy);
    return { tipo: 'pastilla', discreto: st.discreet, enPausa: !!p?.ahora, diasParaPausa: p && !p.ahora ? diffDays(p.desde, hoy) : null, dia: d.numero, de: d.total };
  }

  const s = summarize(data, hoy);
  if (!s.lastStart || s.cycleDay == null) return { tipo: 'vacio' };
  const sinAviso = sinAtrasos(st) || (s.ventana != null && s.ventana[1] >= hoy);
  const total = Math.min(45, Math.max(s.avgCycle, s.cycleDay));
  const marcas: MarcaDia[] = [];
  for (let i = 0; i < total; i++) {
    const d = addDays(s.lastStart, i);
    marcas.push(i < s.avgPeriod ? 'periodo' : s.fertileStart && s.fertileEnd && d >= s.fertileStart && d <= s.fertileEnd ? 'fertil' : 'nada');
  }
  return {
    tipo: 'ciclo',
    discreto: st.discreet,
    dia: s.cycleDay,
    fase: s.phase,
    enPeriodo: s.inPeriod,
    diasPara: s.daysToNext == null ? null : Math.max(0, s.daysToNext),
    fecha: s.nextStart,
    rango: s.ventana,
    atraso: sinAviso ? 0 : s.lateDays,
    fertil: s.fertileStart && s.fertileEnd && s.fertileEnd >= hoy ? [s.fertileStart, s.fertileEnd] : null,
    marcas,
  };
}

export async function leerDatosCiclo(): Promise<ResumenCiclo> {
  try {
    const clave = await AsyncStorage.getItem(CLAVE_ACTIVA);
    const raw = clave ? await AsyncStorage.getItem(clave) : null;
    return resumenCiclo(raw ? JSON.parse(raw) : null);
  } catch {
    return { tipo: 'vacio' };
  }
}
