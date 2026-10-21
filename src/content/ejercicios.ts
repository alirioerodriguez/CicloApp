// Ejercicios con animación y repeticiones recomendadas. Editable.
// Movimiento general de bienestar: el ejercicio regular ayuda con el dolor menstrual [4]
// y la meta general es ~150 min de actividad moderada a la semana [7].
// Las "fases" solo ordenan sugerencias: si tienes energía o no, haz caso a tu cuerpo.
import type { Phase } from '../lib/types';

type P = [number, number];

// Coordenadas en un lienzo de 200×200 (suelo en y = 185).
// Ángulos de brazos: 0° = hacia abajo, 90° = adelante/derecha, 180° = arriba. [brazo, antebrazo].
// torso: 0° = derecho, positivo = inclinado hacia adelante/derecha, -90° = acostada boca arriba.
export interface Pose {
  hip: P;
  torso: number;
  head?: number;
  armF: [number, number];
  armB: [number, number];
  footF: P;
  footB: P;
}

type Bend = 'front' | 'back' | 'up' | 'down' | 'out';

export interface Ejercicio {
  id: string;
  nombre: string;
  emoji: string;
  dosis: string; // la recomendación de repeticiones que se muestra
  series: number;
  reps?: number; // repeticiones por serie
  segundos?: number; // para ejercicios de mantener
  segundosPorRep: number;
  sostener?: boolean;
  frontal?: boolean;
  intensidad: 'suave' | 'moderada' | 'activa';
  pasos: string[];
  porque: string;
  ojo?: string;
  a: Pose;
  b: Pose;
  bendF: Bend;
  bendB: Bend;
}

const DE_PIE: Pose = { hip: [100, 107], torso: 0, armF: [8, 4], armB: [-8, -4], footF: [100, 185], footB: [100, 185] };
const MANOS_CADERA: [number, number] = [-35, 55];

