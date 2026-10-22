// Posparto · cuarto trimestre (diseño 8d, 8e y 8f). La protagonista también es ella.
import { addDays, diffDays, fromISO, today } from '../lib/dates';
import type { ISODate, Loquios, Posparto } from '../lib/types';

export function semanasPosparto(p: Posparto, ref: ISODate = today()): number {
  if (!p.nacimiento) return 0;
  return Math.max(0, Math.floor(diffDays(ref, p.nacimiento) / 7));
}

// Fecha del parto a partir de "hace cuántas semanas nació".
export function nacimientoHace(semanas: number, ref: ISODate = today()): ISODate {
  return addDays(ref, -semanas * 7);
}

// La escala de Edimburgo se responde una vez por semana: se guarda con el lunes de esa semana.
export function lunes(d: ISODate = today()): ISODate {
  return addDays(d, -((fromISO(d).getDay() + 6) % 7));
}

export interface EtapaPosparto {
  desde: number;
  hasta: number;
  titulo: string;
  nombre: string;
  linea: string; // resumen corto para Hoy
  texto: string; // detalle para Recuperación
  ejercicios: string; // nombres que se muestran
  ids: string[]; // ejercicios de la app que corresponden a la etapa
}

export const ETAPAS_POSPARTO: EtapaPosparto[] = [
  {
    desde: 0,
    hasta: 6,
    titulo: 'Semanas 0 a 6',
    nombre: 'Reconectar',
    linea: 'Respira, descansa y reconecta tu suelo pélvico. El sangrado va bajando.',
    texto: 'Respiración diafragmática, contracción y relajación del suelo pélvico, paseos cortos.',
    ejercicios: 'Respira conmigo · Caminar',
    ids: ['caminata'],
  },
  {
    desde: 7,
    hasta: 12,
    titulo: 'Semanas 6 a 12',
    nombre: 'Estabilizar',
    linea: 'Con el alta de tu control, trabaja abdomen profundo y estabilidad.',
    texto: 'Control de la diástasis, transverso abdominal y estabilidad lumbopélvica. Revisa con tu médica o fisio.',
    ejercicios: 'Gato y vaca · Puente suave',
    ids: ['gato-vaca', 'puente'],
  },
  {
    desde: 13,
    hasta: 999,
    titulo: 'Desde la semana 12',
    nombre: 'Fortalecer',
    linea: 'Vuelve poco a poco a la fuerza, escuchando a tu cuerpo.',
    texto: 'Retorno gradual a la fuerza. Impacto solo si no hay escapes ni peso en la pelvis.',
    ejercicios: 'Sentadilla · Plancha',
    ids: ['sentadilla', 'plancha'],
  },
];

export const etapaPosparto = (semanas: number) => ETAPAS_POSPARTO.find((e) => semanas >= e.desde && semanas <= e.hasta) ?? ETAPAS_POSPARTO[0];

export const CUANDO_VUELVE_PERIODO =
  'Si das pecho exclusivo, puede tardar meses (amenorrea de la lactancia). Puedes ovular antes de tu primer período: si no buscas otro embarazo, habla de anticoncepción en tu control.';

// ---------- Hoy ----------

export const LOQUIOS: { id: Loquios; label: string }[] = [
  { id: 'rojo', label: 'Rojo abundante' },
  { id: 'rosado', label: 'Rosado' },
  { id: 'amarillento', label: 'Amarillento' },
  { id: 'no', label: 'Ya no hay' },
];

export const ALERTA_LOQUIOS =
  'Si empapas una toalla por hora, salen coágulos grandes o vuelve el rojo abundante después de la semana 2, comunícate hoy con tu médica.';

export const CICATRIZ = {
  cesarea: ['Bien', 'Tira un poco', 'Enrojecida', 'Supura'],
  vaginal: ['Bien', 'Molestia', 'Puntos tiran', 'Mucho dolor'],
};
// Respuestas que piden consultar pronto.
export const CICATRIZ_ALERTA = ['Enrojecida', 'Supura', 'Mucho dolor'];
export const CUIDADO_CICATRIZ = 'Revisa que no haya enrojecimiento que crece, pus o fiebre. Si aparece, consulta pronto.';

