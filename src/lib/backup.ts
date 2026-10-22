// Respaldo (JSON) y resumen para la ginecóloga (PDF).
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { moodById, symptomById } from '../content/catalogo';
import { detectAlertas } from './alertas';
import { ovarioHistorial } from './salud';
import { PILL_PACKS, pillAdherence, topCounts, type Summary } from './cycle';
import { addDays, diffDays, longDate, shortDate, today } from './dates';
import { normalize } from './store';
import type { AppData, DayLog, ISODate } from './types';

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
  await exportFile(`savia-respaldo-${today()}.json`, JSON.stringify(data, null, 2), 'application/json', 'public.json', 'Guarda tu respaldo (Drive, WhatsApp, correo…)');
}

// Historial día por día en CSV, para abrirlo en Excel o Google Sheets.
export async function exportCsv(data: AppData): Promise<void> {
  const cols = ['fecha', 'flujo', 'dolor', 'animo', 'sintomas', 'agua', 'sueno', 'pastilla', 'moco', 'temperatura', 'lh', 'loquios', 'tomas', 'cicatriz', 'nota'];
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
        l.moods.map((m) => moodById(m).label).join(' | '),
        l.symptoms.map((x) => symptomById(x).label).join(' | '),
        l.water,
        l.sleep,
        l.pillTaken ? 'sí' : '',
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
  await exportFile(`savia-historial-${today()}.csv`, csv, 'text/csv', 'public.comma-separated-values-text', 'Guarda tu historial');
}

// Devuelve null si se canceló; lanza error si el archivo no sirve.
export async function pickBackup(): Promise<AppData | null> {
  const res = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
  });
  if (res.canceled) return null;
  const asset = res.assets[0];
  const text = Platform.OS === 'web' && asset.file ? await asset.file.text() : await new File(asset.uri).text();
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object' || !('logs' in parsed) || !('settings' in parsed)) {
    throw new Error('Este archivo no parece un respaldo de la app.');
  }
  return normalize(parsed);
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

function between(data: AppData, from: ISODate, to: ISODate): DayLog[] {
  const out: DayLog[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) if (data.logs[d]) out.push(data.logs[d]);
  return out;
}

// Mapa "síntoma × día del ciclo" de los últimos ciclos: útil para ver SPM/TDPM.
function cycleDayGrid(data: AppData, s: Summary, ids: { id: string; label: string; kind: 'symptoms' | 'moods' }[]): string {
  const days = 35;
  const starts = s.periods.slice(-4).map((p) => p.start);
  const rows = ids.map(({ id, label, kind }) => {
    const counts = new Array(days).fill(0);
    starts.forEach((st, i) => {
      const end = starts[i + 1] ?? today();
      for (const l of between(data, st, end)) {
        const cd = diffDays(l.date, st);
        if (cd < days && l[kind].includes(id)) counts[cd]++;
      }
    });
    const cells = counts.map((n) => `<td class="g" style="background:${n ? `rgba(231,121,159,${Math.min(1, 0.25 + n * 0.25)})` : '#f6f2f0'}"></td>`).join('');
    return `<tr><td class="lbl">${esc(label)}</td>${cells}</tr>`;
  });
  const head = Array.from({ length: days }, (_, i) => `<th class="g">${(i + 1) % 5 === 0 || i === 0 ? i + 1 : ''}</th>`).join('');
  return `<table class="grid"><tr><th></th>${head}</tr>${rows.join('')}</table>`;
}

