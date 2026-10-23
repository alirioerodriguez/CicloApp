// En la web no hay acceso a Apple Salud ni a Health Connect: solo se ven los datos que ya trajo el teléfono.
// En iPhone y Android Metro usa fuentesSalud.ios.ts y fuentesSalud.android.ts.
import type { FuenteSalud } from './fuentesSalud.comun';

export type { EstadoFuente, FuenteSalud } from './fuentesSalud.comun';

export const fuenteSalud: FuenteSalud = {
  fuente: null,
  nombre: '',
  estado: async () => 'no',
  conectar: async () => false,
  leer: async () => ({}),
  abrirAjustes: () => {},
};