// ---------- Cuídate: escala de Edimburgo adaptada ----------

export const EDIMBURGO: { pregunta: string; opciones: string[] }[] = [
  { pregunta: 'Pude reírme y ver el lado bueno de las cosas', opciones: ['Como siempre', 'Algo menos', 'Mucho menos', 'Nada'] },
  { pregunta: 'Me he culpado sin motivo cuando algo salió mal', opciones: ['Nunca', 'Casi nunca', 'A veces', 'Casi siempre'] },
  { pregunta: 'Me he sentido ansiosa o preocupada sin razón', opciones: ['Nunca', 'Casi nunca', 'A veces', 'Muy a menudo'] },
  { pregunta: 'Me ha pasado por la mente hacerme daño', opciones: ['Nunca', 'Casi nunca', 'A veces', 'Bastante'] },
];

export const EDIMBURGO_INTRO = 'Inspirado en la escala de Edimburgo. No es un diagnóstico: es para que no lo vivas en silencio.';

export type NivelEdimburgo = 'bien' | 'cargada' | 'urgente';

// La última pregunta (hacerse daño) pesa sola: cualquier respuesta distinta de "Nunca" es urgente.
export function nivelEdimburgo(r: number[]): NivelEdimburgo {
  if ((r[3] ?? 0) > 0) return 'urgente';
  return r.reduce((a, b) => a + b, 0) >= 5 ? 'cargada' : 'bien';
}

export const MENSAJE_EDIMBURGO: Record<NivelEdimburgo, string> = {
  bien: 'Vas bien. Sigue pidiendo ayuda y descansando cuando puedas.',
  cargada: 'Se nota que estás cargando mucho. La tristeza posparto es común y tiene ayuda: cuéntaselo a tu médica en tu próximo control.',
  urgente:
    'Gracias por contarlo. No estás sola y no es tu culpa. Habla hoy con tu médica o con alguien de confianza. Si sientes que puedes hacerte daño, ve a emergencias o llama al 911.',
};

export const COMER_DANDO_PECHO = [
  { emoji: '💧', titulo: 'Agua a mano', texto: 'Un vaso cada vez que des pecho.' },
  { emoji: '🍗', titulo: 'Proteína y hierro', texto: 'Para reponerte del parto: huevo, caraotas, carne y pollo.' },
  { emoji: '🐟', titulo: 'Omega-3', texto: 'Sardina o jurel 2 veces por semana.' },
  { emoji: '☕', titulo: 'Café con medida', texto: 'Hasta unas 2 tazas pequeñas al día.' },
];

export const COMER_POSPARTO = [
  { emoji: '💧', titulo: 'Agua a mano', texto: 'Tu cuerpo se está recuperando: hidrátate durante el día.' },
  { emoji: '🍗', titulo: 'Proteína y hierro', texto: 'Para reponerte del parto: huevo, caraotas, carne y pollo.' },
  { emoji: '🥬', titulo: 'Fibra', texto: 'Frutas, vegetales y avena ayudan a evitar el estreñimiento de estas semanas.' },
];

export const ALARMAS_POSPARTO = [
  'Fiebre de 38 °C o más',
  'Sangrado que empapa una toalla por hora',
  'Dolor o calor en una pierna',
  'Dolor de cabeza fuerte o visión borrosa',
  'Pensamientos de hacerte daño a ti o a tu bebé',
];

export const PARTOS: { id: Posparto['parto']; label: string }[] = [
  { id: 'vaginal', label: 'Vaginal' },
  { id: 'cesarea', label: 'Cesárea' },
];

export const ALIMENTACIONES: { id: Posparto['alimentacion']; label: string }[] = [
  { id: 'pecho', label: 'Pecho' },
  { id: 'formula', label: 'Fórmula' },
  { id: 'mixta', label: 'Mixta' },
];
