import { region } from './region';
import type { ISODate } from './types';

const pad = (n: number) => String(n).padStart(2, '0');

export function toISO(d: Date): ISODate {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Mediodía local: evita saltos raros por cambio de horario.
export function fromISO(s: ISODate): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

export function today(): ISODate {
  return toISO(new Date());
}

export function addDays(s: ISODate, n: number): ISODate {
  const d = fromISO(s);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export function diffDays(a: ISODate, b: ISODate): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  return Math.round((Date.UTC(ay, am - 1, ad) - Date.UTC(by, bm - 1, bd)) / 86400000);
}

// Las fechas se arman en el idioma elegido (lib/region), no pasan por el diccionario.
const MESES = {
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
const DIAS = {
  es: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};
const INICIALES = { es: ['L', 'M', 'M', 'J', 'V', 'S', 'D'], en: ['M', 'T', 'W', 'T', 'F', 'S', 'S'] };

export const meses = () => MESES[region().idioma];
export const inicialesSemana = () => INICIALES[region().idioma];

export function shortDate(s: ISODate): string {
  const d = fromISO(s);
  const mes = meses()[d.getMonth()].slice(0, 3);
  return region().idioma === 'en' ? `${mes} ${d.getDate()}` : `${d.getDate()} ${mes}`;
}

export function longDate(s: ISODate): string {
  const d = fromISO(s);
  const dia = DIAS[region().idioma][d.getDay()];
  return region().idioma === 'en' ? `${dia}, ${meses()[d.getMonth()]} ${d.getDate()}` : `${dia} ${d.getDate()} de ${meses()[d.getMonth()]}`;
}

export function timeLabel(hour: number, minute: number): string {
  return `${pad(hour)}:${pad(minute)}`;
}

export function nowTime(): string {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function inDays(n: number): string {
  if (region().idioma === 'en') {
    if (n === 0) return 'today';
    if (n === 1) return 'tomorrow';
    if (n === -1) return 'yesterday';
    return n > 0 ? `in ${n} days` : `${-n} days ago`;
  }
  if (n === 0) return 'hoy';
  if (n === 1) return 'mañana';
  if (n === -1) return 'ayer';
  return n > 0 ? `en ${n} días` : `hace ${-n} días`;
}
