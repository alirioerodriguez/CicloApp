// Íconos de los widgets, los mismos de la app (Lucide, trazo 1,8) en lugar de emojis.
// Android los dibuja como SVG (SvgWidget). El widget de iPhone no puede dibujar SVG propios: usa el símbolo del
// sistema (SF Symbol) equivalente a cada ícono de Lucide.
import { iconoDe } from '../components/mapaIconos';
import { TRAZOS } from '../components/trazos-iconos';

const attrs = (a: Record<string, string>) =>
  Object.entries(a)
    .map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}="${v}"`)
    .join(' ');

/** SVG de un ícono de Lucide por su nombre («Moon», «Check»…). Vacío si no existe. */
export function svgIcono(nombre: string, color: string, tam = 24, trazo = 1.8): string {
  const nodos = TRAZOS[nombre];
  if (!nodos) return '';
  const cuerpo = nodos.map(([tag, a]) => `<${tag} ${attrs(a)}/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${trazo}" stroke-linecap="round" stroke-linejoin="round">${cuerpo}</svg>`;
}

/** SVG del ícono que corresponde al emoji del contenido (la «clave» que usa la app). */
export const svgDeEmoji = (emoji: string | null | undefined, color: string, tam = 24) => svgIcono(iconoDe(emoji) ?? 'Heart', color, tam);

// Lucide → SF Symbol (iPhone). Solo los que usan los widgets.
const SF: Record<string, string> = {
  Moon: 'moon', Sprout: 'leaf', Leaf: 'leaf', Sparkles: 'sparkles', CloudRain: 'cloud.rain', Handshake: 'person.2', Baby: 'figure.and.child.holdinghands',
  Flower2: 'camera.macro', Flower: 'camera.macro', Heart: 'heart', HeartHandshake: 'heart', MoonStar: 'moon.stars',
};

/** Nombre del SF Symbol para el emoji del contenido. */
export const simboloDeEmoji = (emoji: string | null | undefined): string => SF[iconoDe(emoji) ?? ''] ?? 'heart';
