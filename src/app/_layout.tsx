import { Fraunces_600SemiBold, Fraunces_400Regular_Italic } from '@expo-google-fonts/fraunces';
import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans';
import { useFonts } from 'expo-font';
import * as LocalAuthentication from 'expo-local-authentication';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Platform, View } from 'react-native';
import { Text } from '../components/Texto';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Login } from '../components/Login';
import { Logo } from '../components/Logo';
import { AuthProvider, useAuth } from '../lib/auth';
import { MisionBanner } from '../components/MisionBanner';
import { Button } from '../components/ui';
import { rescheduleAll } from '../lib/notifications';
import { StoreProvider, useStore } from '../lib/store';
import { ThemePrefs, serif, useColors } from '../lib/theme';
import { RegionProvider, t, useRegion } from '../lib/region';
import { ElegirPais } from '../components/ElegirPais';
import * as Notifications from 'expo-notifications';
import { nowTime } from '../lib/dates';
import { ACCION_TOMADA, fechaDeRespuesta, idSegundoAviso } from '../lib/tareaPastilla';
import { subirResumenPareja } from '../lib/nube';
import { resumenPareja } from '../lib/pareja';
import { sincronizarReloj } from '../lib/sincronizarReloj';

function Gate() {
  const c = useColors();
  const { ready, data, summary, marcarToma, update } = useStore();
  const { session } = useAuth();
  const [locked, setLocked] = useState(true);
  const lockEnabled = data.settings.lock && Platform.OS !== 'web';

  // Bloqueo con huella / Face ID al abrir y al volver a la app.
  useEffect(() => {
    if (!ready) return;
    if (!lockEnabled) setLocked(false);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'background' && lockEnabled) setLocked(true);
    });
    return () => sub.remove();
  }, [ready, lockEnabled]);

  const unlock = async () => {
    const res = await LocalAuthentication.authenticateAsync({ promptMessage: t('Desbloquea tu app de ciclo') });
    if (res.success) setLocked(false);
  };
  useEffect(() => {
    if (ready && lockEnabled && locked) unlock();
  }, [ready, lockEnabled, locked]); // eslint-disable-line react-hooks/exhaustive-deps

  // Botón "Ya la tomé" con la app abierta (o en iPhone, que la abre): marca la toma si aún no estaba.
  // Con la app cerrada en Android lo resuelve la tarea de lib/tareaPastilla.
  const tomas = useRef(data.tomasPastilla);
  tomas.current = data.tomasPastilla;
  useEffect(() => {
    if (!ready || Platform.OS === 'web') return;
    const atender = (r: Notifications.NotificationResponse | null) => {
      if (!r || r.actionIdentifier !== ACCION_TOMADA) return;
      const fecha = fechaDeRespuesta(r);
      if (fecha && !tomas.current[fecha]) marcarToma(fecha, nowTime());
      if (fecha) Notifications.cancelScheduledNotificationAsync(idSegundoAviso(fecha)).catch(() => {});
      Notifications.dismissNotificationAsync(r.notification.request.identifier).catch(() => {});
    };
    Notifications.getLastNotificationResponseAsync().then(atender).catch(() => {});
    const sub = Notifications.addNotificationResponseReceivedListener(atender);
    return () => sub.remove();
  }, [ready, marcarToma]);

  // Reprogramar recordatorios cuando cambian los datos (con una pausa).
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!ready) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => rescheduleAll(data, summary).catch(() => {}), 1500);
  }, [ready, data, summary]);

  // Modo pareja en vivo: cuando cambia lo que ella comparte, se sube el resumen (con una pausa y solo si cambió).
  const userId = session?.user.id ?? null;
  const compartida = ready && userId && data.settings.red.on && data.settings.red.enVivo ? JSON.stringify(resumenPareja(data, summary)) : null;
  const subida = useRef<string | null>(null);
  useEffect(() => {
    if (!compartida || !userId || compartida === subida.current) return;
    const tm = setTimeout(() => {
      subirResumenPareja(userId, JSON.parse(compartida))
        .then(() => {
          subida.current = compartida;
        })
        .catch(() => {});
    }, 3000);
    return () => clearTimeout(tm);
  }, [compartida, userId]);

  // Reloj y apps de salud: al abrir y al volver a la app trae lo nuevo (como mucho cada 3 horas).
  const datosRef = useRef(data);
  datosRef.current = data;
  useEffect(() => {
    if (!ready || Platform.OS === 'web') return;
    const traer = () => sincronizarReloj(datosRef.current, update).catch(() => {});
    traer();
    const sub = AppState.addEventListener('change', (s) => s === 'active' && traer());
    return () => sub.remove();
  }, [ready, update]);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={c.rosa} />
      </View>
    );
  }

  if (lockEnabled && locked) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center', gap: 18, padding: 30 }}>
        <Logo size={72} animated />
        <Text style={{ fontFamily: serif, fontSize: 26, color: c.text }}>Tu espacio está protegido</Text>
        <Button label="Desbloquear" onPress={unlock} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
      <Stack.Screen name="dia/[fecha]" options={{ presentation: 'modal' }} />
      <Stack.Screen name="alimentacion" />
      <Stack.Screen name="info" />
      <Stack.Screen name="olvide-pastilla" />
      <Stack.Screen name="privacidad-datos" />
      <Stack.Screen name="tutorial" options={{ gestureEnabled: false }} />
      <Stack.Screen name="salud" />
      <Stack.Screen name="suenos" />
      <Stack.Screen name="ejercicios" />
      <Stack.Screen name="ejercicio/[id]" options={{ presentation: 'modal' }} />
      <Stack.Screen name="respirar" options={{ presentation: 'modal' }} />
      <Stack.Screen name="pruebas" />
      <Stack.Screen name="consulta" />
      <Stack.Screen name="cambio" />
      <Stack.Screen name="perdida" options={{ gestureEnabled: false }} />
      <Stack.Screen name="red" />
      <Stack.Screen name="reloj" />
      <Stack.Screen name="acompanar" options={{ gestureEnabled: !data.settings.soloPareja }} />
      <Stack.Screen name="personalizar" />
      <Stack.Screen name="patadas" options={{ presentation: 'modal' }} />
      <Stack.Screen name="contracciones" options={{ presentation: 'modal' }} />
      <Stack.Screen name="menopausia" />
      <Stack.Screen name="quiz" options={{ presentation: 'modal' }} />
    </Stack>
    <MisionBanner />
    </View>
  );
}

