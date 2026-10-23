// Acompañar a mi pareja: quien la acompaña escribe el código que ella creó en "Tu red de apoyo"
// y desde ahí ve en qué etapa está y qué puede hacer hoy. También alimenta el widget "Tu pareja hoy".
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, TextInput } from 'react-native';
import { TarjetaPareja } from '../components/TarjetaPareja';
import { Body, Button, Card, Label, Muted, Screen, Toggle, confirm } from '../components/ui';
import { useAuth } from '../lib/auth';
import { canjearCodigo, leerResumenPareja, soltarPareja } from '../lib/nube';
import { ensurePermission, rescheduleAll } from '../lib/notifications';
import { guardarPareja, leerParejaGuardada, limpiarCodigo, vistaPareja, type ParejaGuardada, type ResumenPareja } from '../lib/pareja';
import { useStore } from '../lib/store';
import { fonts, radius, useColors } from '../lib/theme';
import { t, useRegion } from '../lib/region';
import { actualizarWidgets } from '../widget/actualizarWidgets';

export default function Acompanar() {
  const c = useColors();
  const { pais } = useRegion();
  const { session } = useAuth();
  const { data, summary, updateSettings } = useStore();
  const solo = data.settings.soloPareja;
  const userId = session?.user.id ?? null;
  const [guardada, setGuardada] = useState<ParejaGuardada | null | undefined>(undefined);
  const [codigo, setCodigo] = useState('');
  const [busy, setBusy] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const guardar = useCallback(
    async (p: ParejaGuardada | null) => {
      await guardarPareja(p);
      setGuardada(p);
      await actualizarWidgets();
      rescheduleAll(data, summary).catch(() => {});
    },
    [data, summary],
  );

  // Al abrir: lo guardado al instante y luego lo último de la nube.
  useEffect(() => {
    let vivo = true;
    (async () => {
      const g = await leerParejaGuardada();
      if (!vivo) return;
      setGuardada(g);
      if (!g || !userId) return;
      try {
        const r = await leerResumenPareja(userId);
        if (!vivo) return;
        if (r === undefined) {
          await guardar(null);
          setAviso('Tu pareja dejó de compartir su resumen contigo.');
        } else await guardar({ ...g, resumen: r as ResumenPareja, leido: new Date().toISOString() });
      } catch {
        // Sin internet: queda lo guardado, que sigue calculando el día correcto.
      }
    })();
    return () => {
      vivo = false;
    };
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const conectar = async () => {
    const c8 = limpiarCodigo(codigo);
    if (c8.length !== 8) return setAviso('El código tiene 8 letras y números.');
    setBusy(true);
    setAviso(null);
    try {
      const r = await canjearCodigo(c8);
      if (!r) return setAviso('Ese código no existe o ya venció. Pídele uno nuevo.');
      await ensurePermission().catch(() => false);
      await guardar({ resumen: r as ResumenPareja, leido: new Date().toISOString(), avisos: true });
      setCodigo('');
    } catch (e) {
      setAviso((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const soltar = async () => {
    if (!(await confirm('¿Dejar de acompañar?', 'Ya no verás su resumen ni su widget. Para volver, ella tendrá que crear un código nuevo.', 'Dejar de acompañar'))) return;
    await soltarPareja().catch(() => {});
    await guardar(null);
  };

  const paraMi = () => {
    updateSettings({ soloPareja: false, onboarded: false });
    router.replace('/onboarding');
  };

  const volver = solo ? undefined : <Button small kind="soft" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/perfil'))} />;

  if (guardada === undefined) {
    return (
      <Screen angosta title="Acompañar a mi pareja">
        <ActivityIndicator color={c.rosa} />
      </Screen>
    );
  }

  if (!guardada) {
    return (
      <Screen angosta title="Acompañar a mi pareja" right={volver}>
        <Body>Pídele a tu pareja que abra Savia, vaya a Perfil › Tu red de apoyo y cree un código. Escríbelo aquí.</Body>
        {!userId ? (
          <Muted>Para conectarte necesitas entrar con una cuenta.</Muted>
        ) : (
          <Card>
            <Label>Su código</Label>
            <TextInput
              value={codigo}
              onChangeText={setCodigo}
              placeholder="ABCD-EFGH"
              placeholderTextColor={c.muted}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={9}
              style={{ borderRadius: radius.md, backgroundColor: c.bg, padding: 14, fontSize: 24, letterSpacing: 3, textAlign: 'center', color: c.text, fontFamily: fonts.bold }}
            />
            <Button label={busy ? 'Conectando…' : 'Conectar'} disabled={busy} onPress={conectar} />
            {aviso && <Body style={{ color: '#D0506A' }}>{aviso}</Body>}
          </Card>
        )}
        <Muted>{t('Solo verás lo que ella elija compartir. Nunca sus síntomas, notas, ánimo ni vida íntima.')}</Muted>
        {solo && <Button kind="ghost" label="Quiero usar Savia para mí también" onPress={paraMi} />}
      </Screen>
    );
  }

  const v = vistaPareja(guardada.resumen, pais);
  return (
    <Screen angosta title="Tu pareja hoy" right={volver}>
      {aviso && <Body>{aviso}</Body>}
      <TarjetaPareja v={v} />
      <Card>
        <Toggle
          label="Aviso diario a las 9:00"
          hint="Con la misión del día"
          value={guardada.avisos}
          onChange={(avisos) => {
            if (avisos) ensurePermission().catch(() => false);
            guardar({ ...guardada, avisos });
          }}
        />
        <Muted>Agrega el widget "Savia · Tu pareja hoy" a tu pantalla de inicio para verlo de un vistazo.</Muted>
      </Card>
      <Button kind="danger" label="Dejar de acompañar" onPress={soltar} />
      {solo && <Button kind="ghost" label="Quiero usar Savia para mí también" onPress={paraMi} />}
    </Screen>
  );
}
