// Bienvenida: qué pasos ve cada una y con qué modo arranca la app. Lógica pura, para poder probarla.
// Ciclo se bifurca en la pregunta de la pastilla: con pastilla no hay período que predecir, así que se
// saltan «¿Cuándo empezó tu último período?» y «¿Cada cuántos días te viene?» (el alta baja de 6 a 4 pasos).
import { CONDICIONES_ESPECIAL } from '../content/etapas';
import { conRegularidad, type Regularidad } from './regularidad';
import type { Anticonceptivo, Condicion, Etapa, Settings } from './types';

export type Paso = 'bienvenida' | 'cuenta' | 'periodo' | 'duracion' | 'pastilla' | 'especial' | 'ttc' | 'embarazo' | 'posparto' | 'meno' | 'listo';

const FLUJOS: Record<Etapa, Paso[]> = {
  ciclo: ['bienvenida', 'cuenta', 'pastilla', 'periodo', 'duracion', 'listo'],
  especial: ['bienvenida', 'cuenta', 'periodo', 'especial', 'listo'],
  ttc: ['bienvenida', 'cuenta', 'periodo', 'duracion', 'ttc', 'listo'],
  embarazo: ['bienvenida', 'cuenta', 'embarazo', 'listo'],
  posparto: ['bienvenida', 'cuenta', 'posparto', 'listo'],
  meno: ['bienvenida', 'cuenta', 'meno', 'listo'],
};

/** Los pasos de la bienvenida según la etapa y lo que contestó sobre la pastilla. */
export function flujoOnboarding(etapa: Etapa, anti: Anticonceptivo | null): Paso[] {
  const f = FLUJOS[etapa] ?? FLUJOS.ciclo;
  return etapa === 'ciclo' && anti === 'pastilla' ? f.filter((p) => p !== 'periodo' && p !== 'duracion') : f;
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
