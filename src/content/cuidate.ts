// Contenido de "Cuídate hoy". Editable: agrega o cambia frases libremente.
// Ideas de bienestar general, no consejos médicos.
// Fuentes (numeración del bloque de fuentes): menstrual [1–5], folicular [5–9],
// ovulatoria [6, 7, 10–12], lútea [6, 13–15], pastilla [16] [29].
import type { Phase } from '../lib/types';

export interface PhaseContent {
  nombre: string;
  emoji: string;
  resumen: string;
  comun: string; // "es común sentir…"
  sintomasComunes: string[]; // ids del catálogo; salen primero al registrar
  recomendaciones: string[];
  mimos: { emoji: string; texto: string }[];
  frases: string[];
}

export const CUIDATE: Record<Phase, PhaseContent> = {
  menstrual: {
    nombre: 'Fase menstrual',
    emoji: '🌙',
    resumen: 'Tu útero está soltando su capa interna y por eso sangras. Es normal sentirte más cansada o con cólicos estos días.',
    comun: 'Es común sentir cólicos, cansancio o el estómago revuelto estos días.',
    sintomasComunes: ['colicos', 'espalda', 'cansancio', 'dolor_cabeza', 'digestion', 'nauseas'],
    recomendaciones: [
      'Ponte una bolsa de agua tibia en el vientre o la espalda baja: el calor alivia los cólicos.',
      'Un baño o una ducha tibia puede relajar los músculos y calmar el dolor.',
      'Moverte un poco ayuda: caminar, estirarte o hacer yoga suave puede bajar el dolor.',
      'Si necesitas un analgésico, pregúntale a tu médico cuál te conviene y revisa siempre el prospecto.',
      'Ten tu botella de agua cerca y ve tomando a lo largo del día.',
      'Si sangras mucho, suma comidas con hierro como caraotas, lentejas o carne, junto a algo con vitamina C.',
      'Hoy no tienes que rendir al máximo: deja lo pesado para cuando tengas más energía.',
      'Si el dolor no te deja hacer tu día normal, coméntalo con tu ginecóloga. No es algo que debas aguantar.',
    ],
    mimos: [
      { emoji: '🛁', texto: 'Un baño tibio con música suave y sin apuro.' },
      { emoji: '🫖', texto: 'Té de jengibre con un toque de miel o papelón.' },
      { emoji: '🍲', texto: 'Una sopa calientica de pollo con auyama.' },
      { emoji: '🧦', texto: 'Medias gruesas, manta y tu serie favorita.' },
      { emoji: '🤲', texto: 'Un masaje circular suave en el vientre con tu crema favorita.' },
      { emoji: '🍫', texto: 'Un cuadrito de chocolate oscuro, sin culpa.' },
      { emoji: '😴', texto: 'Una siesta cortica sin alarmas pendientes.' },
      { emoji: '🎧', texto: 'Un podcast o una playlist tranquila mientras descansas.' },
    ],
    frases: [
      'Hoy tu único trabajo es tratarte bonito.',
      'Descansar también es avanzar.',
      'Tu cuerpo está trabajando duro: dale cariño.',
      'No tienes que poder con todo hoy.',
      'Lento también cuenta.',
      'Mereces la misma ternura que le das a los demás.',
      'Manta, agua y paciencia. Ya pasa.',
      'Hoy se vale decir que no.',
      'Eres fuerte incluso cuando estás cansada.',
      'Un día a la vez, con calma.',
    ],
  },
  folicular: {
    nombre: 'Fase folicular',
    emoji: '🌱',
    resumen: 'Terminó el período y los estrógenos empiezan a subir. Muchas sienten más energía y ganas de hacer cosas.',
    comun: 'Muchas notan menos molestias en estos días.',
    sintomasComunes: [],
    recomendaciones: [
      'Buen momento para retomar el ejercicio que te guste; la meta general es unos 150 minutos de actividad moderada a la semana.',
      'Si tienes energía, aprovecha para organizar la semana o empezar algo que venías posponiendo.',
      'Incluye frutas y verduras en cada comida: lechosa, mango, tomate, auyama…',
      'Sigue sumando hierro y proteína después del período: caraotas, huevos, sardinas.',
      'Intenta dormir 7 horas o más; el buen descanso sostiene tu energía y tu ánimo.',
      'Haz planes con gente que te haga bien: una salida, una llamada, un café.',
      'Lleva tu botella de agua cuando salgas.',
      'Anímate a probar algo nuevo: una receta, una clase online o una ruta distinta para caminar.',
    ],
    mimos: [
      { emoji: '🥭', texto: 'Un batido de mango con lechosa.' },
      { emoji: '🫓', texto: 'Arepa con huevo y aguacate para empezar el día.' },
      { emoji: '💃', texto: 'Pon tu playlist favorita y baila en la sala.' },
      { emoji: '🌿', texto: 'Una caminata corta al aire libre.' },
      { emoji: '🧴', texto: 'Tu rutina de skincare, sin apuro.' },
      { emoji: '📝', texto: 'Escribe tres cosas que quieres lograr este mes.' },
      { emoji: '🍓', texto: 'Fresas o moras con yogur natural.' },
      { emoji: '🪴', texto: 'Ordena un rincón de tu casa y ponle una planta o una vela.' },
    ],
    frases: [
      'Arranca suave, que la energía viene llegando.',
      'Hoy es buen día para empezar algo.',
      'Tienes más de lo que crees.',
      'Un paso hoy vale más que diez planeados.',
      'Tus ideas merecen espacio.',
      'Ve con ganas, pero sin correr.',
      'Lo que siembras esta semana, florece después.',
      'Hoy brillas a tu manera.',
      'Confía en tu ritmo.',
      'Que el día te encuentre con ganas.',
    ],
  },
  ovulatoria: {
    nombre: 'Fase ovulatoria',
    emoji: '☀️',
    resumen: 'Uno de tus ovarios suelta un óvulo. Puedes notar el flujo más transparente y elástico, y a veces una molestia leve de un lado.',
    // El flujo transparente es normal aquí: no cuenta como "flujo inusual".
    comun: 'Es común notar más flujo transparente y, a veces, una molestia leve de un lado.',
    sintomasComunes: ['colicos'],
    recomendaciones: [
      'Si sientes una punzada leve en un lado del vientre, puede ser dolor de ovulación; suele durar de unas horas a un par de días.',
      'Un poco de calor o un baño tibio también ayuda con esa molestia.',
      'Si ese dolor es muy fuerte o dura más de lo normal, coméntalo con tu ginecóloga.',
      'El flujo transparente y elástico en estos días es normal. Si cambia de olor o color, o te pica, consúltalo.',
      'Recuerda: la app estima fechas, pero no sirve como método anticonceptivo.',
      'Muévete como te provoque: baile, bici, caminata o lo que te haga sentir bien.',
      'Toma agua con frecuencia, sobre todo si hace calor o haces ejercicio.',
      'Si te sientes con ánimo, es buen momento para esa conversación o reunión pendiente.',
    ],
    mimos: [
      { emoji: '🍉', texto: 'Patilla bien fría en trocitos.' },
      { emoji: '🥗', texto: 'Ensalada fresca con aguacate y tomate.' },
      { emoji: '🍹', texto: 'Un papelón con limón bien frío.' },
      { emoji: '👗', texto: 'Ponte esa ropa que te encanta, aunque sea para estar en casa.' },
      { emoji: '📸', texto: 'Tómate fotos bonitas, porque sí.' },
      { emoji: '🎶', texto: 'Karaoke en la sala con tus canciones favoritas.' },
      { emoji: '☀️', texto: 'Unos minutos de sol en la mañana con tu café.' },
      { emoji: '💌', texto: 'Escríbele un mensaje bonito a alguien que quieres.' },
    ],
    frases: [
      'Hoy te queda bien todo, hasta la calma.',
      'Tu luz se nota.',
      'Di lo que piensas, que vale.',
      'Ríete fuerte hoy.',
      'Eres buena compañía, empezando por ti.',
      'Disfruta lo que te hace sentir viva.',
      'Tu energía contagia.',
      'Aprovecha el día, pero sin presión.',
      'Hoy toca celebrarte un poquito.',
      'Lo que quieres decir, dilo bonito y claro.',
    ],
  },
  lutea: {
    nombre: 'Fase lútea',
    emoji: '🍂',
    resumen: 'Después de la ovulación sube la progesterona. En los días antes del período puedes notar hinchazón, antojos o el ánimo más sensible.',
    comun: 'Antes del período es común notar hinchazón, pechos sensibles o el ánimo más sensible.',
    sintomasComunes: ['pechos', 'hinchazon', 'acne', 'dolor_cabeza', 'cansancio', 'insomnio'],
    recomendaciones: [
      'Anota cómo te sientes cada día: ver el patrón ayuda a entenderte y le sirve a tu ginecóloga.',
      'Prueba comidas más pequeñas y frecuentes para evitar bajones de energía y antojos fuertes.',
      'Baja un poco la sal: puede ayudar con la hinchazón y la retención de líquido.',
      'Modera el café y el alcohol estos días; a algunas personas les empeoran los síntomas.',
      'Muévete aunque sea un rato: el ejercicio regular puede aliviar los síntomas premenstruales.',
      'Prioriza dormir bien y date espacios de calma: respirar, yoga suave o un baño tibio.',
      'Incluye alimentos con calcio, como yogur o queso blanco; hay algo de evidencia de que ayudan con el SPM.',
      'Si el ánimo bajo o la irritabilidad te afectan mucho en tu día o tus relaciones, háblalo con tu médico.',
    ],
    mimos: [
      { emoji: '🍫', texto: 'Chocolate oscuro con unas almendras.' },
      { emoji: '🎃', texto: 'Una crema de auyama calientica.' },
      { emoji: '🍌', texto: 'Cambur con un toque de canela.' },
      { emoji: '🛋️', texto: 'Noche de manta, cotufas y película.' },
      { emoji: '🛀', texto: 'Baño tibio con la luz bajita.' },
      { emoji: '📵', texto: 'Una hora sin redes antes de dormir.' },
      { emoji: '🧘', texto: 'Diez minutos de estiramiento en la cama.' },
      { emoji: '🍠', texto: 'Batata asada con un poquito de mantequilla.' },
    ],
    frases: [
      'Sentir mucho no es un defecto.',
      'Hoy se vale estar sensible.',
      'Baja el ritmo, no la autoestima.',
      'Tus emociones son mensajes, no órdenes.',
      'Sé paciente contigo, como lo eres con otros.',
      'No tienes que explicarte para descansar.',
      'Esto pasa. Lo bonito de ti se queda.',
      'Hoy tu prioridad eres tú.',
      'Un antojo no es un fracaso.',
      'Respira. No todo se resuelve hoy.',
    ],
  },
  pastilla: {
    nombre: 'Con pastilla',
    emoji: '💊',
    // Vale para la combinada y para la de solo progestágeno. Fuentes [16] [29].
    resumen: 'Con la pastilla tus hormonas se mantienen más estables, por eso no se muestran fases. Según el tipo, puedes tener sangrado regular, irregular o ninguno.',
    comun: 'En los primeros meses es común algo de manchado, dolor de cabeza o náuseas.',
    sintomasComunes: ['manchado', 'dolor_cabeza', 'nauseas', 'pechos'],
    recomendaciones: [
      'Tómala a la misma hora cada día. Con la de solo progestágeno, el margen para tomarla tarde puede ser más corto.',
      'Los primeros meses es común tener manchado, dolor de cabeza o pechos sensibles; suele mejorar con el tiempo.',
      'Si olvidaste una, revisa el prospecto: depende del tipo, de cuántas fueron y cuándo. Ante la duda, pregunta en la farmacia.',
      'Con la combinada, el sangrado de la semana de descanso o placebo es de deprivación, no un período.',
      'Con la de solo progestágeno es común sangrar de forma irregular o no sangrar; suele ser esperado.',
      'Si vomitas o tienes diarrea fuerte, la pastilla puede absorberse menos: revisa el prospecto.',
      'Si te recetan un medicamento nuevo, cuéntale al médico que tomas la pastilla.',
      'Si las molestias siguen después de unos meses o te afectan mucho, háblalo con tu ginecóloga.',
    ],
    mimos: [
      { emoji: '⏰', texto: 'Elige una canción bonita como alarma de la pastilla.' },
      { emoji: '🫖', texto: 'Una infusión de manzanilla antes de dormir.' },
      { emoji: '🥑', texto: 'Arepa con aguacate y queso blanco.' },
      { emoji: '🧴', texto: 'Crema hidratante y cinco minutos solo para ti.' },
      { emoji: '🚶‍♀️', texto: 'Una caminata corta al atardecer.' },
      { emoji: '📖', texto: 'Lee unas páginas de un libro que te guste.' },
      { emoji: '🍍', texto: 'Piña o lechosa fría de merienda.' },
      { emoji: '🕯️', texto: 'Una vela y música tranquila al final del día.' },
    ],
    frases: [
      'Constancia también es cariño contigo misma.',
      'Tu rutina, tu tranquilidad.',
      'Un gesto pequeño, todos los días.',
      'Hoy también te elegiste.',
      'Cuidarte también es organizarte.',
      'Lo estás haciendo muy bien.',
      'Tu bienestar, a tu manera.',
      'Paso a paso, sin presión.',
      'Si se te pasó, respira y revisa el prospecto.',
      'Hoy toca un mimo extra.',
    ],
  },
};

// "Fase menstrual" → "Menstrual" (para chips y pestañas).
export function faseCorta(p: Phase): string {
  const n = CUIDATE[p].nombre.replace('Fase ', '');
  return n.charAt(0).toUpperCase() + n.slice(1);
}

// Rota el contenido un día a la vez para que no se repita siempre lo mismo.
export function pick<T>(list: T[], seed: number): T {
  return list[((seed % list.length) + list.length) % list.length];
}
