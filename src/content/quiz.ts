// Quiz "¿Cómo estás de verdad?" (diseño 7b y 7c): una pregunta por pantalla, siempre con "No sé",
// y al final tu flor de hoy, coloreada con tus respuestas.
// Cada pregunta admite varias respuestas. Las que se contradicen (por ejemplo «Descansé bien» y «Agotada»)
// están en «incompatibles»: al elegir una, se desmarca la otra.
import type { Etapa } from '../lib/types';

// [clave del icono, título, detalle, intensidad 0 a 3]
export type Opcion = [string, string, string, number];

export interface Pregunta {
  k: 'sueno' | 'animo' | 'cuerpo' | 'carga' | 'cuidado' | 'compania' | 'pide';
  kicker: string;
  titulo: string;
  ayuda: string;
  opciones: Opcion[];
  nota: string;
  area: string;
  // Pares de opciones (por índice) que no se pueden elegir juntas
  incompatibles: [number, number][];
}

// La primera opción («Todo tranquilo», «En calma»…) no convive con ninguna de las demás
const primeraSola = (n: number): [number, number][] => Array.from({ length: n - 1 }, (_, i) => [0, i + 1]);

function cuerpo(etapa: Etapa): Opcion[] {
  if (etapa === 'meno')
    return [['🌿', 'Todo tranquilo', 'Sin molestias', 0], ['🔥', 'Bochornos', 'Calor que sube de golpe', 2], ['💧', 'Sudores de noche', 'Me despiertan', 2], ['🦴', 'Me duele el cuerpo', 'Articulaciones o músculos', 3]];
  if (etapa === 'embarazo')
    return [['🌿', 'Todo tranquilo', 'Me siento bien', 0], ['🤢', 'Náuseas', 'Revuelta o con asco', 2], ['🦶', 'Pies hinchados', 'Al final del día', 1], ['🔥', 'Acidez', 'Ardor después de comer', 2]];
  if (etapa === 'posparto')
    return [['🌿', 'Todo tranquilo', 'Me siento bien', 0], ['🩹', 'Me duele la cicatriz o los puntos', 'Al moverme o al sentarme', 2], ['🤱', 'Pechos adoloridos', 'Congestión o grietas', 2], ['🪫', 'Agotada', 'El cuerpo no da más', 3]];
  return [['🌿', 'Todo tranquilo', 'Sin molestias', 0], ['🎈', 'Hinchazón', 'Barriga o pechos', 1], ['🌀', 'Cólicos o dolor', 'Vientre o espalda', 3], ['✨', 'Cambios en la piel', 'Granitos o resequedad', 1]];
}

