// Perimenopausia y menopausia (diseño 7i a 7l). Escala MRS (Menopause Rating Scale), chequeos y cuidados.
import { addDays, diffDays, today } from '../lib/dates';
import type { AppData, EtapaMeno, ISODate } from '../lib/types';

export const ETAPAS_MENO: { id: EtapaMeno; corto: string; nombre: string; linea: string; cuando: string }[] = [
  { id: 'peri', corto: 'Peri', nombre: 'Perimenopausia', linea: 'Tu ciclo se vuelve irregular. Puedes seguir registrando tus períodos.', cuando: 'Hace menos de 12 meses' },
  { id: 'meno', corto: 'Menopausia', nombre: 'Menopausia', linea: 'Se confirma tras 12 meses seguidos sin período.', cuando: 'Hace cerca de 12 meses' },
  { id: 'post', corto: 'Pos', nombre: 'Posmenopausia', linea: 'Ya pasaron 12 meses sin período. Cuida huesos y corazón.', cuando: 'Hace más de un año' },
];

export const etapaMeno = (id: EtapaMeno) => ETAPAS_MENO.find((e) => e.id === id) ?? ETAPAS_MENO[1];

// Días desde el último sangrado registrado (null si no hay ninguno).
export function diasSinPeriodo(data: AppData, ref: ISODate = today()): number | null {
  const fechas = Object.values(data.logs)
    .filter((l) => l.flow > 0 && l.date <= ref)
    .map((l) => l.date)
    .sort();
  return fechas.length ? diffDays(ref, fechas[fechas.length - 1]) : null;
}

// ---------- Bochornos ----------

export const INTENSIDADES = ['Leve', 'Moderado', 'Fuerte', 'Muy fuerte'];
export const DESPERTO_POR = [
  { id: 'calor', label: 'Calor o sudor' },
  { id: 'ansiedad', label: 'Ansiedad' },
  { id: 'bano', label: 'Ir al baño' },
  { id: 'nose', label: 'No sé' },
];

export function etiquetaBochornos(n: number, intensidad: string | null): string {
  if (n === 0) return 'Ninguno, qué bien';
  return (intensidad ?? (n <= 2 ? 'Leve' : n <= 4 ? 'Moderado' : 'Fuerte')).toLowerCase();
}

// "Hoy me siento": 5 caritas por fila (0 = peor, 4 = mejor).
export const SENTIR: { id: 'sueno' | 'animo' | 'energia'; label: string; caras: string[] }[] = [
  { id: 'sueno', label: 'Sueño', caras: ['😣', '😕', '😐', '🙂', '😌'] },
  { id: 'animo', label: 'Ánimo', caras: ['😢', '😕', '😐', '🙂', '😊'] },
  { id: 'energia', label: 'Energía', caras: ['🪫', '😮‍💨', '😐', '🙂', '⚡'] },
];

// ---------- Escala MRS ----------

export const MRS: { label: string; sub: string }[] = [
  { label: 'Bochornos y sudores', sub: 'Calor repentino, sudoración' },
  { label: 'Molestias en el corazón', sub: 'Palpitaciones, latidos fuertes' },
  { label: 'Sueño', sub: 'Te cuesta dormir o despiertas temprano' },
  { label: 'Ánimo bajo', sub: 'Tristeza, sin ganas' },
  { label: 'Irritabilidad', sub: 'Nerviosa, tensa' },
  { label: 'Ansiedad', sub: 'Inquietud, pánico' },
  { label: 'Cansancio y memoria', sub: 'Olvidos, poca concentración' },
  { label: 'Vida sexual', sub: 'Cambios en el deseo' },
  { label: 'Vejiga', sub: 'Urgencia, escapes de orina' },
  { label: 'Sequedad vaginal', sub: 'Ardor, molestia en la intimidad' },
  { label: 'Articulaciones y músculos', sub: 'Dolor o rigidez' },
];

export const NIVELES_MRS = ['Nada', 'Leve', 'Moderado', 'Fuerte', 'Muy fuerte'];

