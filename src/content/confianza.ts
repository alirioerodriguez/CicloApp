// Cuidado y confianza (diseño 8g a 8k): cambios en el embarazo, pérdida, red de apoyo y ejercicio adaptado.
import type { CompartirRed, Condicion, Etapa } from '../lib/types';

// ---------- 8h · Pérdida ----------

export const PERDIDA_TITULO = 'Lo sentimos mucho';
export const PERDIDA_TEXTO =
  'No hay nada que hayas hecho mal. Ya silenciamos todos los avisos del embarazo y no te preguntaremos nada que no quieras contar.';

export const PERDIDA_CUIDADOS = [
  { emoji: '🔕', titulo: 'Sin avisos del embarazo', texto: 'Ni tamaños del bebé ni celebraciones. Nunca más, salvo que tú lo pidas.' },
  { emoji: '🩺', titulo: 'Tu cuerpo', texto: 'Sangrar unos días es esperable. Consulta si hay fiebre, dolor fuerte o sangrado muy abundante.' },
  { emoji: '💬', titulo: 'Tu corazón', texto: 'El duelo no tiene tiempo fijo. Hablarlo con alguien de confianza o con una psicóloga ayuda.' },
  { emoji: '🌸', titulo: 'Cuando quieras', texto: 'Tu ciclo volverá en unas semanas. Seguimos aquí, sin prisa.' },
];

// ---------- 8j · Red de apoyo ----------

export const OPCIONES_RED: { id: CompartirRed; label: string }[] = [
  { id: 'fase', label: 'Mi fase o etapa' },
  { id: 'energia', label: 'Mi energía' },
  { id: 'periodo', label: 'Cuándo viene el período' },
  { id: 'ayuda', label: 'Cómo puede ayudarme' },
];

export const INTRO_RED =
  'Comparte solo lo que tú elijas con tu pareja o alguien de confianza. Tus síntomas y notas nunca se comparten.';

// Consejo para quien acompaña, según la etapa.
export const AYUDA_RED: Partial<Record<Etapa, string>> & { general: string } = {
  posparto: 'Encárgate de una toma de noche para que ella duerma 4 horas seguidas.',
  ttc: 'Acompáñala sin presión: pregúntale cómo se siente con la búsqueda.',
  general: 'Pregúntale qué necesita, sin dar por hecho cómo se siente.',
};

// ---------- 8k · Ejercicio adaptado a tu etapa ----------

// Por id de ejercicio de la app.
export const ADAPTADO: Partial<Record<Etapa, Record<string, string>>> = {
  posparto: {
    sentadilla: 'Desde la semana 6, con permiso médico. Exhala y activa el suelo pélvico al subir.',
    zancada: 'Desde la semana 6, con permiso médico. Paso corto y sin rebotes.',
    puente: 'Desde la semana 6: exhala al subir y activa el suelo pélvico.',
    'gato-vaca': 'Suave y sin forzar el abdomen. Ideal para la espalda de tanto cargar.',
    'rodillas-pecho': 'Suave y sin forzar el abdomen. Ideal para la espalda de tanto cargar.',
    plancha: 'Espera al alta de tu control y revisa la diástasis. Empieza en pared.',
    tijera: 'Aún no: espera unas 12 semanas y que no haya escapes de orina.',
    marcha: 'Sin impacto: buena opción mientras vuelves al ejercicio.',
    caminata: 'Desde los primeros días, paseos cortos con tu bebé.',
  },
  ttc: {
    caminata: 'Moverte con constancia ayuda a regular tu ciclo. A ritmo en que puedas conversar.',
    tijera: 'Puedes seguir entrenando como siempre: el ejercicio moderado no afecta la búsqueda.',
  },
};

// En ciclo especial el consejo depende de la condición marcada.
export const ADAPTADO_ESPECIAL: Partial<Record<Condicion, Record<string, string>>> = {
  sop: {
    sentadilla: 'Con SOP, la fuerza ayuda a usar mejor la insulina. Dos o tres veces por semana.',
    zancada: 'Con SOP, la fuerza ayuda a usar mejor la insulina. Dos o tres veces por semana.',
    caminata: 'Con SOP, caminar a diario ayuda a usar mejor la insulina.',
  },
  endometriosis: {
    'rodillas-pecho': 'Con endometriosis, úsalo en los días de dolor: suelta la zona baja de la espalda.',
    'gato-vaca': 'Con endometriosis, úsalo en los días de dolor: suelta la zona baja de la espalda.',
    caminata: 'Con endometriosis, el movimiento suave y constante ayuda con el dolor.',
  },
};

export const NOMBRE_ETAPA: Partial<Record<Etapa, string>> = {
  posparto: 'Posparto',
  ttc: 'Busco un embarazo',
  especial: 'Ciclo especial',
};