export function preguntas(etapa: Etapa): Pregunta[] {
  return [
    {
      k: 'sueno', kicker: 'Energía y descanso', titulo: '¿Cómo has dormido y cómo anda tu energía?', ayuda: 'Piensa en los últimos días, no solo en hoy.',
      opciones: [['🌙', 'Descansé bien', 'Me levanto con pila', 0], ['🌤', 'Más o menos', 'Algunos días sí, otros no', 1], ['🥱', 'Me cuesta dormir', 'Me despierto o tardo en dormir', 2], ['🪫', 'Agotada', 'Sin energía casi todo el día', 3]],
      nota: 'Nos pasa a muchas: el sueño y la energía cambian con las hormonas. Anotarlo ya es un paso.', area: 'Descanso',
      // «Descansé bien» no va con nada más; «Más o menos» y «Agotada» son grados distintos de lo mismo
      incompatibles: [...primeraSola(4), [1, 3]],
    },
    {
      k: 'animo', kicker: 'Ánimo y calma', titulo: '¿Cómo está tu ánimo estos días?', ayuda: 'Elige lo que más se parezca, aunque no sea exacto.',
      opciones: [['😊', 'En calma', 'Tranquila y bien conmigo', 0], ['🌊', 'Con altibajos', 'Subo y bajo rápido', 1], ['😤', 'Irritable', 'Todo me molesta un poquito', 2], ['🫧', 'Ansiosa o triste', 'Con un nudo o ganas de llorar', 3]],
      nota: 'Es súper normal. Sentir más no es sentir de más, y no tienes que poder con todo.', area: 'Ánimo',
      incompatibles: primeraSola(4),
    },
    {
      k: 'cuerpo', kicker: 'Sensaciones del cuerpo', titulo: '¿Qué es lo que más sientes en tu cuerpo?', ayuda: 'Elige la que más te molesta hoy.',
      opciones: cuerpo(etapa), nota: 'Tu cuerpo te está hablando, y escucharlo es cuidarte. Vamos a buscarte un alivio.', area: 'Cuerpo',
      incompatibles: primeraSola(4),
    },
    {
      // Carga mental: lo que no se ve en el cuerpo pero pesa (trabajo, casa, cuidar a otros, preocupaciones)
      k: 'carga', kicker: 'Lo que llevas encima', titulo: '¿Cuánto te está pesando el día a día?', ayuda: 'Puedes elegir más de una.',
      opciones: [['🍃', 'Liviano', 'Llevo bien mis cosas', 0], ['📋', 'Con mucho encima', 'Trabajo, casa o cuidar a otros', 2], ['🌀', 'Le doy vueltas a algo', 'Una preocupación que no se va', 2], ['🌊', 'Desbordada', 'Siento que no llego a todo', 3]],
      nota: 'Todo lo que sostienes también cuenta, aunque nadie lo vea. No tienes que cargarlo sola.', area: 'Carga',
      // «Liviano» no va con nada más; «Con mucho encima» y «Desbordada» son grados de lo mismo
      incompatibles: [...primeraSola(4), [1, 3]],
    },
    {
      // Lo básico: comer, tomar agua, moverse y un rato para una misma
      k: 'cuidado', kicker: 'Cómo te tratas', titulo: '¿Cómo te estás cuidando estos días?', ayuda: 'Puedes elegir más de una.',
      opciones: [['🥗', 'Como a mis horas', 'Y tomo agua', 0], ['⏰', 'Me salteo comidas', 'O como a las apuradas', 2], ['🛋', 'Casi no me muevo', 'Paso mucho tiempo sentada', 1], ['🌸', 'Me di un rato para mí', 'Algo que disfruté', 0]],
      nota: 'Cuidarte no es un premio: es lo que te sostiene. Un paso chiquito ya suma.', area: 'Cuidado',
      incompatibles: [[0, 1]],
    },
    {
      // Compañía: sentirse sola pesa tanto como el cansancio
      k: 'compania', kicker: 'Con quién cuentas', titulo: '¿Te sientes acompañada?', ayuda: 'Puedes elegir más de una.',
      opciones: [['🤝', 'Acompañada', 'Tengo con quién contar', 0], ['💭', 'Me hace falta desahogarme', 'Quisiera contarle a alguien', 1], ['⚡', 'Tensión con alguien', 'Pareja, familia o trabajo', 2], ['🏝', 'Sola', 'Me siento sola o aislada', 3]],
      nota: 'Pedir compañía no es molestar. Las personas que te quieren quieren saber cómo estás.', area: 'Compañía',
      incompatibles: [[0, 3]],
    },
    {
      k: 'pide', kicker: 'Lo que necesitas', titulo: '¿Qué te provoca hoy?', ayuda: 'Te daremos una idea a tu medida.',
      opciones: [['🛁', 'Descansar', 'Bajar el ritmo', 0], ['🫖', 'Un mimo rico', 'Algo calentico o dulce', 0], ['🚶', 'Moverme', 'Soltar el cuerpo', 0], ['💬', 'Hablar con alguien', 'Sentirme acompañada', 0]],
      nota: 'Pedir lo que necesitas también es amor propio.', area: '',
      incompatibles: [[0, 2]], // descansar y moverme
    },
  ];
}

// 'x' = "No sé o prefiero no decir". Si no, la lista de opciones elegidas (por índice).
// Las respuestas guardadas antes de la elección múltiple son un solo número: se leen igual.
export type Respuesta = number[] | number | 'x';
export type Nivel = 'calma' | 'ajuste' | 'cuidado' | 'nose';

export const elegidas = (a: Respuesta | undefined): number[] => (a == null || a === 'x' ? [] : Array.isArray(a) ? a : [a]);

// Preguntas que pintan la flor: todas menos «Lo que necesitas» (que no mide cómo estás, sino qué te provoca)
export const areas = (qs: Pregunta[]) => qs.filter((q) => q.k !== 'pide');

/** Marca o desmarca una opción; si se marca, se desmarcan las que la contradicen. */
export function alternar(q: Pregunta, actual: Respuesta | undefined, i: number): Respuesta | undefined {
  const sel = elegidas(actual);
  if (sel.includes(i)) {
    const resto = sel.filter((x) => x !== i);
    return resto.length ? resto : undefined;
  }
  const choca = (j: number) => q.incompatibles.some(([a, b]) => (a === i && b === j) || (a === j && b === i));
  return [...sel.filter((j) => !choca(j)), i].sort((a, b) => a - b);
}