export function puntajeMrs(r: number[]) {
  const v = r.map((x) => Math.max(0, x));
  const suma = (ids: number[]) => ids.reduce((a, i) => a + (v[i] ?? 0), 0);
  const total = v.reduce((a, b) => a + b, 0);
  return {
    total,
    fisicos: suma([0, 1, 2, 10]),
    animo: suma([3, 4, 5, 6]),
    intimos: suma([7, 8, 9]),
    etiqueta: total <= 4 ? 'Casi sin síntomas' : total <= 8 ? 'Síntomas leves' : total <= 16 ? 'Síntomas moderados' : 'Síntomas fuertes: coméntalo con tu médica',
  };
}

export const OTROS_SINTOMAS = [
  { id: 'niebla', label: 'Niebla mental' },
  { id: 'cabeza', label: 'Dolor de cabeza' },
  { id: 'piel', label: 'Piel o pelo seco' },
  { id: 'peso', label: 'Cambio de peso' },
  { id: 'mareo', label: 'Mareos' },
  { id: 'hinchazon', label: 'Hinchazón' },
  { id: 'hormigueo', label: 'Hormigueo' },
  { id: 'libido', label: 'Menos deseo' },
];

export function mensajeSangrado(etapa: EtapaMeno): string {
  return etapa === 'post'
    ? 'Cualquier sangrado después de 12 meses sin período hay que revisarlo pronto con tu médica. Casi siempre tiene una causa sencilla, pero es importante descartarla.'
    : 'En la perimenopausia los sangrados pueden ser irregulares; si es muy abundante, dura más de 7 días o aparece entre períodos, coméntalo con tu médica.';
}

export const TIPOS_TRH = ['Pastilla', 'Parche', 'Gel', 'Óvulo vaginal'];
export const SUPLEMENTOS = [
  { id: 'ca', label: 'Calcio' },
  { id: 'vd', label: 'Vitamina D' },
  { id: 'lub', label: 'Hidratante vaginal' },
];

export const CHEQUEOS_MENO = [
  { id: 'pa', titulo: 'Presión arterial', cuando: 'Al menos una vez al año' },
  { id: 'lip', titulo: 'Colesterol y glucosa', cuando: 'Perfil de lípidos y azúcar en sangre' },
  { id: 'dexa', titulo: 'Densitometría ósea', cuando: 'Mide tus huesos; desde los 65 o antes si hay riesgo' },
  { id: 'mamo', titulo: 'Mamografía', cuando: 'Según indicación de tu médica' },
  { id: 'pap', titulo: 'Citología (PAP)', cuando: 'Se sigue haciendo después de la menopausia' },
  { id: 'vitd', titulo: 'Vitamina D y tiroides', cuando: 'Análisis que suele pedir tu médica' },
  { id: 'peso', titulo: 'Peso y cintura', cuando: 'Anótalo una vez al mes' },
  { id: 'anual', titulo: 'Control anual general', cuando: 'Visión, dientes y chequeo' },
];

// ---------- Ideas y cuidados ----------

export const IDEAS_MENO = [
  'Una habitación fresca y ropa de algodón ayudan con los sudores nocturnos.',
  'Anota qué pasó antes de un bochorno: café, alcohol, picante o estrés suelen dispararlos.',
  'Los ejercicios de suelo pélvico ayudan con los escapes de orina.',
  'La sequedad vaginal tiene tratamiento: hidratantes, lubricantes y opciones que tu médica puede indicarte.',
  'Respirar lento y profundo cuando empieza un bochorno puede hacerlo más llevadero.',
];

export const ideaDelDia = (ref: ISODate = today()) => IDEAS_MENO[Math.abs(diffDays(ref, '2024-01-01')) % IDEAS_MENO.length];

