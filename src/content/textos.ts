// Textos de la app: avisos, notificaciones, saludos, estados vacíos y logros. Editable.
// {dias} se reemplaza por el número de días.
// Fuentes de la parte de predicción: [16] [29] [35]–[38].
import { supabaseConfigured } from '../lib/supabase';

export const AVISO_ANTICONCEPTIVO =
  'Las fechas fértiles son solo una estimación. Esta app no sirve como método anticonceptivo ni para evitar un embarazo.';
export const AVISO_ANTICONCEPTIVO_CORTO = 'Es una estimación: esta app no sirve como método anticonceptivo.';

export const NOTIF = {
  pastilla: [
    'Hora de tu pastilla. Un gesto pequeño, todos los días.',
    'Tu pastilla te espera. ¿Ya la tomaste?',
    'Recordatorio cariñoso: tu pastilla de hoy',
    'Es la hora de siempre: pastilla y listo',
    'No te olvides de tu pastilla. Márcala cuando la tomes.',
  ],
  pastillaAtrasada: 'Pasó tu hora de la pastilla. Si aún no la tomaste, revisa el prospecto.',
  descansoSinPastilla: 'Mañana empiezan tus días de descanso. Anota cuándo retomas',
  descansoPlacebo: 'Mañana empiezan las pastillas sin hormona. Sigue tomándolas como siempre',
  blisterNuevo: 'Mañana empieza tu blíster nuevo. ¿Ya lo tienes a mano?',
  blisterTrasDescanso: 'Se termina tu descanso: mañana arrancas blíster nuevo',
  periodo: [
    'Tu período podría llegar en {dias} días. Ten a mano lo que necesites',
    'Se acerca tu período. Buen momento para guardar algo en la cartera',
    'Faltan unos {dias} días. Tu bolsa de agua tibia ya te espera',
    'Se viene tu período. Es una estimación: tu cuerpo tiene la última palabra',
  ],
  periodoManana: 'Tu período podría llegar mañana. Hoy date un ratito para ti',
  agua: [
    'Un vasito de agua, ¿te parece?',
    'Pausa de hidratación: tu cuerpo te lo agradece',
    'Hora de rellenar tu botella',
    '¿Cuánta agua llevas hoy? Un traguito más no cae mal',
    'Agua y un respiro de un minuto. Te lo mereces',
  ],
  registro: '¿Cómo estuvo tu día? Regístralo en un minuto',
  autoexamen: 'Hoy es un buen día para tu autoexamen de mamas. Toma 2 minutos.',
  control: 'En {dias} días tienes: {control}',
  respaldo: [
    'Guarda una copia extra de tus datos en un archivo',
    'Hace tiempo que no guardas una copia. ¿La hacemos?',
    'Tus registros son valiosos. Guarda un respaldo hoy',
    'Si cambias de teléfono, el respaldo te salva. Toma un minuto',
    'Tu historial está seguro aquí. Guarda una copia por si acaso',
  ],
};

// Aviso dentro de la app si ayer no se marcó la pastilla.
export const PASTILLA_AYER = [
  'No marcaste la pastilla de ayer. Revisa el prospecto para saber qué hacer',
  'Si ayer se te pasó la pastilla, revisa el prospecto o pregunta en la farmacia.',
];

type Momento = 'manana' | 'tarde' | 'noche';
type Estado = 'periodo' | 'sinPeriodo' | 'retraso' | 'general';

export const SALUDOS: Record<Momento, { titulo: string } & Record<Estado, string>> = {
  manana: {
    titulo: 'Buenos días',
    periodo: 'Hoy, calma y cariño contigo',
    sinPeriodo: '¿Cómo amaneciste hoy?',
    retraso: 'Tu período se está haciendo esperar; anótalo y ve con calma.',
    general: 'Un minuto para registrar cómo te sientes',
  },
  tarde: {
    titulo: 'Buenas tardes',
    periodo: '¿Cómo va el cuerpo? Una pausa no cae mal',
    sinPeriodo: '¿Qué tal va tu día?',
    retraso: 'Un retraso puede pasar; si te preocupa, puedes consultarlo.',
    general: '¿Ya tomaste agua hoy?',
  },
  noche: {
    titulo: 'Buenas noches',
    periodo: 'Manta, descanso y mañana será otro día',
    sinPeriodo: '¿Cómo estuvo tu día?',
    retraso: 'Descansa; mañana puedes revisar cómo sigue tu ciclo.',
    general: 'Antes de dormir, ¿registras tu día?',
  },
};

export function saludo(hour: number, estado: Estado) {
  const m = SALUDOS[hour < 12 ? 'manana' : hour < 19 ? 'tarde' : 'noche'];
  return { titulo: m.titulo, texto: m[estado] };
}

export const VACIOS = {
  estadisticas: {
    titulo: 'Todavía no hay nada que mostrar',
    texto: 'Cuando registres algunos días, aquí verás tus patrones. Empieza hoy, sin presión.',
  },
  primerDia: {
    titulo: 'Bienvenida',
    texto: `Aquí llevas tu ciclo a tu manera. ${supabaseConfigured ? 'Tus datos son privados y quedan respaldados en tu cuenta.' : 'Todo queda solo en tu teléfono.'} ¿Empezamos con cómo te sientes hoy?`,
  },
};

export type LogroId = 'racha7' | 'ciclo1' | 'pastilla30' | 'meses3' | 'respaldo1' | 'suenos3';

export const LOGROS: { id: LogroId; titulo: string; texto: string }[] = [
  { id: 'racha7', titulo: 'Una semana contigo', texto: 'Siete días seguidos registrando. Conocerte también es cuidarte.' },
  { id: 'ciclo1', titulo: '¡Primer ciclo completo!', texto: 'Ya tienes tu primer ciclo registrado. Desde ahora las predicciones se irán ajustando a ti.' },
  { id: 'pastilla30', titulo: '30 de 30', texto: 'Un mes entero sin olvidar tu pastilla. ¡Qué constancia!' },
  { id: 'meses3', titulo: 'Tres meses de ti', texto: 'Tus estadísticas tienen cada vez más sentido.' },
  { id: 'respaldo1', titulo: 'Copia guardada', texto: 'Hiciste tu primer respaldo. Tus datos están a salvo.' },
  { id: 'suenos3', titulo: 'Soñadora', texto: 'Anotaste 3 sueños en tu diario.' },
];

// Qué tan confiable es la predicción según los ciclos registrados (criterio práctico, B5.19).
export function confianza(ciclos: number): string {
  if (ciclos === 0) return 'Estimación inicial';
  if (ciclos < 3) return 'Estimación en ajuste';
  if (ciclos < 6) return 'Estimación razonable';
  return 'Estimación estable';
}

export function fill(text: string, dias: number) {
  return text.replace('{dias}', String(dias));
}
