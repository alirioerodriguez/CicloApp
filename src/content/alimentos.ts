// Lista de alimentos de "Alimentación". Editable.
// Información de bienestar general, no reemplaza a una nutricionista.
// Fuentes (numeración del bloque de fuentes): [5] [8] [14]–[28].
// Cada alimento lleva su nombre en Venezuela; `nombres` da el nombre local en otros países y `paises`
// limita los que solo se consiguen o se usan en algunos. Los textos se traducen solos (lib/region).
import type { Pais } from '../lib/region';
import type { Phase } from '../lib/types';

export const CATEGORIAS = [
  { id: 'hierro', label: 'Hierro' },
  { id: 'calcio', label: 'Calcio' },
  { id: 'dolor', label: 'Para el dolor' },
  { id: 'antiinflamatorio', label: 'Antiinflamatorio' },
  { id: 'hinchazon', label: 'Hinchazón' },
  { id: 'animo', label: 'Ánimo y sueño' },
  { id: 'energia', label: 'Energía' },
] as const;

export type Categoria = (typeof CATEGORIAS)[number]['id'];

export interface Alimento {
  emoji: string;
  nombre: string;
  porque: string;
  categorias: Categoria[];
  fases: Phase[];
  nombres?: Partial<Record<Pais, string>>;
  paises?: Pais[];
}

const TODAS: Phase[] = ['menstrual', 'folicular', 'ovulatoria', 'lutea', 'pastilla'];

