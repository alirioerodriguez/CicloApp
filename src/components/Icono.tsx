// Iconos de línea (Lucide, trazo 1,8 como el diseño de Savia), dibujados con react-native-svg. La app no muestra emojis:
// el contenido guarda un emoji como "clave" y aquí se traduce a su icono.
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';
import { TRAZOS, type NodoIcono } from './trazos-iconos';
import { useColors } from '../lib/theme';

const MAPA: Record<string, string> = {
  // Salud y cuerpo
  '🩺': 'Stethoscope', '💊': 'Pill', '🩸': 'Droplet', '💧': 'Droplets', '💦': 'Droplets', '🫁': 'Wind', '🧠': 'Brain', '🦴': 'Bone', '❤': 'Heart',
  '❤️': 'Heart', '💗': 'Heart', '💜': 'Heart', '💛': 'Heart', '🤍': 'HeartHandshake', '💕': 'Heart', '🫀': 'HeartPulse', '🔬': 'Microscope',
  '🧪': 'FlaskConical', '💉': 'Syringe', '🦵': 'PersonStanding', '👣': 'Footprints', '🤲': 'HandHeart', '🎀': 'Ribbon', '📍': 'Target',
  '⚫': 'Circle', '⭕': 'Circle', '🟠': 'Circle', '⬜': 'Circle', '🌀': 'RefreshCw', '♀': 'Flower2', '♀️': 'Flower2',
  // Etapas
  '🌸': 'Flower2', '🌷': 'Flower', '🌼': 'Flower', '🌱': 'Sprout', '🌿': 'Leaf', '🍂': 'Leaf', '🪴': 'Sprout', '🌾': 'Wheat', '🤰': 'Baby',
  '🍼': 'Baby', '👶': 'Baby', '🌗': 'MoonStar', '🌙': 'Moon', '🌕': 'Moon', '🌤': 'CloudSun', '☀': 'Sun', '☀️': 'Sun', '🌉': 'Moon', '🌩': 'CloudLightning',
  // Ánimo
  '😊': 'FaceGrinning', '😌': 'FaceSlightlySmiling', '🙂': 'FaceSlightlySmiling', '😐': 'FaceNeutral', '😕': 'FaceSlightlyFrowning',
  '😣': 'FaceSlightlyFrowning', '😢': 'FaceSlightlyFrowning', '😤': 'FaceAngry', '😰': 'FaceExpressionless', '😵': 'FaceExpressionless',
  '😵‍💫': 'FaceExpressionless', '🥰': 'Heart', '🥺': 'FaceSlightlyFrowning', '🎢': 'Activity', '😴': 'Moon', '😮': 'Wind', '😮‍💨': 'Wind',
  '🤕': 'Brain', '🤢': 'CircleAlert', '💫': 'Sparkles', '🪫': 'BatteryLow', '🔋': 'BatteryLow', '✨': 'Sparkles', '⚡': 'Zap', '⭐': 'Star',
  '💢': 'Zap', '👙': 'Heart', '🎈': 'Circle', '🫧': 'Bubbles', '🎉': 'PartyPopper', '🏅': 'Award', '🎯': 'Target',
  // Comida
  '🍽': 'Utensils', '🍽️': 'Utensils', '🍲': 'Soup', '🥣': 'CookingPot', '🍳': 'EggFried', '🥚': 'Egg', '🐟': 'Fish', '🦈': 'Fish', '🐚': 'Shell',
  '🍗': 'Drumstick', '🥩': 'Beef', '🍌': 'Banana', '🍎': 'Apple', '🍒': 'Cherry', '🍓': 'Cherry', '🍇': 'Grape', '🫐': 'Grape', '🍋': 'Citrus',
  '🍊': 'Citrus', '🍑': 'Apple', '🍉': 'Citrus', '🍈': 'Citrus', '🍍': 'TreePalm', '🥥': 'TreePalm', '🥭': 'Apple', '🥑': 'LeafyGreen',
  '🥬': 'LeafyGreen', '🥦': 'LeafyGreen', '🥗': 'Salad', '🫑': 'LeafyGreen', '🧅': 'Circle', '🥕': 'Carrot', '🌽': 'Wheat', '🍆': 'LeafyGreen',
  '🎃': 'Circle', '🍠': 'Carrot', '🥔': 'Circle', '🫘': 'Bean', '🫛': 'Bean', '🥜': 'Nut', '🌰': 'Nut', '🧆': 'Circle', '🫚': 'Leaf', '🫓': 'Sandwich',
  '🥛': 'Milk', '🧀': 'Package', '☕': 'Coffee', '🫖': 'Coffee', '🍷': 'Wine', '🍹': 'CupSoda', '🥤': 'CupSoda', '🍫': 'Candy', '🍬': 'Candy',
  '🧂': 'Utensils', '🥄': 'Utensils', '🥫': 'Package', '🍦': 'IceCreamCone', '🍿': 'Popcorn', '🍕': 'Pizza', '🎂': 'Cake', '🦐': 'Shrimp',
  // Movimiento y descanso
  '🧘': 'PersonStanding', '🧘‍♀️': 'PersonStanding', '🚶': 'PersonStanding', '🚶‍♀️': 'PersonStanding', '💃': 'PersonStanding',
  '🏋': 'Dumbbell', '🏋️‍♀️': 'Dumbbell', '🛁': 'Bath', '🛀': 'Bath', '♨': 'Thermometer', '♨️': 'Thermometer', '🔥': 'Flame', '❄️': 'Snowflake',
  '🛋': 'Sofa', '🧦': 'Shirt', '👗': 'Shirt', '🎧': 'Headphones', '🎶': 'ListMusic', '📵': 'Smartphone', '🕯': 'Flame', '🐈': 'Cat', '⏰': 'AlarmClock',
  '⏱': 'Timer', '⏱️': 'Timer', '⏸': 'Pause', '▶': 'Play', '▶️': 'Play', '🔁': 'Repeat', '🔄': 'RefreshCw',
  // App y herramientas
  '📋': 'ClipboardList', '📝': 'FileText', '✍': 'FileText', '✍️': 'FileText', '📖': 'BookOpen', '📄': 'FileText', '💾': 'Save', '📤': 'Package',
  '📦': 'Package', '📅': 'Calendar', '🗓': 'CalendarDays', '🗓️': 'CalendarDays', '📊': 'ChartColumn', '📏': 'Ruler', '⚖': 'Scale', '⚖️': 'Scale',
  '🔒': 'Lock', '🔐': 'Lock', '🔔': 'Bell', '🔕': 'BellOff', '🔎': 'Search', '💡': 'Lightbulb', 'ℹ': 'Info', 'ℹ️': 'Info', '⚠': 'TriangleAlert',
  '⚠️': 'TriangleAlert', '🚨': 'Siren', '🆘': 'Siren', '✅': 'CircleCheck', '🙅': 'Ban', '👀': 'Eye', '🤫': 'Lock', '🤝': 'Handshake',
  '👤': 'User', '👥': 'Users', '💬': 'MessageCircle', '💌': 'Mail', '📸': 'Camera', '📱': 'Smartphone', '📲': 'Smartphone', '🖥': 'Monitor',
  '👜': 'Briefcase', '🎁': 'Gift', '🛏': 'Bed', '🏕': 'Tent', '🧴': 'Droplets', '🩹': 'ShieldCheck', '🧊': 'Refrigerator', '👍': 'ThumbsUp',
  '🧑‍🍳': 'ChefHat', '🍖': 'Ham', '🧫': 'TestTube', '🌊': 'WavesHorizontal', '🥱': 'AlarmClock', '🦶': 'Footprints', '🤱': 'Baby',
};

