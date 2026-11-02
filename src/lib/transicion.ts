// Cambio de etapa desde Perfil: qué se ajusta y qué se le cuenta antes de guardar, con cuidado.
// Lógica pura (se prueba en __tests__/transicion.test.ts). El historial nunca se borra.
import { CONDICIONES_ESPECIAL } from '../content/etapas';
import { fppDesdeSemanas } from '../content/embarazo';
import type { Etapa, ISODate, Settings } from './types';

const SIN_PERIODO: Etapa[] = ['embarazo', 'posparto', 'meno'];
const CON_PERIODO: Etapa[] = ['ciclo', 'especial', 'ttc'];

/** Los ajustes que cambian al pasar a `etapa`. */
export function ajustesDeEtapa(s: Settings, etapa: Etapa, hoy: ISODate): Partial<Settings> {
  const conCond = s.condiciones.some((x) => CONDICIONES_ESPECIAL.some((k) => k.id === x));
  if (etapa === 'especial' && !conCond) return { etapa, condiciones: [...s.condiciones, 'sop'] };
  // Buscando un embarazo o en menopausia no se usa anticonceptivo.
  if (etapa === 'ttc' || etapa === 'meno') return { etapa, anticonceptivo: 'ninguno', pillMode: false };
  // Sin fecha probable de parto, se empieza en la semana 12 y se ajusta en el modo embarazo.
  if (etapa === 'embarazo') return { etapa, anticonceptivo: 'ninguno', pillMode: false, embarazo: s.embarazo.fpp ? s.embarazo : { fpp: fppDesdeSemanas(12) } };
  if (etapa === 'posparto' && !s.posparto.nacimiento) return { etapa, posparto: { ...s.posparto, nacimiento: hoy } };
  return { etapa };
}

export interface Transicion {
  cambios: string[]; // qué va a cambiar, en frases cortas
  registrarPeriodo: boolean; // vuelve a haber período que predecir: conviene registrar cuándo vino
  ofrecerPerdida: boolean; // sale de embarazo sin ir a posparto: se ofrece el camino con más cuidado
}

/** Lo que se le cuenta antes de tocar Guardar. */
export function transicion(s: Settings, etapa: Etapa): Transicion {
  const desde = s.etapa;
  const cambios = ['Tu historial queda guardado: no se borra nada.'];
  if (etapa === desde) return { cambios: [], registrarPeriodo: false, ofrecerPerdida: false };
  if (SIN_PERIODO.includes(etapa) && CON_PERIODO.includes(desde)) cambios.push('Dejamos de predecir tu período y de avisarte atrasos.');
  if (CON_PERIODO.includes(etapa) && SIN_PERIODO.includes(desde)) cambios.push('Vuelve la predicción del período: se va ajustando con lo que registres.');
  if (s.pillMode && (etapa === 'ttc' || etapa === 'embarazo' || etapa === 'meno')) cambios.push('Apagamos los recordatorios de la pastilla y del blíster.');
  if (etapa === 'embarazo') cambios.push('Empezamos en la semana 12; la ajustas en tu modo embarazo.');
  if (etapa === 'posparto') cambios.push('Te acompañamos en tu recuperación y la lactancia.');
  if (etapa === 'meno') cambios.push('Registras calorones, sueño y ánimo en vez del ciclo.');
  if (etapa === 'ttc') cambios.push('Te mostramos tus días fértiles y las señales para buscar embarazo.');
  if (etapa === 'especial' && !s.condiciones.some((x) => CONDICIONES_ESPECIAL.some((k) => k.id === x)))
    cambios.push('Apagamos las alertas de atraso y aceptamos ciclos largos. Puedes elegir tu condición abajo.');
  return {
    cambios,
    registrarPeriodo: CON_PERIODO.includes(etapa) && SIN_PERIODO.includes(desde),
    ofrecerPerdida: desde === 'embarazo' && etapa !== 'posparto',
  };
}
