// Datos del modo embarazo: semana actual, cosas marcadas como listas, patadas y medidas.
import { semanasEmbarazo } from '../content/embarazo';
import { today } from './dates';
import { useStore } from './store';
import type { DatosEmbarazo, ISODate } from './types';

const SIN_MEDIDA = { kg: null, sys: null, dia: null };

export function useEmbarazo() {
  const { data, update } = useStore();
  const e = data.embarazo;
  const semana = semanasEmbarazo(data.settings.embarazo.fpp);
  const cambiar = (fn: (e: DatosEmbarazo) => DatosEmbarazo) => update((d) => ({ ...d, embarazo: fn(d.embarazo) }));

  return {
    semana,
    fpp: data.settings.embarazo.fpp,
    datos: e,
    hecho: (id: string) => e.hechos.includes(id),
    alternar: (id: string) => cambiar((x) => ({ ...x, hechos: x.hechos.includes(id) ? x.hechos.filter((h) => h !== id) : [...x.hechos, id] })),
    guardarPatadas: (n: number, segundos: number, fecha: ISODate = today()) => cambiar((x) => ({ ...x, patadas: { ...x.patadas, [fecha]: { n, segundos } } })),
    guardarMedida: (patch: Partial<DatosEmbarazo['medidas'][ISODate]>, fecha: ISODate = today()) =>
      cambiar((x) => ({ ...x, medidas: { ...x.medidas, [fecha]: { ...(x.medidas[fecha] ?? SIN_MEDIDA), ...patch } } })),
  };
}
