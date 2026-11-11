// Llave de cifrado del respaldo en la nube, solo en memoria: al cerrar la app se pierde y hay que volver a poner la
// frase. Así la clave nunca queda escrita en el teléfono ni viaja a ningún servidor.
import type { Llave } from './cifrado';

let actual: Llave | null = null;

export const hayLlave = (): boolean => actual !== null;
export const getLlave = (): Llave | null => actual;
export function setLlave(l: Llave | null): void {
  actual = l;
}