/** Cada área vale lo que más pesa de lo elegido; el nivel sale del promedio de las áreas respondidas. */
export function nivel(qs: Pregunta[], r: Partial<Record<Pregunta['k'], Respuesta>>): { nivel: Nivel; valores: (number | null)[]; peor: number } {
  const valores = areas(qs).map((q) => {
    const sel = elegidas(r[q.k]).filter((i) => q.opciones[i]);
    return sel.length ? Math.max(...sel.map((i) => q.opciones[i][3])) : null;
  });
  const conocidos = valores.filter((v): v is number => v != null);
  const prom = conocidos.length ? conocidos.reduce((a, b) => a + b, 0) / conocidos.length : -1;
  let peor = 0;
  valores.forEach((v, i) => {
    if (v != null && v > (valores[peor] ?? -1)) peor = i;
  });
  return { nivel: prom < 0 ? 'nose' : prom <= 0.7 ? 'calma' : prom <= 1.7 ? 'ajuste' : 'cuidado', valores, peor };
}

export const RESULTADOS: Record<Nivel, { titulo: string; texto: string; frase: string }> = {
  calma: { titulo: 'Hoy floreces en calma', texto: 'Tu cuerpo y tu ánimo están en sintonía. Disfrútalo y guarda este día como referencia de cómo te sientes bien.', frase: 'Así se ve cuando te escuchas.' },
  ajuste: { titulo: 'Estás floreciendo a tu ritmo', texto: 'Hay cosas que pesan un poquito, y es normal. Lo estás notando, y eso ya es cuidarte. Vamos un día a la vez.', frase: 'Lento también cuenta.' },
  cuidado: {
    titulo: 'Hoy tu flor pide cariño',
    texto: 'Ha sido un tiempo intenso y no estás sola: nos pasa a muchas, y hay formas de sentirte mejor. Si se repite varios días, cuéntaselo a tu médica.',
    frase: 'Mereces la misma ternura que le das a los demás.',
  },
  nose: { titulo: 'Está bien no saberlo todo', texto: 'A veces cuesta ponerle nombre a lo que sentimos. Volver a preguntarte mañana te ayudará a conocerte mejor.', frase: 'Conocerte también es cuidarte.' },
};

// Idea para hoy: según lo que pidió o, si no eligió, según lo que más pesa.
export function idea(etapa: Etapa, pide: Respuesta | undefined, peor: number): [string, string] {
  const pedido = elegidas(pide)[0]; // si pidió varias cosas, la primera de la lista
  const segunArea: [string, string][] = [
    ['😴', 'Esta noche apaga pantallas 30 minutos antes y deja el cuarto fresquito.'],
    ['🫁', 'Respira conmigo: inhala 4, exhala 6, cinco veces. Tu cuerpo entiende que está a salvo.'],
    ['🔥', etapa === 'meno' ? 'Ten un abanico y agua fría a mano, y viste en capas que puedas quitarte.' : etapa === 'embarazo' ? 'Come poquito y seguido, y evita acostarte justo después de comer.' : 'Una bolsa tibia en el vientre o la espalda baja alivia bastante.'],
    ['📋', 'Escribe en un papel todo lo que tienes pendiente y elige solo una cosa para hoy. El resto puede esperar.'],
    ['🥗', 'Deja agua a la vista y ponte una alarma para comer algo a media tarde.'],
    ['💬', 'Escríbele a alguien que te quiera, aunque sea un "pensé en ti".'],
  ];
  const segunPedido: [string, string][] = [
    ['🛁', 'Date permiso de no hacer nada por 20 minutos. Descansar también es avanzar.'],
    ['🫖', etapa === 'embarazo' || etapa === 'posparto' ? 'Algo rico y calentico que te guste; si es un té, pregúntale a tu médica cuáles puedes tomar.' : 'Un té de jengibre con papelón y un cuadrito de chocolate oscuro, sin culpa.'],
    ['🚶', 'Cinco minutos de movimiento suave sueltan el cuerpo y la mente.'],
    ['💬', 'Escríbele a alguien que te quiera, aunque sea un "pensé en ti".'],
  ];
  return pedido != null && segunPedido[pedido] ? segunPedido[pedido] : segunArea[peor] ?? segunArea[0];
}

// Color de cada pétalo según la intensidad de la respuesta.
export const COLOR_NIVEL = ['#C24E7A', '#F0B877', '#E9A15F', '#A99CF2'];
