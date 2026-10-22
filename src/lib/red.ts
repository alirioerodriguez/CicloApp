// Tarjeta del día para la red de apoyo: solo lo que ella eligió compartir, nunca síntomas ni notas.
import { AYUDA_RED } from '../content/confianza';
import { CUIDATE } from '../content/cuidate';
import { etapaPosparto, semanasPosparto } from '../content/posparto';
import type { Summary } from './cycle';
import { longDate, today } from './dates';
import type { AppData } from './types';

export interface TarjetaRed {
  mensaje: string;
  consejo: string | null;
}

// Energía estimada del día: por fase en el ciclo; en posparto, según lo que durmió.
function energia(data: AppData, s: Summary): string {
  const log = data.logs[today()];
  if (data.settings.etapa === 'posparto') {
    const h = log?.sleep;
    return h == null ? 'sin dato' : h < 4 ? 'baja' : h < 6 ? 'media' : 'buena';
  }
  if (log?.moods.includes('con_energia')) return 'alta';
  if (log?.symptoms.includes('cansancio')) return 'baja';
  return { menstrual: 'baja', folicular: 'alta', ovulatoria: 'alta', lutea: 'media', pastilla: 'media' }[s.phase ?? 'lutea'];
}

export function tarjetaRed(data: AppData, s: Summary): TarjetaRed {
  const st = data.settings;
  const nombre = st.name || 'Ella';
  const quiere = st.red.compartir;
  const partes: string[] = [];

  if (quiere.includes('fase')) {
    if (st.etapa === 'posparto') {
      const sem = semanasPosparto(st.posparto);
      partes.push(`${nombre} está en la semana ${sem} de su posparto (${etapaPosparto(sem).nombre.toLowerCase()}).`);
      // Con pastilla no hay fases propias, y el método anticonceptivo no se comparte.
    } else if (s.phase && s.phase !== 'pastilla') {
      partes.push(`${nombre} está en su ${CUIDATE[s.phase].nombre.toLowerCase()}.`);
    }
  }
  if (quiere.includes('energia')) {
    const e = energia(data, s);
    if (e !== 'sin dato') partes.push(`${partes.length ? 'Su' : `La`} energía hoy es ${e}.`);
  }
  if (quiere.includes('periodo') && st.etapa !== 'posparto' && s.nextStart && !s.inPeriod) {
    partes.push(s.ventana ? `Su período podría llegar entre el ${longDate(s.ventana[0])} y el ${longDate(s.ventana[1])}.` : `Su período se espera cerca del ${longDate(s.nextStart)}.`);
  }
  if (quiere.includes('periodo') && s.inPeriod) partes.push('Está con su período.');

  return {
    mensaje: partes.join(' ') || `${nombre} eligió no compartir detalles hoy.`,
    consejo: quiere.includes('ayuda') ? AYUDA_RED[st.etapa] ?? AYUDA_RED.general : null,
  };
}

export function tarjetaTexto(t: TarjetaRed): string {
  return [`🌸 Savia · ${longDate(today())}`, t.mensaje, t.consejo ? `💡 ${t.consejo}` : ''].filter(Boolean).join('\n');
}
