// «¿Cómo estás de verdad?»: lo que Savia le devuelve según lo que respondió (pedido de Alirio, 15/11/2026).
// Tres capas: combinaciones que se explican entre sí (lo más útil), una lectura por cada respuesta y una frase
// de cierre que cambia cada día. Tono: firme y cercano, sin culpa, sin diagnósticos.
import type { Nivel, Pregunta, Respuesta } from './quiz';
import { elegidas } from './quiz';

// Lectura de cada respuesta. Clave: «pregunta:opción» (hay títulos repetidos entre preguntas, como «Agotada»).
export const LECTURAS: Record<string, string> = {
  // Energía y descanso
  'sueno:Descansé bien': 'Dormiste bien y se nota: tienes energía para lo que venga hoy.',
  'sueno:Más o menos': 'Tu descanso viene irregular. No es falta de voluntad: tu cuerpo te pide una rutina más pareja.',
  'sueno:Me cuesta dormir': 'Te está costando dormir, y eso afecta todo lo demás. Cuidar la noche hoy es prioridad.',
  'sueno:Agotada': 'Estás agotada. No es flojera: tu cuerpo te está pidiendo una pausa, y tiene derecho a pedirla.',
  // Ánimo
  'animo:En calma': 'Estás en paz contigo. Ese equilibrio también se construye, y lo estás logrando.',
  'animo:Con altibajos': 'Tu ánimo sube y baja. Es parte de cómo funcionan tus hormonas, no un defecto tuyo.',
  'animo:Irritable': 'Andas con poca paciencia. Tiene sentido: cuando el cuerpo está cargado, la tolerancia baja.',
  'animo:Ansiosa o triste': 'Sentirte ansiosa o triste es real y merece atención. No tienes que disimularlo.',
  // Cuerpo: ciclo
  'cuerpo:Todo tranquilo': 'Tu cuerpo está tranquilo hoy: aprovecha esa calma.',
  'cuerpo:Hinchazón': 'La hinchazón es incómoda y muy común en algunas fases. El agua y el movimiento suave ayudan.',
  'cuerpo:Cólicos o dolor': 'El dolor no es algo que tengas que aguantar en silencio. Calor, pausa y, si se repite, consulta.',
  'cuerpo:Cambios en la piel': 'Tu piel refleja tus cambios hormonales. Es pasajero y no define cómo te ves.',
  // Cuerpo: menopausia
  'cuerpo:Bochornos': 'Los bochornos son de lo más agotador de esta etapa. No exageras: es real.',
  'cuerpo:Sudores de noche': 'Si los sudores te despiertan, tu descanso se resiente: es lógico que estés más cansada.',
  'cuerpo:Me duele el cuerpo': 'El dolor en las articulaciones es frecuente en esta etapa y vale la pena contárselo a tu médica.',
  // Cuerpo: embarazo
  'cuerpo:Náuseas': 'Las náuseas desgastan mucho. Comer poco y seguido es cuidarte, no rendirte.',
  'cuerpo:Pies hinchados': 'Tus pies cargan con mucho. Elevarlos un rato al día es un regalo para tu cuerpo.',
  'cuerpo:Acidez': 'La acidez es común en el embarazo. Comer despacio y no acostarte enseguida ayuda.',
  // Cuerpo: posparto
  'cuerpo:Me duele la cicatriz o los puntos': 'Tu cuerpo se está recuperando de algo enorme. El dolor merece reposo, no culpa.',
  'cuerpo:Pechos adoloridos': 'Si te duelen los pechos, pide ayuda: una puericultora o tu médica pueden aliviarte mucho.',
  'cuerpo:Agotada': 'Criar agota de una forma que pocos ven. Estar cansada no te hace menos buena madre.',
  // Lo que llevas encima
  'carga:Liviano': 'Llevas tus cosas con soltura. Guarda esta sensación: te sirve de referencia.',
  'carga:Con mucho encima': 'Estás sosteniendo mucho. Que no se vea no significa que no pese.',
  'carga:Le doy vueltas a algo': 'Hay algo que te ronda la cabeza. Ponerlo en palabras suele achicarlo.',
  'carga:Desbordada': 'Te sientes desbordada, y es una señal clara: no se trata de hacer más, sino de soltar algo.',
  // Cómo te tratas
  'cuidado:Como a mis horas': 'Comes a tus horas y te hidratas: esa base sostiene tu ánimo y tu energía.',
  'cuidado:Me salteo comidas': 'Saltearte comidas te deja sin combustible. Tu cuerpo merece comer aunque el día apure.',
  'cuidado:Casi no me muevo': 'Moverte poco puede pesar en el ánimo. No hace falta un gimnasio: con caminar diez minutos alcanza.',
  'cuidado:Me di un rato para mí': 'Te diste un rato para ti, y eso es cuidarte de verdad. Repítelo.',
  // Con quién cuentas
  'compania:Acompañada': 'Tienes con quién contar. Esa red es una de tus mejores fortalezas.',
  'compania:Me hace falta desahogarme': 'Necesitas desahogarte, y es sano. Guardarse todo cansa más que contarlo.',
  'compania:Tensión con alguien': 'Una tensión con alguien cercano pesa en todo el día. Tu malestar tiene motivo.',
  'compania:Sola': 'Sentirte sola duele. No es que no merezcas compañía: a veces hay que pedirla en voz alta.',
};

