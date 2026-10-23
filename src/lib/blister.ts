// Blíster digital: lógica pura (sin React ni almacenamiento). Fácil de probar.
// Cada blíster arranca solo al terminar el anterior: la posición se calcula desde `inicio`.
// La ventana de "tarde" (12 h combinada, 3 h solo progestágeno) es orientativa; ante un olvido la app
// solo dice "revisa el prospecto o consulta a tu médico", sin instrucciones médicas.
import { addDays, diffDays, fromISO, today } from './dates';
import type { AppData, BlisterConfig, DayLog, EstadoToma, ISODate, PillLog, PillType, Settings, TipoBlister } from './types';

export type Alveolo = 'activa' | 'placebo' | 'descanso';

interface Esquema {
  activas: number;
  inactivas: number;
  inactiva: Exclude<Alveolo, 'activa'>; // qué hay en los días sin hormona
}

export const ESQUEMAS: Record<Exclude<TipoBlister, 'personalizado'>, Esquema & { label: string }> = {
  '21-7': { activas: 21, inactivas: 7, inactiva: 'descanso', label: '21 + 7 días de descanso' },
  '24-4': { activas: 24, inactivas: 4, inactiva: 'placebo', label: '24 + 4 placebo' },
  '21-7p': { activas: 21, inactivas: 7, inactiva: 'placebo', label: '21 + 7 placebo' },
  '28': { activas: 28, inactivas: 0, inactiva: 'placebo', label: '28 continuo' },
};

export const HORAS_TARDE = { combinada: 12, progestageno: 3 } as const;

export function esquema(c: BlisterConfig): Esquema {
  if (c.tipo !== 'personalizado') return ESQUEMAS[c.tipo];
  const activas = Math.max(1, Math.round(c.activas ?? 21));
  const inactivas = Math.max(0, Math.round(c.inactivas ?? 7));
  return { activas, inactivas, inactiva: c.inactivasPlacebo ? 'placebo' : 'descanso' };
}

export interface DiaBlister {
  numero: number; // 1 = primer alvéolo del blíster en curso
  total: number; // alvéolos del blíster (activas + inactivas)
  alveolo: Alveolo;
  inicioBlister: ISODate;
  siguienteInicio: ISODate; // el blíster nuevo arranca solo este día
}

// En qué alvéolo cae una fecha. Antes del primer inicio también funciona (cuenta hacia atrás).
export function diaDelBlister(c: BlisterConfig, fecha: ISODate): DiaBlister {
  const e = esquema(c);
  const total = e.activas + e.inactivas;
  const offset = ((diffDays(fecha, c.inicio) % total) + total) % total;
  const numero = offset + 1;
  return {
    numero,
    total,
    alveolo: numero <= e.activas ? 'activa' : e.inactiva,
    inicioBlister: addDays(fecha, -offset),
    siguienteInicio: addDays(fecha, total - offset),
  };
}

// ¿Hay que tomar algo ese día? (en los días de descanso no se toma nada).
export const tocaTomar = (c: BlisterConfig, fecha: ISODate) => diaDelBlister(c, fecha).alveolo !== 'descanso';

const minutos = (hora: string) => {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + (m || 0);
};

// Tomada a tiempo o tarde, según cuánto pasó desde la hora programada.
export function clasificarToma(c: BlisterConfig, hora: string): Exclude<EstadoToma, 'olvidada'> {
  return minutos(hora) - minutos(c.hora) > HORAS_TARDE[c.tipoPastilla] * 60 ? 'tarde' : 'tomada';
}

export type EstadoDia = EstadoToma | 'pendiente' | 'futura' | 'descanso';

// Estado que se ve en el alvéolo: lo registrado manda; un día pasado sin marcar cuenta como olvidado.
export function estadoDelDia(c: BlisterConfig, tomas: Record<ISODate, PillLog>, fecha: ISODate, hoy: ISODate = today()): EstadoDia {
  if (!tocaTomar(c, fecha)) return 'descanso';
  const log = tomas[fecha];
  if (log) return log.estado;
  if (fecha > hoy) return 'futura';
  if (fecha === hoy) return 'pendiente';
  return 'olvidada';
}

// ¿Ya pasó la ventana de hoy sin marcarla? (para el aviso informativo, no para cambiar datos).
export function horaLimite(c: BlisterConfig, fecha: ISODate): Date {
  const d = fromISO(fecha);
  const m = minutos(c.hora) + HORAS_TARDE[c.tipoPastilla] * 60;
  d.setHours(0, m, 0, 0);
  return d;
}

// Resumen para el encabezado: "Pastilla 14 de 21" (activas) o "Placebo 2 de 7" / "Descanso 3 de 7".
export function encabezado(c: BlisterConfig, fecha: ISODate): { tipo: Alveolo; n: number; de: number } {
  const e = esquema(c);
  const d = diaDelBlister(c, fecha);
  return d.alveolo === 'activa' ? { tipo: 'activa', n: d.numero, de: e.activas } : { tipo: d.alveolo, n: d.numero - e.activas, de: e.inactivas };
}

