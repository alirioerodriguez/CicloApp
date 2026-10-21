import { Redirect, Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../lib/store';
import { fonts, useColors } from '../../lib/theme';

// La app abre en "Hoy" aunque la primera pestaña sea Calendario.
export const unstable_settings = { anchor: 'index' };

const icon =(emoji: string) =>
  function TabIcon({ focused }: { focused: boolean }) {
    return <Text style={{ fontSize: 21, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>;
  };

export default function TabsLayout() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { data } = useStore();
  if (!data.settings.onboarded) return <Redirect href="/onboarding" />;
  if (!data.settings.tutorialVisto) return <Redirect href="/tutorial" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.rosa,
        tabBarInactiveTintColor: c.muted,
        tabBarLabelStyle: { fontSize: 11, fontFamily: fonts.semibold },
        tabBarStyle: {
          backgroundColor: c.card,
          borderTopColor: c.line,
          height: 66 + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom + 8,
        },
        sceneStyle: { backgroundColor: c.bg },
      }}
    >
      <Tabs.Screen name="calendario" options={{ title: 'Calendario', tabBarIcon: icon('📅') }} />
      <Tabs.Screen name="index" options={{ title: 'Hoy', tabBarIcon: icon('🌸') }} />
      <Tabs.Screen name="cuidate" options={{ title: 'Cuídate', tabBarIcon: icon('🌿') }} />
      <Tabs.Screen name="estadisticas" options={{ title: 'Resumen', tabBarIcon: icon('📊') }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: icon('👤') }} />
    </Tabs>
  );
}
