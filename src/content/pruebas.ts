// Sección "Ayúdanos a mejorar": pruebas de uso que las usuarias hacen por su cuenta.
// Cada misión empieza en "Hoy" y la usuaria busca cómo hacerla: así se ve qué tan fácil es la app.
// Métricas estándar de UX: SEQ (facilidad de 1 a 7 por tarea) y SUS (cuestionario de 10 preguntas).

// ✍️ Si quieres recibir los resultados por correo, pon aquí tu dirección. Si queda vacío,
// la usuaria los comparte por donde quiera (WhatsApp, correo, Drive…).
export const CORREO_RESULTADOS = 'alirioerodriguez@gmail.com';

export const MISIONES = [
  { id: 'registrar', titulo: 'Registrar tu día', tarea: 'Registra cómo te sientes hoy: elige un ánimo y un síntoma.' },
  { id: 'proximo', titulo: 'Tu próximo período', tarea: 'Encuentra qué día se espera tu próximo período.' },
  { id: 'marcar', titulo: 'Marcar el período', tarea: 'Marca en el calendario los días de tu último período.' },
  { id: 'ejercicio', titulo: 'Un ejercicio para hoy', tarea: 'Encuentra un ejercicio recomendado para tu fase y míralo.' },
  { id: 'pdf', titulo: 'Resumen para la consulta', tarea: 'Crea el resumen en PDF para llevar a tu médica.' },
  { id: 'recordatorio', titulo: 'Activar un recordatorio', tarea: 'Activa un recordatorio (pastilla, período o registro diario).' },
  { id: 'tono', titulo: 'Personalizar', tarea: 'Cambia el color de la app a tu tono favorito.' },
  { id: 'sueno', titulo: 'Diario de sueños', tarea: 'Anota un sueño en tu diario.' },
  { id: 'control', titulo: 'Agendar un control', tarea: 'Agrega un control médico, por ejemplo tu próximo PAP.' },
  { id: 'respaldo', titulo: 'Respaldar tus datos', tarea: 'Haz un respaldo de tus datos.' },
] as const;

export const SEQ_PREGUNTA = 'En general, ¿qué tan fácil o difícil fue?';
export const SEQ_EXTREMOS = ['Muy difícil', 'Muy fácil'];

// System Usability Scale (Brooke, 1996), adaptado. Respuestas de 1 (muy en desacuerdo) a 5 (muy de acuerdo).
export const SUS = [
  'Creo que me gustaría usar esta app seguido.',
  'La app me pareció más complicada de lo necesario.',
  'La app me pareció fácil de usar.',
  'Creo que necesitaría ayuda de alguien para poder usarla.',
  'Las distintas funciones están bien integradas.',
  'Hay demasiadas cosas inconsistentes en la app.',
  'Creo que la mayoría de las personas aprendería a usarla muy rápido.',
  'La app me pareció muy engorrosa de usar.',
  'Me sentí segura usando la app.',
  'Tuve que aprender muchas cosas antes de poder usarla.',
];

// Puntaje SUS de 0 a 100 (68 es el promedio de referencia).
export function susScore(r: number[]): number | null {
  if (r.length !== 10 || r.some((x) => !x)) return null;
  const sum = r.reduce((acc, v, i) => acc + (i % 2 === 0 ? v - 1 : 5 - v), 0);
  return sum * 2.5;
}
