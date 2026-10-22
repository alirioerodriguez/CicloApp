// País e idioma de la usuaria. Se eligen antes de iniciar sesión (el país adapta la comida y el
// vocabulario; el idioma sale del dispositivo) y se pueden cambiar en Perfil. Se guardan en el
// dispositivo, fuera de la cuenta, porque hacen falta antes de entrar.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { EN, EN_PATRONES } from '../content/i18n/en';
import { NEUTRO, NEUTRO_PATRONES } from '../content/i18n/neutro';

export type Pais = 'VE' | 'MX' | 'CO' | 'AR' | 'CL' | 'PE' | 'US';
export type Idioma = 'es' | 'en';

// Venezuela primero (jerga venezolana); luego los 5 países hispanohablantes con más uso de apps de
// salud femenina en Latam, y Estados Unidos.
export const PAISES: { id: Pais; nombre: string }[] = [
  { id: 'VE', nombre: 'Venezuela' },
  { id: 'MX', nombre: 'México' },
  { id: 'CO', nombre: 'Colombia' },
  { id: 'AR', nombre: 'Argentina' },
  { id: 'CL', nombre: 'Chile' },
  { id: 'PE', nombre: 'Perú' },
  { id: 'US', nombre: 'Estados Unidos' },
];

export const IDIOMAS: { id: Idioma; nombre: string }[] = [
  { id: 'es', nombre: 'Español' },
  { id: 'en', nombre: 'English' },
];

interface Region {
  pais: Pais;
  idioma: Idioma;
  elegido: boolean; // true cuando la usuaria ya confirmó su país
}

const KEY = 'savia:region';

function delDispositivo(): Region {
  const l = getLocales()[0];
  const idioma: Idioma = l?.languageCode === 'en' ? 'en' : 'es';
  const r = l?.regionCode?.toUpperCase();
  const pais = PAISES.some((p) => p.id === r) ? (r as Pais) : idioma === 'en' ? 'US' : 'VE';
  return { pais, idioma, elegido: false };
}

// Estado actual a nivel de módulo: lo usa t() en cualquier parte, también fuera de React.
let actual: Region = delDispositivo();
export const region = () => actual;

// ---------- Traducción ----------
// Todo el texto de la app está escrito en español venezolano. t() lo pasa a inglés o a español
// neutro (para los demás países) con diccionarios; si una frase no está, queda como está.
// Las frases con datos variables usan patrones: "Día {0} de tu ciclo".

type Patron = { re: RegExp; plantilla: string };
// Los patrones con más texto fijo van primero: "La app usa {0} días…" gana sobre "{0} de {1}".
const fijo = (es: string) => es.replace(/\{\d+\}/g, '').length;
const compilar = (p: Record<string, string>): Patron[] =>
  Object.entries(p)
    .sort(([a], [b]) => fijo(b) - fijo(a))
    .map(([es, otro]) => ({
      re: new RegExp('^' + es.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\{(\d+)\}/g, '(.+?)') + '$', 's'),
      plantilla: otro,
    }));

const tablas = {
  en: { dic: EN, patrones: compilar(EN_PATRONES), cache: new Map<string, string>() },
  neutro: { dic: NEUTRO, patrones: compilar(NEUTRO_PATRONES), cache: new Map<string, string>() },
};

function traducirCon(tabla: (typeof tablas)['en'], s: string): string {
  const exacta = tabla.dic[s];
  if (exacta != null) return exacta;
  const guardada = tabla.cache.get(s);
  if (guardada != null) return guardada;
  // Espacios del borde (frases partidas en JSX) se conservan.
  const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s)!;
  let out = s;
  const mayus = m[2].charAt(0).toUpperCase() + m[2].slice(1);
  if (m[2] && m[2] !== s && tabla.dic[m[2]] != null) out = m[1] + tabla.dic[m[2]] + m[3];
  // "estimación en ajuste" en minúscula dentro de otra frase: se busca con mayúscula inicial.
  else if (mayus !== m[2] && tabla.dic[mayus] != null) out = m[1] + tabla.dic[mayus].charAt(0).toLowerCase() + tabla.dic[mayus].slice(1) + m[3];
  else {
    for (const p of tabla.patrones) {
      const r = p.re.exec(m[2]);
      if (r) {
        // Los valores variables también se traducen si son frases conocidas.
        out = m[1] + p.plantilla.replace(/\{(\d+)\}/g, (_, i) => traducirCon(tabla, r[Number(i) + 1])) + m[3];
        break;
      }
    }
  }
  tabla.cache.set(s, out);
  return out;
}

export function t(s: string): string {
  if (!s) return s;
  if (actual.idioma === 'en') return traducirCon(tablas.en, s);
  if (actual.pais !== 'VE') return traducirCon(tablas.neutro, s);
  return s;
}

// ---------- Contexto ----------

const Ctx = createContext<Region & { listo: boolean; cambiar: (r: Partial<Region>) => void }>({ ...actual, listo: false, cambiar: () => {} });

export function RegionProvider({ children }: { children: ReactNode }) {
  const [r, setR] = useState<Region>(actual);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw) return;
        const guardado = { ...actual, ...(JSON.parse(raw) as Partial<Region>) };
        actual = guardado;
        setR(guardado);
      })
      .catch(() => {})
      .finally(() => setListo(true));
  }, []);

  const cambiar = useCallback((patch: Partial<Region>) => {
    const nuevo = { ...actual, ...patch };
    actual = nuevo;
    setR(nuevo);
    AsyncStorage.setItem(KEY, JSON.stringify(nuevo)).catch(() => {});
  }, []);

  // Cada texto (components/Texto) escucha este contexto: al cambiar país o idioma se redibuja solo.
  return <Ctx.Provider value={{ ...r, listo, cambiar }}>{children}</Ctx.Provider>;
}

export function useRegion() {
  return useContext(Ctx);
}
