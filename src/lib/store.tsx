// Estado global de la app, guardado en el teléfono (AsyncStorage). Sin internet.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Platform } from 'react-native';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ANIMO_A_SINTOMA, ID_RENOMBRADOS } from '../content/catalogo';
import { CLAVE_ACTIVA, clasificarToma, migrarBlister, normalizarTomas } from './blister';
import { summarize, type Summary } from './cycle';
import { actualizarWidgets } from '../widget/actualizarWidgets';
import { dejarDeCompartir, deleteRemote, pullRemote, pushRemote, soltarPareja } from './nube';
import { addDays, today } from './dates';
import type { AppData, BlisterConfig, DayLog, EstadoToma, ISODate, Settings } from './types';

const KEY = 'ciclo:data:v1';

export const DEFAULT_SETTINGS: Settings = {
  onboarded: false,
  tutorialVisto: false,
  name: '',
  edad: null,
  etapa: 'ciclo',
  anticonceptivo: 'ninguno',
  ttcRegistro: ['moco', 'lh', 'relacion'],
  posparto: { nacimiento: null, parto: 'vaginal', alimentacion: 'pecho' },
  embarazo: { fpp: null },
  meno: { etapa: 'meno', trh: false, trhTipo: 'Parche', suplementos: [] },
  red: { on: false, nombre: '', compartir: ['fase', 'energia', 'periodo', 'ayuda'], enVivo: false },
  soloPareja: false,
  silencioEmbarazo: false,
  cycleLength: 28,
  periodLength: 5,
  pillMode: false,
  pillName: '',
  pillType: '21-7',
  pillPackStart: null,
  condiciones: [],
  ocultarRetrasos: false,
  pdfAnimo: false,
  pdfReloj: true,
  reminders: {
    pill: { on: false, hour: 21, minute: 0 },
    water: { on: false, hours: [10, 13, 16, 19] },
    period: { on: true, daysBefore: 2, hour: 9 },
    pack: { on: true, hour: 9 },
    registro: { on: false, hour: 21, minute: 30 },
    autoexamen: { on: true, hour: 10 },
    controles: { on: true, daysBefore: 3, hour: 9 },
  },
  lock: false,
  lastBackup: null,
  logrosVistos: [],
  // Discretas desde el primer día: mucha gente ve la pantalla bloqueada frente a otras personas. El detalle se activa en Perfil.
  discreet: true,
  tono: 'rosa',
  modo: 'auto',
  signo: null,
};

export const emptyData = (): AppData => ({
  version: 1,
  settings: DEFAULT_SETTINGS,
  logs: {},
  dreams: [],
  controles: [],
  autoexamenes: [],
  quistes: [],
  edimburgo: {},
  embarazo: { hechos: [], patadas: {}, medidas: {}, preguntas: [] },
  mrs: {},
  chequeosMeno: [],
  quiz: {},
  pruebas: { misiones: {}, sus: [], ideas: [] },
  blister: null,
  tomasPastilla: {},
  reloj: { fuente: null, ultimaSync: null, dias: {} },
});

export function emptyLog(date: ISODate): DayLog {
  return { date, flow: 0, pain: 0, moods: [], symptoms: [], note: '', water: 0, sleep: null, pillTaken: false, pillTime: null, ovario: null, senos: [], intimidad: false, moco: null, temp: null, lh: null, loquios: null, tomas: [], cicatriz: null, bochornos: null, intensidad: null, despertares: null, despertoPor: [], sentir: null, menoExtra: [] };
}

function isEmptyLog(l: DayLog) {
  return (
    !l.flow && !l.pain && !l.moods.length && !l.symptoms.length && !l.note.trim() && !l.water && l.sleep == null && !l.pillTaken && !l.ovario && !l.senos.length && !l.intimidad &&
    !l.moco && l.temp == null && !l.lh && !l.loquios && !l.tomas.length && !l.cicatriz &&
    l.bochornos == null && l.despertares == null && !l.despertoPor.length && !l.sentir && !l.menoExtra.length
  );
}

// Traduce ids de catálogos anteriores (por ejemplo, de un respaldo viejo).
function migrateIds(moods: string[], symptoms: string[]) {
  const rename = (ids: string[], map: Record<string, string | null>) =>
    ids.flatMap((id) => (id in map ? (map[id] ? [map[id]!] : []) : [id]));
  const extra = moods.map((m) => ANIMO_A_SINTOMA[m]).filter(Boolean);
  return {
    moods: [...new Set(rename(moods, ID_RENOMBRADOS.moods))],
    symptoms: [...new Set([...rename(symptoms, ID_RENOMBRADOS.symptoms), ...extra])],
  };
}

