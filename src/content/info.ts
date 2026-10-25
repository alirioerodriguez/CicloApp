// Contenido de la pantalla "Cuándo consultar". Editable.
// Fuentes: [1]–[4] [13] [14] [16] [17] [23] [26] [29]–[34] [38]–[44].

export const NO_DISPOSITIVO =
  'Esta app es una herramienta de registro y bienestar. No es un dispositivo médico, no diagnostica y no reemplaza la consulta con tu médico.';

export const URGENTE = [
  'Si empapas una toalla o tampón cada hora durante varias horas, o te mareas mucho, busca atención médica hoy.',
  'Dolor fuerte en el bajo vientre con fiebre: busca atención médica hoy.',
];

export const URGENTE_COMBINADA =
  'Si tomas pastilla combinada y tienes dolor o hinchazón en una pierna, dolor en el pecho, falta de aire o un dolor de cabeza muy fuerte y distinto, o cambios bruscos en la visión, busca atención urgente.';

export const CRISIS =
  'Si en algún momento piensas en hacerte daño, busca ayuda de inmediato: llama a emergencias o a una línea de ayuda de tu país.';

export const RANGOS = [
  'Ciclo: entre 24 y 38 días se considera normal (FIGO). La ACOG usa de 21 a 35.',
  'Período: hasta 7–8 días. Más que eso, si se repite, vale la pena consultarlo.',
  'Regularidad: que el ciclo más corto y el más largo no se diferencien en más de 7 días (9 entre los 18–25 y los 42–45 años).',
  'Sin período por 3 meses o más (sin estar tomando pastilla): consulta.',
  'Sangrado abundante: cambiar toalla o tampón cada 1–2 horas, o coágulos de más de 2,5 cm.',
  'Sangrado entre períodos o después de las relaciones, o dolor en las relaciones.',
  'Dolor que no te deja hacer tu día normal, que no mejora con analgésicos o que va en aumento.',
  'En adolescentes los ciclos pueden ser más variables (21 a 45 días) durante los primeros años.',
];

// Versión para tocar: cada situación de RANGOS como pregunta corta; el detalle es el mismo texto de arriba.
export const RANGOS_PREGUNTAS: { pregunta: string; detalle: string }[] = [
  { pregunta: '¿Tus ciclos duran menos de 24 o más de 38 días?', detalle: RANGOS[0] },
  { pregunta: '¿Tu período dura más de 8 días?', detalle: RANGOS[1] },
  { pregunta: '¿Tus ciclos cambian mucho de un mes a otro?', detalle: RANGOS[2] },
  { pregunta: '¿Llevas 3 meses o más sin período?', detalle: RANGOS[3] },
  { pregunta: '¿Cambias la toalla o el tampón cada 1–2 horas?', detalle: RANGOS[4] },
  { pregunta: '¿Sangras entre períodos o después de las relaciones?', detalle: RANGOS[5] },
  { pregunta: '¿El dolor no te deja hacer tu día normal?', detalle: RANGOS[6] },
];
export const RANGOS_NOTA = RANGOS[7];

// nivel: cuánta evidencia hay (3 moderada, 2 baja pero consistente, 1 limitada). Se dibuja como barra.
export const ALIVIO: { medida: string; evidencia: string; nivel: 1 | 2 | 3 }[] = [
  { medida: 'Calor local (bolsa de agua tibia, parche térmico)', evidencia: 'Moderada; en algunos estudios, comparable a analgésicos comunes.', nivel: 3 },
  { medida: 'Ejercicio regular', evidencia: 'Baja calidad, pero consistente: reduce la intensidad del dolor.', nivel: 2 },
  { medida: 'TENS (estimulación eléctrica en la piel)', evidencia: 'Limitada; estudios pequeños con beneficio.', nivel: 1 },
  { medida: 'Jengibre', evidencia: 'Limitada (estudios pequeños).', nivel: 1 },
  { medida: 'Omega-3', evidencia: 'Limitada y de baja calidad.', nivel: 1 },
  { medida: 'Yoga, relajación, baño tibio, masaje suave', evidencia: 'Limitada, con bajo riesgo.', nivel: 1 },
  { medida: 'Dejar de fumar', evidencia: 'Fumar se asocia con más dolor menstrual.', nivel: 2 },
];

export const MITOS = [
  'Aceite de onagra para el SPM o los cólicos: no hay evidencia suficiente.',
  'Cúrcuma en la comida contra los cólicos: los estudios usan suplementos, no lo que se usa al cocinar.',
  '"No tomar cosas frías", "no bañarse" o "no hacer ejercicio" en el período: son mitos; el ejercicio de hecho ayuda.',
  'Infusiones para "adelantar" o "bajar" el período: no hay evidencia de que funcionen.',
  'Tés "detox", ayunos o dietas restrictivas para el SPM: no tienen respaldo.',
  'Aceites esenciales como tratamiento del dolor: estudios de baja calidad. Como mimo relajante, bien.',
];

export const SPM =
  'El SPM son molestias físicas o emocionales en los días antes del período que se van cuando empieza. Es muy común. El TDPM es una forma más intensa, en la que la tristeza, la ansiedad o la irritabilidad afectan mucho el trabajo, los estudios o las relaciones. Lo diagnostica un profesional con un registro de al menos 2 ciclos: tus registros en esta app sirven justo para eso.';

export const PASTILLA_OLVIDO =
  'Si olvidaste pastillas y no tuviste el sangrado esperado, una prueba de embarazo puede darte tranquilidad.';