export const EJERCICIOS: Ejercicio[] = [
  {
    id: 'rodillas-pecho',
    nombre: 'Rodillas al pecho',
    emoji: '🤍',
    dosis: 'Mantén 20 segundos · 3 veces',
    series: 3,
    segundos: 20,
    segundosPorRep: 3,
    sostener: true,
    intensidad: 'suave',
    pasos: ['Acuéstate boca arriba.', 'Lleva las rodillas al pecho y abrázalas.', 'Respira lento; puedes mecerte suave de lado a lado.'],
    porque: 'Relaja la espalda baja y la zona pélvica cuando hay cólicos.',
    a: { hip: [112, 175], torso: -90, armF: [90, 90], armB: [90, 90], footF: [188, 180], footB: [186, 181] },
    b: { hip: [112, 175], torso: -90, armF: [150, 110], armB: [145, 105], footF: [122, 140], footB: [120, 142] },
    bendF: 'up',
    bendB: 'up',
  },
  {
    id: 'gato-vaca',
    nombre: 'Gato y vaca',
    emoji: '🐈',
    dosis: '8 a 10 veces, al ritmo de tu respiración',
    series: 1,
    reps: 10,
    segundosPorRep: 5,
    intensidad: 'suave',
    pasos: ['Apoya manos y rodillas, con las manos bajo los hombros.', 'Al exhalar, redondea la espalda y mira hacia el ombligo.', 'Al inhalar, baja el abdomen y mira al frente.'],
    porque: 'Moviliza la columna y la pelvis con suavidad; muchas lo usan para aliviar la tensión lumbar.',
    a: { hip: [78, 145], torso: 64, head: 45, armF: [0, 0], armB: [0, 0], footF: [40, 185], footB: [38, 185] },
    b: { hip: [78, 148], torso: 76, head: -30, armF: [0, 0], armB: [0, 0], footF: [40, 185], footB: [38, 185] },
    bendF: 'down',
    bendB: 'down',
  },
  {
    id: 'puente',
    nombre: 'Puente de glúteos',
    emoji: '🌉',
    dosis: '3 series de 12 repeticiones',
    series: 3,
    reps: 12,
    segundosPorRep: 3,
    intensidad: 'moderada',
    pasos: ['Acuéstate boca arriba con las rodillas dobladas y los pies apoyados.', 'Aprieta los glúteos y sube la cadera hasta formar una línea.', 'Baja despacio sin dejarte caer.'],
    porque: 'Fortalece glúteos y espalda baja, que sostienen la pelvis.',
    a: { hip: [108, 175], torso: -90, armF: [90, 90], armB: [90, 90], footF: [150, 185], footB: [148, 185] },
    b: { hip: [108, 150], torso: -118, armF: [62, 90], armB: [62, 90], footF: [150, 185], footB: [148, 185] },
    bendF: 'up',
    bendB: 'up',
  },
  {
    id: 'sentadilla',
    nombre: 'Sentadillas',
    emoji: '🏋️‍♀️',
    dosis: '3 series de 12 repeticiones',
    series: 3,
    reps: 12,
    segundosPorRep: 3,
    intensidad: 'moderada',
    pasos: ['Pies al ancho de la cadera.', 'Baja como si te sentaras en una silla, con el pecho alto.', 'Sube empujando el piso con los talones.'],
    porque: 'Trabaja piernas y glúteos, y suma a tus minutos de actividad de la semana.',
    ojo: 'Las rodillas siguen la dirección de los pies.',
    a: { ...DE_PIE, armF: [10, 5], armB: [10, 5] },
    b: { hip: [80, 140], torso: 35, armF: [90, 90], armB: [86, 88], footF: [100, 185], footB: [100, 185] },
    bendF: 'front',
    bendB: 'front',
  },
  {
    id: 'zancada',
    nombre: 'Zancadas',
    emoji: '🦵',
    dosis: '3 series de 10 por pierna',
    series: 3,
    reps: 10,
    segundosPorRep: 3,
    intensidad: 'moderada',
    pasos: ['Da un paso largo hacia adelante.', 'Baja hasta que ambas rodillas formen un ángulo recto.', 'Vuelve a subir y cambia de pierna en la siguiente serie.'],
    porque: 'Fortalece piernas y mejora el equilibrio.',
    a: { hip: [100, 115], torso: 0, armF: MANOS_CADERA, armB: MANOS_CADERA, footF: [135, 185], footB: [62, 185] },
    b: { hip: [100, 146], torso: 0, armF: MANOS_CADERA, armB: MANOS_CADERA, footF: [135, 185], footB: [62, 185] },
    bendF: 'front',
    bendB: 'down',
  },
  {
    id: 'tijera',
    nombre: 'Saltos de tijera',
    emoji: '⭐',
    dosis: '3 series de 20 (o sin salto, abriendo una pierna a la vez)',
    series: 3,
    reps: 20,
    segundosPorRep: 1.4,
    frontal: true,
    intensidad: 'activa',
    pasos: ['De pie, brazos abajo.', 'Abre piernas y sube los brazos a la vez.', 'Vuelve al centro. Aterriza suave con las rodillas un poco dobladas.'],
    porque: 'Sube el pulso: buen calentamiento o cardio corto.',
    ojo: 'Calienta antes de moverte rápido.',
    a: { hip: [100, 106], torso: 0, armF: [15, 8], armB: [-15, -8], footF: [106, 185], footB: [94, 185] },
    b: { hip: [100, 108], torso: 0, armF: [155, 165], armB: [-155, -165], footF: [124, 185], footB: [76, 185] },
    bendF: 'out',
    bendB: 'out',
  },
  {
    id: 'marcha',
    nombre: 'Marcha con rodillas altas',
    emoji: '🚶‍♀️',
    dosis: '3 series de 30 segundos',
    series: 3,
    segundos: 30,
    segundosPorRep: 1.6,
    intensidad: 'activa',
    pasos: ['De pie, espalda derecha.', 'Sube una rodilla a la altura de la cadera, luego la otra.', 'Acompaña con los brazos.'],
    porque: 'Activa el cuerpo sin impacto fuerte.',
    a: { hip: [100, 107], torso: 0, armF: [-40, 20], armB: [45, 110], footF: [108, 150], footB: [100, 185] },
    b: { hip: [100, 107], torso: 0, armF: [45, 110], armB: [-40, 20], footF: [100, 185], footB: [108, 150] },
    bendF: 'front',
    bendB: 'front',
  },
  {
    id: 'plancha',
    nombre: 'Plancha de antebrazos',
    emoji: '📏',
    dosis: 'Mantén 20 a 30 segundos · 3 veces',
    series: 3,
    segundos: 25,
    segundosPorRep: 3,
    intensidad: 'moderada',
    pasos: ['Apoya antebrazos y puntas de los pies.', 'Cuerpo en línea recta, abdomen firme.', 'Respira; si es mucho, apoya las rodillas.'],
    porque: 'Fortalece el abdomen profundo, que ayuda a la espalda.',
    a: { hip: [92, 160], torso: 82, armF: [0, 90], armB: [0, 90], footF: [16, 185], footB: [18, 185] },
    b: { hip: [92, 157], torso: 81, armF: [0, 90], armB: [0, 90], footF: [16, 185], footB: [18, 185] },
    bendF: 'down',
    bendB: 'down',
  },
  {
    id: 'lateral',
    nombre: 'Estiramiento lateral',
    emoji: '🌾',
    dosis: '8 por lado, despacio',
    series: 1,
    reps: 8,
    segundosPorRep: 5,
    frontal: true,
    intensidad: 'suave',
    pasos: ['De pie, pies al ancho de la cadera.', 'Sube un brazo e inclínate hacia el lado contrario.', 'Respira en la posición y cambia de lado.'],
    porque: 'Estira los costados y alivia la sensación de hinchazón.',
    a: { hip: [100, 107], torso: -16, armF: [10, 5], armB: [-200, -220], footF: [108, 185], footB: [92, 185] },
    b: { hip: [100, 107], torso: 16, armF: [200, 220], armB: [-10, -5], footF: [108, 185], footB: [92, 185] },
    bendF: 'out',
    bendB: 'out',
  },
  {
    id: 'cadera',
    nombre: 'Círculos de cadera',
    emoji: '⭕',
    dosis: '10 hacia cada lado',
    series: 2,
    reps: 10,
    segundosPorRep: 2.5,
    frontal: true,
    intensidad: 'suave',
    pasos: ['De pie, manos en la cintura y rodillas sueltas.', 'Dibuja círculos amplios con la cadera.', 'Cambia de dirección a la mitad.'],
    porque: 'Moviliza la pelvis y suelta la zona lumbar.',
    a: { hip: [88, 108], torso: 7, armF: [30, -40], armB: [-30, 40], footF: [110, 185], footB: [90, 185] },
    b: { hip: [112, 108], torso: -7, armF: [30, -40], armB: [-30, 40], footF: [110, 185], footB: [90, 185] },
    bendF: 'out',
    bendB: 'out',
  },
  {
    id: 'caminata',
    nombre: 'Caminata suave',
    emoji: '🌿',
    dosis: '20 a 30 minutos, a tu ritmo',
    series: 1,
    segundos: 1200,
    segundosPorRep: 1.4,
    intensidad: 'suave',
    pasos: ['Camina a un ritmo en el que puedas conversar.', 'Hombros sueltos y brazos acompañando.', 'Si es posible, al aire libre.'],
    porque: 'Moverse con suavidad puede aliviar el dolor menstrual y mejorar el ánimo.',
    a: { hip: [100, 110], torso: 4, armF: [-30, -10], armB: [30, 60], footF: [122, 185], footB: [80, 185] },
    b: { hip: [100, 110], torso: 4, armF: [30, 60], armB: [-30, -10], footF: [80, 185], footB: [122, 185] },
    bendF: 'front',
    bendB: 'front',
  },
];

