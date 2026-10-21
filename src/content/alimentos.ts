// Lista de alimentos de "Alimentación". Editable.
// Información de bienestar general, no reemplaza a una nutricionista.
// Fuentes (numeración del bloque de fuentes): [5] [8] [14]–[28].
import type { Phase } from '../lib/types';

export const CATEGORIAS = [
  { id: 'dolor', label: 'Para el dolor' },
  { id: 'hierro', label: 'Hierro' },
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
}

export const ALIMENTOS: Alimento[] = [
  { emoji: '🫚', nombre: 'Jengibre', porque: 'Algunos estudios muestran que puede aliviar los cólicos, aunque la evidencia es limitada.', categorias: ['dolor'], fases: ['menstrual'] },
  { emoji: '🍫', nombre: 'Chocolate oscuro', porque: 'El de 70 % o más aporta magnesio y hierro; un cuadrito también es un mimo.', categorias: ['animo'], fases: ['lutea', 'menstrual'] },
  { emoji: '🐟', nombre: 'Pescado azul (sardina, jurel, salmón)', porque: 'Aporta omega-3; hay evidencia limitada de que ayude con los cólicos.', categorias: ['dolor', 'antiinflamatorio'], fases: ['menstrual', 'lutea', 'pastilla'] },
  { emoji: '🥬', nombre: 'Espinaca', porque: 'Aporta hierro vegetal y folato; con unas gotas de limón lo aprovechas mejor.', categorias: ['hierro'], fases: ['menstrual', 'folicular'] },
  { emoji: '🫘', nombre: 'Lentejas y caraotas', porque: 'Tienen hierro, proteína y fibra, y te dan energía que dura.', categorias: ['hierro', 'energia'], fases: ['menstrual', 'folicular', 'pastilla'] },
  { emoji: '🥩', nombre: 'Carne roja magra o hígado', porque: 'Su hierro es el que mejor se absorbe; el hígado, mejor no más de una vez por semana.', categorias: ['hierro', 'energia'], fases: ['menstrual', 'folicular'] },
  { emoji: '🍊', nombre: 'Naranja, kiwi o guayaba', porque: 'Su vitamina C ayuda a absorber el hierro de caraotas, lentejas y verduras.', categorias: ['hierro'], fases: ['menstrual', 'folicular', 'pastilla'] },
  { emoji: '🍌', nombre: 'Cambur', porque: 'Aporta potasio, que ayuda a equilibrar el sodio, y calma el antojo de algo dulce.', categorias: ['hinchazon', 'energia'], fases: ['lutea', 'menstrual'] },
  { emoji: '🌰', nombre: 'Semillas de auyama', porque: 'Son ricas en magnesio, zinc y hierro; un puñito sirve de merienda.', categorias: ['hierro', 'energia'], fases: ['menstrual', 'lutea'] },
  { emoji: '🥑', nombre: 'Aguacate', porque: 'Aporta grasas saludables, fibra y potasio, y te deja satisfecha por más tiempo.', categorias: ['energia', 'hinchazon'], fases: ['lutea', 'folicular', 'pastilla'] },
  { emoji: '🫐', nombre: 'Moras y fresas', porque: 'Aportan vitamina C y fibra; una opción dulce y fresca.', categorias: ['hierro'], fases: ['folicular', 'ovulatoria'] },
  { emoji: '🥜', nombre: 'Almendras y nueces', porque: 'Tienen magnesio y grasas saludables; un puñado quita el hambre entre comidas.', categorias: ['energia'], fases: ['lutea', 'pastilla'] },
  { emoji: '🍠', nombre: 'Batata', porque: 'Es un carbohidrato con fibra que da energía estable y ayuda con los antojos.', categorias: ['energia', 'animo'], fases: ['lutea'] },
  { emoji: '🥚', nombre: 'Huevos', porque: 'Proteína completa y vitamina B12 para empezar el día con energía.', categorias: ['energia'], fases: ['folicular', 'menstrual', 'pastilla'] },
  { emoji: '🥣', nombre: 'Avena', porque: 'Su fibra te da energía de liberación lenta y te mantiene llena.', categorias: ['energia'], fases: ['lutea', 'folicular'] },
  { emoji: '🍉', nombre: 'Pepino y patilla', porque: 'Tienen mucha agua y te ayudan a hidratarte, sobre todo en días de calor.', categorias: ['hinchazon'], fases: ['ovulatoria', 'lutea'] },
  { emoji: '🌼', nombre: 'Manzanilla', porque: 'Una taza tibia relaja y ayuda a bajar el ritmo; su efecto en los cólicos tiene poca evidencia.', categorias: ['animo'], fases: ['menstrual', 'lutea', 'pastilla'] },
  { emoji: '🥄', nombre: 'Yogur natural', porque: 'Aporta calcio, que tiene algo de evidencia para aliviar síntomas del SPM.', categorias: ['animo'], fases: ['lutea', 'pastilla'] },
  { emoji: '💧', nombre: 'Agua', porque: 'Mantenerte hidratada ayuda a tu cuerpo en todas las fases.', categorias: ['energia'], fases: ['menstrual', 'folicular', 'ovulatoria', 'lutea', 'pastilla'] },
  { emoji: '🍈', nombre: 'Lechosa', porque: 'Rica en vitamina C y fibra; ayuda a la digestión y a absorber el hierro.', categorias: ['hierro'], fases: ['menstrual', 'folicular', 'pastilla'] },
  { emoji: '🥭', nombre: 'Mango', porque: 'Aporta vitaminas C y A; un dulce natural para los antojos.', categorias: ['hierro', 'energia'], fases: ['folicular', 'ovulatoria'] },
  { emoji: '🍌', nombre: 'Plátano', porque: 'Da energía y aporta potasio y fibra; mejor sancochado o al horno que frito.', categorias: ['energia', 'hinchazon'], fases: ['lutea', 'menstrual'] },
  { emoji: '🥫', nombre: 'Sardina enlatada', porque: 'Económica y con omega-3; si te comes las espinitas, también suma calcio.', categorias: ['dolor', 'hierro'], fases: ['menstrual', 'lutea', 'pastilla'] },
  { emoji: '🎃', nombre: 'Auyama', porque: 'Aporta vitamina A, fibra y potasio; en crema es puro consuelo.', categorias: ['energia', 'hinchazon'], fases: ['lutea', 'menstrual'] },
  { emoji: '🥔', nombre: 'Ocumo', porque: 'Tubérculo con fibra y potasio que te llena y da energía estable.', categorias: ['energia'], fases: ['lutea', 'menstrual'] },
  { emoji: '🫛', nombre: 'Quinchoncho', porque: 'Tiene proteína, fibra, folato y hierro, como las caraotas.', categorias: ['hierro', 'energia'], fases: ['menstrual', 'folicular'] },
  { emoji: '💛', nombre: 'Parchita', porque: 'Aporta vitamina C y fibra; en jugo natural con poca azúcar refresca.', categorias: ['hierro'], fases: ['folicular', 'ovulatoria'] },
  { emoji: '🫑', nombre: 'Ají dulce', porque: 'Le da sabor a tus guisos y te permite usar menos sal.', categorias: ['hinchazon'], fases: ['lutea', 'pastilla'] },
  { emoji: '🐚', nombre: 'Chipichipi y pepitonas', porque: 'Están entre los alimentos más ricos en hierro y vitamina B12; las de lata traen sal.', categorias: ['hierro', 'energia'], fases: ['menstrual', 'folicular'] },
  { emoji: '🍍', nombre: 'Piña', porque: 'Aporta agua y vitamina C, que ayuda a absorber el hierro.', categorias: ['hierro'], fases: ['ovulatoria', 'folicular'] },
  { emoji: '🧀', nombre: 'Leche o queso fresco', porque: 'Aportan calcio, que puede ayudar con el SPM; prefiere quesos bajos en sal.', categorias: ['animo'], fases: ['lutea', 'pastilla'] },
  { emoji: '🧆', nombre: 'Garbanzos', porque: 'Tienen hierro, proteína y fibra; rinden en guisos, ensaladas o tostados.', categorias: ['hierro', 'energia'], fases: ['menstrual', 'folicular'] },
  { emoji: '🍋', nombre: 'Limón', porque: 'Unas gotas sobre caraotas o verduras te ayudan a absorber mejor su hierro.', categorias: ['hierro'], fases: ['menstrual', 'folicular', 'pastilla'] },
  { emoji: '🍗', nombre: 'Pollo', porque: 'Proteína magra con algo de hierro que se absorbe bien.', categorias: ['energia', 'hierro'], fases: ['menstrual', 'folicular', 'pastilla'] },
];

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
