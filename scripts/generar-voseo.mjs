// Genera src/content/i18n/vos.ts: cada texto de Savia (ya en español neutro) en voseo rioplatense.
// Solo cambia el presente, el imperativo afirmativo, «tú/ti/contigo» y «eres». El subjuntivo («que tomes»,
// «no olvides»), el pasado y el futuro quedan igual, como se usan en Argentina y Uruguay.
// Uso (desde la carpeta de CicloApp): node scripts/generar-voseo.mjs . <carpeta donde dejar revision-voseo.txt>
// Después de cambiar textos de la app: correrlo, mirar revision-voseo.txt y sumar a ARREGLOS o QUEDAN_IGUAL lo que falle.
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const [repo, salida] = process.argv.slice(2);
const { EN, EN_PATRONES } = await import(pathToFileURL(join(repo, 'src/content/i18n/en.ts')).href);
const { NEUTRO } = await import(pathToFileURL(join(repo, 'src/content/i18n/neutro.ts')).href);

// Presente: siempre que aparecen son el verbo.
const PRESENTE = {
  puedes: 'podés', tienes: 'tenés', sientes: 'sentís', quieres: 'querés', necesitas: 'necesitás', llevas: 'llevás',
  eres: 'sos', compartes: 'compartís', cambias: 'cambiás', registras: 'registrás', sabes: 'sabés', sangras: 'sangrás',
  comes: 'comés', piensas: 'pensás', pierdes: 'perdés', vienes: 'venís', mandas: 'mandás', eliges: 'elegís', usas: 'usás',
  prefieres: 'preferís', duermes: 'dormís', empapas: 'empapás', guardas: 'guardás', consigues: 'conseguís', admiras: 'admirás',
  alimentas: 'alimentás', acuerdas: 'acordás', envías: 'enviás', anotas: 'anotás', amaneces: 'amanecés', aprovechas: 'aprovechás',
  vuelves: 'volvés', siembras: 'sembrás', haces: 'hacés', descansas: 'descansás', animas: 'animás', rompes: 'rompés',
  buscas: 'buscás', escuchas: 'escuchás', floreces: 'florecés', retomas: 'retomás', arrancas: 'arrancás', decides: 'decidís',
  entras: 'entrás', empiezas: 'empezás', sigues: 'seguís', ajustas: 'ajustás', configuras: 'configurás', escribes: 'escribís',
  pones: 'ponés', sostienes: 'sostenés', tratas: 'tratás', andas: 'andás', exageras: 'exagerás', hidratas: 'hidratás',
  olvidas: 'olvidás', conversas: 'conversás', vomitas: 'vomitás', mereces: 'merecés', crees: 'creés', vives: 'vivís',
  trabajas: 'trabajás', ves: 'ves', das: 'das', vas: 'vas', estás: 'estás',
};
// Presente que también es sustantivo («tus tomas», «las marcas»): solo detrás de estas palabras.
const PRESENTE_AMBIGUO = { activas: 'activás', mareas: 'mareás', tomas: 'tomás', cuentas: 'contás', marcas: 'marcás', cargas: 'cargás', notas: 'notás', despiertas: 'despertás', creas: 'creás' };
const ANTES_DE_VERBO = new Set(['si', 'te', 'lo', 'la', 'le', 'les', 'me', 'ya', 'no', 'tú', 'vos', 'que', 'cuando', 'cómo', 'qué', 'también', 'mientras', 'donde', 'nunca', 'siempre', 'solo', 'casi']);

