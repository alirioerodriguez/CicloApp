// Guía para que el ahorro de batería de Android no apague la alarma de la pastilla.
// Xiaomi, Samsung, Motorola, Infinix/Tecno y Huawei cierran apps en segundo plano de formas distintas.
// Pasos basados en https://dontkillmyapp.com (por marca) y en el permiso de alarmas exactas de Android 12+
// (SCHEDULE_EXACT_ALARM). Los nombres de los menús cambian entre versiones: son orientativos.

export type MarcaAndroid = 'xiaomi' | 'samsung' | 'motorola' | 'infinix_tecno' | 'huawei_honor' | 'generico';

export interface GuiaBateria {
  marca: MarcaAndroid;
  nombre: string;
  titulo: string;
  pasos: string[];
}

/** Marca a partir de `Device.manufacturer` (expo-device) o similar. */
export function marcaAndroid(fabricante?: string | null): MarcaAndroid {
  const m = (fabricante ?? '').trim().toLowerCase();
  if (/xiaomi|redmi|poco/.test(m)) return 'xiaomi';
  if (m.includes('samsung')) return 'samsung';
  if (/motorola|lenovo/.test(m)) return 'motorola';
  if (/infinix|tecno|itel|transsion/.test(m)) return 'infinix_tecno';
  if (/huawei|honor/.test(m)) return 'huawei_honor';
  return 'generico';
}

const ALARMAS = 'Activa «Alarmas y recordatorios» para Savia, así Android no atrasa el aviso.';

const GUIAS: Record<MarcaAndroid, GuiaBateria> = {
  xiaomi: {
    marca: 'xiaomi', nombre: 'Xiaomi, Redmi o POCO', titulo: 'Que Xiaomi no apague el recordatorio',
    pasos: ['Mantén apretado el ícono de Savia → Info de la app → Ahorro de batería → «Sin restricciones».', 'En la misma pantalla, activa «Inicio automático».', ALARMAS],
  },
  samsung: {
    marca: 'samsung', nombre: 'Samsung', titulo: 'Que Samsung no apague el recordatorio',
    pasos: ['Ajustes → Aplicaciones → Savia → Batería → «Sin restricciones».', 'Ajustes → Batería → Límites de uso en segundo plano: saca a Savia de «Aplicaciones en suspensión».', ALARMAS],
  },
  motorola: {
    marca: 'motorola', nombre: 'Motorola', titulo: 'Que Motorola no apague el recordatorio',
    pasos: ['Ajustes → Apps → Savia → Uso de batería de la app → «Sin restricciones».', ALARMAS],
  },
  infinix_tecno: {
    marca: 'infinix_tecno', nombre: 'Infinix, Tecno o Itel', titulo: 'Que Phone Master no cierre el recordatorio',
    pasos: ['Abre Phone Master → Administración de inicio automático → activa Savia.', 'Ajustes → Batería → Optimización de batería → Savia → «No optimizar».', ALARMAS],
  },
  huawei_honor: {
    marca: 'huawei_honor', nombre: 'Huawei u Honor', titulo: 'Que Huawei no apague el recordatorio',
    pasos: ['Ajustes → Batería → Inicio de aplicaciones → Savia: desactiva «Gestionar automáticamente».', 'Deja activados «Inicio automático», «Inicio secundario» y «Ejecutar en segundo plano».', ALARMAS],
  },
  generico: {
    marca: 'generico', nombre: 'Android', titulo: 'Que el recordatorio suene a horario',
    pasos: ['Ajustes de la app Savia → Batería → «Sin restricciones».', ALARMAS],
  },
};

export function guiaBateria(marca: MarcaAndroid): GuiaBateria {
  return GUIAS[marca];
}
