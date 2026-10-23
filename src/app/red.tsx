// Tu red de apoyo (diseño 8j): compartir solo lo que ella elija con su pareja o alguien de confianza.
// Dos formas: en vivo con un código (la pareja lo ve en su Savia y en su widget) o una tarjeta que ella envía.
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Share, TextInput, View } from 'react-native';
import { Text } from '../components/Texto';
import { TarjetaPareja } from '../components/TarjetaPareja';
import { Body, Button, Card, Chip, Label, Muted, Screen, Toggle, confirm, notify } from '../components/ui';
import { INTRO_RED, OPCIONES_RED } from '../content/confianza';
import { INTRO_PAREJA } from '../content/pareja';
import { useAuth } from '../lib/auth';
import { crearCodigoPareja, dejarDeCompartir, estadoPareja, type EstadoPareja } from '../lib/nube';
import { mostrarCodigo, nuevoCodigo, resumenPareja, vistaPareja } from '../lib/pareja';
import { tarjetaRed, tarjetaTexto } from '../lib/red';
import { useStore } from '../lib/store';
import { fonts, radius, serif, useColors } from '../lib/theme';
import { t, useRegion } from '../lib/region';

async function enviar(texto: string) {
  if (Platform.OS === 'web') {
    if (typeof navigator !== 'undefined' && navigator.share) return navigator.share({ text: texto });
    await navigator.clipboard?.writeText(texto);
    return notify('Copiado', 'Quedó copiado. Pégalo en WhatsApp o donde prefieras.');
  }
  await Share.share({ message: texto });
}

// Conexión en vivo con la pareja: crear el código, ver si ya se conectó y dejar de compartir.
function EnVivo() {
  const c = useColors();
  const { session } = useAuth();
  const { data, summary, updateSettings } = useStore();
  const red = data.settings.red;
  const userId = session?.user.id ?? null;
  const [estado, setEstado] = useState<EstadoPareja | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  const revisar = useCallback(async () => {
    if (!userId) return;
    try {
      setEstado(await estadoPareja(userId));
    } catch {
      setEstado(null);
    }
  }, [userId]);
  useEffect(() => {
    revisar();
  }, [revisar]);

  if (!userId) return <Muted>Para conectar en vivo necesitas entrar con tu cuenta.</Muted>;
  if (estado === undefined) return <ActivityIndicator color={c.rosa} />;

  const crear = async () => {
    setBusy(true);
    try {
      await crearCodigoPareja(userId, nuevoCodigo(), resumenPareja(data, summary));
      updateSettings({ red: { ...red, enVivo: true } });
      await revisar();
    } catch (e) {
      notify('No se pudo crear el código', (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const parar = async () => {
    if (!(await confirm('¿Dejar de compartir?', 'Tu pareja deja de ver tu resumen en su Savia.', 'Dejar de compartir'))) return;
    try {
      await dejarDeCompartir(userId);
      updateSettings({ red: { ...red, enVivo: false } });
      setEstado(null);
    } catch (e) {
      notify('Sin conexión', (e as Error).message);
    }
  };

  if (estado?.conectada) {
    return (
      <>
        <Body>{`✓ Conectada. ${red.nombre.trim() || 'Tu pareja'} ve tu resumen en su Savia y en su widget, y se actualiza solo.`}</Body>
        <Button kind="danger" label="Dejar de compartir" onPress={parar} />
      </>
    );
  }

  if (estado?.codigo) {
    const codigo = mostrarCodigo(estado.codigo);
    const texto = t(`Te comparto mi Savia 🌸 Descárgala en https://cicloapp.vercel.app, entra con tu cuenta, toca "Acompañar a mi pareja" y escribe este código: ${codigo}`);
    return (
      <>
        <Muted>Tu código (vale 24 horas, sirve una sola vez):</Muted>
        <Text selectable style={{ fontFamily: serif, fontSize: 34, letterSpacing: 3, color: c.text, textAlign: 'center' }}>
          {codigo}
        </Text>
        <Button label="Enviar el código" onPress={() => enviar(texto).catch(() => {})} />
        <Button kind="soft" label="Ya lo escribió: revisar" onPress={revisar} />
        <Button kind="danger" small label="Cancelar el código" onPress={parar} />
      </>
    );
  }

  return (
    <>
      <Body>{INTRO_PAREJA}</Body>
      <Button label={busy ? 'Creando…' : 'Crear código para mi pareja'} disabled={busy} onPress={crear} />
    </>
  );
}

export default function Red() {
  const c = useColors();
  const { pais } = useRegion();
  const { session } = useAuth();
  const { data, summary, updateSettings } = useStore();
  const red = data.settings.red;
  const setRed = (patch: Partial<typeof red>) => updateSettings({ red: { ...red, ...patch } });
  const tarjeta = tarjetaRed(data, summary);
  const quien = red.nombre.trim() || 'tu persona de confianza';
  const vista = vistaPareja(resumenPareja(data, summary), pais);

  const apagar = async (on: boolean) => {
    // Al apagar, si estaba conectada en vivo, se borra lo compartido.
    if (!on && red.enVivo && session) await dejarDeCompartir(session.user.id).catch(() => {});
    setRed(on ? { on } : { on, enVivo: false });
  };

  return (
    <Screen angosta title="Tu red de apoyo" right={<Button small kind="soft" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/perfil'))} />}>
      <Body>{INTRO_RED}</Body>

      <Card>
        <Label>¿Con quién?</Label>
        <TextInput
          value={red.nombre}
          onChangeText={(nombre) => setRed({ nombre })}
          placeholder={t('Nombre de tu pareja o alguien de confianza')}
          placeholderTextColor={c.muted}
          style={{ borderRadius: radius.md, backgroundColor: c.bg, padding: 12, fontSize: 16, color: c.text, fontFamily: fonts.regular }}
        />
        <Toggle label={`Compartir con ${quien}`} hint="Tú eliges qué ve. Nunca tus síntomas, notas, ánimo ni vida íntima." value={red.on} onChange={apagar} />
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
          <Card>
            <Label>📲 En vivo, en su Savia</Label>
            <EnVivo />
          </Card>

          <Text style={{ fontFamily: fonts.bold, fontSize: 11.5, letterSpacing: 1.5, color: c.muted, marginTop: 6 }}>ASÍ LO VERÁ</Text>
          <TarjetaPareja v={vista} previa />

          <Card>
            <Label>💬 O envíale la tarjeta de hoy</Label>
            <Body>{tarjeta.mensaje}</Body>
            <Button kind="soft" label={`Enviar la tarjeta de hoy${red.nombre.trim() ? ` a ${red.nombre.trim()}` : ''}`} onPress={() => enviar(tarjetaTexto(tarjeta)).catch(() => {})} />
            <Muted>La tarjeta la mandas tú cuando quieras (WhatsApp, mensaje, correo).</Muted>
          </Card>
        </>
      )}
    </Screen>
  );
}