// Imperativo con pronombre pegado: cualquier lugar de la frase.
const CLITICO = {
  coméntalo: 'comentalo', pregúntale: 'preguntale', cuídate: 'cuidate', encárgate: 'encargate', cuéntanos: 'contanos',
  muévete: 'movete', comunícate: 'comunicate', cuéntaselo: 'contáselo', ofrécete: 'ofrecete', consúltalo: 'consultalo',
  ayúdanos: 'ayudanos', acuéstate: 'acostate', anótalo: 'anotalo', escríbele: 'escribile', háblalo: 'hablalo', escríbenos: 'escribinos',
  confírmalo: 'confirmalo', pídele: 'pedile', escríbelo: 'escribilo', pégalo: 'pegalo', ayúdala: 'ayudala', llévale: 'llevale',
  márcala: 'marcala', apóyate: 'apoyate', cuéntale: 'contale', tómala: 'tomala', míralo: 'miralo', anótala: 'anotala',
  remójala: 'remojala', súmale: 'sumale', envíale: 'enviale', asegúrate: 'asegurate', resuélvelo: 'resolvelo', invítala: 'invitala',
  ofrécele: 'ofrecele', prepárale: 'preparale', sorpréndela: 'sorprendela', ábrela: 'abrila', actívala: 'activala', márcalo: 'marcalo',
  apágalo: 'apagalo', búscala: 'buscala', avísanos: 'avisanos', pégalos: 'pegalos', pégala: 'pegala', siéntate: 'sentate',
  muéstraselo: 'mostráselo', llévatelo: 'llevátelo', prepáralo: 'preparalo', actívalos: 'activalos', pídela: 'pedila', ábrelo: 'abrilo',
  déjalo: 'dejalo', acompáñala: 'acompañala', úsalo: 'usalo', cámbiala: 'cambiala', anímate: 'animate', tómate: 'tomate',
  abrázalas: 'abrazalas', inclínate: 'inclinate', consúltale: 'consultale', prepárate: 'preparate', hidrátate: 'hidratate',
  disfrútalo: 'disfrutalo', mírate: 'mirate', regístralo: 'registralo', obsérvala: 'observala', descárgala: 'descargala',
  tócalo: 'tocalo', guárdalo: 'guardalo', márcalas: 'marcalas', cífralo: 'cifralo', repítelo: 'repetilo', fíjate: 'fijate',
  acuérdate: 'acordate', recuérdalo: 'recordalo', pruébala: 'probala', pruébalo: 'probalo', cuídala: 'cuidala', ábrela: 'abrila',
  proponle: 'proponele', tenle: 'tenele', ponte: 'ponete', hazte: 'hacete', hazlo: 'hacelo', dile: 'decile', dime: 'decime',
  ponles: 'poneles', ponle: 'ponele', ponla: 'ponela', ponlo: 'ponelo', tenlo: 'tenelo', vete: 'andate', sal: null, date: 'date', dale: 'dale',
  tomándolas: 'tomándolas', detente: 'detenete', sírvete: 'servite', vístete: 'vestite', duérmete: 'dormite', siéntete: 'sentite', lávate: 'lavate',
  estírate: 'estirate', relájate: 'relajate', recuéstate: 'recostate', levántate: 'levantate', quédate: 'quedate', permítete: 'permitite',
  dátelo: 'dátelo', regálate: 'regalate', mímate: 'mimate', escúchate: 'escuchate', tómalo: 'tomalo', tómalas: 'tomalas',
  llámala: 'llamala', abrázala: 'abrazala', mándale: 'mandale', escríbeme: 'escribime', cuéntame: 'contame', ayúdame: 'ayudame',
};

