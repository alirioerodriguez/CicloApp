import { etapaById } from '../content/etapas';
import type { Etapa } from './types';

/** Texto del chip de «Hoy»: dice en qué modo está la usuaria y dónde viven sus datos, en una línea. */
export function textoEtapa(etapa: Etapa, conCuenta: boolean): { etapa: string; datos: string; emoji: string } {
  const e = etapaById(etapa);
  return { emoji: e.emoji, etapa: e.label, datos: conCuenta ? 'Con copia en tu cuenta' : 'Datos en este teléfono' };
}
