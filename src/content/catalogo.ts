// Opciones de registro. Puedes agregar o quitar sin tocar nada más.
// El id se guarda en los datos: si cambias uno ya usado, agrégalo a ID_RENOMBRADOS.
// Fuentes de la lista: [5] [11] [13] [14] [16] [30]–[34].

export const FLOW_LABELS = ['Nada', 'Manchado', 'Leve', 'Medio', 'Abundante'];

export const SYMPTOMS = [
  { id: 'colicos', emoji: '🌀', label: 'Cólicos' },
  { id: 'dolor_pelvico', emoji: '📍', label: 'Dolor pélvico' },
  { id: 'coagulos', emoji: '⚫', label: 'Coágulos grandes' },
  { id: 'manchado', emoji: '🩸', label: 'Manchado entre períodos' },
  { id: 'dolor_cabeza', emoji: '🤕', label: 'Dolor de cabeza' },
  { id: 'migrana', emoji: '⚡', label: 'Migraña' },
  { id: 'espalda', emoji: '🦴', label: 'Dolor de espalda' },
  { id: 'dolor_relaciones', emoji: '💢', label: 'Dolor en relaciones' },
  { id: 'pechos', emoji: '👙', label: 'Pechos sensibles' },
  { id: 'hinchazon', emoji: '🎈', label: 'Hinchazón' },
  { id: 'acne', emoji: '🫧', label: 'Acné' },
  { id: 'nauseas', emoji: '🤢', label: 'Náuseas' },
  { id: 'digestion', emoji: '🍽️', label: 'Malestar digestivo' },
  { id: 'cansancio', emoji: '🔋', label: 'Cansancio' },
  { id: 'mareo', emoji: '💫', label: 'Mareo' },
  { id: 'insomnio', emoji: '🌙', label: 'Insomnio' },
  { id: 'flujo_inusual', emoji: '💧', label: 'Flujo inusual' },
];

export const MOODS = [
  { id: 'feliz', emoji: '😊', label: 'Feliz' },
  { id: 'tranquila', emoji: '😌', label: 'Tranquila' },
  { id: 'con_energia', emoji: '✨', label: 'Con energía' },
  { id: 'carinosa', emoji: '🥰', label: 'Cariñosa' },
  { id: 'sensible', emoji: '🥺', label: 'Sensible' },
  { id: 'cambios_humor', emoji: '🎢', label: 'Cambios de humor' },
  { id: 'irritable', emoji: '😤', label: 'Irritable' },
  { id: 'ansiosa', emoji: '😰', label: 'Ansiosa' },
  { id: 'triste', emoji: '😢', label: 'Triste' },
  { id: 'abrumada', emoji: '😵‍💫', label: 'Abrumada' },
];

// Ids de versiones anteriores → id actual (null = se descarta).
export const ID_RENOMBRADOS = {
  symptoms: { cabeza: 'dolor_cabeza', flujo: null, antojos: null } as Record<string, string | null>,
  moods: { energica: 'con_energia', 'con-dolor': null, cansada: null } as Record<string, string | null>,
};

// Ánimo viejo que ahora es síntoma.
export const ANIMO_A_SINTOMA: Record<string, string> = { cansada: 'cansancio' };

export function moodById(id: string) {
  return MOODS.find((m) => m.id === id) ?? { id, emoji: '•', label: id };
}

export function symptomById(id: string) {
  return SYMPTOMS.find((s) => s.id === id) ?? { id, emoji: '•', label: id };
}
