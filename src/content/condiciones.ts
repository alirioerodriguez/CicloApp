// Situaciones que cambian cómo la app predice y avisa (recomendación de la investigación UX).
import type { Condicion } from '../lib/types';

export const CONDICIONES: { id: Condicion; label: string }[] = [
  { id: 'irregular', label: 'Ciclos irregulares' },
  { id: 'sop', label: 'SOP' },
  { id: 'endometriosis', label: 'Endometriosis' },
  { id: 'tdpm', label: 'TDPM' },
  { id: 'perimenopausia', label: 'Perimenopausia' },
  { id: 'tiroides', label: 'Tiroides' },
];

// Con estas, la fecha del próximo período se muestra como un rango.
export const CONDICIONES_RANGO: Condicion[] = ['irregular', 'sop', 'perimenopausia'];