// Aplica el tono y el modo (Noche/Día) elegidos en Perfil a toda la app.
function Themed() {
  const { data } = useStore();
  const prefs = { tono: data.settings.tono, modo: data.settings.modo };
  return (
    <ThemePrefs.Provider value={prefs}>
      <ThemedStatusBar />
      <Gate />
    </ThemePrefs.Provider>
  );
}

function ThemedStatusBar() {
  const c = useColors();
  return <StatusBar style={c.dark ? 'light' : 'dark'} />;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_400Regular_Italic,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });
  // Si las fuentes fallan o tardan, la app abre igual con la fuente del sistema.
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 3000);
    return () => clearTimeout(t);
  }, []);
  if (!fontsLoaded && !fontError && !timedOut) return null;
  return (
    <SafeAreaProvider>
      <RegionProvider>
        <AuthProvider>
          <AuthGate />
        </AuthProvider>
      </RegionProvider>
    </SafeAreaProvider>
  );
}

// Sin sesión se muestra el inicio con correo y contraseña. Si Neon aún no está configurado, la app funciona solo en el teléfono.
function AuthGate() {
  const { loading, session, configured } = useAuth();
  const region = useRegion();
  if (loading || !region.listo) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }
  if (configured && !session) {
    return (
      <>
        <StatusBar style="auto" />
        {region.elegido ? <Login /> : <ElegirPais />}
      </>
    );
  }
  return (
    <StoreProvider key={session?.user.id ?? 'local'} userId={session?.user.id ?? null}>
      <Themed />
    </StoreProvider>
  );
}
