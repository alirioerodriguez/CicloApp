// Respaldo (JSON) y resumen para la ginecóloga (PDF).
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { moodById, symptomById } from '../content/catalogo';
import type { Summary } from './cycle';
import { today } from './dates';
import { region, t as tr } from './region';
import { normalize } from './store';
import { cifrar, descifrar, esSobre, type Sobre } from './cifrado';
import { reportHtml } from './informe';
import type { AppData } from './types';

export { reportHtml };

function downloadOnWeb(name: string, text: string, type: string) {
  const blob = new Blob([text], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

// En la web se descarga; en el teléfono se abre el menú para compartir o guardar.
async function exportFile(name: string, text: string, mimeType: string, UTI: string, dialogTitle: string): Promise<void> {
  if (Platform.OS === 'web') return downloadOnWeb(name, text, mimeType);
  const file = new File(Paths.cache, name);
  if (file.exists) file.delete();
  file.create();
  file.write(text);
  await Sharing.shareAsync(file.uri, { mimeType, dialogTitle, UTI });
}

export async function exportBackup(data: AppData): Promise<void> {
  await exportFile(`savia-respaldo-${today()}.json`, JSON.stringify(data, null, 2), 'application/json', 'public.json', tr('Guarda tu respaldo (Drive, WhatsApp, correo…)'));
}

// Respaldo cifrado en un archivo (AES-256-GCM, lib/cifrado): sirve sin cuenta y sin nube. Sin la frase no se abre.
export async function exportBackupCifrado(data: AppData, frase: string): Promise<void> {
  const sobre = await cifrar(data, frase, 'archivo');
  await exportFile(`savia-respaldo-cifrado-${today()}.json`, JSON.stringify(sobre), 'application/json', 'public.json', tr('Guarda tu respaldo cifrado (Drive, WhatsApp, correo…)'));
}

// Historial día por día en CSV, para abrirlo en Excel o Google Sheets.
export async function exportCsv(data: AppData): Promise<void> {
  const cols =
    region().idioma === 'en'
      ? ['date', 'flow', 'pain', 'mood', 'symptoms', 'water', 'sleep', 'pill', 'mucus', 'temperature', 'lh', 'lochia', 'feedings', 'scar', 'note']
      : ['fecha', 'flujo', 'dolor', 'animo', 'sintomas', 'agua', 'sueno', 'pastilla', 'moco', 'temperatura', 'lh', 'loquios', 'tomas', 'cicatriz', 'nota'];
  const cell = (v: string | number | null | undefined) => {
    const t = v == null ? '' : String(v);
    return /[",\n;]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };
  const rows = Object.values(data.logs)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((l) =>
      [
        l.date,
        l.flow,
        l.pain,
        l.moods.map((m) => tr(moodById(m).label)).join(' | '),
        l.symptoms.map((x) => tr(symptomById(x).label)).join(' | '),
        l.water,
        l.sleep,
        data.tomasPastilla[l.date] ? tr(data.tomasPastilla[l.date].estado) : '',
        l.moco,
        l.temp,
        l.lh,
        l.loquios,
        l.tomas.length || '',
        l.cicatriz,
        l.note,
      ]
        .map(cell)
        .join(','),
    );
  // El BOM hace que Excel lea bien los acentos.
  const csv = '﻿' + [cols.join(','), ...rows].join('\n');
  await exportFile(`savia-historial-${today()}.csv`, csv, 'text/csv', 'public.comma-separated-values-text', tr('Guarda tu historial'));
}

export type RespaldoLeido = { tipo: 'plano'; data: AppData } | { tipo: 'cifrado'; sobre: Sobre };

// Elige el archivo. Devuelve null si se canceló; lanza error si no sirve. Si está cifrado, devuelve el sobre para pedir la frase.
export async function leerRespaldo(): Promise<RespaldoLeido | null> {
  const res = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
  });
  if (res.canceled) return null;
  const asset = res.assets[0];
  const text = Platform.OS === 'web' && asset.file ? await asset.file.text() : await new File(asset.uri).text();
  return interpretarRespaldo(JSON.parse(text));
}

/** Separa un respaldo normal de uno cifrado y valida que sea de Savia. */
export function interpretarRespaldo(parsed: unknown): RespaldoLeido {
  if (esSobre(parsed)) return { tipo: 'cifrado', sobre: parsed };
  if (!parsed || typeof parsed !== 'object' || !('logs' in parsed) || !('settings' in parsed)) {
    throw new Error(tr('Este archivo no parece un respaldo de la app.'));
  }
  return { tipo: 'plano', data: normalize(parsed) };
}

/** Abre un respaldo cifrado con la frase. Tira ErrorCifrado('frase') si no es la correcta. */
export async function abrirRespaldoCifrado(sobre: Sobre, frase: string): Promise<AppData> {
  const r = interpretarRespaldo(await descifrar(sobre, frase, 'archivo'));
  if (r.tipo !== 'plano') throw new Error(tr('Este archivo no parece un respaldo de la app.'));
  return r.data;
}

// Compatibilidad: solo respaldos sin cifrar.
export async function pickBackup(): Promise<AppData | null> {
  const r = await leerRespaldo();
  if (!r) return null;
  if (r.tipo === 'cifrado') throw new Error(tr('Este respaldo está cifrado: usa «Restaurar un respaldo» en Perfil y pon tu frase.'));
  return r.data;
}

export async function shareReport(data: AppData, s: Summary): Promise<void> {
  const html = reportHtml(data, s);
  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return;
  }
  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: tr('Resumen para tu médico') });
}
