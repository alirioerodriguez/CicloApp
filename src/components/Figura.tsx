// Figura animada para los ejercicios: un esqueleto simple dibujado con SVG.
// Cada ejercicio define dos poses (A y B) y la figura va y viene entre ellas.
// Las piernas usan cinemática inversa: se indica dónde va el pie y la rodilla se calcula sola.
import { useContext, useEffect, useId, useRef, useState } from 'react';
import Svg, { ClipPath, Defs, G, Line, Path, Rect } from 'react-native-svg';
import type { Pose } from '../content/ejercicios';
import { ThemePrefs, TONOS, useColors } from '../lib/theme';

const SPINE = 52;
const UPPER_ARM = 30;
const FOREARM = 28;
const THIGH = 40;
const SHIN = 40;
const GROUND = 185;

type P = [number, number];
const rad = (d: number) => (d * Math.PI) / 180;
// 0° = hacia abajo, 90° = hacia la derecha, 180° = hacia arriba.
const dir = (a: number): P => [Math.sin(rad(a)), Math.cos(rad(a))];
const add = (p: P, v: P, k: number): P => [p[0] + v[0] * k, p[1] + v[1] * k];
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpP = (a: P, b: P, t: number): P => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

function legIK(hip: P, foot: P, bend: 'front' | 'back' | 'up' | 'down' | 'out', center: number): { knee: P; foot: P } {
  let dx = foot[0] - hip[0];
  let dy = foot[1] - hip[1];
  let d = Math.hypot(dx, dy);
  const max = THIGH + SHIN - 0.5;
  if (d > max) {
    dx = (dx / d) * max;
    dy = (dy / d) * max;
    d = max;
  }
  const u: P = [dx / d, dy / d];
  const mid = add(hip, u, d / 2);
  const h = Math.sqrt(Math.max(0, THIGH * THIGH - (d / 2) * (d / 2)));
  const k1 = add(mid, [-u[1], u[0]], h);
  const k2 = add(mid, [u[1], -u[0]], h);
  const pickBy = {
    front: (a: P, b: P) => (a[0] >= b[0] ? a : b),
    back: (a: P, b: P) => (a[0] <= b[0] ? a : b),
    up: (a: P, b: P) => (a[1] <= b[1] ? a : b),
    down: (a: P, b: P) => (a[1] >= b[1] ? a : b),
    out: (a: P, b: P) => (Math.abs(a[0] - center) >= Math.abs(b[0] - center) ? a : b),
  }[bend];
  return { knee: pickBy(k1, k2), foot: [hip[0] + dx, hip[1] + dy] };
}

function interpolate(a: Pose, b: Pose, t: number): Pose {
  return {
    hip: lerpP(a.hip, b.hip, t),
    torso: lerp(a.torso, b.torso, t),
    head: lerp(a.head ?? 0, b.head ?? 0, t),
    armF: [lerp(a.armF[0], b.armF[0], t), lerp(a.armF[1], b.armF[1], t)],
    armB: [lerp(a.armB[0], b.armB[0], t), lerp(a.armB[1], b.armB[1], t)],
    footF: lerpP(a.footF, b.footF, t),
    footB: lerpP(a.footB, b.footB, t),
  };
}

export interface FiguraProps {
  a: Pose;
  b: Pose;
  bendF: 'front' | 'back' | 'up' | 'down' | 'out';
  bendB: 'front' | 'back' | 'up' | 'down' | 'out';
  segundosPorRep: number;
  sostener?: boolean; // ejercicios de mantener: va a B y se queda
  frontal?: boolean; // vista de frente: ambos lados con el mismo color
  playing?: boolean;
  size?: number;
  onRep?: () => void;
}

// Suaviza el movimiento (empieza y termina despacio).
const ease = (x: number) => 0.5 - Math.cos(Math.PI * x) / 2;

