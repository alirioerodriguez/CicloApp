// Emoji del contenido → nombre del icono de Lucide. Lógica pura: la usan la app (Icono) y los widgets.
export const MAPA: Record<string, string> = {
  // Salud y cuerpo
  '🩺': 'Stethoscope', '💊': 'Pill', '🩸': 'Droplet', '💧': 'Droplets', '💦': 'Droplets', '🫁': 'Wind', '🧠': 'Brain', '🦴': 'Bone', '❤': 'Heart',
  '❤️': 'Heart', '💗': 'Heart', '💜': 'Heart', '💛': 'Heart', '🤍': 'HeartHandshake', '💕': 'Heart', '🫀': 'HeartPulse', '🔬': 'Microscope',
  '🧪': 'FlaskConical', '💉': 'Syringe', '🦵': 'PersonStanding', '👣': 'Footprints', '🤲': 'HandHeart', '🎀': 'Ribbon', '📍': 'Target',
  '⚫': 'Circle', '⭕': 'Circle', '🟠': 'Circle', '⬜': 'Circle', '🌀': 'RefreshCw', '♀': 'Flower2', '♀️': 'Flower2',
  // Etapas
  '🌸': 'Flower2', '🌷': 'Flower', '🌼': 'Flower', '🌱': 'Sprout', '🌿': 'Leaf', '🍂': 'Leaf', '🪴': 'Sprout', '🌾': 'Wheat', '🤰': 'Baby',
  '🍼': 'Baby', '👶': 'Baby', '🌗': 'MoonStar', '🌙': 'Moon', '🌧': 'CloudRain', '💞': 'Heart', '🌕': 'Moon', '🌤': 'CloudSun', '☀': 'Sun', '☀️': 'Sun', '🌉': 'Moon', '🌩': 'CloudLightning',
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
  // Respuestas nuevas del quiz y emojis que no tenían icono (15/11/2026, traídas de main)
  '🍃': 'Feather', '💭': 'MessageCircleHeart', '🏝': 'User', '🌶': 'Flame', '🚬': 'Cigarette', '🥵': 'ThermometerSun', '🛠': 'Wrench',
};

// Quita los selectores de variación para encontrar el emoji en el mapa.
const limpiar = (e: string) => e.replace(/️/g, '');

export function iconoDe(e?: string | null): string | null {
  if (!e) return null;
  return MAPA[e] ?? MAPA[limpiar(e)] ?? MAPA[[...e][0]] ?? null;
}

