// Embarazo semana a semana (diseño 7d a 7h). Basado en la OMS (8 contactos prenatales) y apps de embarazo.
import { addDays, diffDays, today } from '../lib/dates';
import type { ISODate } from '../lib/types';

// ---------- Semanas ----------

export const SEMANA_MIN = 4;
export const SEMANA_MAX = 42;

export function semanasEmbarazo(fpp: ISODate | null, ref: ISODate = today()): number {
  if (!fpp) return SEMANA_MIN;
  return Math.max(0, Math.floor((280 - diffDays(fpp, ref)) / 7));
}

// Fecha probable de parto a partir de "de cuántas semanas estás".
export function fppDesdeSemanas(semanas: number, ref: ISODate = today()): ISODate {
  return addDays(ref, (40 - semanas) * 7);
}

export function trimestre(semana: number): 1 | 2 | 3 {
  return semana <= 13 ? 1 : semana <= 27 ? 2 : 3;
}

export const TRIMESTRES = [
  { n: 1, nombre: '1er trimestre', rango: 'Semanas 4 a 13', desde: 4, hasta: 13, linea: 'Primer trimestre: descansa, toma ácido fólico y come poquito y seguido si hay náuseas.' },
  { n: 2, nombre: '2do trimestre', rango: 'Semanas 14 a 27', desde: 14, hasta: 27, linea: 'Segundo trimestre: suele ser la etapa con más energía. Muévete y cuida tu alimentación.' },
  { n: 3, nombre: '3er trimestre', rango: 'Semanas 28 a 40', desde: 28, hasta: 40, linea: 'Tercer trimestre: escucha a tu cuerpo, cuenta las patadas y prepárate para el parto.' },
] as const;

// Tamaño aproximado del bebé: [emoji, comparación, cm, gramos].
export const BEBE: Record<number, [string, string, number, number]> = {
  4: ['🌱', 'una semilla de amapola', 0.1, 0], 5: ['🌾', 'un ajonjolí', 0.2, 0], 6: ['🫘', 'una lenteja', 0.6, 0], 7: ['🫐', 'un arándano', 1.3, 1],
  8: ['🫐', 'una frambuesa', 1.6, 1], 9: ['🍒', 'una cereza', 2.3, 2], 10: ['🍓', 'una fresa', 3.1, 4], 11: ['🍇', 'un higo', 4.1, 7],
  12: ['🍋', 'un limón', 5.4, 14], 13: ['🍑', 'un durazno', 7.4, 23], 14: ['🍋', 'un limón grande', 8.7, 43], 15: ['🍎', 'una manzana', 10.1, 70],
  16: ['🥑', 'un aguacate', 11.6, 100], 17: ['🧅', 'una cebolla', 13, 140], 18: ['🫑', 'un pimentón', 14.2, 190], 19: ['🥭', 'un mango', 15.3, 240],
  20: ['🍌', 'un cambur', 25.6, 300], 21: ['🥕', 'una zanahoria', 26.7, 360], 22: ['🍠', 'una batata', 27.8, 430], 23: ['🍊', 'una toronja', 28.9, 501],
  24: ['🌽', 'una mazorca', 30, 600], 25: ['🥦', 'una coliflor', 34.6, 660], 26: ['🥬', 'una lechuga', 35.6, 760], 27: ['🥦', 'un brócoli', 36.6, 875],
  28: ['🍆', 'una berenjena', 37.6, 1000], 29: ['🎃', 'una auyama pequeña', 38.6, 1150], 30: ['🥬', 'un repollo', 39.9, 1300], 31: ['🥥', 'un coco', 41.1, 1500],
  32: ['🍍', 'una piña', 42.4, 1700], 33: ['🍍', 'una piña grande', 43.7, 1900], 34: ['🍈', 'un melón', 45, 2100], 35: ['🍈', 'un melón grande', 46.2, 2400],
  36: ['🍈', 'una lechosa', 47.4, 2600], 37: ['🥬', 'una acelga', 48.6, 2900], 38: ['🎃', 'una auyama', 49.8, 3100], 39: ['🍉', 'una patilla pequeña', 50.7, 3300],
  40: ['🍉', 'una patilla', 51.2, 3500],
};

export function bebe(semana: number) {
  const [emoji, fruta, cm, g] = BEBE[Math.max(SEMANA_MIN, Math.min(40, semana))];
  return { emoji, fruta, cm: `${String(cm).replace('.', ',')} cm`, peso: g >= 1000 ? `${String(g / 1000).replace('.', ',')} kg` : `${g} g` };
}

