// Trae los datos nuevos del reloj o la app de salud y los suma a los de la usuaria.
// Se llama al abrir la app (como mucho cada 3 horas) y con el botón "Sincronizar ahora".
import { today } from './dates';
import { fuenteSalud } from './fuentesSalud';
import { fusionarDias, rangoALeer } from './reloj';
import type { AppData } from './types';

const CADA_MS = 3 * 3600 * 1000;

export async function sincronizarReloj(data: AppData, update: (fn: (d: AppData) => AppData) => void, forzar = false): Promise<number> {
  const r = data.reloj;
  if (!r.fuente || r.fuente !== fuenteSalud.fuente) return 0;
  if (!forzar && r.ultimaSync && Date.now() - Date.parse(r.ultimaSync) < CADA_MS) return 0;
  const { desde, hasta } = rangoALeer(r.ultimaSync, today());
  const nuevos = await fuenteSalud.leer(desde, hasta);
  const ahora = new Date().toISOString();
  update((d) => ({ ...d, reloj: { ...d.reloj, ultimaSync: ahora, dias: fusionarDias(d.reloj.dias, nuevos) } }));
  return Object.keys(nuevos).length;
}