export const CUIDADOS_MENO = [
  { emoji: '😴', titulo: 'Sueño', texto: 'Habitación fresca, horarios fijos y poca pantalla de noche.' },
  { emoji: '🔥', titulo: 'Bochornos', texto: 'Ropa en capas, abanico a mano y anota qué los dispara.' },
  { emoji: '💗', titulo: 'Intimidad', texto: 'Hidratantes y lubricantes vaginales; pregunta por el estrógeno vaginal.' },
  { emoji: '🧠', titulo: 'Ánimo y memoria', texto: 'Habla de cómo te sientes; la terapia cognitivo-conductual ayuda con el sueño y los bochornos.' },
  { emoji: '🦴', titulo: 'Huesos', texto: 'Calcio, vitamina D, fuerza y caminar.' },
  { emoji: '❤️', titulo: 'Corazón', texto: 'Controla presión, colesterol y glucosa cada año.' },
  { emoji: '🌸', titulo: 'Suelo pélvico', texto: 'Ejercicios de Kegel para los escapes de orina.' },
];

export const ALIMENTOS_MENO = [
  { emoji: '🥛', titulo: 'Calcio', texto: 'Leche, yogur, queso blanco y sardinas con espinitas.' },
  { emoji: '☀️', titulo: 'Vitamina D', texto: 'Un poco de sol, huevo y pescado; tu médica puede indicar suplemento.' },
  { emoji: '🍗', titulo: 'Proteína en cada comida', texto: 'Ayuda a mantener tus músculos: huevo, pollo, caraotas, pescado.' },
  { emoji: '🌱', titulo: 'Soya y linaza', texto: 'Tienen fitoestrógenos; la evidencia sobre los bochornos es limitada.' },
  { emoji: '🥗', titulo: 'Fibra y agua', texto: 'Frutas, verduras y avena para tu digestión y corazón.' },
];

export const MODERACION_MENO = 'Sal, alcohol, café y picante: suben la presión o disparan bochornos en algunas mujeres.';

export const PLATOS_MENO = [
  {
    emoji: '🐟', nombre: 'Sardinas al horno con ensalada', tiempo: '25 min', etiqueta: 'Calcio y omega-3',
    porque: 'Las sardinas con espinitas aportan calcio para tus huesos y omega-3 para tu corazón.',
    ingredientes: ['4 sardinas', 'Tomate, pepino y lechuga', 'Limón y aceite de oliva', 'Orégano'],
    pasos: ['Hornea las sardinas 15 minutos con orégano.', 'Prepara la ensalada.', 'Aliña con limón y poquita sal.'],
  },
  {
    emoji: '🎃', nombre: 'Crema de auyama con queso blanco', tiempo: '30 min', etiqueta: 'Suave y con calcio',
    porque: 'Fácil de comer, saciante y con calcio del queso.',
    ingredientes: ['3 tazas de auyama', '1 cebolla', 'Caldo bajo en sal', 'Queso blanco rallado'],
    pasos: ['Cocina la auyama con cebolla en caldo.', 'Licúa hasta que quede cremosa.', 'Sirve con queso blanco.'],
  },
  {
    emoji: '🥣', nombre: 'Avena con leche, linaza y lechosa', tiempo: '10 min', etiqueta: 'Fibra',
    porque: 'Fibra para tu digestión y corazón; la linaza tiene fitoestrógenos (evidencia limitada).',
    ingredientes: ['½ taza de avena', '1 taza de leche', '1 cda de linaza molida', 'Lechosa'],
    pasos: ['Cocina la avena en la leche.', 'Agrega la linaza.', 'Sirve con lechosa.'],
  },
];

export const EJERCICIO_MENO = {
  intro: 'Fuerza 2 veces por semana y caminar casi todos los días cuidan huesos, músculos y corazón.',
  ids: ['sentadilla', 'caminata', 'gato-vaca'],
};

// Bochornos de los últimos `n` días (null = sin registro).
export function bochornosRecientes(data: AppData, n: number, ref: ISODate = today()): (number | null)[] {
  return Array.from({ length: n }, (_, i) => data.logs[addDays(ref, i - n + 1)]?.bochornos ?? null);
}