export const ALIMENTOS: Alimento[] = [
  // ---------- Para todos los países ----------
  { emoji: '🫘', nombre: 'Lentejas y caraotas', porque: 'Tienen hierro, proteína y fibra, y te dan energía que dura.', categorias: ['hierro', 'energia'], fases: ['menstrual', 'folicular', 'pastilla'], nombres: { MX: 'Lentejas y frijoles', CO: 'Lentejas y fríjoles', AR: 'Lentejas y porotos', CL: 'Lentejas y porotos', PE: 'Lentejas y frejoles', US: 'Lentejas y frijoles' } },
  { emoji: '🥩', nombre: 'Carne roja magra o hígado', porque: 'Su hierro es el que mejor se absorbe; el hígado, mejor no más de una vez por semana.', categorias: ['hierro', 'energia'], fases: ['menstrual', 'folicular'] },
  { emoji: '🥬', nombre: 'Espinaca', porque: 'Aporta hierro vegetal y folato; con unas gotas de limón lo aprovechas mejor.', categorias: ['hierro'], fases: ['menstrual', 'folicular'] },
  { emoji: '🍊', nombre: 'Naranja, kiwi o guayaba', porque: 'Su vitamina C ayuda a absorber el hierro de caraotas, lentejas y verduras.', categorias: ['hierro'], fases: ['menstrual', 'folicular', 'pastilla'] },
  { emoji: '🍋', nombre: 'Limón', porque: 'Unas gotas sobre caraotas o verduras te ayudan a absorber mejor su hierro.', categorias: ['hierro'], fases: ['menstrual', 'folicular', 'pastilla'] },
  { emoji: '🧆', nombre: 'Garbanzos', porque: 'Tienen hierro, proteína y fibra; rinden en guisos, ensaladas o tostados.', categorias: ['hierro', 'energia'], fases: ['menstrual', 'folicular'] },
  { emoji: '🍗', nombre: 'Pollo', porque: 'Proteína magra con algo de hierro que se absorbe bien.', categorias: ['energia', 'hierro'], fases: ['menstrual', 'folicular', 'pastilla'] },
  { emoji: '🥚', nombre: 'Huevos', porque: 'Proteína completa y vitamina B12 para empezar el día con energía.', categorias: ['energia'], fases: ['folicular', 'menstrual', 'pastilla'] },
  { emoji: '🌰', nombre: 'Semillas de auyama', porque: 'Son ricas en magnesio, zinc y hierro; un puñito sirve de merienda.', categorias: ['hierro', 'energia'], fases: ['menstrual', 'lutea'], nombres: { MX: 'Pepitas de calabaza', CO: 'Semillas de ahuyama', AR: 'Semillas de zapallo', CL: 'Semillas de zapallo', PE: 'Pepas de zapallo', US: 'Semillas de calabaza' } },
  { emoji: '🐟', nombre: 'Pescado azul (sardina, jurel, salmón)', porque: 'Aporta omega-3; hay evidencia limitada de que ayude con los cólicos.', categorias: ['dolor', 'antiinflamatorio'], fases: ['menstrual', 'lutea', 'pastilla'], nombres: { MX: 'Pescado azul (sardina, macarela, salmón)', PE: 'Pescado azul (anchoveta, bonito, jurel)', US: 'Pescado azul (sardina, macarela, salmón)' } },
  { emoji: '🥫', nombre: 'Sardina enlatada', porque: 'Económica y con omega-3; si te comes las espinitas, también suma calcio.', categorias: ['dolor', 'hierro', 'calcio'], fases: ['menstrual', 'lutea', 'pastilla'] },
  { emoji: '🦐', nombre: 'Chipichipi y pepitonas', porque: 'Están entre los alimentos más ricos en hierro y vitamina B12; las de lata traen sal.', categorias: ['hierro', 'energia'], fases: ['menstrual', 'folicular'], nombres: { MX: 'Almejas y mejillones', CO: 'Piangua y almejas', AR: 'Mejillones y almejas', CL: 'Choritos y almejas', PE: 'Choros y conchas negras', US: 'Almejas y mejillones' } },
  { emoji: '🥄', nombre: 'Yogur natural', porque: 'Aporta calcio, que tiene algo de evidencia para aliviar síntomas del SPM.', categorias: ['animo', 'calcio'], fases: ['lutea', 'pastilla'] },
  { emoji: '🧀', nombre: 'Leche o queso fresco', porque: 'Aportan calcio, que puede ayudar con el SPM; prefiere quesos bajos en sal.', categorias: ['animo', 'calcio'], fases: ['lutea', 'pastilla'], nombres: { CO: 'Leche o queso campesino', AR: 'Leche o queso fresco (port salut)', PE: 'Leche o queso fresco andino' } },
  { emoji: '🫚', nombre: 'Jengibre', porque: 'Algunos estudios muestran que puede aliviar los cólicos, aunque la evidencia es limitada.', categorias: ['dolor'], fases: ['menstrual'], nombres: { CL: 'Jengibre (kion)', PE: 'Kion (jengibre)' } },
  { emoji: '🍫', nombre: 'Chocolate oscuro', porque: 'El de 70 % o más aporta magnesio y hierro; un cuadrito también es un mimo.', categorias: ['animo'], fases: ['lutea', 'menstrual'] },
  { emoji: '🌼', nombre: 'Manzanilla', porque: 'Una taza tibia relaja y ayuda a bajar el ritmo; su efecto en los cólicos tiene poca evidencia.', categorias: ['animo'], fases: ['menstrual', 'lutea', 'pastilla'] },
  { emoji: '🥑', nombre: 'Aguacate', porque: 'Aporta grasas saludables, fibra y potasio, y te deja satisfecha por más tiempo.', categorias: ['energia', 'hinchazon'], fases: ['lutea', 'folicular', 'pastilla'], nombres: { AR: 'Palta', CL: 'Palta', PE: 'Palta' } },
  { emoji: '🍌', nombre: 'Cambur', porque: 'Aporta potasio, que ayuda a equilibrar el sodio, y calma el antojo de algo dulce.', categorias: ['hinchazon', 'energia'], fases: ['lutea', 'menstrual'], nombres: { MX: 'Plátano', CO: 'Banano', AR: 'Banana', CL: 'Plátano', PE: 'Plátano de seda', US: 'Plátano (banana)' } },
  { emoji: '🥜', nombre: 'Almendras y nueces', porque: 'Tienen magnesio y grasas saludables; un puñado quita el hambre entre comidas.', categorias: ['energia', 'calcio'], fases: ['lutea', 'pastilla'] },
  { emoji: '🍠', nombre: 'Batata', porque: 'Es un carbohidrato con fibra que da energía estable y ayuda con los antojos.', categorias: ['energia', 'animo'], fases: ['lutea'], nombres: { MX: 'Camote', CL: 'Camote', PE: 'Camote', US: 'Camote' } },
  { emoji: '🥣', nombre: 'Avena', porque: 'Su fibra te da energía de liberación lenta y te mantiene llena.', categorias: ['energia'], fases: ['lutea', 'folicular'] },
  { emoji: '🍉', nombre: 'Pepino y patilla', porque: 'Tienen mucha agua y te ayudan a hidratarte, sobre todo en días de calor.', categorias: ['hinchazon'], fases: ['ovulatoria', 'lutea'], nombres: { MX: 'Pepino y sandía', CO: 'Pepino y sandía', AR: 'Pepino y sandía', CL: 'Pepino y sandía', PE: 'Pepino y sandía', US: 'Pepino y sandía' } },
  { emoji: '🫐', nombre: 'Moras y fresas', porque: 'Aportan vitamina C y fibra; una opción dulce y fresca.', categorias: ['hierro'], fases: ['folicular', 'ovulatoria'], nombres: { AR: 'Moras y frutillas', CL: 'Moras y frutillas' } },
  { emoji: '🥭', nombre: 'Mango', porque: 'Aporta vitaminas C y A; un dulce natural para los antojos.', categorias: ['hierro', 'energia'], fases: ['folicular', 'ovulatoria'] },
  { emoji: '🍍', nombre: 'Piña', porque: 'Aporta agua y vitamina C, que ayuda a absorber el hierro.', categorias: ['hierro'], fases: ['ovulatoria', 'folicular'], nombres: { AR: 'Ananá' } },
  { emoji: '🍈', nombre: 'Lechosa', porque: 'Rica en vitamina C y fibra; ayuda a la digestión y a absorber el hierro.', categorias: ['hierro'], fases: ['menstrual', 'folicular', 'pastilla'], nombres: { MX: 'Papaya', CO: 'Papaya', AR: 'Papaya', CL: 'Papaya', PE: 'Papaya', US: 'Papaya' } },
  { emoji: '🎃', nombre: 'Auyama', porque: 'Aporta vitamina A, fibra y potasio; en crema es puro consuelo.', categorias: ['energia', 'hinchazon'], fases: ['lutea', 'menstrual'], nombres: { MX: 'Calabaza', CO: 'Ahuyama', AR: 'Zapallo', CL: 'Zapallo', PE: 'Zapallo', US: 'Calabaza' } },
  { emoji: '💛', nombre: 'Parchita', porque: 'Aporta vitamina C y fibra; en jugo natural con poca azúcar refresca.', categorias: ['hierro'], fases: ['folicular', 'ovulatoria'], nombres: { MX: 'Maracuyá', CO: 'Maracuyá', AR: 'Maracuyá', CL: 'Maracuyá', PE: 'Maracuyá', US: 'Maracuyá' } },
  { emoji: '💧', nombre: 'Agua', porque: 'Mantenerte hidratada ayuda a tu cuerpo en todas las fases.', categorias: ['energia'], fases: TODAS },

  // ---------- Venezuela ----------
  { emoji: '🍌', nombre: 'Plátano', porque: 'Da energía y aporta potasio y fibra; mejor sancochado o al horno que frito.', categorias: ['energia', 'hinchazon'], fases: ['lutea', 'menstrual'], paises: ['VE', 'CO', 'PE', 'MX'], nombres: { MX: 'Plátano macho', PE: 'Plátano verde o bellaco' } },
  { emoji: '🥔', nombre: 'Ocumo', porque: 'Tubérculo con fibra y potasio que te llena y da energía estable.', categorias: ['energia'], fases: ['lutea', 'menstrual'], paises: ['VE'] },
  { emoji: '🫛', nombre: 'Quinchoncho', porque: 'Tiene proteína, fibra, folato y hierro, como las caraotas.', categorias: ['hierro', 'energia'], fases: ['menstrual', 'folicular'], paises: ['VE'] },
  { emoji: '🫑', nombre: 'Ají dulce', porque: 'Le da sabor a tus guisos y te permite usar menos sal.', categorias: ['hinchazon'], fases: ['lutea', 'pastilla'], paises: ['VE'] },

  // ---------- México ----------
  { emoji: '🫓', nombre: 'Tortillas de maíz nixtamalizado', porque: 'La nixtamalización con cal les suma calcio; con frijoles hacen una comida completa.', categorias: ['calcio', 'energia'], fases: TODAS, paises: ['MX', 'US'] },
  { emoji: '🥬', nombre: 'Nopales', porque: 'Tienen fibra, calcio y muy pocas calorías; te ayudan con la digestión.', categorias: ['calcio', 'hinchazon'], fases: ['lutea', 'folicular', 'pastilla'], paises: ['MX', 'US'] },
  { emoji: '🌾', nombre: 'Amaranto', porque: 'Aporta hierro, calcio y proteína; en alegría o en el atole suma mucho.', categorias: ['hierro', 'calcio'], fases: ['menstrual', 'folicular'], paises: ['MX', 'PE'], nombres: { PE: 'Kiwicha' } },
  { emoji: '🌰', nombre: 'Chía', porque: 'Tiene omega-3 vegetal, fibra y calcio; remójala en agua o yogur.', categorias: ['calcio', 'antiinflamatorio'], fases: ['lutea', 'pastilla'], paises: ['MX', 'US', 'AR', 'CL'] },
  { emoji: '🐟', nombre: 'Charales', porque: 'Pescaditos que se comen enteros: mucho calcio y hierro en poca cantidad.', categorias: ['calcio', 'hierro'], fases: ['menstrual', 'folicular'], paises: ['MX'] },
  { emoji: '🥬', nombre: 'Quelites y verdolagas', porque: 'Hojas verdes tradicionales con hierro, calcio y folato.', categorias: ['hierro', 'calcio'], fases: ['menstrual', 'folicular'], paises: ['MX'] },

  // ---------- Colombia ----------
  { emoji: '🍊', nombre: 'Uchuva', porque: 'Rica en vitamina C para absorber el hierro de los fríjoles y las lentejas.', categorias: ['hierro'], fases: ['menstrual', 'folicular', 'pastilla'], paises: ['CO', 'PE'], nombres: { PE: 'Aguaymanto' } },
  { emoji: '🌽', nombre: 'Mazamorra de maíz con leche', porque: 'Maíz y leche: energía y calcio en un plato tradicional y económico.', categorias: ['calcio', 'energia'], fases: ['lutea', 'menstrual'], paises: ['CO'] },
  { emoji: '🥔', nombre: 'Arracacha', porque: 'Tubérculo suave con calcio, fibra y energía estable.', categorias: ['calcio', 'energia'], fases: ['lutea', 'menstrual'], paises: ['CO', 'PE'] },

  // ---------- Argentina y Chile ----------
  { emoji: '🥬', nombre: 'Acelga', porque: 'Hoja verde con hierro y folato; en tarta o salteada, con limón.', categorias: ['hierro'], fases: ['menstrual', 'folicular'], paises: ['AR', 'CL', 'PE'] },
  { emoji: '🐟', nombre: 'Merluza', porque: 'Pescado blanco, liviano y con proteína de calidad.', categorias: ['energia'], fases: TODAS, paises: ['AR', 'CL', 'PE'] },
  { emoji: '🥫', nombre: 'Jurel en conserva', porque: 'Económico, con omega-3, hierro y calcio si comes las espinas.', categorias: ['hierro', 'calcio', 'antiinflamatorio'], fases: ['menstrual', 'lutea'], paises: ['CL', 'PE'] },
  { emoji: '🫘', nombre: 'Porotos con zapallo', porque: 'Un clásico con hierro, proteína y fibra; súmale tomate o pimentón por la vitamina C.', categorias: ['hierro', 'energia'], fases: ['menstrual', 'folicular'], paises: ['CL', 'AR'] },

  // ---------- Perú ----------
  { emoji: '🩸', nombre: 'Sangrecita', porque: 'De los alimentos con más hierro; el Ministerio de Salud del Perú la recomienda contra la anemia.', categorias: ['hierro'], fases: ['menstrual', 'folicular'], paises: ['PE'] },
  { emoji: '🌾', nombre: 'Quinua', porque: 'Grano andino con proteína completa, hierro y magnesio.', categorias: ['hierro', 'energia'], fases: TODAS, paises: ['PE', 'CL', 'US'] },
  { emoji: '🐟', nombre: 'Anchoveta', porque: 'Pescadito peruano muy rico en omega-3, hierro y calcio.', categorias: ['hierro', 'calcio', 'antiinflamatorio'], fases: ['menstrual', 'lutea'], paises: ['PE'] },
  { emoji: '🍇', nombre: 'Camu camu', porque: 'De las frutas con más vitamina C: ayuda mucho a absorber el hierro.', categorias: ['hierro'], fases: ['menstrual', 'folicular'], paises: ['PE'] },
  { emoji: '🫘', nombre: 'Tarwi (chocho)', porque: 'Leguminosa andina con mucha proteína, hierro y calcio.', categorias: ['hierro', 'calcio'], fases: ['menstrual', 'folicular'], paises: ['PE'] },

  // ---------- Estados Unidos ----------
  { emoji: '🥣', nombre: 'Cereal fortificado con hierro', porque: 'Muchos traen hierro y ácido fólico añadidos; revisa la etiqueta y elige los de poca azúcar.', categorias: ['hierro'], fases: ['menstrual', 'folicular', 'pastilla'], paises: ['US'] },
  { emoji: '🥬', nombre: 'Kale (col rizada)', porque: 'Hoja verde con calcio, hierro y vitamina K.', categorias: ['calcio', 'hierro'], fases: ['menstrual', 'folicular'], paises: ['US'] },
  { emoji: '🥄', nombre: 'Yogur griego', porque: 'Más proteína que el yogur común y buena fuente de calcio.', categorias: ['calcio', 'animo'], fases: ['lutea', 'pastilla'], paises: ['US'] },
];