export function reportHtml(data: AppData, s: Summary): string {
  const st = data.settings;
  const logs = Object.values(data.logs);
  const alertas = detectAlertas(data, s);
  const lastCycles = s.cycles.slice(-12).reverse();
  const symptoms = topCounts(logs, 'symptoms', 8);
  const moods = topCounts(logs, 'moods', 4);
  const painDays = logs.filter((l) => l.pain > 0);
  const avgPain = painDays.length ? (painDays.reduce((a, l) => a + l.pain, 0) / painDays.length).toFixed(1) : '—';
  const adh = pillAdherence(data, 30);
  const count = (id: string) => logs.filter((l) => l.symptoms.includes(id) || l.senos.includes(id)).length;
  const ov = ovarioHistorial(data, s);
  const ovIzq = ov.filter((x) => x.lado !== 'der').length;
  const ovDer = ov.filter((x) => x.lado !== 'izq').length;
  const proximos = data.controles.filter((x) => x.fecha).sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
  const notes = logs
    .filter((l) => l.note.trim())
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 12);

  const metodo = st.pillMode ? `Pastilla${st.pillName ? ` ${esc(st.pillName)}` : ''} · ${PILL_PACKS[st.pillType].label}` : 'Sin pastilla anticonceptiva registrada';
  const row = (a: string, b: string) => `<tr><td>${a}</td><td><b>${b}</b></td></tr>`;
  const perRow = (start: ISODate, length: number | null) => {
    const p = s.periods.find((x) => x.start === start);
    const ls = p ? between(data, p.start, p.end) : [];
    const heavy = ls.filter((l) => l.flow >= 4).length;
    const clots = ls.some((l) => l.symptoms.includes('coagulos'));
    const maxPain = Math.max(0, ...ls.map((l) => l.pain));
    return `<tr><td>${shortDate(start)} ${start.slice(0, 4)}</td><td>${length ? `${length} días` : 'en curso'}</td><td>${p?.length ?? '—'}</td><td>${heavy || '—'}</td><td>${clots ? 'Sí' : '—'}</td><td>${maxPain ? `${maxPain}/10` : '—'}</td></tr>`;
  };
  const gridIds = [
    ...topCounts(logs, 'symptoms', 5).map((x) => ({ id: x.id, label: symptomById(x.id).label, kind: 'symptoms' as const })),
    ...moods.map((x) => ({ id: x.id, label: moodById(x.id).label, kind: 'moods' as const })),
  ];

  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body{font-family:-apple-system,Roboto,Helvetica,Arial,sans-serif;color:#2E2A3F;padding:28px;font-size:12.5px}
    h1{font-family:Georgia,serif;font-weight:400;font-size:26px;margin:0 0 4px}
    h2{font-size:13px;margin:20px 0 8px;color:#E7799F;text-transform:uppercase;letter-spacing:1px}
    table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #eee;padding:5px 4px;text-align:left}
    .muted{color:#888;font-size:11px}.alert{background:#FBEBD5;padding:8px 10px;border-radius:8px;margin:4px 0}
    .grid td.g,.grid th.g{width:10px;padding:0;border:1px solid #fff;height:12px;font-size:8px;color:#999;text-align:center}
    .grid td.lbl{white-space:nowrap;padding-right:6px;font-size:11px}
  </style></head><body>
    <h1>Resumen de ciclo</h1>
    <div class="muted">${esc(st.name || '')} · generado el ${longDate(today())}</div>
    <h2>Datos clave</h2>
    <table>
      ${row('Fecha de la última menstruación', s.lastStart ? longDate(s.lastStart) : '—')}
      ${row('Duración promedio del ciclo', `${s.avgCycle} días (${s.cycles.length} ciclos registrados)`)}
      ${s.cycleRange ? row('Más corto / más largo (últimos ciclos)', `${s.cycleRange[0]} / ${s.cycleRange[1]} días · diferencia ${s.cycleRange[1] - s.cycleRange[0]}`) : ''}
      ${row('Duración promedio del período', `${s.avgPeriod} días`)}
      ${row('Dolor promedio los días con dolor', `${avgPain} / 10`)}
      ${row('Método anticonceptivo', metodo)}
      ${adh ? row('Tomas registradas (30 días)', `${adh.taken} de ${adh.expected}${adh.expected - adh.taken ? ` · ${adh.expected - adh.taken} sin marcar` : ''}`) : ''}
      ${row('Sangrado entre períodos (días)', String(count('manchado')))}
      ${row('Dolor en relaciones (días)', String(count('dolor_relaciones')))}
      ${row('Migraña (días)', String(count('migrana')))}
      ${row('Coágulos grandes (días)', String(count('coagulos')))}
      ${ovIzq + ovDer ? row('Dolor de ovario (últimos 2 ciclos)', `izquierdo ${ovIzq} días · derecho ${ovDer} días`) : ''}
      ${data.quistes.map((q) => row(`Quiste ovario ${q.ovario === 'der' ? 'derecho' : 'izquierdo'} (${esc(q.tipo)})`, q.medidas.map((m) => `${m.mm} mm (${shortDate(m.fecha)})`).join(' → '))).join('')}
      ${data.autoexamenes.length ? row('Último autoexamen de mamas', shortDate([...data.autoexamenes].sort().pop()!)) : ''}
      ${count('bulto') ? row('Notó un bulto o cambio en mamas (días)', String(count('bulto'))) : ''}
      ${proximos.length ? row('Próximos controles', proximos.map((x) => `${esc(x.titulo)} (${shortDate(x.fecha)})`).join(' · ')) : ''}
    </table>
    ${alertas.length ? `<h2>Temas para la consulta</h2>${alertas.map((a) => `<div class="alert">${esc(a.texto)}</div>`).join('')}` : ''}
    <h2>Ciclos</h2>
    <table><tr><th>Inicio</th><th>Ciclo</th><th>Días de sangrado</th><th>Días abundantes</th><th>Coágulos</th><th>Dolor máx.</th></tr>
      ${s.lastStart ? perRow(s.lastStart, null) : ''}
      ${lastCycles.map((c) => perRow(c.start, c.length)).join('') || ''}
    </table>
    ${gridIds.length ? `<h2>Síntomas y ánimos por día del ciclo (últimos ciclos)</h2>${cycleDayGrid(data, s, gridIds)}<div class="muted">Más intenso = más ciclos con ese síntoma ese día. Día 1 = primer día de sangrado.</div>` : ''}
    <h2>Síntomas más frecuentes</h2>
    <table>${symptoms.map((x) => row(symptomById(x.id).label, `${x.count} días`)).join('') || '<tr><td>Sin registros</td></tr>'}</table>
    ${notes.length ? `<h2>Notas de la usuaria</h2><table>${notes.map((n) => row(shortDate(n.date), esc(n.note))).join('')}</table>` : ''}
    <p class="muted" style="margin-top:28px">No incluye intimidad ni diario de sueños. Datos registrados por la usuaria en una app de registro personal; no es un dispositivo médico. Las fechas futuras y las fases son estimaciones.</p>
  </body></html>`;
}

export async function shareReport(data: AppData, s: Summary): Promise<void> {
  const html = reportHtml(data, s);
  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return;
  }
  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: 'Resumen para tu médico' });
}
