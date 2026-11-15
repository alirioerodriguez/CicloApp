// Sesión de la usuaria (correo y contraseña o Google, vía Neon Auth).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { alCambiarSesion, neon, nubeConfigurada } from './nube';

export interface Sesion {
  // `image` y `name` llegan si entró con Google (la foto de su cuenta)
  user: { id: string; email?: string | null; image?: string | null; name?: string | null };
}

interface Auth {
  loading: boolean;
  session: Sesion | null;
  configured: boolean;
  // Eligió usar Savia sin cuenta: todo queda en el teléfono. Puede crear la cuenta después desde Perfil.
  sinCuenta: boolean;
  usarSinCuenta: (on: boolean) => void;
}

const SIN_CUENTA = 'ciclo:sin-cuenta';
// Última sesión confirmada por el servidor (solo id, correo, nombre y foto: nada de claves)
const ULTIMA = 'ciclo:ultima-sesion';
const Ctx = createContext<Auth>({ loading: true, session: null, configured: nubeConfigurada, sinCuenta: false, usarSinCuenta: () => {} });

// Reglas para no sacar a nadie de su cuenta por una falla de red. MANTENER = dejar la sesión como está.
export const MANTENER = Symbol('mantener');
/** Respuesta de getSession: solo una respuesta sin error decide (con o sin sesión). */
export function trasLeer(r: { data?: { session?: unknown } | null; error?: unknown } | null | undefined): Sesion | null | typeof MANTENER {
  if (!r || r.error) return MANTENER;
  return (r.data?.session as Sesion | null | undefined) ?? null;
}
/** Evento de Neon Auth: solo SIGNED_OUT cierra; un INITIAL_SESSION vacío puede ser una falla de red. */
export function trasEvento(evento: string, s: unknown): Sesion | null | typeof MANTENER {
  if (evento === 'SIGNED_OUT') return null;
  return s ? (s as Sesion) : MANTENER;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Sesion | null>(null);
  const [loading, setLoading] = useState(nubeConfigurada);
  const [sinCuenta, setSinCuenta] = useState(false);
  const [sinCuentaLeido, setSinCuentaLeido] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SIN_CUENTA)
      .then((v) => setSinCuenta(v === '1'))
      .catch(() => {})
      .finally(() => setSinCuentaLeido(true));
  }, []);

  // Si entra a una cuenta, deja de estar «sin cuenta» (al cerrar sesión vuelve a ver el login).
  useEffect(() => {
    if (session) AsyncStorage.removeItem(SIN_CUENTA).then(() => setSinCuenta(false)).catch(() => {});
  }, [session]);

  const usarSinCuenta = (on: boolean) => {
    setSinCuenta(on);
    (on ? AsyncStorage.setItem(SIN_CUENTA, '1') : AsyncStorage.removeItem(SIN_CUENTA)).catch(() => {});
  };

  useEffect(() => {
    if (!neon) return;
    let vivo = true;
    // Solo se cierra la sesión cuando el servidor contesta que no hay (o la usuaria la cierra). Si la consulta
    // falla (sin señal, red lenta, el servidor tarda), se mantiene la última conocida y se vuelve a probar:
    // antes, cualquier falla momentánea la sacaba de su cuenta.
    const aplicar = (s: Sesion | null) => {
      if (!vivo) return;
      setSession(s);
      // Se guarda solo quién es (sin el token de acceso que también trae la sesión)
      const quien = s ? { user: { id: s.user.id, email: s.user.email ?? null, image: s.user.image ?? null, name: s.user.name ?? null } } : null;
      (quien ? AsyncStorage.setItem(ULTIMA, JSON.stringify(quien)) : AsyncStorage.removeItem(ULTIMA)).catch(() => {});
    };
    const leer = async () => {
      try {
        const r = trasLeer(await neon!.auth.getSession());
        if (r === MANTENER) return false;
        aplicar(r);
        return true;
      } catch {
        return false;
      }
    };
    // Mientras tanto, la última sesión conocida: así una recarga sin señal no muestra el ingreso
    const inicio = AsyncStorage.getItem(ULTIMA)
      .then((v) => {
        if (vivo && v) setSession((actual) => actual ?? (JSON.parse(v) as Sesion));
      })
      .catch(() => {});
    inicio.then(leer).then((ok) => {
      if (!ok) setTimeout(() => void leer(), 5000);
    }).finally(() => vivo && setLoading(false));
    alCambiarSesion(async () => {
      await leer();
    });
    const { data } = neon.auth.onAuthStateChange((evento, s) => {
      // INITIAL_SESSION sin sesión puede ser una falla de red: lo confirma «leer»
      const r = trasEvento(evento, s);
      if (r !== MANTENER) aplicar(r);
    });
    // En la web: al volver a la pestaña o recuperar la señal, se revisa la sesión sin sacarla de su cuenta
    const revisar = () => void leer();
    const web = typeof window !== 'undefined' && typeof document !== 'undefined' && !!window.addEventListener;
    const alVolver = () => document.visibilityState === 'visible' && revisar();
    if (web) {
      window.addEventListener('online', revisar);
      document.addEventListener('visibilitychange', alVolver);
    }
    return () => {
      vivo = false;
      alCambiarSesion(null);
      data.subscription.unsubscribe();
      if (web) {
        window.removeEventListener('online', revisar);
        document.removeEventListener('visibilitychange', alVolver);
      }
    };
  }, []);

  return <Ctx.Provider value={{ loading: loading || !sinCuentaLeido, session, configured: nubeConfigurada, sinCuenta, usarSinCuenta }}>{children}</Ctx.Provider>;
}

export function useAuth(): Auth {
  return useContext(Ctx);
}
