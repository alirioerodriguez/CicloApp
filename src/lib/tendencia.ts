// Tendencia de los últimos ciclos (Savia+): promedio, rango y si se vienen alargando o acortando.
// Compara el promedio de los 3 últimos ciclos con el de los 3 anteriores. Es descriptiva, no un diagnóstico:
// los avisos para consultar siguen en alertas.ts (umbrales de FIGO).

export type Rumbo = 'alargando' | 'acortando' | 'estable';

export interface Tendencia {
  ciclos: { start: string; length: number }[]; // los que se muestran, del más viejo al más nuevo
  promedio: number;
  rango: [number, number];
  rumbo: Rumbo | null; // null: hacen falta al menos 6 ciclos
  antes: number | null; // promedio de los 3 anteriores
  ahora: number | null; // promedio de los 3 últimos
}

const CAMBIO_DIAS = 3; // diferencia de promedios que ya se nota (criterio práctico)

const prom = (xs: number[]) => Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);

export function tendenciaCiclos(cycles: { start: string; length: number }[], max: number): Tendencia | null {
  const ciclos = cycles.slice(-max);
  if (!ciclos.length) return null;
  const largos = ciclos.map((c) => c.length);
  let rumbo: Rumbo | null = null, antes: number | null = null, ahora: number | null = null;
  if (ciclos.length >= 6) {
    ahora = prom(largos.slice(-3));
    antes = prom(largos.slice(-6, -3));
    rumbo = ahora - antes >= CAMBIO_DIAS ? 'alargando' : antes - ahora >= CAMBIO_DIAS ? 'acortando' : 'estable';
  }
  return { ciclos, promedio: prom(largos), rango: [Math.min(...largos), Math.max(...largos)], rumbo, antes, ahora };
}

export function textoTendencia(t: Tendencia): string {
  const base = `En tus últimos ${t.ciclos.length} ciclos: ${t.promedio} días en promedio, entre ${t.rango[0]} y ${t.rango[1]}.`;
  if (t.rumbo === 'alargando') return `${base} Últimamente se vienen alargando (de unos ${t.antes} a ${t.ahora} días).`;
  if (t.rumbo === 'acortando') return `${base} Últimamente se vienen acortando (de unos ${t.antes} a ${t.ahora} días).`;
  if (t.rumbo === 'estable') return `${base} Se mantienen parecidos.`;
  return base;
}
