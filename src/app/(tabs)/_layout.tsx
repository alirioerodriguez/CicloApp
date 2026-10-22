import { Redirect, Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ANCHO_BARRA, useLayout } from '../../lib/layout';
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
  const L = useLayout();
  const posparto = data.settings.etapa === 'posparto';
  if (!data.settings.onboarded) return <Redirect href="/onboarding" />;
  if (!data.settings.tutorialVisto) return <Redirect href="/tutorial" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.rosa,
        tabBarInactiveTintColor: c.muted,
        sceneStyle: { backgroundColor: c.bg },
        ...(L.barraLateral
          ? {
              // Escritorio: barra lateral con el ícono al lado del nombre.
              tabBarPosition: 'left',
              tabBarVariant: 'material',
              tabBarLabelPosition: 'beside-icon',
              tabBarLabelStyle: { fontSize: 15, fontFamily: fonts.semibold },
              tabBarActiveBackgroundColor: c.rosaSuave,
              tabBarItemStyle: { borderRadius: 14, marginHorizontal: 12, marginVertical: 2, paddingHorizontal: 6, maxHeight: 52 },
              tabBarStyle: { backgroundColor: c.card, borderRightColor: c.line, width: ANCHO_BARRA, paddingTop: 28 },
            }
          : {
              tabBarLabelPosition: 'below-icon',
              tabBarLabelStyle: { fontSize: 11, fontFamily: fonts.semibold },
              tabBarStyle: {
                backgroundColor: c.card,
                borderTopColor: c.line,
                height: 66 + insets.bottom,
                paddingTop: 6,
                paddingBottom: insets.bottom + 8,
              },
            }),
      }}
    >
      <Tabs.Screen name="calendario" options={posparto ? { title: 'Recuperación', tabBarIcon: icon('🌷') } : { title: 'Calendario', tabBarIcon: icon('📅') }} />
      <Tabs.Screen name="index" options={{ title: 'Hoy', tabBarIcon: icon('🌸') }} />
      <Tabs.Screen name="cuidate" options={{ title: 'Cuídate', tabBarIcon: icon('🌿') }} />
      <Tabs.Screen name="estadisticas" options={posparto ? { title: 'Consulta', tabBarIcon: icon('🩺') } : { title: 'Resumen', tabBarIcon: icon('📊') }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: icon('👤') }} />
    </Tabs>
  );
}
