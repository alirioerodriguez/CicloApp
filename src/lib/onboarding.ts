// Bienvenida: qué pasos ve cada una y con qué modo arranca la app. Lógica pura, para poder probarla.
// Ciclo se bifurca en la pregunta de la pastilla: con pastilla no hay período que predecir, así que se
// saltan «¿Cuándo empezó tu último período?» y «¿Cada cuántos días te viene?» (el alta baja de 6 a 4 pasos).
// La entrada es doble (Llevo mi ciclo / Tomo pastilla) con las otras etapas detrás de un enlace: si ya eligió
// ahí, no se le vuelve a preguntar por la pastilla.
import { CONDICIONES_ESPECIAL } from '../content/etapas';
import { addDays } from './dates';
import { conRegularidad, type Regularidad } from './regularidad';
import type { Anticonceptivo, Condicion, Etapa, ISODate, Settings } from './types';

export type Paso = 'bienvenida' | 'cuenta' | 'periodo' | 'duracion' | 'pastilla' | 'especial' | 'ttc' | 'embarazo' | 'posparto' | 'meno' | 'listo';

const FLUJOS: Record<Etapa, Paso[]> = {
  ciclo: ['bienvenida', 'cuenta', 'pastilla', 'periodo', 'duracion', 'listo'],
  especial: ['bienvenida', 'cuenta', 'periodo', 'especial', 'listo'],
  ttc: ['bienvenida', 'cuenta', 'periodo', 'duracion', 'ttc', 'listo'],
  embarazo: ['bienvenida', 'cuenta', 'embarazo', 'listo'],
  posparto: ['bienvenida', 'cuenta', 'posparto', 'listo'],
  meno: ['bienvenida', 'cuenta', 'meno', 'listo'],
};

/** Los pasos de la bienvenida según la etapa, lo que contestó sobre la pastilla y si lo eligió en la entrada doble. */
export function flujoOnboarding(etapa: Etapa, anti: Anticonceptivo | null, elegidoAlEntrar = false): Paso[] {
  const f = FLUJOS[etapa] ?? FLUJOS.ciclo;
  if (etapa !== 'ciclo') return f;
  // Con pastilla el paso de la pastilla queda: ahí se arma el blíster
  if (anti === 'pastilla') return f.filter((p) => p !== 'periodo' && p !== 'duracion');
  if (elegidoAlEntrar && anti === 'ninguno') return f.filter((p) => p !== 'pastilla');
  return f;
}

/** Entrada doble: lo que eligió en «Crea tu cuenta», o null si fue a otra etapa o no eligió. */
export type Entrada = 'ciclo' | 'pastilla' | null;
export function entradaElegida(etapa: Etapa, anti: Anticonceptivo | null): Entrada {
  if (etapa !== 'ciclo') return null;
  return anti === 'pastilla' ? 'pastilla' : anti === 'ninguno' ? 'ciclo' : null;
}

/** Blíster en dos datos: con el número de pastilla de hoy se sabe qué día empezó (la 1 es hoy). */
export function inicioDesdePastillaDeHoy(numero: number | null, hoy: ISODate): ISODate | null {
  if (numero == null || numero < 1) return null;
  return addDays(hoy, -(Math.floor(numero) - 1));
}

/** El anticonceptivo con el que queda: buscando un embarazo, embarazada o en la menopausia no se usa. */
export function anticonceptivoFinal(etapa: Etapa, anti: Anticonceptivo | null): Anticonceptivo {
  return etapa === 'ttc' || etapa === 'embarazo' || etapa === 'meno' ? 'ninguno' : anti ?? 'ninguno';
}

export interface RespuestasOnboarding {
  name: string;
  edad: number;
  etapa: Etapa;
  anti: Anticonceptivo | null;
  condiciones: Condicion[];
  regularidad: Regularidad | null;
  cycleLength: number;
  periodLength: number;
  pillName: string;
  pillType: Settings['pillType'];
  packStart: Settings['pillPackStart'];
  pillHour: number;
}

/** Los ajustes con los que arranca la app (sin lo de embarazo, posparto, menopausia ni búsqueda, que arma la pantalla). */
export function modoInicial(s0: Settings, r: RespuestasOnboarding, notificaciones: boolean) {
  const anticonceptivo = anticonceptivoFinal(r.etapa, r.anti);
  const pastilla = anticonceptivo === 'pastilla';
  const conPeriodo = r.etapa === 'ciclo' || r.etapa === 'ttc';
  const condiciones = r.etapa === 'especial' ? r.condiciones : conRegularidad(r.condiciones.filter((x) => !CONDICIONES_ESPECIAL.some((k) => k.id === x)), conPeriodo ? r.regularidad : null);
  return {
    onboarded: true,
    name: r.name.trim(),
    edad: r.edad,
    etapa: r.etapa,
    anticonceptivo,
    condiciones,
    cycleLength: r.etapa === 'especial' ? 35 : r.cycleLength,
    periodLength: r.periodLength,
    pillMode: pastilla,
    pillName: r.pillName.trim(),
    pillType: r.pillType,
    pillPackStart: pastilla ? r.packStart : null,
    reminders: {
      ...s0.reminders,
      pill: { on: pastilla && notificaciones, hour: r.pillHour, minute: 0 },
      // Con pastilla el aviso que sirve es el del blíster, no el del período
      period: { ...s0.reminders.period, on: notificaciones && conPeriodo && !pastilla },
      pack: { ...s0.reminders.pack, on: pastilla && notificaciones },
    },
  } satisfies Partial<Settings>;
}
