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
const Ctx = createContext<Auth>({ loading: true, session: null, configured: nubeConfigurada, sinCuenta: false, usarSinCuenta: () => {} });

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
    const leer = () =>
      neon!.auth
        .getSession()
        .then(({ data }) => setSession((data.session as Sesion | null) ?? null))
        .catch(() => setSession(null));
    leer().finally(() => setLoading(false));
    alCambiarSesion(leer);
    const { data } = neon.auth.onAuthStateChange((_evento, s) => setSession((s as Sesion | null) ?? null));
    return () => {
      alCambiarSesion(null);
      data.subscription.unsubscribe();
    };
  }, []);

  return <Ctx.Provider value={{ loading: loading || !sinCuentaLeido, session, configured: nubeConfigurada, sinCuenta, usarSinCuenta }}>{children}</Ctx.Provider>;
}

export function useAuth(): Auth {
  return useContext(Ctx);
}
