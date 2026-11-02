import { etapaById } from '../content/etapas';
import type { Etapa } from './types';

/** Texto del chip de «Hoy»: dice en qué modo está la usuaria y dónde viven sus datos, en una línea. */
export function textoEtapa(etapa: Etapa, conCuenta: boolean, pastilla = false): { etapa: string; datos: string; emoji: string } {
  const e = etapaById(etapa);
  const datos = conCuenta ? 'Con copia en tu cuenta' : 'Datos en este teléfono';
  // Con pastilla, «Hoy» gira alrededor del blíster: el chip lo dice para que no parezca el modo ciclo
  if (pastilla && (etapa === 'ciclo' || etapa === 'especial')) return { emoji: '💊', etapa: 'Ciclo con pastilla', datos };
  return { emoji: e.emoji, etapa: e.label, datos };
}
