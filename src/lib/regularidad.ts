import type { Condicion } from './types';

// Pregunta rápida del onboarding («¿tu ciclo es parecido cada mes?»): adapta las primeras predicciones sin sumar un modo nuevo.
// «Cambia bastante» y «SOP» hacen que la fecha del próximo período se muestre como un rango (ver CONDICIONES_RANGO).
export type Regularidad = 'igual' | 'cambia' | 'sop' | 'noSe';

export const REGULARIDAD: { id: Regularidad; label: string }[] = [
  { id: 'igual', label: 'Casi siempre igual' },
  { id: 'cambia', label: 'Cambia bastante' },
  { id: 'sop', label: 'Tengo SOP' },
  { id: 'noSe', label: 'No sé' },
];

/** Las condiciones que se agregan según la respuesta. «Casi siempre igual» y «No sé» no agregan nada. */
export function condicionesDeRegularidad(r: Regularidad | null): Condicion[] {
  if (r === 'cambia') return ['irregular'];
  if (r === 'sop') return ['sop'];
  return [];
}

/** Suma las condiciones de la respuesta a las que ya había, sin repetir. */
export function conRegularidad(actuales: Condicion[], r: Regularidad | null): Condicion[] {
  return [...new Set([...actuales, ...condicionesDeRegularidad(r)])];
}
