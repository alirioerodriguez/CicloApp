// Antes de iniciar sesión: país (adapta comidas y vocabulario) e idioma (sale del dispositivo).
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IDIOMAS, PAISES, useRegion } from '../lib/region';
import { serif, useColors } from '../lib/theme';
import { Logo } from './Logo';
import { Text } from './Texto';
import { Button, Card, Chip, Label, Muted } from './ui';

export function SelectorRegion() {
  const c = useColors();
  const { pais, idioma, cambiar } = useRegion();
  return (
    <>
      <Label>¿De dónde eres?</Label>
      <Muted>Así te sugerimos comidas que consigues en tu país.</Muted>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {PAISES.map((p) => (
          <Chip key={p.id} label={p.nombre} color={c.lavanda} selected={pais === p.id} onPress={() => cambiar({ pais: p.id })} />
        ))}
      </View>
      <Label>Idioma</Label>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {IDIOMAS.map((i) => (
          <Chip key={i.id} label={i.nombre} selected={idioma === i.id} onPress={() => cambiar({ idioma: i.id })} />
        ))}
      </View>
    </>
  );
}

export function ElegirPais() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { cambiar } = useRegion();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 24, paddingTop: insets.top + 40, gap: 18, maxWidth: 480, width: '100%', alignSelf: 'center' }}>
      <View style={{ alignItems: 'center', gap: 12 }}>
        <Logo size={64} animated />
        <Text style={{ fontFamily: serif, fontSize: 28, color: c.text, textAlign: 'center' }}>Hola, te damos la bienvenida a Savia</Text>
      </View>
      <Card>
        <SelectorRegion />
        <Muted>Puedes cambiarlo cuando quieras desde Perfil.</Muted>
      </Card>
      <Button label="Continuar" onPress={() => cambiar({ elegido: true })} />
    </ScrollView>
  );
}