// Acepta datos viejos o incompletos (por ejemplo, de un respaldo) sin romperse.
export function normalize(raw: unknown): AppData {
  const r = (raw ?? {}) as Partial<AppData>;
  const s = (r.settings ?? {}) as Partial<Settings>;
  const settings: Settings = {
    ...DEFAULT_SETTINGS,
    ...s,
    // Versiones anteriores llamaban '28' al esquema 21 + 7 placebo.
    pillType: (s.pillType as string) === '28' ? '21-7p' : s.pillType ?? DEFAULT_SETTINGS.pillType,
    // Antes de los modos, la pastilla se guardaba solo como pillMode.
    anticonceptivo: s.anticonceptivo ?? (s.pillMode ? 'pastilla' : 'ninguno'),
    posparto: { ...DEFAULT_SETTINGS.posparto, ...s.posparto },
    red: { ...DEFAULT_SETTINGS.red, ...s.red },
    embarazo: { ...DEFAULT_SETTINGS.embarazo, ...s.embarazo },
    meno: { ...DEFAULT_SETTINGS.meno, ...s.meno },
    reminders: {
      pill: { ...DEFAULT_SETTINGS.reminders.pill, ...s.reminders?.pill },
      water: { ...DEFAULT_SETTINGS.reminders.water, ...s.reminders?.water },
      period: { ...DEFAULT_SETTINGS.reminders.period, ...s.reminders?.period },
      pack: { ...DEFAULT_SETTINGS.reminders.pack, ...s.reminders?.pack },
      registro: { ...DEFAULT_SETTINGS.reminders.registro, ...s.reminders?.registro },
      autoexamen: { ...DEFAULT_SETTINGS.reminders.autoexamen, ...s.reminders?.autoexamen },
      controles: { ...DEFAULT_SETTINGS.reminders.controles, ...s.reminders?.controles },
    },
  };
  const logs: Record<ISODate, DayLog> = {};
  for (const [date, l] of Object.entries(r.logs ?? {})) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const log = { ...emptyLog(date), ...(l as Partial<DayLog>), date };
    logs[date] = { ...log, ...migrateIds(log.moods, log.symptoms) };
  }
  const base = emptyData();
  // Blíster digital: datos de antes (pillType, pillPackStart y pillTaken en DayLog) se migran sin borrar nada.
  const { blister, tomasPastilla } = migrarBlister({ settings, logs, blister: r.blister, tomasPastilla: r.tomasPastilla });
  return {
    version: 1,
    blister,
    tomasPastilla,
    settings,
    logs,
    dreams: Array.isArray(r.dreams) ? r.dreams : base.dreams,
    controles: Array.isArray(r.controles) ? r.controles : base.controles,
    autoexamenes: Array.isArray(r.autoexamenes) ? r.autoexamenes : base.autoexamenes,
    quistes: Array.isArray(r.quistes) ? r.quistes : base.quistes,
    edimburgo: r.edimburgo && typeof r.edimburgo === 'object' ? r.edimburgo : base.edimburgo,
    embarazo: { ...base.embarazo, ...r.embarazo, preguntas: Array.isArray(r.embarazo?.preguntas) ? r.embarazo.preguntas : base.embarazo.preguntas },
    mrs: r.mrs && typeof r.mrs === 'object' ? r.mrs : base.mrs,
    chequeosMeno: Array.isArray(r.chequeosMeno) ? r.chequeosMeno : base.chequeosMeno,
    quiz: r.quiz && typeof r.quiz === 'object' ? r.quiz : base.quiz,
    pruebas: { ...base.pruebas, ...r.pruebas },
    reloj: { ...base.reloj, ...r.reloj, dias: r.reloj?.dias && typeof r.reloj.dias === 'object' ? r.reloj.dias : {} },
  };
}

interface Store {
  ready: boolean;
  data: AppData;
  summary: Summary;
  getLog: (date: ISODate) => DayLog;
  setLog: (date: ISODate, patch: Partial<DayLog>) => void;
  togglePeriodDay: (date: ISODate) => void;
  startPeriodToday: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
  update: (fn: (d: AppData) => AppData) => void; // para diario, controles, quistes y pruebas
  guardarBlister: (blister: BlisterConfig | null) => void;
  marcarToma: (fecha: ISODate, hora: string | null, estado?: EstadoToma) => void;
  quitarToma: (fecha: ISODate) => void;
  mision: { id: string; inicio: number } | null; // prueba en curso (no se guarda)
  setMision: (m: { id: string; inicio: number } | null) => void;
  replaceAll: (data: AppData) => void;
  resetAll: () => void;
  sync: SyncState;
}

export type SyncState = 'local' | 'sincronizando' | 'al-dia' | 'sin-conexion';

