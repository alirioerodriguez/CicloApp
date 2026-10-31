// Embarazo: dudas que aparecen en la semana y se olvidan en el consultorio. Se anotan cuando surgen (con la semana de
// gestación de ese día) y en el Modo consulta se ven las pendientes, para leerlas o compartirlas con la obstetra.
// Funciones puras: la pantalla las usa con `update` del store.
import type { DatosEmbarazo, ISODate, PreguntaConsulta } from './types';

export const MAX_PREGUNTA = 280;

const lista = (e: DatosEmbarazo): PreguntaConsulta[] => (Array.isArray(e.preguntas) ? e.preguntas : []);

/** Suma una pregunta. Ignora el texto vacío y la misma pregunta pendiente repetida (sin distinguir mayúsculas). */
export function agregarPregunta(e: DatosEmbarazo, texto: string, fecha: ISODate, semana: number | null, id: string): DatosEmbarazo {
  const limpio = texto.replace(/\s+/g, ' ').trim().slice(0, MAX_PREGUNTA);
  if (!limpio) return e;
  const ya = lista(e).some((p) => !p.hecha && p.texto.toLowerCase() === limpio.toLowerCase());
  if (ya) return e;
  return { ...e, preguntas: [...lista(e), { id, fecha, semana, texto: limpio, hecha: false }] };
}

/** Marca o desmarca una pregunta como ya conversada en la consulta. */
export function marcarPregunta(e: DatosEmbarazo, id: string, hecha: boolean): DatosEmbarazo {
  return { ...e, preguntas: lista(e).map((p) => (p.id === id ? { ...p, hecha } : p)) };
}

export function quitarPregunta(e: DatosEmbarazo, id: string): DatosEmbarazo {
  return { ...e, preguntas: lista(e).filter((p) => p.id !== id) };
}

/** Saca las ya conversadas: después de la consulta, la lista queda limpia para la próxima. */
export function limpiarConversadas(e: DatosEmbarazo): DatosEmbarazo {
  return { ...e, preguntas: lista(e).filter((p) => !p.hecha) };
}

/** Las pendientes, de la más vieja a la más nueva (así se preguntan en el orden en que surgieron). */
export function pendientes(e: DatosEmbarazo): PreguntaConsulta[] {
  return lista(e)
    .filter((p) => !p.hecha)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

/** «Semana 24 · ¿Puedo viajar en avión?» */
export function lineaPregunta(p: PreguntaConsulta): string {
  return p.semana != null && p.semana > 0 ? `Semana ${p.semana} · ${p.texto}` : p.texto;
}