export const POR_FASE: Record<Phase, { intro: string; ids: string[] }> = {
  menstrual: { intro: 'Movimiento suave. Si tienes mucho dolor o cansancio, descansar también vale.', ids: ['rodillas-pecho', 'gato-vaca', 'caminata', 'cadera'] },
  folicular: { intro: 'Muchas sienten más energía: buen momento para fuerza si te provoca.', ids: ['sentadilla', 'zancada', 'puente', 'tijera'] },
  ovulatoria: { intro: 'Si tienes ganas de moverte, aprovecha. Calienta bien antes.', ids: ['tijera', 'marcha', 'sentadilla', 'plancha'] },
  lutea: { intro: 'Bajar la intensidad está bien. Estiramientos y fuerza moderada.', ids: ['puente', 'lateral', 'cadera', 'caminata', 'gato-vaca'] },
  pastilla: { intro: 'Una mezcla para cualquier día. Haz caso a tu energía.', ids: ['sentadilla', 'puente', 'plancha', 'caminata'] },
};

export const SOS_IDS = ['rodillas-pecho', 'gato-vaca', 'cadera'];

export const AVISO_EJERCICIO =
  'Ideas de movimiento general. Si algo te duele, detente. Si estás embarazada, tienes una lesión o una condición médica, consulta antes de empezar.';

export function ejercicioById(id: string) {
  return EJERCICIOS.find((e) => e.id === id);
}