type Elegidas = Partial<Record<Pregunta['k'], string[]>>;
const tiene = (e: Elegidas, k: Pregunta['k'], ...titulos: string[]) => (e[k] ?? []).some((t) => titulos.includes(t));

// Combinaciones: cuando dos respuestas se explican entre sí, eso es lo primero que se dice.
// «usa» son las respuestas que la combinación ya cubre (para no repetirlas en las lecturas sueltas).
export const COMBOS: { si: (e: Elegidas) => boolean; texto: string; usa: string[] }[] = [
  {
    si: (e) => tiene(e, 'animo', 'Ansiosa o triste') && tiene(e, 'compania', 'Sola'),
    texto: 'Sentirte triste y sola a la vez es mucho para llevarlo en silencio. Escríbele hoy a una persona de confianza; si se repite varios días, cuéntaselo a un profesional.',
    usa: ['animo:Ansiosa o triste', 'compania:Sola'],
  },
  {
    si: (e) => tiene(e, 'sueno', 'Agotada', 'Me cuesta dormir') && tiene(e, 'carga', 'Desbordada', 'Con mucho encima'),
    texto: 'Mucha carga y poco descanso se alimentan entre sí. Hoy lo más productivo es dormir bien, no tachar pendientes.',
    usa: ['sueno:Agotada', 'sueno:Me cuesta dormir', 'carga:Desbordada', 'carga:Con mucho encima'],
  },
  {
    si: (e) => tiene(e, 'animo', 'Irritable') && tiene(e, 'sueno', 'Agotada', 'Me cuesta dormir'),
    texto: 'Tu irritabilidad tiene una explicación clara: dormir mal le baja la paciencia a cualquiera. No eres tú, es el cansancio.',
    usa: ['animo:Irritable'],
  },
  {
    si: (e) => tiene(e, 'carga', 'Le doy vueltas a algo') && tiene(e, 'sueno', 'Me cuesta dormir'),
    texto: 'Si algo te da vueltas en la cabeza, cuesta apagar la mente para dormir. Escribirlo antes de acostarte ayuda a soltarlo.',
    usa: ['carga:Le doy vueltas a algo', 'sueno:Me cuesta dormir'],
  },
  {
    si: (e) => tiene(e, 'compania', 'Tensión con alguien') && tiene(e, 'animo', 'Irritable', 'Ansiosa o triste', 'Con altibajos'),
    texto: 'Una tensión con alguien cercano puede explicar buena parte de cómo te sientes. No estás exagerando.',
    usa: ['compania:Tensión con alguien'],
  },
  {
    si: (e) => tiene(e, 'cuidado', 'Me salteo comidas') && tiene(e, 'animo', 'Irritable', 'Con altibajos'),
    texto: 'Saltearte comidas hace que el ánimo suba y baje más. Comer a tus horas es una forma concreta de calmarlo.',
    usa: ['cuidado:Me salteo comidas'],
  },
  {
    si: (e) => tiene(e, 'cuidado', 'Me salteo comidas') && tiene(e, 'sueno', 'Agotada'),
    texto: 'Sin comida ni descanso suficientes, el cuerpo no tiene de dónde sacar energía. Empieza por lo más fácil: comer algo ahora.',
    usa: ['cuidado:Me salteo comidas', 'sueno:Agotada'],
  },
  {
    si: (e) => tiene(e, 'cuidado', 'Casi no me muevo') && tiene(e, 'cuerpo', 'Hinchazón', 'Cólicos o dolor', 'Pies hinchados'),
    texto: 'Un poco de movimiento suave puede aliviar la hinchazón y el dolor más de lo que parece.',
    usa: ['cuidado:Casi no me muevo'],
  },
  {
    si: (e) => tiene(e, 'cuerpo', 'Sudores de noche') && tiene(e, 'sueno', 'Agotada', 'Me cuesta dormir', 'Más o menos'),
    texto: 'Los sudores de noche cortan el sueño: tu cansancio tiene una causa concreta, y se puede tratar. Vale la pena hablarlo con tu médica.',
    usa: ['cuerpo:Sudores de noche'],
  },
  {
    si: (e) => tiene(e, 'cuidado', 'Me di un rato para mí') && tiene(e, 'carga', 'Con mucho encima', 'Desbordada'),
    texto: 'Aun con todo lo que cargas, te diste un rato para ti. Eso no es egoísmo: es lo que te permite seguir.',
    usa: ['cuidado:Me di un rato para mí'],
  },
  {
    si: (e) => tiene(e, 'compania', 'Acompañada') && tiene(e, 'carga', 'Desbordada', 'Con mucho encima'),
    texto: 'Llevas mucho, pero no estás sola: apóyate en quien tienes cerca y reparte algo de lo que cargas.',
    usa: ['compania:Acompañada'],
  },
  {
    si: (e) => tiene(e, 'compania', 'Me hace falta desahogarme') && tiene(e, 'carga', 'Le doy vueltas a algo'),
    texto: 'Eso que te da vueltas pide salir. Contárselo a alguien hoy puede quitarte un peso de encima.',
    usa: ['compania:Me hace falta desahogarme', 'carga:Le doy vueltas a algo'],
  },
  {
    si: (e) => tiene(e, 'sueno', 'Descansé bien') && tiene(e, 'animo', 'En calma') && tiene(e, 'carga', 'Liviano'),
    texto: 'Descanso, ánimo y carga en equilibrio: hoy es un muy buen día para algo que disfrutes.',
    usa: ['sueno:Descansé bien', 'animo:En calma', 'carga:Liviano'],
  },
];

