// Informe para la consulta ginecológica (PDF), según el diseño "Savia Resumen de Ciclo v3".
// Dos páginas A4: datos clave y ciclos; luego el mapa de síntomas por día y lo más frecuente.
// Todo el texto pasa por tr(): sale en inglés o en español neutro según el país y el idioma.
import { moodById, symptomById } from '../content/catalogo';
import { detectAlertas } from './alertas';
import { PILL_PACKS, pillAdherence, topCounts, type Summary } from './cycle';
import { addDays, diffDays, longDate, shortDate, today } from './dates';
import { region, t as tr } from './region';
import { formatoSueno, formatoTemp, resumenReloj } from './reloj';
import { ovarioHistorial } from './salud';
import type { AppData, DayLog, ISODate } from './types';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

// Los avisos de la app le hablan a la usuaria; aquí se escriben para la médica: [en negrita, resto].
const PARA_MEDICA: Record<string, [string, string]> = {
  'ciclos-cortos': ['Ciclos cortos:', 'los últimos 2 duraron menos de 24 días.'],
  'ciclos-largos': ['Ciclos largos:', 'los últimos 2 duraron más de 38 días.'],
  irregular: ['Ciclos irregulares:', 'más de 7 días de diferencia entre el más corto y el más largo (últimos 6).'],
  'sin-periodo': ['Sin período', 'desde hace unos 3 meses.'],
  retraso: ['Período con retraso', 'de 7 días o más.'],
  'periodo-largo': ['Período de más de 7 días', 'en los últimos 2 ciclos.'],
  abundante: ['Sangrado abundante', 'en los últimos ciclos (flujo abundante 2 días o más, o coágulos grandes).'],
  'pastilla-manchado': ['Sangrado no esperado', 'con anticonceptivo oral en 3 meses distintos.'],
  manchado: ['Sangrado intermenstrual', 'en 2 ciclos o más.'],
  'dolor-fuerte': ['Dolor menstrual de 7/10 o más', 'en los últimos 2 ciclos.'],
  'dolor-aumenta': ['Dolor menstrual en aumento', 'en los últimos 3 ciclos.'],
  'dolor-relaciones': ['Dolor en las relaciones (dispareunia)', 'en 2 ciclos o más.'],
  'flujo-inusual': ['Flujo vaginal inusual', 'en los últimos 30 días.'],
  hierro: ['Posible déficit de hierro:', 'cansancio y mareo frecuentes junto a sangrado abundante.'],
  'migrana-pastilla': ['Migraña', 'en los últimos 90 días tomando anticonceptivo combinado.'],
  tdpm: ['Ánimo bajo marcado en la semana premenstrual', 'durante 2 ciclos seguidos (posible TDPM).'],
  spm: ['Síntomas en la semana premenstrual', 'que mejoran al empezar el período (compatible con SPM).'],
};

// Escala de intensidad del mapa (0 = nada, 5 = todos los ciclos).
const NIVELES = ['#F4EDEA', '#F6DCE5', '#E7AFC4', '#C9557F', '#A73C68', '#7E2F52'];

const LOGO = (h: number) => `<svg width="${h}" height="${h}" viewBox="0 0 100 100" aria-hidden="true">
  <defs><mask id="semilla${h}"><rect width="100" height="100" fill="#fff"/><circle cx="50" cy="50" r="8" fill="#000"/></mask></defs>
  <g mask="url(#semilla${h})">
    <path d="M50 50C38 40 38 18 50 8C62 18 62 40 50 50Z" fill="#C24E7A"/>
    <path d="M50 50C60 38 82 38 92 50C82 62 60 62 50 50Z" fill="#F0B877"/>
    <path d="M50 50C62 60 62 82 50 92C38 82 38 60 50 50Z" fill="#8FBF9F"/>
    <path d="M50 50C40 62 18 62 8 50C18 38 40 38 50 50Z" fill="#A99CF2"/>
  </g></svg>`;

const marca = (h: number, texto: number) => `<div class="marca">${LOGO(h)}<span style="font-size:${texto}px">savia</span></div>`;

function between(data: AppData, from: ISODate, to: ISODate): DayLog[] {
  const out: DayLog[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) if (data.logs[d]) out.push(data.logs[d]);
  return out;
}

