// Guía «¿Olvidaste una pastilla?»: orienta, no prescribe. Siempre termina en «revisa tu prospecto y consulta».
// Fuentes: CDC, U.S. Selected Practice Recommendations for Contraceptive Use (2024), y OMS, Selected practice
// recommendations for contraceptive use (3.ª ed., 2016). Se sigue la del CDC, que es la más prudente
// (desde 2 pastillas olvidadas ya pide protección extra; la OMS lo pide desde 3).
import type { PillType } from './types';

export type TipoGuia = 'combinada' | 'combinadaContinua' | 'progestageno' | 'especial';
export type Olvido = 'placebo' | 'una' | 'dosOMas';

export interface Respuesta {
  pasos: string[];
  /** Mensaje destacado (protección extra o consulta urgente). */
  aviso?: string;
}

export const CIERRE = 'Es una guía general: tu prospecto manda. Ante cualquier duda, consulta a tu médica o en la farmacia.';
export const VOMITO = 'Si vomitaste o tuviste diarrea fuerte en las 3–4 horas después de tomarla, cuenta como olvidada.';

export function tipoDeGuia(pillType: PillType): TipoGuia {
  if (pillType === '26-2') return 'especial';
  if (pillType === 'pop' || pillType === 'pop-24-4') return 'progestageno';
  if (pillType === 'continua') return 'combinadaContinua';
  return 'combinada';
}

/** Combinada (estrógeno + progestágeno). semana: en qué semana de pastillas con hormona fue el olvido (1, 2 o 3+). */
export function guiaCombinada(o: { olvido: Olvido; semana?: 1 | 2 | 3; continua?: boolean; relaciones?: boolean }): Respuesta {
  if (o.olvido === 'placebo') {
    return { pasos: ['Las pastillas placebo (o los días sin pastilla) no tienen hormona.', 'Descarta las placebo que olvidaste y sigue con el blíster como siempre.'] };
  }
  if (o.olvido === 'una') {
    return {
      pasos: [
        'Toma la pastilla olvidada apenas te acuerdes, aunque eso signifique tomar dos el mismo día.',
        'Sigue con las siguientes a tu hora de siempre.',
        'Con una sola olvidada no hace falta protección extra.',
      ],
    };
  }
  const pasos = [
    'Toma la última pastilla que olvidaste apenas te acuerdes y descarta las otras olvidadas.',
    'Sigue con las siguientes a tu hora de siempre, aunque tomes dos el mismo día.',
  ];
  if (!o.continua && o.semana === 3) {
    pasos.push('Como fue en la última semana de pastillas con hormona: termina esas pastillas, no hagas la pausa ni tomes los placebo, y empieza el blíster nuevo al día siguiente.');
  }
  return {
    pasos,
    aviso:
      !o.continua && o.semana === 1 && o.relaciones
        ? 'Usa preservativo (o evita las relaciones) hasta completar 7 días seguidos de pastillas con hormona. Como tuviste relaciones sin protección en los últimos 5 días, consulta hoy en una farmacia o con tu médica sobre la pastilla de emergencia.'
        : 'Usa preservativo (o evita las relaciones) hasta completar 7 días seguidos de pastillas con hormona.',
  };
}

/** Solo progestágeno. masDe3Horas: si pasaron más de 3 horas de la hora habitual (12 con desogestrel). */
export function guiaProgestageno(o: { masDe3Horas: boolean; relaciones?: boolean }): Respuesta {
  if (!o.masDe3Horas) {
    return { pasos: ['Tómala ahora y sigue con las siguientes a tu hora de siempre.', 'Con menos de 3 horas de atraso no hace falta protección extra.'] };
  }
  return {
    pasos: ['Toma una pastilla apenas te acuerdes (solo una, aunque hayas olvidado más).', 'Sigue con las siguientes a tu hora de siempre, aunque tomes dos el mismo día.'],
    aviso: o.relaciones
      ? 'Usa preservativo (o evita las relaciones) los próximos 2 días. Como tuviste relaciones sin protección, consulta hoy en una farmacia o con tu médica sobre la pastilla de emergencia.'
      : 'Usa preservativo (o evita las relaciones) los próximos 2 días.',
  };
}

export const GUIA_ESPECIAL: Respuesta = {
  pasos: ['Tu pastilla tiene dosis distintas según el día del blíster (tipo Qlaira): lo que hay que hacer cambia según cuál olvidaste.', 'Sigue las instrucciones de olvido de tu prospecto.'],
  aviso: 'Mientras tanto, usa preservativo (o evita las relaciones) y consulta en la farmacia o con tu médica.',
};
