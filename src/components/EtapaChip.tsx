// Chip de «Hoy»: «🌸 Etapa: Ciclo regular · Datos en este teléfono». Se lee en 3 segundos y lleva a Perfil, donde se cambia de modo.
import { router } from 'expo-router';
import { Pressable } from 'react-native';
import { Text } from './Texto';
import { useAuth } from '../lib/auth';
import { textoEtapa } from '../lib/etapaChip';
import { t } from '../lib/region';
import { useStore } from '../lib/store';
import { fonts, radius, useColors } from '../lib/theme';

export function EtapaChip() {
  const c = useColors();
  const { session } = useAuth();
  const { data } = useStore();
  const x = textoEtapa(data.settings.etapa, !!session);
  const texto = `${x.emoji} ${t('Etapa')}: ${t(x.etapa)} · ${t(x.datos)}`;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${texto}. ${t('Toca para cambiar de modo')}`}
      onPress={() => router.push('/perfil')}
      style={({ pressed }) => ({ alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', paddingHorizontal: 14, borderRadius: radius.md, backgroundColor: c.card, borderWidth: 1, borderColor: c.line, opacity: pressed ? 0.7 : 1 })}
    >
      <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: c.muted }}>{texto}</Text>
    </Pressable>
  );
}
