// Figura animada para los ejercicios: un esqueleto simple dibujado con SVG.
// Cada ejercicio define dos poses (A y B) y la figura va y viene entre ellas.
// Las piernas usan cinemática inversa: se indica dónde va el pie y la rodilla se calcula sola.
import { useEffect, useRef, useState } from 'react';
import Svg, { Circle, Ellipse, G, Line, Path } from 'react-native-svg';
import type { Pose } from '../content/ejercicios';
import { useColors } from '../lib/theme';

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
  const top = add(p.hip, spineDir, SPINE);
  // De perfil los brazos salen del hombro; de frente, a cada lado del pecho y las piernas a cada lado de la cadera.
  const shoulder = add(p.hip, spineDir, SPINE - 4);
  const shF = frontal ? add(shoulder, side, 12) : shoulder;
  const shB = frontal ? add(shoulder, side, -12) : shoulder;
  const hipF = frontal ? add(p.hip, side, 7) : p.hip;
  const hipB = frontal ? add(p.hip, side, -7) : p.hip;
  const elbowF = add(shF, dir(p.armF[0]), UPPER_ARM);
  const handF = add(elbowF, dir(p.armF[1]), FOREARM);
  const elbowB = add(shB, dir(p.armB[0]), UPPER_ARM);
  const handB = add(elbowB, dir(p.armB[1]), FOREARM);
  const legF = legIK(hipF, p.footF, bendF, 100);
  const legB = legIK(hipB, p.footB, bendB, 100);

  const body = c.rosa;
  const outline = c.card;
  const farOpacity = frontal ? 1 : 0.5;

  // Brazo o pierna: muslo/brazo más grueso que pantorrilla/antebrazo, con borde para separarlo del torso.
  const limb = (k: string, a1: P, j: P, e: P, w1: number, w2: number, opacity: number, borde: boolean) => (
    <G key={k} opacity={opacity}>
      {borde && <Line x1={a1[0]} y1={a1[1]} x2={j[0]} y2={j[1]} stroke={outline} strokeWidth={w1 + 3} strokeLinecap="round" />}
      {borde && <Line x1={j[0]} y1={j[1]} x2={e[0]} y2={e[1]} stroke={outline} strokeWidth={w2 + 3} strokeLinecap="round" />}
      <Line x1={a1[0]} y1={a1[1]} x2={j[0]} y2={j[1]} stroke={body} strokeWidth={w1} strokeLinecap="round" />
      <Line x1={j[0]} y1={j[1]} x2={e[0]} y2={e[1]} stroke={body} strokeWidth={w2} strokeLinecap="round" />
    </G>
  );
  const pie = (k: string, f: P, opacity: number) =>
    frontal ? (
      <Ellipse key={k} cx={f[0]} cy={f[1] + 1} rx={4} ry={3} fill={body} opacity={opacity} />
    ) : (
      <Line key={k} x1={f[0] - 1} y1={f[1]} x2={f[0] + 8} y2={f[1] + 1} stroke={body} strokeWidth={6} strokeLinecap="round" opacity={opacity} />
    );

  // Torso dibujado con la cadera en (0,0), la espalda hacia -x y el frente (busto) hacia +x.
  const torso = frontal ? (
    <G>
      <Path d={TORSO_FRENTE} fill={body} />
      <Ellipse cx={-6} cy={-39} rx={6} ry={4.5} fill={outline} opacity={0.18} />
      <Ellipse cx={6} cy={-39} rx={6} ry={4.5} fill={outline} opacity={0.18} />
    </G>
  ) : (
    <Path d={TORSO_PERFIL} fill={body} />
  );
  const cabeza = frontal ? (
    <G transform={`rotate(${p.head ?? 0} 0 -57)`}>
      <Line x1={0} y1={-55} x2={0} y2={-61} stroke={body} strokeWidth={8} strokeLinecap="round" />
      <Circle cx={0} cy={-80} r={5.5} fill={body} />
      <Circle cx={0} cy={-69} r={11} fill={body} />
    </G>
  ) : (
    <G transform={`rotate(${p.head ?? 0} 1 -56)`}>
      <Line x1={1} y1={-54} x2={2} y2={-61} stroke={body} strokeWidth={8} strokeLinecap="round" />
      <Path d="M-7 -74 Q-19 -73 -21 -60 Q-21 -55 -17 -54 Q-16 -63 -9 -66 Z" fill={body} />
      <Circle cx={2} cy={-69} r={11} fill={body} />
      <Path d="M12 -69 L15 -66 L12 -64.5 Z" fill={body} />
    </G>
  );

  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Line x1={6} y1={GROUND + 5} x2={194} y2={GROUND + 5} stroke={c.line} strokeWidth={3} strokeLinecap="round" />
      {limb('ab', shB, elbowB, handB, 8, 7, farOpacity, false)}
      {limb('lb', hipB, legB.knee, legB.foot, 15, 11, farOpacity, false)}
      {pie('pb', legB.foot, farOpacity)}
      <G transform={`translate(${p.hip[0]} ${p.hip[1]}) rotate(${p.torso})`}>
        {torso}
        {cabeza}
      </G>
      {limb('lf', hipF, legF.knee, legF.foot, 15, 11, 1, !frontal)}
      {pie('pf', legF.foot, 1)}
      {limb('af', shF, elbowF, handF, 8, 7, 1, !frontal)}
    </Svg>
  );
}

// Silueta de perfil (cadera en 0,0; hombros en y ≈ -52): glúteo atrás, cintura, busto adelante.
const TORSO_PERFIL =
  'M9 6 Q12 -6 8 -16 Q6 -23 7 -28 Q15 -31 16 -38 Q16 -45 9 -48 Q7 -52 5 -56 L-3 -57 Q-9 -54 -9 -48 Q-6 -37 -7 -30 Q-9 -24 -14 -16 Q-21 -6 -15 4 Q-8 11 0 9 Q6 9 9 6 Z';

// Silueta de frente: hombros, cintura marcada y cadera.
const TORSO_FRENTE =
  'M-9 7 Q-17 1 -16 -10 Q-11 -21 -9 -28 Q-12 -37 -14 -46 Q-15 -53 -11 -56 L11 -56 Q15 -53 14 -46 Q12 -37 9 -28 Q11 -21 16 -10 Q17 1 9 7 Q0 10 -9 7 Z';