export function reportHtml(data: AppData, s: Summary): string {
  const st = data.settings;
  const en = region().idioma === 'en';
  const conAnimo = st.pdfAnimo; // el ánimo sale solo si ella lo eligió
  const logs = Object.values(data.logs);
  const hoy = today();

  // ---------- Formatos ----------
  const mayus = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);
  const anio = (d: ISODate) => d.slice(0, 4);
  const fechaLarga = (d: ISODate) => (en ? `${longDate(d)}, ${anio(d)}` : `${mayus(longDate(d))} de ${anio(d)}`);
  const fechaCorta = (d: ISODate) => `${shortDate(d)} ${anio(d)}`;
  const decimal = (n: number) => (en ? n.toFixed(1) : n.toFixed(1).replace('.', ','));
  const dias = (n: number) => tr(n === 1 ? `${n} día` : `${n} días`);
  const unidadDias = (n: number) => tr(n === 1 ? 'día' : 'días');

  // ---------- Datos ----------
  // El aviso de TDPM se basa en el ánimo: sin permiso, no sale.
  const alertas = detectAlertas(data, s).filter((a) => conAnimo || a.id !== 'tdpm');
  const symptoms = topCounts(logs, 'symptoms', 8);
  const moods = conAnimo ? topCounts(logs, 'moods', 5) : [];
  const painDays = logs.filter((l) => l.pain > 0);
  const avgPain = painDays.length ? decimal(painDays.reduce((a, l) => a + l.pain, 0) / painDays.length) : '—';
  const count = (id: string) => logs.filter((l) => l.symptoms.includes(id) || l.senos.includes(id)).length;
  const ov = ovarioHistorial(data, s);
  const ovIzq = ov.filter((x) => x.lado !== 'der').length;
  const ovDer = ov.filter((x) => x.lado !== 'izq').length;
  const proximo = data.controles.filter((x) => x.fecha && x.fecha >= hoy).sort((a, b) => (a.fecha < b.fecha ? -1 : 1))[0];
  const adh = pillAdherence(data, 30);
  const ciclos = s.cycles.slice(-5).reverse();
  const desde = (ciclos.length ? ciclos[ciclos.length - 1].start : s.lastStart) ?? hoy;
  const rango = `${shortDate(desde)}${anio(desde) !== anio(hoy) ? ` ${anio(desde)}` : ''} – ${fechaCorta(hoy)}`;
  const nombre = esc(st.name || tr('Usuaria'));

  // ---------- Página 1 ----------
  const kpi = (label: string, valor: string, unidad: string) =>
    `<div class="kpi"><div class="kpi-l">${tr(label)}</div><div class="kpi-v">${valor}<small>${unidad}</small></div></div>`;
  const kpis = [
    kpi('Ciclo promedio', String(s.avgCycle), unidadDias(s.avgCycle)),
    kpi('Más corto / más largo', s.cycleRange ? `${s.cycleRange[0]}–${s.cycleRange[1]}` : '—', s.cycleRange ? unidadDias(2) : ''),
    kpi('Duración del período', String(s.avgPeriod), unidadDias(s.avgPeriod)),
    kpi('Dolor promedio', avgPain, '/ 10'),
  ].join('');

  const temas = alertas.length
    ? `<div class="temas"><h3>${tr('Temas para la consulta')}</h3><ol>${alertas
        .map((a) => {
          const [negrita, resto] = PARA_MEDICA[a.id] ?? [a.texto, ''];
          return `<li><span class="num"></span><p><b>${esc(tr(negrita))}</b> ${esc(tr(resto))}</p></li>`;
        })
        .join('')}</ol></div>`
    : '';

  const metodo = st.pillMode ? `${tr('Pastilla')}${st.pillName ? ` ${esc(st.pillName)}` : ''} · ${tr(PILL_PACKS[st.pillType].label)}` : tr('Sin pastilla registrada');
  const fila = (label: string, valor: string, alerta = false) => `<div class="fila"><span>${tr(label)}</span><b${alerta ? ' class="rojo"' : ''}>${valor}</b></div>`;
  const filas = [
    fila('Última menstruación', s.lastStart ? mayus(longDate(s.lastStart)) : '—'),
    fila('Método anticonceptivo', metodo),
    ...(adh ? [fila('Tomas registradas (30 días)', `${tr(`${adh.taken} de ${adh.expected}`)}`)] : []),
    fila('Sangrado entre períodos', dias(count('manchado'))),
    fila('Coágulos grandes', dias(count('coagulos')), count('coagulos') > 0),
    fila('Dolor en relaciones · migraña', `${dias(count('dolor_relaciones'))} · ${dias(count('migrana'))}`),
    fila('Dolor de ovario (últ. 2 ciclos)', `${tr('Izq.')} ${dias(ovIzq)} · ${tr('der.')} ${ovDer}`),
    ...data.quistes.map((q) =>
      fila(
        tr(`Quiste ovario ${q.ovario === 'der' ? 'der.' : 'izq.'} (${tr(q.tipo).toLowerCase()})`),
        q.medidas.map((m) => `<strong>${m.mm} mm</strong> ${shortDate(m.fecha)}`).join(' → '),
      ),
    ),
    fila('Último autoexamen de mamas', data.autoexamenes.length ? shortDate([...data.autoexamenes].sort().pop()!) : '—'),
    ...(count('bulto') ? [fila('Notó un bulto o cambio en mamas', dias(count('bulto')), true)] : []),
    fila('Próximo control', proximo ? `${esc(tr(proximo.titulo))} · ${shortDate(proximo.fecha)}` : '—'),
  ];
  const mitad = Math.ceil(filas.length / 2);

  const filaCiclo = (start: ISODate, length: number | null) => {
    const p = s.periods.find((x) => x.start === start);
    const ls = p ? between(data, p.start, p.end) : [];
    const heavy = ls.filter((l) => l.flow >= 4).length;
    const clots = ls.some((l) => l.symptoms.includes('coagulos'));
    const maxPain = Math.max(0, ...ls.map((l) => l.pain));
    const dolor = maxPain ? `<span class="dolor${maxPain >= 7 ? ' fuerte' : ''}">${maxPain}/10</span>` : '—';
    return `<tr><td><b>${fechaCorta(start)}</b></td><td>${length ? dias(length) : mayus(tr('en curso'))}</td><td>${p?.length ?? '—'}</td><td>${heavy || '—'}</td><td>${clots ? tr('Sí') : '—'}</td><td>${dolor}</td></tr>`;
  };
  const tablaCiclos = `<div class="tabla"><table><tr>${['Inicio', 'Ciclo', 'Días de sangrado', 'Días abundantes', 'Coágulos', 'Dolor máx.'].map((h) => `<th>${tr(h)}</th>`).join('')}</tr>
    ${s.lastStart ? filaCiclo(s.lastStart, null) : ''}${ciclos.map((c) => filaCiclo(c.start, c.length)).join('')}</table></div>`;

  // ---------- Página 2: mapa por día del ciclo ----------
  const DIAS_MAPA = 35;
  const inicios = s.periods.slice(-4).map((p) => p.start);
  const conteo = (prueba: (l: DayLog) => boolean) => {
    const n = new Array(DIAS_MAPA).fill(0);
    inicios.forEach((ini, i) => {
      const fin = inicios[i + 1] ?? hoy;
      for (const l of between(data, ini, fin)) {
        const cd = diffDays(l.date, ini);
        if (cd < DIAS_MAPA && cd >= 0 && prueba(l)) n[cd]++;
      }
    });
    return n;
  };
  const nivel = (n: number) => NIVELES[Math.min(5, Math.round((n / Math.max(1, inicios.length)) * 5))];
  const celdas = (n: number[]) => n.map((x) => `<i style="background:${x ? nivel(x) : NIVELES[0]}"></i>`).join('');
  const sangrado = conteo((l) => l.flow >= 2)
    .map((x) => `<i class="barra" style="background:${x ? nivel(x) : 'transparent'}"></i>`)
    .join('');
  const filasMapa = (ids: { id: string; label: string }[], tipo: 'symptoms' | 'moods') =>
    ids.map(({ id, label }) => `<div class="m-fila"><span>${esc(tr(label))}</span><div class="m-celdas">${celdas(conteo((l) => l[tipo].includes(id)))}</div></div>`).join('');
  const encabezado = Array.from({ length: DIAS_MAPA }, (_, i) => `<i>${i === 0 || (i + 1) % 5 === 0 ? i + 1 : ''}</i>`).join('');
  const mapa = inicios.length
    ? `<div class="mapa">
        <div class="m-fila m-cab"><span>${tr('Día del ciclo')}</span><div class="m-celdas">${encabezado}</div></div>
        <div class="m-fila m-sangrado"><span>${tr('Sangrado')}</span><div class="m-celdas">${sangrado}</div></div>
        ${filasMapa(topCounts(logs, 'symptoms', 5).map((x) => ({ id: x.id, label: symptomById(x.id).label })), 'symptoms')}
        ${moods.length ? `<div class="m-sep"></div>${filasMapa(moods.slice(0, 3).map((x) => ({ id: x.id, label: moodById(x.id).label })), 'moods')}` : ''}
      </div>
      <div class="leyenda"><span>${tr('Día 1 = primer día de sangrado. Más intenso = más ciclos con ese síntoma ese día.')}</span>
        <span class="escala">${tr('Menos')} ${NIVELES.map((c) => `<i style="background:${c}"></i>`).join('')} ${tr('Más')}</span></div>`
    : `<p class="vacio">${tr('Sin registros')}</p>`;

  const barras = (titulo: string, items: { id: string; count: number }[], etiqueta: (id: string) => string) => {
    const max = Math.max(1, ...items.map((x) => x.count));
    return `<div class="tarjeta"><h3>${tr(titulo)}</h3>${
      items
        .map(
          (x) =>
            `<div class="b-fila"><span>${esc(tr(etiqueta(x.id)))}</span><div class="b-pista"><i style="width:${Math.max(3, (x.count / max) * 100)}%${x.id === 'coagulos' ? ';background:#B3263E' : ''}"></i></div><b>${dias(x.count)}</b></div>`,
        )
        .join('') || `<p class="vacio">${tr('Sin registros')}</p>`
    }</div>`;
  };

  // ---------- Página 3 (opcional): reloj o app de salud ----------
  const rel = st.pdfReloj ? resumenReloj(data, s, hoy, desde) : null;
  const conReloj = !!rel && rel.noches >= 7;
  const total = conReloj ? 3 : 2;
  const pie = (n: number) => `<footer><span>${tr('Generado con Savia · Registro personal, no es un diagnóstico.')}</span><span>${tr(`${n} de ${total}`)}</span></footer>`;

  const paginaReloj = () => {
    if (!rel || !conReloj) return '';
    const fuente = data.reloj.fuente === 'apple' ? 'Apple Salud' : 'Health Connect';
    const filasFase: [string, 'fcReposo' | 'vfc' | 'sueno' | 'pasos' | 'tempPiel' | 'tempBasal', (v: number) => string][] = [
      ['Pulso en reposo', 'fcReposo', (v) => `${Math.round(v)} lpm`],
      ['Variabilidad cardíaca', 'vfc', (v) => `${Math.round(v)} ms`],
      ['Sueño por noche', 'sueno', formatoSueno],
      ['Pasos al día', 'pasos', (v) => Math.round(v).toLocaleString(en ? 'en-US' : 'es')],
      ['Temperatura al dormir (desvío)', 'tempPiel', formatoTemp],
      ['Temperatura basal', 'tempBasal', (v) => `${decimal(v)} °C`],
    ];
    const fases = ['menstrual', 'folicular', 'lutea'] as const;
    const tabla = `<div class="tabla"><table><tr><th></th>${['Fase menstrual', 'Fase folicular', 'Fase lútea'].map((h) => `<th>${tr(h)}</th>`).join('')}</tr>${filasFase
      .filter(([, k]) => fases.some((f) => rel.porFase[f][k] != null))
      .map(([label, k, fmt]) => `<tr><td><b>${tr(label)}</b></td>${fases.map((f) => `<td>${rel.porFase[f][k] != null ? tr(fmt(rel.porFase[f][k]!)) : '—'}</td>`).join('')}</tr>`)
      .join('')}<tr><td>${tr('Días con datos')}</td>${fases.map((f) => `<td>${rel.porFase[f].dias}</td>`).join('')}</tr></table></div>`;
    const saltos = rel.saltos.length
      ? `<div class="tabla"><table><tr>${['Ciclo que empezó', 'Subida de temperatura', 'Día del ciclo', 'Subida'].map((h) => `<th>${tr(h)}</th>`).join('')}</tr>${rel.saltos
          .slice(-6)
          .reverse()
          .map((x) => `<tr><td><b>${fechaCorta(x.inicioCiclo)}</b></td><td>${fechaCorta(x.fecha)}</td><td>${x.diaCiclo}</td><td>${formatoTemp(x.subida)}</td></tr>`)
          .join('')}</table></div>`
      : `<p class="vacio">${tr('Sin una subida clara de temperatura en el período analizado.')}</p>`;
    // Curva del último ciclo con datos: puntos por noche y la línea base.
    const curva = rel.curva;
    let grafico = '';
    if (curva.length >= 5) {
      const W = 640, H = 150, dmax = Math.max(28, ...curva.map((p) => p.dia));
      const vs = curva.map((p) => p.valor);
      const lo = Math.min(...vs) - 0.1, hi = Math.max(...vs) + 0.1;
      const x = (d: number) => 30 + ((d - 1) / (dmax - 1)) * (W - 40);
      const y = (v: number) => 10 + (1 - (v - lo) / (hi - lo)) * (H - 30);
      const salto = rel.saltos.find((z) => curva.some((p) => p.fecha === z.fecha));
      const linea = curva.map((p, i) => `${i ? 'L' : 'M'}${x(p.dia).toFixed(1)} ${y(p.valor).toFixed(1)}`).join(' ');
      grafico = `<svg width="100%" viewBox="0 0 ${W} ${H}" style="margin-top:6px">
        ${salto ? `<rect x="${x(salto.diaCiclo)}" y="6" width="${W - 10 - x(salto.diaCiclo)}" height="${H - 22}" fill="#F8E6EC"/>` : ''}
        ${data.reloj.fuente && curva.every((p) => Math.abs(p.valor) < 3) ? `<line x1="30" x2="${W - 10}" y1="${y(0)}" y2="${y(0)}" stroke="#CDBFBA" stroke-dasharray="4 4"/>` : ''}
        <path d="${linea}" fill="none" stroke="#7E2F52" stroke-width="2"/>
        ${curva.map((p) => `<circle cx="${x(p.dia)}" cy="${y(p.valor)}" r="3" fill="#7E2F52"/>`).join('')}
        ${[1, 7, 14, 21, 28].filter((d) => d <= dmax).map((d) => `<text x="${x(d)}" y="${H - 2}" font-size="10" fill="#7A6873" text-anchor="middle">${d}</text>`).join('')}
      </svg><div class="leyenda"><span>${tr('Temperatura de cada noche del último ciclo, por día del ciclo.')}${salto ? ` ${tr('En rosa: desde la subida de temperatura.')}` : ''}</span></div>`;
    }
    const notas: string[] = [];
    if (rel.difFcReposo != null) notas.push(tr(`Pulso en reposo en fase lútea vs. folicular: ${rel.difFcReposo > 0 ? '+' : ''}${decimal(rel.difFcReposo)} lpm.`));
    if (rel.difTemp != null) notas.push(tr(`Temperatura en fase lútea vs. folicular: ${formatoTemp(rel.difTemp)}.`));
    return `<section class="pagina">
  <div class="cab2">${marca(22, 21)}<span>${tr('Resumen de ciclo')} · ${nombre} · ${fechaCorta(hoy)}</span></div>
  <div class="ante" style="margin-top:22px">${tr('Reloj o app de salud')} · ${fuente}</div>
  <h2 class="h2grande">${tr('Pulso, sueño y temperatura por fase')}</h2>
  ${tabla}
  ${notas.length ? `<p style="margin:10px 0 0;font-size:11.5px">${notas.join(' ')}</p>` : ''}
  <h2>${tr('Subida de temperatura por ciclo')}</h2>
  ${saltos}
  ${grafico}
  <div class="aviso">${tr('Datos medidos por el reloj o el teléfono de la usuaria y leídos de su app de salud. La fase lútea se cuenta desde la subida de temperatura (regla 3 sobre 6) o, sin ella, desde 14 días antes del período siguiente. No es un método anticonceptivo ni un diagnóstico.')}</div>
  ${pie(3)}
</section>`;
  };

  return `<!doctype html><html lang="${region().idioma}"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  @page{size:A4;margin:0}
  *{box-sizing:border-box}
  body{margin:0;font-family:'Plus Jakarta Sans',-apple-system,Roboto,Helvetica,Arial,sans-serif;color:#2A1E28;font-size:11.5px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .pagina{width:210mm;height:297mm;padding:13mm 15mm 0;position:relative;page-break-after:always;overflow:hidden}
  .pagina:last-child{page-break-after:auto}
  h1,h2,h3,.kpi-v,.marca span{font-family:'Fraunces',Georgia,serif;font-weight:500}
  .marca{display:flex;align-items:center;gap:8px;color:#2A1E28}
  .marca span{font-weight:600;letter-spacing:.2px}
  .arriba{display:flex;justify-content:space-between;align-items:center}
  .sello{background:#F8E6EC;color:#7E2F52;border-radius:99px;padding:6px 14px;font-size:9.5px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase}
  .titular{display:flex;justify-content:space-between;align-items:flex-end;margin-top:26px;padding-bottom:16px;border-bottom:2px solid #7E2F52}
  .ante{color:#7E2F52;font-size:10px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase}
  h1{font-size:40px;margin:4px 0 0;line-height:1.05}
  .meta{display:grid;grid-template-columns:auto auto;gap:4px 18px;font-size:11px}
  .meta span{color:#7A6873}.meta b{font-weight:600}
  .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:20px}
  .kpi{background:#F8F3F0;border:1px solid #EFE6E2;border-radius:12px;padding:12px 16px}
  .kpi-l{font-size:10.5px;color:#4A3B45}
  .kpi-v{font-size:30px;margin-top:6px;line-height:1}
  .kpi-v small{font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;color:#4A3B45;margin-left:3px}
  .temas{background:#F6DAE4;border-radius:14px;padding:16px 24px;margin-top:20px}
  .temas h3{font-size:18px;margin:0 0 10px}
  .temas ol{list-style:none;margin:0;padding:0;counter-reset:t}
  .temas li{display:flex;gap:12px;align-items:flex-start;margin:7px 0;counter-increment:t}
  .temas .num{flex:none;width:20px;height:20px;border-radius:50%;background:#7E2F52;color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center}
  .temas .num::before{content:counter(t)}
  .temas p{margin:2px 0 0;font-size:12px;line-height:1.4}
  h2{font-size:19px;margin:22px 0 10px}
  .datos{display:grid;grid-template-columns:1fr 1fr;gap:0 32px}
  .fila{display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid #EDE3DF;font-size:11.5px}
  .fila span{color:#5B4A55}.fila b{font-weight:600;text-align:right}.fila b strong{font-weight:700}
  .rojo{color:#B3263E}
  .tabla{border:1px solid #E8DEDA;border-radius:12px;overflow:hidden}
  table{border-collapse:collapse;width:100%}
  th{background:#F8F3F0;font-weight:600;font-size:10.5px;text-align:left;padding:9px 16px;color:#3A2C36}
  td{padding:8px 16px;border-top:1px solid #EFE6E2;font-size:11.5px}
  td b{font-weight:600}
  .dolor{display:inline-block;background:#F1ECE9;color:#5B4A55;border-radius:99px;padding:2px 9px;font-weight:700;font-size:10.5px}
  .dolor.fuerte{background:#FBE3E6;color:#B3263E}
  footer{position:absolute;left:15mm;right:15mm;bottom:9mm;display:flex;justify-content:space-between;font-size:9.5px;color:#7A6873}
  .cab2{display:flex;justify-content:space-between;align-items:center;padding-bottom:12px;border-bottom:2px solid #7E2F52;font-size:11px;color:#5B4A55}
  .h2grande{font-size:26px;margin:4px 0 16px}
  .mapa{border:1px solid #E8DEDA;border-radius:14px;padding:14px 20px}
  .m-fila{display:flex;align-items:center;gap:10px;margin:5px 0}
  .m-fila>span{width:116px;flex:none;font-size:11px}
  .m-celdas{flex:1;display:grid;grid-template-columns:repeat(35,1fr);gap:3px}
  .m-celdas i{display:block;height:18px;border-radius:4px}
  .m-cab span,.m-cab i{font-size:9.5px;color:#5B4A55;font-style:normal;height:auto;text-align:left}
  .m-sangrado span{font-size:10px;color:#7A6873}
  .m-celdas i.barra{height:5px;border-radius:3px}
  .m-sep{height:8px}
  .leyenda{display:flex;justify-content:space-between;align-items:center;margin-top:10px;font-size:9.5px;color:#5B4A55}
  .escala{display:flex;align-items:center;gap:4px}
  .escala i{display:inline-block;width:14px;height:10px;border-radius:3px}
  .tarjetas{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:26px}
  .tarjetas.una{grid-template-columns:1fr}
  .tarjeta{background:#F8F3F0;border-radius:14px;padding:16px 20px}
  .tarjeta h3{font-size:17px;margin:0 0 10px}
  .b-fila{display:grid;grid-template-columns:minmax(0,1.9fr) minmax(0,0.9fr) 52px;align-items:center;gap:10px;padding:5px 0;font-size:11.5px}
  .b-pista{height:6px;background:#fff;border-radius:3px;overflow:hidden}
  .b-pista i{display:block;height:100%;background:#7E2F52;border-radius:3px}
  .b-fila b{text-align:right;font-weight:600}
  .aviso{position:absolute;left:15mm;right:15mm;bottom:20mm;background:#F3E8E6;border-radius:12px;padding:12px 16px;font-size:10px;color:#5B4A55;line-height:1.5}
  .vacio{color:#7A6873}
</style></head><body>
<section class="pagina">
  <div class="arriba">${marca(30, 30)}<span class="sello">${tr('Informe para consulta ginecológica')}</span></div>
  <div class="titular">
    <div><div class="ante">${tr('Resumen de ciclo')}</div><h1>${nombre}</h1></div>
    <div class="meta"><span>${tr('Generado')}</span><b>${fechaLarga(hoy)}</b><span>${tr('Período analizado')}</span><b>${rango}</b><span>${tr('Ciclos registrados')}</span><b>${s.cycles.length}</b></div>
  </div>
  <div class="kpis">${kpis}</div>
  ${temas}
  <h2>${tr('Datos clave')}</h2>
  <div class="datos"><div>${filas.slice(0, mitad).join('')}</div><div>${filas.slice(mitad).join('')}</div></div>
  <h2>${tr('Ciclos')}</h2>
  ${tablaCiclos}
  ${pie(1)}
</section>
<section class="pagina">
  <div class="cab2">${marca(22, 21)}<span>${tr('Resumen de ciclo')} · ${nombre} · ${fechaCorta(hoy)}</span></div>
  <div class="ante" style="margin-top:22px">${tr('Últimos ciclos')}</div>
  <h2 class="h2grande">${tr(conAnimo ? 'Síntomas y ánimo por día del ciclo' : 'Síntomas por día del ciclo')}</h2>
  ${mapa}
  <div class="tarjetas${moods.length ? '' : ' una'}">
    ${barras('Síntomas más frecuentes', symptoms, (id) => symptomById(id).label)}
    ${moods.length ? barras('Ánimos más frecuentes', moods, (id) => moodById(id).label) : ''}
  </div>
  <div class="aviso">${tr(conAnimo ? 'No incluye intimidad, notas personales ni diario de sueños.' : 'No incluye intimidad, notas personales, estado de ánimo ni diario de sueños.')} ${tr('Datos registrados por la usuaria en una app de registro personal; no es un dispositivo médico.')} ${tr('Las fechas futuras y las fases son estimaciones.')}</div>
  ${pie(2)}
</section>
${paginaReloj()}
</body></html>`;
}
