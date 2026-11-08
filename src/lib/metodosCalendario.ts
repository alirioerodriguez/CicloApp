// Recordatorios de otros métodos hormonales: anillo, parche e inyección. Cuentas de calendario, sin internet.
// Cada método sigue el esquema habitual del prospecto; la usuaria siempre manda con el suyo.
// Fuentes: NHS – Contraceptive vaginal ring (3 semanas puesto + 7 días sin), NHS – Contraceptive patch
// (un parche por semana 3 semanas + 7 días sin), NHS – Contraceptive injection (la de 13 semanas) y OMS –
// Selected Practice Recommendations for Contraceptive Use, 3.ª ed. (inyectable mensual cada 4 semanas).
// La inyección mensual en Argentina y Venezuela suele indicarse «cada 30 días»: confirmar con el prospecto.
import { addDays } from './dates';
import type { ISODate } from './types';

export type MetodoCalendario = 'anillo' | 'parche' | 'inyeccion_mensual' | 'inyeccion_trimestral';

export interface Recordatorio {
  /** Qué toca hacer en `fecha`. */
  accion: 'poner_anillo' | 'sacar_anillo' | 'cambiar_parche' | 'semana_sin_parche' | 'poner_parche' | 'inyeccion';
  fecha: ISODate;
  /** Días desde `hoy` (0 = hoy). */
  enDias: number;
  /** Texto para la pantalla; la notificación usa uno neutro. */
  texto: string;
}

const DIA_MS = 86_400_000;
const diasEntre = (a: ISODate, b: ISODate) => Math.round((Date.parse(b + 'T12:00:00Z') - Date.parse(a + 'T12:00:00Z')) / DIA_MS);

export const DURACION_INYECCION: Record<'inyeccion_mensual' | 'inyeccion_trimestral', number> = {
  inyeccion_mensual: 30,
  inyeccion_trimestral: 91, // 13 semanas
};

/**
 * Próximo recordatorio a partir del día en que empezó el ciclo actual del método (`inicio`: cuando se puso el
 * anillo o el primer parche, o el día de la última inyección).
 */
export function proximoRecordatorio(metodo: MetodoCalendario, inicio: ISODate, hoy: ISODate): Recordatorio {
  const dias = diasEntre(inicio, hoy);
  if (metodo === 'inyeccion_mensual' || metodo === 'inyeccion_trimestral') {
    const cada = DURACION_INYECCION[metodo];
    const vueltas = Math.max(1, Math.ceil(Math.max(dias, 0) / cada) || 1);
    const fecha = addDays(inicio, vueltas * cada);
    const enDias = diasEntre(hoy, fecha);
    return { accion: 'inyeccion', fecha, enDias, texto: enDias === 0 ? 'Hoy toca la inyección' : `Próxima inyección en ${enDias} ${enDias === 1 ? 'día' : 'días'}` };
  }

  // Anillo y parche: ciclos de 28 días (21 con método + 7 sin).
  const enCiclo = ((dias % 28) + 28) % 28;
  const base = addDays(inicio, dias - enCiclo);
  if (metodo === 'anillo') {
    const [accion, offset, texto] = enCiclo < 21
      ? (['sacar_anillo', 21, 'Sacar el anillo'] as const)
      : (['poner_anillo', 28, 'Poner un anillo nuevo'] as const);
    const fecha = addDays(base, offset);
    return { accion, fecha, enDias: diasEntre(hoy, fecha), texto };
  }
  // Parche: cambio los días 7 y 14, se saca el 21 y se pone uno nuevo el 28.
  const paso = [7, 14, 21, 28].find((d) => d > enCiclo) ?? 28;
  const accion = paso === 21 ? 'semana_sin_parche' : paso === 28 ? 'poner_parche' : 'cambiar_parche';
  const texto = paso === 21 ? 'Sacar el parche (semana sin parche)' : paso === 28 ? 'Poner un parche nuevo' : 'Cambiar el parche';
  const fecha = addDays(base, paso);
  return { accion, fecha, enDias: diasEntre(hoy, fecha), texto };
}

/** El primer recordatorio en `desde` o después. */
function primeroDesde(metodo: MetodoCalendario, inicio: ISODate, desde: ISODate): Recordatorio {
  // La inyección ya cuenta el día mismo («hoy toca»); anillo y parche dan siempre el siguiente: se mira desde el día anterior.
  const esInyeccion = metodo === 'inyeccion_mensual' || metodo === 'inyeccion_trimestral';
  const r = proximoRecordatorio(metodo, inicio, esInyeccion ? desde : addDays(desde, -1));
  return { ...r, enDias: diasEntre(desde, r.fecha) };
}

/** Los próximos `n` recordatorios desde `hoy` (incluido), para programar los avisos. */
export function proximosRecordatorios(metodo: MetodoCalendario, inicio: ISODate, hoy: ISODate, n: number): Recordatorio[] {
  const salida: Recordatorio[] = [];
  // El día de inicio ya se hizo (se puso el anillo o la inyección): se avisa desde el siguiente
  let desde = hoy <= inicio ? addDays(inicio, 1) : hoy;
  while (salida.length < n) {
    const r = primeroDesde(metodo, inicio, desde);
    // El aviso suena ese mismo día: la inyección se nombra sin «en N días»
    salida.push({ ...r, enDias: diasEntre(hoy, r.fecha), texto: r.accion === 'inyeccion' ? 'Toca la inyección' : r.texto });
    desde = addDays(r.fecha, 1);
  }
  return salida;
}
