// Fechas siempre como texto local 'YYYY-MM-DD'.
import type { Modo, TonoId } from './theme';

export type ISODate = string;

export interface DayLog {
  date: ISODate;
  flow: number; // 0 = nada, 1 manchado, 2 leve, 3 medio, 4 abundante
  pain: number; // 0–10
  moods: string[];
  symptoms: string[];
  note: string;
  water: number; // vasos
  sleep: number | null; // horas
  pillTaken: boolean;
  pillTime: string | null; // 'HH:MM'
  ovario: 'izq' | 'der' | 'ambos' | null; // dolor de ovario
  senos: string[]; // 'seno_izq' | 'seno_der' | 'bulto'
  intimidad: boolean;
}

// 21-7: días sin pastilla · 21-7p: placebo · pop: solo progestágeno.
export type PillType = '21-7' | '21-7p' | '24-4' | '26-2' | 'continua' | 'pop' | 'pop-24-4';

export interface ReminderTime {
  on: boolean;
  hour: number;
  minute: number;
}

export type Condicion = 'irregular' | 'sop' | 'endometriosis' | 'tdpm' | 'perimenopausia' | 'tiroides';

export interface Settings {
  onboarded: boolean;
  tutorialVisto: boolean;
  name: string;
  cycleLength: number; // valor inicial; luego se aprende de los datos
  periodLength: number;
  pillMode: boolean;
  pillName: string;
  pillType: PillType;
  pillPackStart: ISODate | null; // día 1 del blíster actual (o de cualquiera)
  condiciones: Condicion[];
  ocultarRetrasos: boolean; // sin avisos de retraso ni sugerencias de prueba de embarazo
  reminders: {
    pill: ReminderTime;
    water: { on: boolean; hours: number[] };
    period: { on: boolean; daysBefore: number; hour: number };
    pack: { on: boolean; hour: number };
    registro: ReminderTime; // empujoncito para registrar el día
    autoexamen: { on: boolean; hour: number };
    controles: { on: boolean; daysBefore: number; hour: number };
  };
  lock: boolean;
  lastBackup: ISODate | null;
  logrosVistos: string[]; // logros ya celebrados
  discreet: boolean; // notificaciones que no dicen "pastilla" ni "período"
  tono: TonoId;
  modo: Modo;
  signo: string | null; // diario de sueños (solo por diversión)
}

export interface Dream {
  id: string;
  date: ISODate;
  texto: string;
  tipos: string[];
}

export interface Control {
  id: string;
  tipo: string; // id de TIPOS_CONTROL o texto libre
  titulo: string;
  nota: string;
  fecha: ISODate;
  hechos: ISODate[];
}

export interface Quiste {
  id: string;
  ovario: 'izq' | 'der';
  tipo: string;
  medidas: { fecha: ISODate; mm: number }[];
  nota: string;
}

export interface PruebaResultado {
  ok: boolean;
  facilidad: number; // 1–7 (Single Ease Question)
  segundos: number;
  comentario: string;
  fecha: ISODate;
}

export interface AppData {
  version: 1;
  settings: Settings;
  logs: Record<ISODate, DayLog>;
  dreams: Dream[];
  controles: Control[];
  autoexamenes: ISODate[];
  quistes: Quiste[];
  pruebas: {
    misiones: Record<string, PruebaResultado>;
    sus: number[]; // 10 respuestas 1–5
    ideas: { fecha: ISODate; texto: string }[];
  };
}

export type Phase = 'menstrual' | 'folicular' | 'ovulatoria' | 'lutea' | 'pastilla';