/**
 * Hasta 3 frases sobre lo que respondió: primero las combinaciones (máx. 2), después la lectura de lo que más
 * pesa. Si todo está tranquilo, se reconoce lo que está bien.
 */
export function lecturas(qs: Pregunta[], r: Partial<Record<Pregunta['k'], Respuesta>>): string[] {
  const e: Elegidas = {};
  const sueltas: { clave: string; peso: number; orden: number }[] = [];
  qs.forEach((q, n) => {
    if (q.k === 'pide') return;
    const sel = elegidas(r[q.k]).filter((i) => q.opciones[i]);
    e[q.k] = sel.map((i) => q.opciones[i][1]);
    sel.forEach((i) => sueltas.push({ clave: `${q.k}:${q.opciones[i][1]}`, peso: q.opciones[i][3], orden: n * 10 + i }));
  });
  const combos = COMBOS.filter((c) => c.si(e)).slice(0, 2);
  const usadas = new Set(combos.flatMap((c) => c.usa));
  const hayPeso = sueltas.some((s) => s.peso > 0);
  const resto = sueltas
    .filter((s) => !usadas.has(s.clave) && LECTURAS[s.clave] && (hayPeso ? s.peso > 0 : true))
    .sort((a, b) => b.peso - a.peso || a.orden - b.orden)
    .map((s) => LECTURAS[s.clave]);
  return [...combos.map((c) => c.texto), ...resto].slice(0, 3);
}

// Frase de cierre: varias por resultado; cambia con el día para que no sea siempre la misma.
export const FRASES: Record<Nivel, string[]> = {
  calma: [
    'Así se ve cuando te escuchas.',
    'Hoy tu cuerpo y tu mente van para el mismo lado.',
    'Estar bien también merece registrarse.',
    'Lo que hoy te funciona, vale la pena repetirlo.',
    'Florecer en calma también es un logro.',
    'Guarda este día: es tu referencia de bienestar.',
  ],
  ajuste: [
    'Lento también cuenta.',
    'No tienes que poder con todo hoy.',
    'Darte cuenta ya es empezar a cuidarte.',
    'Un día a la vez es suficiente.',
    'Lo que sientes tiene sentido.',
    'Bajar el ritmo no es retroceder.',
  ],
  cuidado: [
    'Mereces la misma ternura que le das a los demás.',
    'Pedir ayuda es una forma de fuerza.',
    'No estás sola, aunque hoy lo parezca.',
    'Lo que sientes es real y tiene salida.',
    'Hoy alcanza con cuidarte un poco.',
    'Tu bienestar también es prioridad.',
  ],
  nose: [
    'Conocerte también es cuidarte.',
    'Está bien no tener todas las respuestas.',
    'Mañana puedes volver a preguntarte.',
    'Escucharte es un hábito que se aprende.',
  ],
};

export function fraseDelDia(n: Nivel, fecha: string): string {
  const lista = FRASES[n];
  const semilla = [...fecha].reduce((a, ch) => a + ch.charCodeAt(0), 0);
  return lista[semilla % lista.length];
}