// Quita los selectores de variación para encontrar el emoji en el mapa.
const limpiar = (e: string) => e.replace(/️/g, '');

export function iconoDe(e?: string | null): string | null {
  if (!e) return null;
  return MAPA[e] ?? MAPA[limpiar(e)] ?? MAPA[[...e][0]] ?? null;
}

const ELEMENTOS: Record<string, typeof Path> = { path: Path, circle: Circle, rect: Rect, line: Line, polyline: Polyline } as never;

function Trazo({ nombre, size, color, strokeWidth }: { nombre: string; size: number; color: string; strokeWidth: number }) {
  const nodos: NodoIcono[] = TRAZOS[nombre] ?? [];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {nodos.map(([tag, attrs], i) => {
        const E = ELEMENTOS[tag];
        return E ? <E key={i} {...(attrs as object)} /> : null;
      })}
    </Svg>
  );
}

/** Icono a partir de la clave emoji del contenido. Si no hay traducción, no muestra nada. */
export function Icono({ e, size = 20, color, strokeWidth = 1.8 }: { e?: string | null; size?: number; color?: string; strokeWidth?: number }) {
  const c = useColors();
  const nombre = iconoDe(e);
  if (!nombre) return null;
  return <Trazo nombre={nombre} size={size} color={color ?? c.rosa} strokeWidth={strokeWidth} />;
}

/** Icono dentro de una burbuja suave, para listas y tarjetas. */
export function IconoBurbuja({ e, size = 38, color, fondo }: { e?: string | null; size?: number; color?: string; fondo?: string }) {
  const c = useColors();
  const nombre = iconoDe(e);
  if (!nombre) return null;
  return (
    <Burbuja size={size} fondo={fondo ?? c.rosaSuave}>
      <Trazo nombre={nombre} size={Math.round(size * 0.5)} color={color ?? c.text} strokeWidth={1.8} />
    </Burbuja>
  );
}

function Burbuja({ size, fondo, children }: { size: number; fondo: string; children: ReactNode }) {
  return <View style={{ width: size, height: size, borderRadius: size * 0.32, backgroundColor: fondo, alignItems: 'center', justifyContent: 'center' }}>{children}</View>;
}
