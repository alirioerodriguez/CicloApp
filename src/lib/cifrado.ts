// Cifrado en el teléfono antes de subir o guardar datos de salud: AES-256-GCM con una clave que sale de una frase
// de la usuaria (scrypt). Ni Neon ni Vercel ni nadie del equipo puede leer lo cifrado: sin la frase no hay forma
// de recuperarlo, y eso se le dice a la usuaria antes de activarlo.
//
// Todo en JS puro (@noble, auditadas) para que ande igual en Hermes, en la web y en las pruebas: no depende de
// crypto.subtle, que el teléfono no trae. Solo usa crypto.getRandomValues, que polyfills.ts ya carga.
import { gcm } from '@noble/ciphers/aes.js';
import { randomBytes } from '@noble/ciphers/utils.js';
import { scryptAsync } from '@noble/hashes/scrypt.js';

/** Costo de scrypt de las claves nuevas (2^15 = unos 32 MB). Va dentro del sobre: se puede subir más adelante sin romper lo viejo. */
export const COSTO_SCRYPT = 2 ** 15;
export const FRASE_MIN = 8;

export type Contexto = 'nube' | 'archivo';

/** Lo que se guarda o se sube: nada de esto revela el contenido. */
export interface Sobre {
  savia: 'cifrado';
  v: 1;
  alg: 'AES-256-GCM';
  kdf: 'scrypt';
  N: number;
  r: number;
  p: number;
  /** Sal de la clave y nonce de este cifrado, en base64. */
  salt: string;
  nonce: string;
  ct: string;
  ctx: Contexto;
}

export class ErrorCifrado extends Error {
  constructor(
    public codigo: 'frase' | 'formato' | 'version',
    mensaje: string,
  ) {
    super(mensaje);
    this.name = 'ErrorCifrado';
  }
}

/** Clave ya derivada: se calcula una vez (tarda unos segundos) y se reusa mientras la app está abierta. */
export interface Llave {
  clave: Uint8Array;
  salt: Uint8Array;
  N: number;
  r: number;
  p: number;
}

// ---------- base64 (Hermes no siempre trae btoa/atob) ----------
const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function aBase64(b: Uint8Array): string {
  let s = '';
  for (let i = 0; i < b.length; i += 3) {
    const n = (b[i] << 16) | ((b[i + 1] ?? 0) << 8) | (b[i + 2] ?? 0);
    s += ABC[(n >> 18) & 63] + ABC[(n >> 12) & 63] + (i + 1 < b.length ? ABC[(n >> 6) & 63] : '=') + (i + 2 < b.length ? ABC[n & 63] : '=');
  }
  return s;
}

export function deBase64(s: string): Uint8Array {
  const limpio = s.replace(/=+$/, '');
  if (/[^A-Za-z0-9+/]/.test(limpio) || limpio.length % 4 === 1) throw new ErrorCifrado('formato', 'El archivo está dañado.');
  const out = new Uint8Array(Math.floor((limpio.length * 3) / 4));
  let o = 0;
  for (let i = 0; i < limpio.length; i += 4) {
    const n = (ABC.indexOf(limpio[i]) << 18) | (ABC.indexOf(limpio[i + 1]) << 12) | ((ABC.indexOf(limpio[i + 2] ?? 'A') & 63) << 6) | (ABC.indexOf(limpio[i + 3] ?? 'A') & 63);
    out[o++] = (n >> 16) & 255;
    if (i + 2 < limpio.length) out[o++] = (n >> 8) & 255;
    if (i + 3 < limpio.length) out[o++] = n & 255;
  }
  return out;
}

// ---------- texto ↔ bytes ----------
const aBytes = (t: string) => new TextEncoder().encode(t);
const deBytes = (b: Uint8Array) => new TextDecoder().decode(b);
/** NFKC: la misma frase tecleada en otro teclado o sistema da la misma clave. */
const normalizarFrase = (f: string) => f.normalize('NFKC');

/** Datos que se atan al cifrado: un sobre de «nube» no se puede hacer pasar por uno de «archivo». */
const aad = (ctx: Contexto) => aBytes(`savia:v1:${ctx}`);

export function fraseValida(frase: string): boolean {
  return normalizarFrase(frase).length >= FRASE_MIN;
}

