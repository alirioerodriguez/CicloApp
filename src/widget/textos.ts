// Textos de los widgets, iguales en Android (react-native-android-widget) y en iPhone (expo-widgets).
// Sin librerías de widgets acá: este archivo se carga en las dos plataformas.
// En modo discreto no dicen "período" ni "fértil".
import { shortDate } from '../lib/dates';
import { t } from '../lib/region';
import type { ResumenCiclo } from './datosCiclo';
import type { ResumenWidget } from './datosWidget';

export interface Cuenta {
  grande: string; // número o palabra grande
  unidad: string;
  pie: string | null;
  color: 'rosa' | 'lila' | 'salvia' | 'texto';
}

const dias = (n: number, uno: string, varios: string) => t(n === 1 ? uno : varios);
const fechaCorta = (r: Extract<ResumenCiclo, { tipo: 'ciclo' }>) =>
  r.rango ? `${shortDate(r.rango[0])} – ${shortDate(r.rango[1])}` : r.fecha ? shortDate(r.fecha) : null;

// Lo mismo para los dos widgets de ella: el número grande y su explicación.
export function cuenta(r: ResumenCiclo): Cuenta {
  switch (r.tipo) {
    case 'embarazo':
      return { grande: String(r.semana), unidad: t('semanas de embarazo'), pie: r.faltan != null ? t(`Faltan ${r.faltan} días`) : null, color: 'lila' };
    case 'posparto':
      return { grande: String(r.semana), unidad: t('semanas de posparto'), pie: null, color: 'salvia' };
    case 'pastilla':
      if (r.enPausa) return { grande: t('Hoy'), unidad: t(r.discreto ? 'días de descanso' : 'días sin hormona del blíster'), pie: `${t('Blíster')} ${r.dia}/${r.de}`, color: 'lila' };
      if (r.diasParaPausa == null) return { grande: `${r.dia}/${r.de}`, unidad: t(r.discreto ? 'tu día de hoy' : 'pastilla de hoy'), pie: null, color: 'rosa' };
      return { grande: String(r.diasParaPausa), unidad: dias(r.diasParaPausa, 'día para tu descanso', 'días para tu descanso'), pie: `${t('Blíster')} ${r.dia}/${r.de}`, color: 'lila' };
    case 'ciclo': {
      if (r.enPeriodo) return { grande: String(r.dia), unidad: t(r.discreto ? 'día 1 en curso' : 'día de tu período'), pie: null, color: 'rosa' };
      if (r.atraso > 0) return { grande: String(r.atraso), unidad: dias(r.atraso, r.discreto ? 'día más' : 'día de retraso', r.discreto ? 'días más' : 'días de retraso'), pie: null, color: 'texto' };
      if (r.diasPara === 0 || r.diasPara == null)
        return { grande: t('Hoy'), unidad: t(r.discreto ? 'podría ser tu día 1' : 'podría llegar tu período'), pie: fechaCorta(r), color: 'rosa' };
      return { grande: String(r.diasPara), unidad: dias(r.diasPara, r.discreto ? 'día para tu día 1' : 'día para tu período', r.discreto ? 'días para tu día 1' : 'días para tu período'), pie: fechaCorta(r), color: 'rosa' };
    }
    case 'meno':
      return { grande: '🌸', unidad: t('Toca para registrar tu día'), pie: null, color: 'texto' };
    default:
      return { grande: '🌸', unidad: t('Registra tu período para ver la cuenta'), pie: null, color: 'texto' };
  }
}

export function tituloPastilla(r: Extract<ResumenWidget, { activo: true }>): string {
  const quien = r.tipo === 'activa' ? 'Pastilla' : r.tipo === 'placebo' ? 'Placebo' : 'Descanso';
  return `${t(quien)} ${r.n}/${r.de}`;
}

export function estadoPastilla(r: Extract<ResumenWidget, { activo: true }>): string {
  switch (r.estadoHoy) {
    case 'tomada':
      return t(`Tomada a las ${r.horaToma ?? ''}`).trim();
    case 'tarde':
      return t(`Tomada tarde a las ${r.horaToma ?? ''}`).trim();
    case 'olvidada':
      return t('Marcada como olvidada');
    case 'descanso':
      return t('Hoy no te toca pastilla.');
    default:
      return t(`Hoy a las ${r.hora}`);
  }
}