// Imperativo sin pronombre: solo al empezar una frase (así no se toca «ella toma» ni «la toma»).
// `null` = la palabra también es de tercera persona o sustantivo; esas van en AMBIGUO_INICIO con su contexto.
const IMPERATIVO = {
  revisa: 'revisá', respira: 'respirá', elige: 'elegí', guarda: 'guardá', baja: 'bajá', registra: 'registrá', anota: 'anotá',
  usa: 'usá', agrega: 'agregá', escribe: 'escribí', sigue: 'seguí', propón: 'proponé', ten: 'tené', abre: 'abrí', busca: 'buscá',
  pon: 'poné', mide: 'medí', calienta: 'calentá', descansa: 'descansá', salta: 'saltá', prepara: 'prepará', lee: 'leé',
  comparte: 'compartí', confirma: 'confirmá', pide: 'pedí', inhala: 'inhalá', exhala: 'exhalá', responde: 'respondé',
  avanza: 'avanzá', repite: 'repetí', personaliza: 'personalizá', camina: 'caminá', deja: 'dejá', incluye: 'incluí',
  apoya: 'apoyá', mantén: 'mantené', moviliza: 'movilizá', come: 'comé', habla: 'hablá', encuentra: 'encontrá', configura: 'configurá',
  atiende: 'atendé', organiza: 'organizá', planea: 'planeá', separa: 'separá', aprovecha: 'aprovechá', arranca: 'arrancá',
  confía: 'confiá', disfruta: 'disfrutá', intenta: 'intentá', modera: 'moderá', ordena: 'ordená', prioriza: 'priorizá',
  recuerda: 'recordá', acompaña: 'acompañá', aprieta: 'apretá', dibuja: 'dibujá', estira: 'estirá', relaja: 'relajá',
  aterriza: 'aterrizá', mezcla: 'mezclá', practica: 'practicá', protege: 'protegé', termina: 'terminá', adereza: 'aderezá',
  controla: 'controlá', hornea: 'horneá', licúa: 'licuá', cuida: 'cuidá', piensa: 'pensá', descarta: 'descartá', actualiza: 'actualizá',
  mira: 'mirá', desbloquea: 'desbloqueá', sostén: 'sostené', espera: 'esperá', haz: 'hacé', di: 'decí', ve: 'andá', bebe: 'tomá',
  invita: 'invitá', sorprende: 'sorprendé', ofrece: 'ofrecé', pasa: 'pasá', llama: 'llamá', regala: 'regalá', escucha: 'escuchá',
  evita: 'evitá', suma: 'sumá', reparte: 'repartí', reduce: null, oculta: null, redondea: 'redondeá', reconecta: 'reconectá', entra: 'entrá', corta: 'cortá', entiende: 'entendé', baila: 'bailá', toca: null, prueba: null, activa: null, toma: null, pregunta: null, vuelve: null, cocina: null,
  marca: null, cambia: null, sirve: null, consulta: null, crea: null, nota: null, cuenta: null, lleva: null, empieza: null,
};
// Esas palabras ambiguas: imperativo solo si la palabra siguiente lo confirma.
const SIGUIENTE = {
  toca: /^(para|aquí|acá|el|la|los|las|un|una|cada|tu|tus|dos|"|«)$/i,
  prueba: /^(con|a|un|una|el|la|esto|este|esta|otra|otro|cambiar|hacer|poner|tomar|usar|primero)$/i,
  activa: /^(el|la|los|las|tu|tus|un|una|avisos|recordatorios)$/i,
  toma: /^(\d+|el|la|tu|tus|un|una|agua|nota|aire|la|tus|tu|una|un|en|con|algo|ácido|suficiente)$/i,
  pregunta: /^(en|a|por|si|cuál|cuáles|qué|cómo|siempre|antes)$/i,
  vuelve: /^(a|al)$/i,
  cocina: /^(a|el|la|los|las|un|una|en|con)$/i,
  marca: /^(la|el|las|los|tu|tus|cada|cuándo|cómo|aquí|hoy)$/i,
  cambia: /^(de|el|la|tu|tus|cada)$/i,
  sirve: /^(con|en|caliente|frío|fría|tibio|tibia)$/i,
  consulta: /^(con|a|si|tu|en|antes|siempre|pronto|hoy)$/i,
  crea: /^(tu|un|una)$/i,
  nota: /^(cómo|si|qué)$/i,
  cuenta: /^(\d+|las|los|cuántas|cuántos|hasta|cada)$/i,
  lleva: /^(a|al|tu|tus|el|la|un|una|contigo|agua)$/i,
  empieza: /^(por|con)$/i,
};

// Mitad de frase: estas casi siempre son de tercera persona («y baja la fiebre», «y sigue igual»).
const TERCERA = new Set(['baja', 'usa', 'sigue', 'deja', 'pasa', 'suma', 'espera', 'lleva', 'termina', 'avanza', 'mide', 'protege', 'relaja', 'controla', 'ayuda', 'sirve', 'toca', 'cambia', 'crea', 'nota', 'marca', 'cocina', 'vuelve', 'prueba', 'pregunta', 'abre', 'salta', 'lee', 'habla', 'piensa', 'confía', 'sostén', 'estira', 'mezcla']);
const AMBIGUO_VOS = { toca: 'tocá', prueba: 'probá', activa: 'activá', toma: 'tomá', pregunta: 'preguntá', vuelve: 'volvé', cocina: 'cociná', marca: 'marcá', cambia: 'cambiá', sirve: 'serví', consulta: 'consultá', crea: 'creá', nota: 'notá', cuenta: 'contá', lleva: 'llevá', empieza: 'empezá' };

const conMayuscula = (de, a) => (de[0] === de[0].toUpperCase() && de[0] !== de[0].toLowerCase() ? a[0].toUpperCase() + a.slice(1) : a);
const PALABRA = /[A-Za-zÁÉÍÓÚáéíóúÑñü]+/g;

export function voseo(texto) {
  // Pronombres
  let s = texto
    .replace(/\b(para|a|de|en|por|sin|entre|hacia|según|sobre)\s+ti\b/gi, (_, p) => `${p} vos`)
    .replace(/\bcontigo\b/g, 'con vos')
    .replace(/\bContigo\b/g, 'Con vos')
    // \b no sirve detrás de «ú» (no la cuenta como letra): se mira la letra siguiente a mano.
    .replace(/(^|[^A-Za-zÁÉÍÓÚáéíóúñ])tú(?![A-Za-zÁÉÍÓÚáéíóúñ])/g, '$1vos')
    .replace(/(^|[^A-Za-zÁÉÍÓÚáéíóúñ])Tú(?![A-Za-zÁÉÍÓÚáéíóúñ])/g, '$1Vos');
  // Palabra por palabra, mirando la anterior y la siguiente.
  const partes = [...s.matchAll(PALABRA)];
  let out = '';
  let corte = 0;
  partes.forEach((m, i) => {
    const w = m[0];
    const l = w.toLowerCase();
    const antes = s.slice(0, m.index);
    const anterior = partes[i - 1]?.[0].toLowerCase();
    const siguiente = partes[i + 1]?.[0] ?? '';
    const alInicio = /(^|[.:;!?¿¡•\n—"«(]\s*)$/.test(antes) || /^\s*$/.test(antes);
    // Segundo imperativo de la frase («revisa la etiqueta y elige…»): después de «y», «o», coma, dos puntos o paréntesis.
    const despuesDeUnion = /(\s(y|o|e)\s+|[,;(]\s*)$/.test(antes);
    let nuevo = null;
    if (l in CLITICO && CLITICO[l]) nuevo = CLITICO[l];
    else if (l in PRESENTE) nuevo = PRESENTE[l];
    else if (l in PRESENTE_AMBIGUO && ANTES_DE_VERBO.has(anterior)) nuevo = PRESENTE_AMBIGUO[l];
    else if (alInicio && l in IMPERATIVO) {
      if (IMPERATIVO[l]) nuevo = IMPERATIVO[l];
      else if (SIGUIENTE[l]?.test(siguiente)) nuevo = AMBIGUO_VOS[l];
    } else if (despuesDeUnion && l in IMPERATIVO && !TERCERA.has(l)) {
      if (IMPERATIVO[l]) nuevo = IMPERATIVO[l];
      else if (SIGUIENTE[l]?.test(siguiente)) nuevo = AMBIGUO_VOS[l];
    } else if (l === 've' && /^(a|al|de|con)$/i.test(siguiente)) nuevo = 'andá';
    if (nuevo && nuevo !== l) {
      out += s.slice(corte, m.index) + conMayuscula(w, nuevo);
      corte = m.index + w.length;
    }
  });
  return out + s.slice(corte);
}

// Revisadas a mano: la traducción al inglés confirma que son descripciones o «te toca», no órdenes.
const QUEDAN_IGUAL = new Set([
  'Toca la inyección',
  'Toca la {0} de {1}{2}',
  'Activa tu blíster digital y oculta los días fértiles',
  'Activa el cuerpo sin impacto fuerte.',
  'Baja calidad, pero consistente: reduce la intensidad del dolor.',
  'Usa TRH ({0}): revisar dosis y efecto en los bochornos.',
  // Lo que hace el bebé en cada semana del embarazo (tercera persona).
  'Abre los ojos, reacciona a tu voz y gana grasa.',
  'Abre y cierra los ojos, sueña y patea con fuerza.',
]);
const ARREGLOS = [
  ['Saltá los días de descanso.', 'Salta los días de descanso.'],
  ['y toca empezar', 'y tocá empezar'],
  ['Empieza en pared.', 'Empezá en pared.'],
  ['y empieza el blíster nuevo', 'y empezá el blíster nuevo'],
  ['Al inhalar, baja el abdomen', 'Al inhalar, bajá el abdomen'],
  ['usa preservativo', 'usá preservativo'],
  ['(o evita las relaciones)', '(o evitá las relaciones)'],
  ['pregunta en la farmacia', 'preguntá en la farmacia'],
  ['toca el alvéolo', 'tocá el alvéolo'],
  ['toca "Acompañar a mi pareja"', 'tocá "Acompañar a mi pareja"'],
  ['y sigue con las siguientes', 'y seguí con las siguientes'],
  ['y toca Guardar', 'y tocá Guardar'],
  ['Sube empujando', 'Subí empujando'],
  ['Si bajas un respaldo', 'Si bajás un respaldo'],
  ['Empieza hoy, sin presión.', 'Empezá hoy, sin presión.'],
  ['si se repite, consulta.', 'si se repite, consultá.'],
  ['Sube un brazo', 'Subí un brazo'],
  ['y alivia la sensación', 'y aliviá la sensación'],
  ['y deja que ella elija', 'y dejá que ella elija'],
  ['y prueba un movimiento suave', 'y probá un movimiento suave'],
  ['mucho, suma comidas', 'mucho, sumá comidas'],
  ['y viste en capas', 'y vestite en capas'],
  ['usa Savia sin cuenta', 'usá Savia sin cuenta'],
  ['habla de anticoncepción', 'hablá de anticoncepción'],
];
const voseoFinal = (n) => (QUEDAN_IGUAL.has(n) ? n : ARREGLOS.reduce((x, [a, b]) => x.split(a).join(b), voseo(n)));
const neutro = (k) => NEUTRO[k] ?? k;
const dic = {};
const pat = {};
const revision = [];
for (const k of Object.keys(EN)) {
  const n = neutro(k);
  const v = voseoFinal(n);
  if (v !== n) {
    dic[n] = v;
    revision.push(`- ${n}\n+ ${v}`);
  }
}
for (const k of Object.keys(EN_PATRONES)) {
  const v = voseoFinal(k);
  if (v !== k) {
    pat[k] = v;
    revision.push(`- ${k}\n+ ${v}`);
  }
}
const cuerpo = (o) => Object.entries(o).map(([a, b]) => `  ${JSON.stringify(a)}: ${JSON.stringify(b)},`).join('\n');
writeFileSync(
  join(repo, 'src/content/i18n/vos.ts'),
  `// Voseo para Argentina y Uruguay: el texto en español neutro → con «vos» (ver VOZ.md).\n` +
    `// Archivo generado por scripts/generar-voseo.mjs (mapa de verbos revisado a mano). Si cambias textos, vuelve a generarlo.\n` +
    `// Solo cambian el presente («tenés»), el imperativo («registrá», «fijate») y «ti/contigo»; el subjuntivo queda igual.\n` +
    `// Los patrones usan {0}, {1}… para las partes que cambian.\n\n` +
    `export const VOS: Record<string, string> = {\n${cuerpo(dic)}\n};\n\nexport const VOS_PATRONES: Record<string, string> = {\n${cuerpo(pat)}\n};\n`,
);
writeFileSync(join(salida, 'revision-voseo.txt'), revision.join('\n'));
console.log('frases con voseo:', Object.keys(dic).length, '· patrones:', Object.keys(pat).length);