// ---------- claves ----------

async function derivar(frase: string, salt: Uint8Array, N: number, r: number, p: number): Promise<Uint8Array> {
  return scryptAsync(aBytes(normalizarFrase(frase)), salt, { N, r, p, dkLen: 32 });
}

/** Clave nueva (con sal al azar) a partir de la frase. `N` se puede bajar solo en las pruebas. */
export async function crearLlave(frase: string, N = COSTO_SCRYPT): Promise<Llave> {
  if (!fraseValida(frase)) throw new ErrorCifrado('frase', `La frase debe tener al menos ${FRASE_MIN} caracteres.`);
  const salt = randomBytes(16);
  return { clave: await derivar(frase, salt, N, 8, 1), salt, N, r: 8, p: 1 };
}

/** Clave a partir de la frase y la sal de un sobre que ya existe, para poder abrirlo. */
export async function abrirLlave(frase: string, sobre: Sobre): Promise<Llave> {
  validarSobre(sobre);
  const salt = deBase64(sobre.salt);
  return { clave: await derivar(frase, salt, sobre.N, sobre.r, sobre.p), salt, N: sobre.N, r: sobre.r, p: sobre.p };
}

// ---------- cifrar y descifrar ----------

export function esSobre(x: unknown): x is Sobre {
  return !!x && typeof x === 'object' && (x as Sobre).savia === 'cifrado';
}

function validarSobre(s: Sobre): void {
  if (!esSobre(s)) throw new ErrorCifrado('formato', 'Este archivo no está cifrado con Savia.');
  if (s.v !== 1 || s.alg !== 'AES-256-GCM' || s.kdf !== 'scrypt') throw new ErrorCifrado('version', 'Este respaldo es de una versión más nueva de Savia. Actualiza la app.');
  const ok = Number.isInteger(s.N) && s.N >= 2 ** 10 && s.N <= 2 ** 22 && (s.N & (s.N - 1)) === 0 && Number.isInteger(s.r) && s.r >= 1 && s.r <= 16 && Number.isInteger(s.p) && s.p >= 1 && s.p <= 4;
  if (!ok || typeof s.salt !== 'string' || typeof s.nonce !== 'string' || typeof s.ct !== 'string') throw new ErrorCifrado('formato', 'El archivo está dañado.');
}

/** Cifra cualquier dato JSON con la clave. Cada llamada usa un nonce nuevo; la sal es la de la llave. */
export function cifrarConLlave(datos: unknown, llave: Llave, ctx: Contexto): Sobre {
  const nonce = randomBytes(12);
  const ct = gcm(llave.clave, nonce, aad(ctx)).encrypt(aBytes(JSON.stringify(datos)));
  return { savia: 'cifrado', v: 1, alg: 'AES-256-GCM', kdf: 'scrypt', N: llave.N, r: llave.r, p: llave.p, salt: aBase64(llave.salt), nonce: aBase64(nonce), ct: aBase64(ct), ctx };
}

/** Abre un sobre. Si la clave no es la correcta (o el contenido cambió), tira ErrorCifrado('frase'). */
export function descifrarConLlave(sobre: Sobre, llave: Llave, ctx: Contexto): unknown {
  validarSobre(sobre);
  if (sobre.ctx !== ctx) throw new ErrorCifrado('formato', 'Este respaldo no es de este tipo.');
  try {
    const claro = gcm(llave.clave, deBase64(sobre.nonce), aad(ctx)).decrypt(deBase64(sobre.ct));
    return JSON.parse(deBytes(claro));
  } catch (e) {
    if (e instanceof ErrorCifrado) throw e;
    throw new ErrorCifrado('frase', 'La frase no es la correcta.');
  }
}

/** Atajo para un archivo suelto: deriva la clave, cifra y listo (tarda unos segundos por scrypt). */
export async function cifrar(datos: unknown, frase: string, ctx: Contexto, N = COSTO_SCRYPT): Promise<Sobre> {
  return cifrarConLlave(datos, await crearLlave(frase, N), ctx);
}

export async function descifrar(sobre: Sobre, frase: string, ctx: Contexto): Promise<unknown> {
  return descifrarConLlave(sobre, await abrirLlave(frase, sobre), ctx);
}