// ---------- Migración desde el modelo anterior (pillType + pillPackStart + pillTaken en DayLog) ----------

const DESDE_PILLTYPE: Record<PillType, Pick<BlisterConfig, 'tipo' | 'tipoPastilla' | 'activas' | 'inactivas' | 'inactivasPlacebo'>> = {
  '21-7': { tipo: '21-7', tipoPastilla: 'combinada' },
  '21-7p': { tipo: '21-7p', tipoPastilla: 'combinada' },
  '24-4': { tipo: '24-4', tipoPastilla: 'combinada' },
  '26-2': { tipo: 'personalizado', tipoPastilla: 'combinada', activas: 26, inactivas: 2, inactivasPlacebo: true },
  continua: { tipo: '28', tipoPastilla: 'combinada' },
  pop: { tipo: '28', tipoPastilla: 'progestageno' },
  'pop-24-4': { tipo: '24-4', tipoPastilla: 'progestageno' },
};

// Para elegir una marca conocida (content/pastillas usa el esquema anterior).
export function configDesdePillType(tipo: PillType): Pick<BlisterConfig, 'tipo' | 'tipoPastilla' | 'activas' | 'inactivas' | 'inactivasPlacebo'> {
  return { ...DESDE_PILLTYPE[tipo] };
}

// Al revés: lo más parecido en el esquema anterior, que todavía usan recordatorios, PDF y estadísticas.
export function pillTypeDesdeBlister(c: BlisterConfig): PillType {
  const pop = c.tipoPastilla === 'progestageno';
  if (c.tipo === '28') return pop ? 'pop' : 'continua';
  if (c.tipo === '24-4') return pop ? 'pop-24-4' : '24-4';
  if (c.tipo === 'personalizado') {
    const e = esquema(c);
    if (e.inactivas === 0) return pop ? 'pop' : 'continua';
    if (e.activas === 26 && e.inactivas === 2) return '26-2';
    return e.inactiva === 'placebo' ? '21-7p' : '21-7';
  }
  return c.tipo;
}

const hora = (h: number, m: number) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

export function blisterDesdeAjustes(s: Settings): BlisterConfig | null {
  if (!s.pillPackStart) return null;
  return { ...DESDE_PILLTYPE[s.pillType], inicio: s.pillPackStart, hora: hora(s.reminders.pill.hour, s.reminders.pill.minute) };
}

// Las pastillas marcadas antes (pillTaken en DayLog) pasan al registro nuevo, sin borrar nada.
export function tomasDesdeLogs(logs: Record<ISODate, DayLog>, c: BlisterConfig | null, previas: Record<ISODate, PillLog>): Record<ISODate, PillLog> {
  const out = { ...previas };
  for (const l of Object.values(logs)) {
    if (!l.pillTaken || out[l.date]) continue;
    out[l.date] = { fecha: l.date, estado: c && l.pillTime ? clasificarToma(c, l.pillTime) : 'tomada', hora: l.pillTime };
  }
  return out;
}

// Valida lo que venga de un respaldo o de la nube; si no sirve, null.
export function normalizarBlister(raw: unknown): BlisterConfig | null {
  const b = raw as Partial<BlisterConfig> | null;
  if (!b || typeof b !== 'object' || !b.inicio || !/^\d{4}-\d{2}-\d{2}$/.test(b.inicio)) return null;
  const tipo: TipoBlister = b.tipo && (b.tipo === 'personalizado' || b.tipo in ESQUEMAS) ? b.tipo : '21-7';
  return {
    tipo,
    inicio: b.inicio,
    hora: typeof b.hora === 'string' && /^\d{2}:\d{2}$/.test(b.hora) ? b.hora : '21:00',
    tipoPastilla: b.tipoPastilla === 'progestageno' ? 'progestageno' : 'combinada',
    ...(tipo === 'personalizado' ? { activas: b.activas ?? 21, inactivas: b.inactivas ?? 7, inactivasPlacebo: !!b.inactivasPlacebo } : {}),
  };
}

export function normalizarTomas(raw: unknown): Record<ISODate, PillLog> {
  const out: Record<ISODate, PillLog> = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const [fecha, v] of Object.entries(raw as Record<string, Partial<PillLog>>)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !v) continue;
    const estado: EstadoToma = v.estado === 'tarde' || v.estado === 'olvidada' ? v.estado : 'tomada';
    out[fecha] = { fecha, estado, hora: typeof v.hora === 'string' ? v.hora : null };
  }
  return out;
}

// Los datos antiguos se migran al cargar: config del blíster desde los ajustes y tomas desde DayLog.
export function migrarBlister(data: Pick<AppData, 'settings' | 'logs'> & { blister?: unknown; tomasPastilla?: unknown }) {
  const blister = normalizarBlister(data.blister) ?? blisterDesdeAjustes(data.settings);
  const tomasPastilla = tomasDesdeLogs(data.logs, blister, normalizarTomas(data.tomasPastilla));
  return { blister, tomasPastilla };
}