// Desarrollo: [desde, hasta, tu bebé, tú].
const DESARROLLO: [number, number, string, string][] = [
  [4, 7, 'Se forma el tubo neural, que será su cerebro y médula. Su corazón empieza a latir.', 'Puedes notar cansancio, náuseas y pechos sensibles.'],
  [8, 10, 'Ya se notan brazos, piernas y deditos. Todos sus órganos empiezan a formarse.', 'Las náuseas suelen estar en su punto más fuerte. Come poquito y seguido.'],
  [11, 13, 'Se mueve aunque aún no lo sientas y ya tiene huellas en los dedos.', 'Al final del trimestre muchas sienten más energía.'],
  [14, 17, 'Hace muecas, se chupa el dedo y empieza a oír.', 'Tu barriga empieza a notarse.'],
  [18, 22, 'Puedes sentir sus primeros movimientos. En la ecografía se ven sus órganos con detalle.', 'Puede aparecer dolor de espalda o calambres en las piernas.'],
  [23, 27, 'Abre los ojos, reacciona a tu voz y gana grasita.', 'Puede haber hinchazón en los pies y acidez.'],
  [28, 31, 'Abre y cierra los ojos, sueña y patea con fuerza.', 'Te puede faltar el aire y orinar más seguido.'],
  [32, 35, 'Practica respirar y suele acomodarse de cabeza.', 'Las contracciones de práctica son normales: van y vienen sin ritmo.'],
  [36, 42, 'Sus pulmones maduran. Desde la semana 37 se considera a término.', 'Descansa, ten tu bolso listo y atenta a las señales de parto.'],
];

export function desarrollo(semana: number) {
  const d = DESARROLLO.find(([a, b]) => semana >= a && semana <= b) ?? DESARROLLO[0];
  return { bebe: d[2], tu: d[3] };
}

// Pendientes de la semana: [título, detalle].
export function pendientes(semana: number): [string, string][] {
  const l: [string, string][] = [];
  if (semana <= 12) l.push(['Primera consulta prenatal', 'Lo antes posible, antes de la semana 12'], ['Ácido fólico todos los días', 'Ayuda a prevenir defectos del tubo neural'], ['Análisis de sangre y orina', 'Grupo sanguíneo, hemoglobina y más']);
  if (semana >= 11 && semana <= 14) l.push(['Ecografía de la semana 11 a 14', 'Confirma fecha y revisa desarrollo']);
  if (semana >= 18 && semana <= 22) l.push(['Ecografía morfológica', 'Entre la semana 18 y 22']);
  if (semana >= 24 && semana <= 28) l.push(['Prueba de glucosa', 'Entre la semana 24 y 28']);
  if (semana >= 27 && semana <= 36) l.push(['Vacuna Tdap', 'Protege a tu bebé de la tos ferina']);
  if (semana >= 28) l.push(['Contar patadas cada día', 'A la hora en que suele estar activo']);
  if (semana >= 32) l.push(['Preparar el bolso del hospital', 'Documentos, ropa y pañales']);
  if (semana >= 35 && semana <= 37) l.push(['Prueba de estreptococo B', 'Entre la semana 35 y 37']);
  l.push(['Tomar 8 vasos de agua', 'Y orinar seguido'], ['Caminar 20 minutos', 'Si tu médica no indica reposo']);
  return l;
}

// ---------- Controles (OMS: al menos 8 contactos) ----------

export const CONTROLES_OMS: { semana: number; texto: string }[] = [
  { semana: 12, texto: 'Historia, examen físico, análisis y primera ecografía' },
  { semana: 20, texto: 'Control de peso, presión y crecimiento' },
  { semana: 26, texto: 'Control y prueba de glucosa' },
  { semana: 30, texto: 'Crecimiento del bebé y presión' },
  { semana: 34, texto: 'Posición del bebé y presión' },
  { semana: 36, texto: 'Posición, peso y plan de parto' },
  { semana: 38, texto: 'Control y señales de parto' },
  { semana: 40, texto: 'Control final; si no nace, vuelve a la semana 41' },
];

export function proximoControl(semana: number) {
  return CONTROLES_OMS.find((c) => c.semana >= semana) ?? CONTROLES_OMS[CONTROLES_OMS.length - 1];
}

export const EXAMENES: { id: string; titulo: string; cuando: string }[] = [
  { id: 'eco1', titulo: 'Ecografía temprana', cuando: 'Antes de la semana 24 · confirma la fecha' },
  { id: 'morf', titulo: 'Ecografía morfológica', cuando: 'Semanas 18 a 22' },
  { id: 'glu', titulo: 'Prueba de glucosa', cuando: 'Semanas 24 a 28' },
  { id: 'tdap', titulo: 'Vacuna Tdap', cuando: 'Semanas 27 a 36' },
  { id: 'flu', titulo: 'Vacuna de la influenza', cuando: 'En cualquier momento del embarazo' },
  { id: 'egb', titulo: 'Estreptococo B', cuando: 'Semanas 35 a 37' },
  { id: 'hb', titulo: 'Hemoglobina y orina', cuando: 'En cada trimestre' },
];