const Ctx = createContext<Store | null>(null);

// Los datos se guardan en el teléfono (para usar la app sin conexión) y se respaldan en Supabase
// con la cuenta de la usuaria. Gana la versión más nueva (por fecha de modificación).
export function StoreProvider({ children, userId }: { children: ReactNode; userId: string | null }) {
  const [data, setData] = useState<AppData>(emptyData);
  const [ready, setReady] = useState(false);
  const [sync, setSync] = useState<SyncState>('local');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fromLoad = useRef(true); // el primer cambio viene de cargar, no de la usuaria
  const key = userId ? `${KEY}:${userId}` : KEY;
  const stampKey = `${key}:updatedAt`;

  useEffect(() => {
    let cancel = false;
    setReady(false);
    fromLoad.current = true;
    (async () => {
      let local: AppData | null = null;
      let localStamp: string | null = null;
      try {
        const raw = await AsyncStorage.getItem(key);
        // Primera vez con cuenta: se adoptan los datos que ya había en este teléfono sin cuenta.
        const legacy = !raw && userId ? await AsyncStorage.getItem(KEY) : null;
        if (raw ?? legacy) local = normalize(JSON.parse((raw ?? legacy)!));
        localStamp = await AsyncStorage.getItem(stampKey);
      } catch {
        // Datos locales dañados: se sigue con lo que haya en la nube.
      }
      let chosen = local;
      if (userId) {
        try {
          setSync('sincronizando');
          const remote = await pullRemote(userId);
          if (remote && (!localStamp || remote.updatedAt > localStamp)) {
            chosen = normalize(remote.data);
            await AsyncStorage.setItem(stampKey, remote.updatedAt);
          } else if (local) {
            const stamp = localStamp ?? new Date().toISOString();
            await pushRemote(userId, local, stamp);
          }
          setSync('al-dia');
        } catch {
          setSync('sin-conexion');
        }
      }
      if (cancel) return;
      setData(chosen ?? emptyData());
      setReady(true);
      // Para el botón "Ya la tomé" de la notificación, que escribe sin la app abierta.
      AsyncStorage.setItem(CLAVE_ACTIVA, key).catch(() => {});
    })();
    return () => {
      cancel = true;
    };
  }, [key, stampKey, userId]);

  // Guardado con una pequeña espera para no escribir en cada toque; a la nube, un poco después.
  const latest = useRef(data);
  latest.current = data;
  useEffect(() => {
    if (!ready) return;
    if (fromLoad.current) {
      fromLoad.current = false;
      return;
    }
    const stamp = new Date().toISOString();
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      AsyncStorage.multiSet([
        [key, JSON.stringify(data)],
        [stampKey, stamp],
      ])
        // El widget de inicio lee lo guardado: se actualiza después de escribir (solo Android).
        .then(() => actualizarWidgets())
        .catch(() => {});
    }, 300);
    if (!userId) return;
    if (pushTimer.current) clearTimeout(pushTimer.current);
    setSync('sincronizando');
    pushTimer.current = setTimeout(() => {
      pushRemote(userId, data, stamp)
        .then(() => setSync('al-dia'))
        .catch(() => setSync('sin-conexion'));
    }, 2000);
  }, [data, ready, key, stampKey, userId]);

  // Si la app se cierra o pasa a segundo plano, se guarda al instante.
  useEffect(() => {
    if (!ready) return;
    const flush = () => {
      AsyncStorage.setItem(key, JSON.stringify(latest.current)).catch(() => {});
    };
    // Al volver, se suman las pastillas marcadas desde la notificación ("Ya la tomé") mientras la app no estaba.
    const recoger = async () => {
      try {
        const raw = await AsyncStorage.getItem(key);
        const guardadas = raw ? normalizarTomas((JSON.parse(raw) as Partial<AppData>).tomasPastilla) : {};
        setData((d) => {
          const nuevas = Object.keys(guardadas).filter((f) => !d.tomasPastilla[f]);
          if (!nuevas.length) return d;
          return { ...d, tomasPastilla: { ...Object.fromEntries(nuevas.map((f) => [f, guardadas[f]])), ...d.tomasPastilla } };
        });
      } catch {
        // Si no se puede leer, se queda lo que hay en memoria.
      }
    };
    const sub = AppState.addEventListener('change', (s) => {
      if (s !== 'active') flush();
      else recoger();
    });
    if (Platform.OS === 'web') window.addEventListener('pagehide', flush);
    return () => {
      sub.remove();
      if (Platform.OS === 'web') window.removeEventListener('pagehide', flush);
    };
  }, [ready, key]);

  const setLog = useCallback((date: ISODate, patch: Partial<DayLog>) => {
    setData((d) => {
      const next = { ...(d.logs[date] ?? emptyLog(date)), ...patch, date };
      const logs = { ...d.logs };
      if (isEmptyLog(next)) delete logs[date];
      else logs[date] = next;
      return { ...d, logs };
    });
  }, []);

  const togglePeriodDay = useCallback((date: ISODate) => {
    setData((d) => {
      const cur = d.logs[date] ?? emptyLog(date);
      const next = { ...cur, flow: cur.flow > 0 ? 0 : 2 };
      const logs = { ...d.logs };
      if (isEmptyLog(next)) delete logs[date];
      else logs[date] = next;
      return { ...d, logs };
    });
  }, []);

  // Botón "Me vino hoy": marca solo hoy; los días siguientes se registran a medida que pasan.
  const startPeriodToday = useCallback(() => {
    const t = today();
    setData((d) => {
      const cur = d.logs[t] ?? emptyLog(t);
      return { ...d, logs: { ...d.logs, [t]: { ...cur, flow: cur.flow || 2 } } };
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  }, []);

  const update = useCallback((fn: (d: AppData) => AppData) => setData(fn), []);

  // ---------- Blíster digital ----------
  // Guardar o editar el blíster (null lo borra). Mantiene en sincronía los ajustes anteriores
  // (pillPackStart) mientras el resto de la app los siga usando.
  const guardarBlister = useCallback((blister: BlisterConfig | null) => {
    setData((d) => ({ ...d, blister, settings: blister ? { ...d.settings, pillPackStart: blister.inicio } : d.settings }));
  }, []);

  // Marcar la toma de un día. Sin estado, se clasifica sola como a tiempo o tarde según la hora.
  const marcarToma = useCallback((fecha: ISODate, hora: string | null, estado?: EstadoToma) => {
    setData((d) => {
      if (!d.blister) return d;
      // La hora es de hoy: si se marca un día anterior (p. ej., desde la notificación de ayer) cuenta como tarde.
      const final: EstadoToma = estado ?? (hora ? clasificarToma(d.blister, hora, fecha, today()) : 'tomada');
      return { ...d, tomasPastilla: { ...d.tomasPastilla, [fecha]: { fecha, estado: final, hora: final === 'olvidada' ? null : hora } } };
    });
  }, []);

  // Quitar lo registrado ese día (vuelve a "pendiente" si es hoy u "olvidada" si ya pasó).
  const quitarToma = useCallback((fecha: ISODate) => {
    setData((d) => {
      const tomasPastilla = { ...d.tomasPastilla };
      delete tomasPastilla[fecha];
      return { ...d, tomasPastilla };
    });
  }, []);
  const [mision, setMision] = useState<{ id: string; inicio: number } | null>(null);

  const replaceAll = useCallback((nd: AppData) => setData(normalize(nd)), []);
  const resetAll = useCallback(() => {
    setData(emptyData());
    // En la nube: el respaldo, lo que ella comparte con su pareja y, si era la pareja de alguien, ese vínculo.
    if (userId) {
      deleteRemote(userId).catch(() => {});
      dejarDeCompartir(userId).catch(() => {});
      soltarPareja().catch(() => {});
    }
  }, [userId]);

  // Solo en desarrollo web: permite cargar datos de prueba desde la consola.
  useEffect(() => {
    if (__DEV__ && Platform.OS === 'web') (window as unknown as Record<string, unknown>).__cicloReplace = replaceAll;
  }, [replaceAll]);

  const summary = useMemo(() => summarize(data), [data]);
  const getLog = useCallback((date: ISODate) => data.logs[date] ?? emptyLog(date), [data.logs]);

  const value = useMemo(
    () => ({ ready, data, summary, getLog, setLog, togglePeriodDay, startPeriodToday, updateSettings, update, guardarBlister, marcarToma, quitarToma, mision, setMision, replaceAll, resetAll, sync }),
    [ready, data, summary, getLog, setLog, togglePeriodDay, startPeriodToday, updateSettings, update, guardarBlister, marcarToma, quitarToma, mision, replaceAll, resetAll, sync],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore fuera de StoreProvider');
  return s;
}

// Marca los días del período inicial que se cargan en la bienvenida.
export function seedFirstPeriod(logs: Record<ISODate, DayLog>, start: ISODate, length: number): Record<ISODate, DayLog> {
  const out = { ...logs };
  const t = today();
  for (let i = 0; i < length; i++) {
    const d = addDays(start, i);
    if (d > t) break;
    out[d] = { ...(out[d] ?? emptyLog(d)), flow: out[d]?.flow || 2 };
  }
  return out;
}

// Id corto y suficiente para registros locales (sueños, controles, quistes).
export function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
