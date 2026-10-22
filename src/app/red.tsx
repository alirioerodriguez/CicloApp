// Tu red de apoyo (diseño 8j): compartir solo lo que ella elija con su pareja o alguien de confianza.
import { router } from 'expo-router';
import { Platform, Share, Text, TextInput, View } from 'react-native';
import { Body, Button, Card, Chip, Label, Muted, Screen, Toggle, notify } from '../components/ui';
import { INTRO_RED, OPCIONES_RED } from '../content/confianza';
import { tarjetaRed, tarjetaTexto } from '../lib/red';
import { useStore } from '../lib/store';
import { fonts, radius, serif, useColors } from '../lib/theme';

async function enviar(texto: string) {
  if (Platform.OS === 'web') {
    if (typeof navigator !== 'undefined' && navigator.share) return navigator.share({ text: texto });
    await navigator.clipboard?.writeText(texto);
    return notify('Copiado', 'La tarjeta quedó copiada. Pégala en WhatsApp o donde prefieras.');
  }
  await Share.share({ message: texto });
}

export default function Red() {
  const c = useColors();
  const { data, summary, updateSettings } = useStore();
  const red = data.settings.red;
  const setRed = (patch: Partial<typeof red>) => updateSettings({ red: { ...red, ...patch } });
  const tarjeta = tarjetaRed(data, summary);
  const quien = red.nombre.trim() || 'tu persona de confianza';

  return (
    <Screen angosta title="Tu red de apoyo" right={<Button small kind="soft" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/perfil'))} />}>
      <Body>{INTRO_RED}</Body>

      <Card>
        <Label>¿Con quién?</Label>
        <TextInput
          value={red.nombre}
          onChangeText={(nombre) => setRed({ nombre })}
          placeholder="Nombre de tu pareja o alguien de confianza"
          placeholderTextColor={c.muted}
          style={{ borderRadius: radius.md, backgroundColor: c.bg, padding: 12, fontSize: 16, color: c.text, fontFamily: fonts.regular }}
        />
        <Toggle label={`Compartir con ${quien}`} hint="Una tarjeta al día, que tú envías" value={red.on} onChange={(on) => setRed({ on })} />
        {red.on && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {OPCIONES_RED.map((o) => (
              <Chip
                key={o.id}
                label={o.label}
                selected={red.compartir.includes(o.id)}
                onPress={() => setRed({ compartir: red.compartir.includes(o.id) ? red.compartir.filter((x) => x !== o.id) : [...red.compartir, o.id] })}
              />
            ))}
          </View>
        )}
      </Card>

      {red.on && (
        <>
          <Card tint={c.rosaSuave}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 11.5, letterSpacing: 1.5, color: c.muted }}>ASÍ LO VERÁ</Text>
            <Text style={{ fontFamily: serif, fontSize: 20, lineHeight: 27, color: c.text }}>{tarjeta.mensaje}</Text>
            {tarjeta.consejo && <Body>{tarjeta.consejo}</Body>}
          </Card>
          <Button label={`Enviar la tarjeta de hoy${red.nombre.trim() ? ` a ${red.nombre.trim()}` : ''}`} onPress={() => enviar(tarjetaTexto(tarjeta)).catch(() => {})} />
          <Muted>Savia no envía nada por su cuenta: tú eliges cuándo y por dónde mandarla (WhatsApp, mensaje, correo).</Muted>
        </>
      )}
    </Screen>
  );
}
