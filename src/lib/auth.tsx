// Sesión de la usuaria (correo y contraseña o Google, vía Neon Auth).
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { neon, nubeConfigurada } from './nube';

export interface Sesion {
  user: { id: string; email?: string | null };
}

interface Auth {
  loading: boolean;
  session: Sesion | null;
  configured: boolean;
}

const Ctx = createContext<Auth>({ loading: true, session: null, configured: nubeConfigurada });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Sesion | null>(null);
  const [loading, setLoading] = useState(nubeConfigurada);

  useEffect(() => {
    if (!neon) return;
    neon.auth
      .getSession()
      .then(({ data }) => setSession((data.session as Sesion | null) ?? null))
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
    const { data } = neon.auth.onAuthStateChange((_evento, s) => setSession((s as Sesion | null) ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  return <Ctx.Provider value={{ loading, session, configured: nubeConfigurada }}>{children}</Ctx.Provider>;
}

export function useAuth(): Auth {
  return useContext(Ctx);
}
