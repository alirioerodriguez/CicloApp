// Sesión de la usuaria (correo y contraseña, vía Supabase).
import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, supabaseConfigured } from './supabase';

interface Auth {
  loading: boolean;
  session: Session | null;
  configured: boolean;
}

const Ctx = createContext<Auth>({ loading: true, session: null, configured: supabaseConfigured });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(supabaseConfigured);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .finally(() => setLoading(false));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  return <Ctx.Provider value={{ loading, session, configured: supabaseConfigured }}>{children}</Ctx.Provider>;
}

export function useAuth(): Auth {
  return useContext(Ctx);
}