export function Figura({ a, b, bendF, bendB, segundosPorRep, sostener, frontal, playing = true, size = 220, onRep }: FiguraProps) {
  const c = useColors();
  const { tono: tonoId } = useContext(ThemePrefs);
  const tono = TONOS.find((x) => x.id === tonoId) ?? TONOS[0];
  const uid = useId();
  const [t, setT] = useState(0);
  const start = useRef<number | null>(null);
  const offset = useRef(0); // tiempo acumulado al pausar
  const reps = useRef(0);
  const onRepRef = useRef(onRep);
  onRepRef.current = onRep;

  useEffect(() => {
    if (!playing) {
      start.current = null;
      return;
    }
    let raf = 0;
    const loop = (now: number) => {
      if (start.current == null) start.current = now - offset.current;
      const elapsed = (now - start.current) / 1000;
      offset.current = now - start.current;
      if (sostener) {
        setT(Math.min(1, elapsed / 1.2));
      } else {
        const cycles = elapsed / segundosPorRep;
        const n = Math.floor(cycles);
        if (n > reps.current) {
          reps.current = n;
          onRepRef.current?.();
        }
        const phase = cycles - n; // 0→1: ida y vuelta
        setT(phase < 0.5 ? ease(phase * 2) : ease((1 - phase) * 2));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, segundosPorRep, sostener]);

  const p = interpolate(a, b, t);
  const spineDir = dir(180 - p.torso);
  const side: P = [-spineDir[1], spineDir[0]]; // hacia la derecha del cuerpo (vista de frente)
  // De perfil los brazos salen del hombro; de frente, a cada lado del pecho y las piernas a cada lado de la cadera.
  const shoulder = add(p.hip, spineDir, SPINE - 5);
  const shF = frontal ? add(shoulder, side, 12) : shoulder;
  const shB = frontal ? add(shoulder, side, -12) : shoulder;
  const hipF = frontal ? add(p.hip, side, 7) : add(p.hip, spineDir, 2);
  const hipB = frontal ? add(p.hip, side, -7) : add(p.hip, spineDir, 2);
  const elbowF = add(shF, dir(p.armF[0]), UPPER_ARM);
  const handF = add(elbowF, dir(p.armF[1]), FOREARM);
  const elbowB = add(shB, dir(p.armB[0]), UPPER_ARM);
  const handB = add(elbowB, dir(p.armB[1]), FOREARM);
  const legF = legIK(hipF, p.footF, bendF, 100);
  const legB = legIK(hipB, p.footB, bendB, 100);

  // Cuerpo en el tono suave; top deportivo, calzas y pelo en el tono profundo (diseño en Claude Design).
  const suave = tono.suave;
  const profundo = tono.profundo;
  const borde = c.card;
  const farOp = frontal ? 1 : 0.55;
  const clipId = `torso${uid.replace(/[^a-zA-Z0-9]/g, '')}`;

  const arm = (s1: P, e: P, h: P, ang: number) => limb(s1, e, h, 4.6, 3.6, 2.6) + seg(h, add(h, dir(ang), 4), 2.8, 2.4);
  const foot = (f: P) => (frontal ? seg([f[0], f[1] - 2], [f[0], f[1] + 2], 3.6, 3.2) : seg(f, [f[0] + 9, f[1] + 1.5], 3.6, 2.4));

  const legNear = limb(hipF, legF.knee, legF.foot, 8.5, 5.4, 3.4);
  const armNear = arm(shF, elbowF, handF, p.armF[1]);

  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Defs>
        <ClipPath id={clipId}>
          <Path d={frontal ? TORSO_FRENTE : TORSO_PERFIL} />
        </ClipPath>
      </Defs>
      <Line x1={8} y1={GROUND + 6} x2={192} y2={GROUND + 6} stroke={c.line} strokeWidth={3} strokeLinecap="round" />
      <Path d={arm(shB, elbowB, handB, p.armB[1])} fill={suave} opacity={farOp} />
      <Path d={limb(hipB, legB.knee, legB.foot, 8.5, 5.4, 3.4)} fill={profundo} opacity={farOp} />
      <Path d={foot(legB.foot)} fill={suave} opacity={farOp} />
      <G transform={`translate(${p.hip[0]} ${p.hip[1]}) rotate(${p.torso})`}>
        <Path d={frontal ? seg([0, -55], [0, -62], 4.2, 3.8) : seg([0.5, -55], [2.5, -62], 4.2, 3.8)} fill={suave} />
        <Path d={frontal ? TORSO_FRENTE : TORSO_PERFIL} fill={suave} />
        <G clipPath={`url(#${clipId})`}>
          <Rect x={-30} y={frontal ? -49 : -50} width={60} height={frontal ? 17 : 20} fill={profundo} />
          <Rect x={-30} y={-21} width={60} height={40} fill={profundo} />
        </G>
        <G transform={`rotate(${p.head ?? 0} ${frontal ? 0 : 1} -57)`}>
          <Path d={frontal ? COLETA_FRENTE : COLETA_PERFIL} fill={profundo} />
          <Path d={frontal ? CABEZA_FRENTE : CABEZA_PERFIL} fill={suave} />
          <Path d={frontal ? PELO_FRENTE : PELO_PERFIL} fill={profundo} />
        </G>
      </G>
      {/* Borde debajo y relleno encima: separa la pierna y el brazo del torso sin marcar las articulaciones. */}
      <Path d={legNear} fill={borde} stroke={borde} strokeWidth={2.4} strokeLinejoin="round" />
      <Path d={legNear} fill={profundo} />
      <Path d={foot(legF.foot)} fill={suave} />
      <Path d={armNear} fill={borde} stroke={borde} strokeWidth={2.4} strokeLinejoin="round" />
      <Path d={armNear} fill={suave} />
    </Svg>
  );
}

const r1 = (n: number) => Math.round(n * 10) / 10;

// Segmento afinado: círculo de radio ra en A y rb en B, unidos por tangentes.
function seg(A: P, B: P, ra: number, rb: number): string {
  const d = Math.hypot(B[0] - A[0], B[1] - A[1]) || 0.01;
  const u: P = [(B[0] - A[0]) / d, (B[1] - A[1]) / d];
  const n: P = [-u[1], u[0]];
  const a1 = add(A, n, ra);
  const b1 = add(B, n, rb);
  const b2 = add(B, n, -rb);
  const a2 = add(A, n, -ra);
  return (
    `M${r1(a1[0])} ${r1(a1[1])}L${r1(b1[0])} ${r1(b1[1])}A${rb} ${rb} 0 0 0 ${r1(b2[0])} ${r1(b2[1])}` +
    `L${r1(a2[0])} ${r1(a2[1])}A${ra} ${ra} 0 0 0 ${r1(a1[0])} ${r1(a1[1])}Z`
  );
}

// Brazo o pierna: dos segmentos que se afinan hacia la mano o el pie.
function limb(A: P, J: P, E: P, ra: number, rj: number, re: number): string {
  return seg(A, J, ra, rj) + seg(J, E, rj, re);
}

// Siluetas con la cadera en (0,0): de perfil mira a la derecha (busto adelante, glúteo atrás).
const TORSO_PERFIL =
  'M4 -58C5 -54 6 -51 9 -48C15 -46 18 -41 15 -36C13 -33 9 -32 8 -29C7 -24 10 -18 10 -12C10 -5 10 1 6 7C2 11 -4 12 -9 10C-16 7 -19 -2 -16 -9C-14 -14 -10 -18 -8 -24C-7 -30 -8 -36 -9 -42C-10 -48 -8 -55 -3 -58Z';
const TORSO_FRENTE =
  'M-11 -57C-15 -55 -15 -50 -14 -45C-12 -38 -9 -33 -9 -28C-9 -22 -14 -17 -16 -9C-17 -1 -14 6 -8 8C-3 10 3 10 8 8C14 6 17 -1 16 -9C14 -17 9 -22 9 -28C9 -33 12 -38 14 -45C15 -50 15 -55 11 -57Z';
const CABEZA_PERFIL = 'M-7 -72C-7 -80 1 -82 7 -79C11 -77 13 -72 12.5 -69L14.6 -65.6L12.4 -64.6C12.4 -61.4 10 -59 6 -59C-1 -59 -7 -63.5 -7 -72Z';
const PELO_PERFIL = 'M-8.5 -69C-9.5 -79 -1 -84 6 -81.5C10 -80 12.2 -77 12.6 -73.5C8 -76.5 2 -76 -1.5 -72C-3.5 -69.5 -4.5 -66 -6.5 -63.5Z';
const COLETA_PERFIL = 'M-5 -77C-14 -80 -21 -73 -21 -63C-21 -57 -18 -53.5 -15 -53.5C-16.5 -59 -16 -67 -7 -72Z';
const CABEZA_FRENTE = 'M0 -81C7 -81 10.5 -75.5 10.5 -69.5C10.5 -62.5 6 -58.5 0 -58.5C-6 -58.5 -10.5 -62.5 -10.5 -69.5C-10.5 -75.5 -7 -81 0 -81Z';
const PELO_FRENTE = 'M-10.8 -68C-11.5 -78 -6 -82 0 -82C6 -82 11.5 -78 10.8 -68C8 -74 4 -76 0 -76C-4 -76 -8 -74 -10.8 -68Z';
const COLETA_FRENTE = 'M0 -91C4.5 -91 6.5 -88 6.5 -85C6.5 -82 4 -80.5 0 -80.5C-4 -80.5 -6.5 -82 -6.5 -85C-6.5 -88 -4.5 -91 0 -91Z';
