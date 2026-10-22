// Modo consulta médica (diseño 8i): lo esencial de los últimos 3 o 6 meses para mostrar en 30 segundos.
import { MOODS, symptomById } from '../content/catalogo';
import { NOMBRE_ETAPA } from '../content/confianza';
import { ANTICONCEPTIVOS, etapaById } from '../content/etapas';
import { CICATRIZ_ALERTA, EDIMBURGO, lunes, nivelEdimburgo, semanasPosparto } from '../content/posparto';
import { EXAMENES, presionAlta, semanasEmbarazo } from '../content/embarazo';
import { detectAlertas } from './alertas';
import type { Summary } from './cycle';
import { addDays, today } from './dates';
import type { AppData } from './types';

export interface Consulta {
  quien: string;
  modo: string;
  kpis: { valor: string; label: string }[];
  frecuentes: { label: string; nivel: string; pct: number }[];
  conversar: string[];
  diasRegistrados: number;
}

const ANIMO_BAJO = ['triste', 'abrumada', 'ansiosa', 'irritable'];
const coma = (n: number) => String(Math.round(n * 10) / 10).replace('.', ',');

export function consulta(data: AppData, s: Summary, meses: 3 | 6): Consulta {
  const st = data.settings;
  const desde = addDays(today(), -meses * 30);
  const logs = Object.values(data.logs).filter((l) => l.date >= desde);
  const dias = logs.length;

  const nombre = st.name || 'Usuaria';
  const quien = st.edad ? `${nombre} · ${st.edad} años` : nombre;
  const etapa = NOMBRE_ETAPA[st.etapa] ?? etapaById(st.etapa).label;
  const semanas = semanasPosparto(st.posparto);
  const semEmb = semanasEmbarazo(st.embarazo.fpp);
  const modo = `${st.etapa === 'posparto' ? `Posparto · semana ${semanas}` : st.etapa === 'embarazo' ? `Embarazo · semana ${semEmb}` : etapa} · últimos ${meses} meses`;

  // Lo más frecuente: síntomas y ánimo bajo, como % de los días registrados.
  const cuenta = new Map<string, number>();
  for (const l of logs) {
    for (const x of l.symptoms) cuenta.set(symptomById(x).label, (cuenta.get(symptomById(x).label) ?? 0) + 1);
    for (const m of l.moods) if (ANIMO_BAJO.includes(m)) {
      const label = `Ánimo: ${MOODS.find((k) => k.id === m)?.label.toLowerCase() ?? m}`;
      cuenta.set(label, (cuenta.get(label) ?? 0) + 1);
    }
  }
  const frecuentes = [...cuenta.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([label, n]) => {
      const pct = dias ? n / dias : 0;
      return { label, pct, nivel: pct >= 0.5 ? 'Frecuente' : pct >= 0.2 ? 'A veces' : 'Rara vez' };
    });

  let kpis: Consulta['kpis'];
  const conversar: string[] = [];

  if (st.etapa === 'embarazo') {
    const medidas = Object.entries(data.embarazo.medidas).filter(([f]) => f >= desde).sort(([a], [b]) => a.localeCompare(b));
    const ultima = (k: 'kg' | 'sys' | 'dia') => [...medidas].reverse().find(([, m]) => m[k] != null)?.[1][k] ?? null;
    const sys = ultima('sys');
    const dia = ultima('dia');
    const kg = ultima('kg');
    kpis = [
      { valor: String(semEmb), label: 'semanas' },
      { valor: sys && dia ? `${sys}/${dia}` : '—', label: 'última presión' },
      { valor: kg ? coma(kg) : '—', label: 'kg (último)' },
    ];
    if (medidas.some(([, m]) => presionAlta(m.sys, m.dia))) conversar.push('Hubo registros de presión de 140/90 o más.');
    const patadas = Object.entries(data.embarazo.patadas).filter(([f]) => f >= desde).sort(([a], [b]) => a.localeCompare(b));
    const ultimaP = patadas[patadas.length - 1];
    if (ultimaP) conversar.push(`Patadas: ${ultimaP[1].n} movimientos en ${Math.max(1, Math.round(ultimaP[1].segundos / 60))} minutos (${ultimaP[0]}).`);
    const pend = EXAMENES.filter((x) => !data.embarazo.hechos.includes(`examen:${x.id}`)).map((x) => x.titulo.toLowerCase());
    if (pend.length) conversar.push(`Exámenes sin marcar: ${pend.join(', ')}.`);
  } else if (st.etapa === 'posparto') {
    const semanasEdim = Object.keys(data.edimburgo).filter((k) => k >= desde).sort();
    const ultima = semanasEdim.length ? data.edimburgo[semanasEdim[semanasEdim.length - 1]] : null;
    const completa = ultima && ultima.every((x) => x >= 0);
    const suenos = logs.map((l) => l.sleep).filter((x): x is number => x != null);
    kpis = [
      { valor: String(semanas), label: 'semanas posparto' },
      { valor: completa ? String(ultima!.reduce((a, b) => a + b, 0)) : '—', label: `Edimburgo (${EDIMBURGO.length} ítems)` },
      { valor: suenos.length ? coma(suenos.reduce((a, b) => a + b, 0) / suenos.length) : '—', label: 'h de sueño promedio' },
    ];
    if (ultima) {
      const nivel = nivelEdimburgo(ultima.map((x) => Math.max(0, x)));
      if (nivel === 'urgente') conversar.push('En la escala de Edimburgo marcó pensamientos de hacerse daño: atender hoy.');
      else if (nivel === 'cargada') conversar.push('Edimburgo con puntaje alto: conversar sobre su ánimo.');
    }
    if (logs.some((l) => l.loquios === 'rojo' && semanasPosparto(st.posparto, l.date) >= 2)) conversar.push('Sangrado rojo abundante después de la semana 2.');
    if (logs.some((l) => l.cicatriz && CICATRIZ_ALERTA.includes(l.cicatriz))) conversar.push('Molestias en la cicatriz que conviene revisar.');
    if (!ultima && lunes() >= desde) conversar.push('Aún no respondió la escala de Edimburgo.');
  } else {
    const ciclos = s.cycles.filter((cy) => cy.start >= desde).length;
    kpis = [
      { valor: `${s.avgCycle} d`, label: s.cycleRange && s.cycleRange[0] !== s.cycleRange[1] ? `ciclo (${s.cycleRange[0]}–${s.cycleRange[1]})` : 'ciclo promedio' },
      { valor: `${s.avgPeriod} d`, label: 'período promedio' },
      { valor: String(ciclos), label: ciclos === 1 ? 'ciclo registrado' : 'ciclos registrados' },
    ];
    for (const a of detectAlertas(data, s)) conversar.push(a.texto);
    if (st.anticonceptivo !== 'ninguno') conversar.push(`Anticonceptivo: ${ANTICONCEPTIVOS.find((k) => k.id === st.anticonceptivo)?.label.toLowerCase()}.`);
  }
  if (!conversar.length) conversar.push('Sin señales de alerta en este período.');

  return { quien, modo, kpis, frecuentes, conversar, diasRegistrados: dias };
}

// Texto corto para compartir por WhatsApp o correo.
export function consultaTexto(c: Consulta): string {
  return [
    `Resumen para mi consulta · Savia`,
    `${c.quien} · ${c.modo}`,
    '',
    ...c.kpis.map((k) => `• ${k.valor} ${k.label}`),
    '',
    'Lo más frecuente:',
    ...(c.frecuentes.length ? c.frecuentes.map((f) => `• ${f.label}: ${f.nivel.toLowerCase()} (${Math.round(f.pct * 100)}% de los días)`) : ['• Nada registrado']),
    '',
    'Para conversar:',
    ...c.conversar.map((x) => `• ${x}`),
  ].join('\n');
}
