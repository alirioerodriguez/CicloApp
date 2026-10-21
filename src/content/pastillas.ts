// Marcas conocidas para autocompletar el esquema. La misma marca puede venir distinta
// según el país, por eso la app siempre pide confirmarlo en el blíster.
// Fuentes: [16] [29] [45]–[50]. Para agregar una marca, verifica su esquema en el prospecto.
import type { PillType } from '../lib/types';

export const MARCAS: { nombre: string; esquema: PillType }[] = [
  { nombre: 'Yaz', esquema: '24-4' },
  { nombre: 'Yasmin', esquema: '21-7' },
  { nombre: 'Microgynon 30', esquema: '21-7' },
  { nombre: 'Microgynon 30 ED', esquema: '21-7p' },
  { nombre: 'Belara', esquema: '21-7' },
  { nombre: 'Belara diario', esquema: '21-7p' },
  { nombre: 'Qlaira', esquema: '26-2' },
  { nombre: 'Slinda', esquema: 'pop-24-4' },
  { nombre: 'Cerazette', esquema: 'pop' },
];

export const RESTA_EFECTO =
  'Vómitos, diarrea fuerte, algunos medicamentos (como rifampicina, algunos anticonvulsivos o tratamientos para el VIH) y la hierba de San Juan pueden restarle efecto a tu pastilla. Los antibióticos comunes no suelen afectarla. Revisa el prospecto.';
