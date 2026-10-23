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
  // Modo "busco un embarazo".
  moco: Moco | null;
  temp: number | null; // temperatura basal, °C
  lh: 'neg' | 'pos' | null; // test de ovulación
  // Modo posparto.
  loquios: Loquios | null;
  tomas: Toma[];
  cicatriz: string | null;
  // Modo menopausia.
  bochornos: number | null;
  intensidad: string | null; // del bochorno más fuerte
  despertares: number | null;
  despertoPor: string[];
  sentir: { sueno: number; animo: number; energia: number } | null; // 0 a 4
  menoExtra: string[]; // otros síntomas: niebla mental, mareos…
}

export type Loquios = 'rojo' | 'rosado' | 'amarillento' | 'no';
export interface Toma {
  lado: 'izq' | 'der' | 'biberon';
  hora: string; // 'HH:MM'
}

// Red de apoyo: qué se comparte con la pareja o alguien de confianza (nunca síntomas ni notas).
export type CompartirRed = 'fase' | 'energia' | 'periodo' | 'ayuda';
export interface RedApoyo {
  on: boolean;
  nombre: string;
  compartir: CompartirRed[];
  enVivo: boolean; // conectada con su pareja en Savia (modo pareja): el resumen se sube solo
}

export type EtapaMeno = 'peri' | 'meno' | 'post';

export interface DatosEmbarazo {
  hechos: string[]; // controles, exámenes, pendientes y bolso marcados como listos
  patadas: Record<ISODate, { n: number; segundos: number }>;
  medidas: Record<ISODate, { kg: number | null; sys: number | null; dia: number | null }>;
}

export interface Posparto {
  nacimiento: ISODate | null; // fecha del parto: de aquí salen las semanas
  parto: 'vaginal' | 'cesarea';
  alimentacion: 'pecho' | 'formula' | 'mixta';
}

// 21-7: días sin pastilla · 21-7p: placebo · pop: solo progestágeno.
export type PillType = '21-7' | '21-7p' | '24-4' | '26-2' | 'continua' | 'pop' | 'pop-24-4';

// ---------- Blíster digital ----------
// Va separado de DayLog: la configuración del blíster y un registro propio de tomas.
// 21-7: 21 activas + 7 días sin pastilla · 21-7p / 24-4: con placebo · 28: continuo · personalizado: N + M.
export type TipoBlister = '21-7' | '24-4' | '21-7p' | '28' | 'personalizado';
export type TipoPastilla = 'combinada' | 'progestageno';

export interface BlisterConfig {
  tipo: TipoBlister;
  inicio: ISODate; // día 1 del blíster actual; los siguientes arrancan solos al terminar
  hora: string; // 'HH:MM', toma diaria
  tipoPastilla: TipoPastilla;
  // Solo para 'personalizado': activas + inactivas, y si las inactivas son placebo o descanso.
  activas?: number;
  inactivas?: number;
  inactivasPlacebo?: boolean;
}

export type EstadoToma = 'tomada' | 'tarde' | 'olvidada';

export interface PillLog {
  fecha: ISODate;
  estado: EstadoToma;
  hora: string | null; // 'HH:MM' real de la toma (null si se marcó olvidada)
}

export interface ReminderTime {
  on: boolean;
  hour: number;
  minute: number;
}

export type Condicion = 'irregular' | 'sop' | 'endometriosis' | 'tdpm' | 'perimenopausia' | 'tiroides' | 'sangrados_largos';

// Los 6 modos de vida de Savia. Se cambian sin perder el historial.
export type Etapa = 'ciclo' | 'especial' | 'ttc' | 'embarazo' | 'posparto' | 'meno';

export type Anticonceptivo = 'ninguno' | 'pastilla' | 'diu_hormonal' | 'diu_cobre' | 'implante' | 'anillo';

// Señales que registra quien busca un embarazo.
export type SenalTtc = 'moco' | 'temp' | 'lh' | 'relacion';
export type Moco = 'seco' | 'pegajoso' | 'cremoso' | 'elastico';

export interface Settings {
  onboarded: boolean;
  tutorialVisto: boolean;
  name: string;
  edad: number | null;
  etapa: Etapa;
  anticonceptivo: Anticonceptivo;
  ttcRegistro: SenalTtc[]; // qué señales quiere registrar en modo "busco un embarazo"
  posparto: Posparto;
  embarazo: { fpp: ISODate | null }; // fecha probable de parto: de aquí salen las semanas
  meno: { etapa: EtapaMeno; trh: boolean; trhTipo: string; suplementos: string[] };
  red: RedApoyo;
  soloPareja: boolean; // usa Savia solo para acompañar a su pareja (sin registrar un ciclo propio)
  silencioEmbarazo: boolean; // tras una pérdida o "prefiero no decir": sin avisos ni sugerencias de embarazo
  cycleLength: number; // valor inicial; luego se aprende de los datos
  periodLength: number;
  pillMode: boolean;
  pillName: string;
  pillType: PillType;
  pillPackStart: ISODate | null; // día 1 del blíster actual (o de cualquiera)
  condiciones: Condicion[];
  ocultarRetrasos: boolean; // sin avisos de retraso ni sugerencias de prueba de embarazo
  pdfAnimo: boolean; // la usuaria eligió incluir sus estados de ánimo en el PDF para la médica
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
  // Escala de Edimburgo adaptada (4 preguntas, 0–3), una por semana: clave = lunes de esa semana.
  edimburgo: Record<ISODate, number[]>;
  embarazo: DatosEmbarazo;
  // Escala MRS (11 síntomas, 0 a 4) una vez por semana, y chequeos marcados como al día.
  mrs: Record<ISODate, number[]>;
  chequeosMeno: string[];
  // Quiz "¿Cómo estás de verdad?": un resultado por día.
  quiz: Record<ISODate, { nivel: 'calma' | 'ajuste' | 'cuidado' | 'nose'; respuestas: Record<string, number | 'x'> }>;
  pruebas: {
    misiones: Record<string, PruebaResultado>;
    sus: number[]; // 10 respuestas 1–5
    ideas: { fecha: ISODate; texto: string }[];
  };
  // Blíster digital: null si nunca se configuró. Se muestra solo con settings.pillMode encendido.
  blister: BlisterConfig | null;
  tomasPastilla: Record<ISODate, PillLog>;
}

export type Phase = 'menstrual' | 'folicular' | 'ovulatoria' | 'lutea' | 'pastilla';
