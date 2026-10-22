// Los 6 modos de vida de Savia (diseño 8a) y las opciones de cada uno (8b y 8c).
import type { Anticonceptivo, Condicion, Etapa, Moco, SenalTtc } from '../lib/types';

export interface EtapaInfo {
  id: Etapa;
  emoji: string;
  label: string;
  sub: string;
  // Para mostrar un modo como "Muy pronto" mientras se construye.
  disponible: boolean;
}

export const ETAPAS: EtapaInfo[] = [
  { id: 'ciclo', emoji: '🌸', label: 'Ciclo regular', sub: 'Fases, predicción y entrenamiento según tu fase', disponible: true },
  { id: 'especial', emoji: '🌀', label: 'Ciclo especial', sub: 'SOP, endometriosis, ciclos irregulares o anticonceptivos', disponible: true },
  { id: 'ttc', emoji: '🌱', label: 'Busco un embarazo', sub: 'Ventana fértil, moco cervical, temperatura y LH', disponible: true },
  { id: 'embarazo', emoji: '🤰', label: 'Estoy embarazada', sub: 'Semana a semana, controles y tu bebé', disponible: true },
  { id: 'posparto', emoji: '🍼', label: 'Posparto o lactancia', sub: 'Tu recuperación, tu ánimo y la lactancia', disponible: true },
  { id: 'meno', emoji: '🌗', label: 'Perimenopausia o menopausia', sub: 'Ciclos que cambian, bochornos y salud ósea', disponible: true },
];

export const etapaById = (id: Etapa) => ETAPAS.find((e) => e.id === id) ?? ETAPAS[0];

export const CAMBIO_ETAPA = 'Cambiamos tu modo. Tu historial sigue intacto.';

// ---------- Ciclo especial ----------

export const CONDICIONES_ESPECIAL: { id: Condicion; label: string }[] = [
  { id: 'sop', label: 'SOP' },
  { id: 'endometriosis', label: 'Endometriosis' },
  { id: 'irregular', label: 'Ciclos irregulares' },
  { id: 'sangrados_largos', label: 'Sangrados largos' },
];

export const ANTICONCEPTIVOS: { id: Anticonceptivo; label: string }[] = [
  { id: 'pastilla', label: 'Pastilla' },
  { id: 'diu_hormonal', label: 'DIU hormonal' },
  { id: 'diu_cobre', label: 'DIU de cobre' },
  { id: 'implante', label: 'Implante' },
  { id: 'anillo', label: 'Anillo' },
  { id: 'ninguno', label: 'Ninguno' },
];

// Con estos métodos no hay ovulación propia: no se muestran días fértiles.
export const SIN_OVULACION: Anticonceptivo[] = ['pastilla', 'implante', 'anillo'];

export const NOTA_ESPECIAL =
  'Usamos la mediana de tus ciclos, así un ciclo largo no rompe tus predicciones. Distinguimos manchado de flujo real.';
export const NOTA_HORMONAL =
  'Con anticonceptivo hormonal no hay ovulación propia: tu sangrado es por pausa. Te recordamos la toma y anotamos efectos.';

// ---------- Busco un embarazo ----------

export const SENALES_TTC: { id: SenalTtc; label: string }[] = [
  { id: 'moco', label: 'Moco cervical' },
  { id: 'temp', label: 'Temperatura basal' },
  { id: 'lh', label: 'Tests de ovulación (LH)' },
  { id: 'relacion', label: 'Relaciones' },
];

export const MOCOS: { id: Moco; label: string; hint: string }[] = [
  { id: 'seco', label: 'Seco', hint: 'Poco o nada' },
  { id: 'pegajoso', label: 'Pegajoso', hint: 'Grumoso, se rompe' },
  { id: 'cremoso', label: 'Cremoso', hint: 'Blanco, como loción' },
  { id: 'elastico', label: 'Elástico', hint: 'Transparente, como clara de huevo' },
];

export const TEXTO_TTC = 'Destacamos tu ventana fértil. Nunca te avisaremos de un embarazo por un simple atraso.';