export const BOLSO = ['Documentos e informe médico', 'Ropa cómoda y bata', 'Toallas de posparto', 'Pañales de recién nacido', 'Ropita y gorrito', 'Cargador del teléfono'];

// Presión de 140/90 o más: consultar el mismo día.
export const presionAlta = (sys: number | null, dia: number | null) => (sys ?? 0) >= 140 || (dia ?? 0) >= 90;
export const AVISO_PRESION = 'Tu presión está alta: comunícate con tu médica hoy.';

// ---------- Cuídate ----------

export const PLATOS_EMBARAZO = [
  {
    emoji: '🍳', nombre: 'Caraotas con arroz y huevo', tiempo: '30 min', etiqueta: 'Hierro y folato',
    porque: 'Hierro y folato para ti y para la formación de tu bebé. El huevo, siempre bien cocido.',
    ingredientes: ['1 taza de caraotas cocidas', '½ taza de arroz', '1 huevo', 'Tomate y aguacate'],
    pasos: ['Calienta las caraotas guisadas.', 'Cocina el huevo hasta que la yema esté firme.', 'Sirve con arroz, tomate y aguacate.'],
  },
  {
    emoji: '🍲', nombre: 'Sopa de pollo con verduras', tiempo: '40 min', etiqueta: 'Para las náuseas',
    porque: 'Suave, calentica y fácil de digerir en los días de náuseas.',
    ingredientes: ['1 pechuga', 'Auyama, zanahoria y apio', 'Cilantro', 'Sal al gusto'],
    pasos: ['Cocina el pollo en agua con sal.', 'Agrega las verduras en trozos.', 'Termina con cilantro picado.'],
  },
  {
    emoji: '🥣', nombre: 'Yogur con lechosa y avena', tiempo: '5 min', etiqueta: 'Calcio',
    porque: 'Calcio para sus huesitos y fibra para el estreñimiento.',
    ingredientes: ['1 taza de yogur pasteurizado', '1 taza de lechosa', '3 cdas de avena'],
    pasos: ['Corta la lechosa.', 'Mezcla con el yogur.', 'Agrega la avena.'],
  },
];

export const NUTRIENTES_EMBARAZO = [
  { emoji: '🥬', titulo: 'Ácido fólico', texto: 'Hojas verdes, caraotas y el suplemento que te indiquen.' },
  { emoji: '🫘', titulo: 'Hierro', texto: 'Caraotas, lentejas y carne bien cocida, con vitamina C.' },
  { emoji: '🥛', titulo: 'Calcio', texto: 'Leche, yogur y quesos pasteurizados.' },
  { emoji: '🐟', titulo: 'Omega-3', texto: 'Sardina y jurel bien cocidos, 2 veces por semana.' },
  { emoji: '💧', titulo: 'Agua', texto: 'Unos 8 a 10 vasos al día.' },
];

export const EVITAR_EMBARAZO = [
  { emoji: '🍷', titulo: 'Alcohol', texto: 'No hay una cantidad segura en el embarazo.' },
  { emoji: '🥩', titulo: 'Carnes, huevos o pescados crudos', texto: 'Siempre bien cocidos.' },
  { emoji: '🧀', titulo: 'Quesos sin pasteurizar', texto: 'Pueden transmitir listeria.' },
  { emoji: '🦈', titulo: 'Pescados grandes', texto: 'Como pez espada o tiburón, por el mercurio.' },
  { emoji: '☕', titulo: 'Mucho café', texto: 'Máximo unas 2 tazas pequeñas al día.' },
];

export const ALARMAS_EMBARAZO = [
  'Sangrado vaginal',
  'Pérdida de líquido por la vagina',
  'Dolor de cabeza fuerte con visión borrosa',
  'Hinchazón repentina de cara o manos',
  'Fiebre',
  'Tu bebé se mueve mucho menos',
  'Contracciones regulares antes de la semana 37',
  'Dolor fuerte en el vientre',
];

export const EJERCICIO_EMBARAZO = {
  intro: 'Movimiento seguro para el embarazo. Si tu médica indicó reposo, consúltale antes.',
  ids: ['caminata', 'gato-vaca', 'sentadilla'],
};

// ---------- Patadas y contracciones ----------

export const META_PATADAS = 10;
export const TEXTO_PATADAS = 'Desde la semana 28, cuenta los movimientos a la hora en que tu bebé suele estar activo. Toca cada vez que lo sientas.';
export const AVISO_PATADAS = 'Si notas que se mueve mucho menos de lo normal, no esperes: comunícate con tu médica o ve a emergencias.';

export const REGLA_511 = 'Si son regulares cada 5 minutos, duran 1 minuto y siguen así por 1 hora, ve a tu centro de salud. Si rompes fuente o sangras, ve de una vez.';
export const REGLA_511_YA = 'Cada 5 minutos, de 1 minuto y por 1 hora (regla 5-1-1): es momento de ir a tu centro de salud.';
