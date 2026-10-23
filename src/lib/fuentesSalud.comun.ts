// Partes comunes de la lectura de Apple Salud y Health Connect (ver fuentesSalud.ios/.android).
import { toISO } from './dates';
import type { FuenteReloj, ISODate, MedidaReloj } from './types';

export type EstadoFuente = 'disponible' | 'instalar' | 'no';

export interface FuenteSalud {
  fuente: FuenteReloj | null;
  nombre: string; // "Apple Salud", "Health Connect"
  estado: () => Promise<EstadoFuente>;
  conectar: () => Promise<boolean>;
  leer: (desde: ISODate, hasta: ISODate) => Promise<Record<ISODate, MedidaReloj>>;
  abrirAjustes: () => void;
}

export const diaDe = (fecha: string | Date) => toISO(typeof fecha === 'string' ? new Date(fecha) : fecha);

// Junta valores por día y campo; al final saca el promedio (o la suma) de cada uno.
export class Acumulador {
  private sumas: Record<string, Record<string, { total: number; n: number }>> = {};

  agregar(dia: ISODate, campo: keyof MedidaReloj, valor: number | null | undefined) {
    if (valor == null || !Number.isFinite(valor)) return;
    const d = (this.sumas[dia] ??= {});
    const c = (d[campo] ??= { total: 0, n: 0 });
    c.total += valor;
    c.n += 1;
  }

  resultado(sumar: (keyof MedidaReloj)[] = []): Record<ISODate, MedidaReloj> {
    const out: Record<ISODate, MedidaReloj> = {};
    for (const [dia, campos] of Object.entries(this.sumas)) {
      const m: MedidaReloj = {};
      for (const [campo, { total, n }] of Object.entries(campos)) {
        const k = campo as keyof MedidaReloj;
        const v = sumar.includes(k) ? total : total / n;
        m[k] = k === 'tempPiel' || k === 'tempBasal' ? Math.round(v * 100) / 100 : Math.round(v * 10) / 10;
      }
      out[dia] = m;
    }
    return out;
  }
}

// Inicio y fin del rango en hora local, como fechas.
export const inicioDia = (d: ISODate) => new Date(`${d}T00:00:00`);
export const finDia = (d: ISODate) => new Date(`${d}T23:59:59`);
