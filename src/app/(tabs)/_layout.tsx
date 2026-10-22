import { Redirect, Tabs } from 'expo-router';
import { BarraNav } from '../../components/BarraNav';
import { useLayout } from '../../lib/layout';
import { useStore } from '../../lib/store';
import { useColors } from '../../lib/theme';

// Orden del diseño: Hoy, Calendario, Cuídate, Resumen y Perfil. Los nombres cambian según la etapa.
const NOMBRES: Record<string, { cal: string; stats: string }> = {
  embarazo: { cal: 'Semanas', stats: 'Controles' },
  posparto: { cal: 'Recuperación', stats: 'Consulta' },
};

export default function TabsLayout() {
  const c = useColors();
  const { data } = useStore();
  const L = useLayout();
  if (!data.settings.onboarded) return <Redirect href="/onboarding" />;
  if (!data.settings.tutorialVisto) return <Redirect href="/tutorial" />;
  const n = NOMBRES[data.settings.etapa] ?? { cal: 'Calendario', stats: 'Resumen' };

  return (
    <Tabs
      tabBar={(props) => <BarraNav {...props} lateral={L.barraLateral} />}
      screenOptions={{ headerShown: false, tabBarPosition: L.barraLateral ? 'left' : 'bottom', sceneStyle: { backgroundColor: c.bg } }}
    >
      <Tabs.Screen name="index" options={{ title: 'Hoy' }} />
      <Tabs.Screen name="calendario" options={{ title: n.cal }} />
      <Tabs.Screen name="cuidate" options={{ title: 'Cuídate' }} />
      <Tabs.Screen name="estadisticas" options={{ title: n.stats }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