// Lista para el país elegido, con el nombre local de cada alimento.
export function alimentosPara(pais: Pais): Alimento[] {
  return ALIMENTOS.filter((a) => !a.paises || a.paises.includes(pais)).map((a) => ({ ...a, nombre: a.nombres?.[pais] ?? a.nombre }));
}

// Qué moderar. Sin `fases` = aplica siempre.
export const CON_MODERACION: { emoji: string; texto: string; fases?: Phase[] }[] = [
  { emoji: '☕', texto: 'Té o café junto a las comidas: reducen la absorción del hierro justo cuando más se pierde.', fases: ['menstrual'] },
  { emoji: '🧂', texto: 'Sal: puede aumentar la hinchazón y la retención de líquido.', fases: ['lutea'] },
  { emoji: '☕', texto: 'Cafeína: puede empeorar la irritabilidad, la sensibilidad en los pechos y el insomnio.', fases: ['lutea'] },
  { emoji: '🍷', texto: 'Alcohol: puede empeorar el ánimo y el sueño.', fases: ['lutea'] },
  { emoji: '🍬', texto: 'Azúcar: provoca subidas y bajones de energía; mejor carbohidratos con fibra.', fases: ['lutea'] },
  { emoji: '🧂', texto: 'En general, poca sal y pocos azúcares añadidos: es la pauta de la OMS para cualquier persona.' },
];

export const TIP_HIERRO =
  'Para aprovechar el hierro, acompaña la comida con vitamina C (guayaba, naranja, limón, lechosa). Si tomas café o té, déjalo para un rato antes o después.';

export const AVISO_PASTILLA =
  'Si tomas pastilla: la hierba de San Juan (hipérico) reduce su eficacia. Ningún alimento común le quita el efecto.';
