// Contenido de "Salud ginecológica". Editable.
// La frecuencia de cada control la define la médica; los meses aquí son solo una sugerencia para reprogramar.

export const TIPOS_CONTROL = [
  { id: 'anual', titulo: 'Control ginecológico anual', emoji: '🩺', repetirMeses: 12 },
  { id: 'pap', titulo: 'Papanicolaou (PAP) o test de VPH', emoji: '🔬', repetirMeses: 0 },
  { id: 'eco', titulo: 'Ecografía de control', emoji: '🖥️', repetirMeses: 0 },
  { id: 'mamografia', titulo: 'Mamografía', emoji: '🎀', repetirMeses: 0 },
  { id: 'otro', titulo: 'Otro control', emoji: '📋', repetirMeses: 0 },
] as const;

export const AUTOEXAMEN = {
  resumen: 'Una vez al mes, unos días después del período, cuando hay menos sensibilidad.',
  pasos: [
    'Frente al espejo, mírate con los brazos abajo y luego arriba.',
    'Busca cambios de forma, piel hundida o enrojecida.',
    'Acostada, palpa cada seno con las yemas de los dedos, en círculos.',
    'Revisa también la axila y alrededor del pezón.',
    'Anota si notaste algo distinto.',
  ],
  aviso: 'Si notas un bulto, la piel hundida, cambios en el pezón o secreción, consulta pronto. La mayoría no son graves, pero hay que revisarlos.',
};

export const TIPOS_QUISTE = ['Funcional', 'Dermoide', 'Endometrioma', 'No sé'];

export const URGENTE_QUISTE =
  'Busca atención urgente si sientes un dolor muy fuerte y repentino de un lado de la pelvis, sobre todo con náuseas, vómitos o fiebre: puede ser una complicación de un quiste.';
