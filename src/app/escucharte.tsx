// «Queremos escucharte»: ideas, problemas o lo que quiera contarnos. Llega al panel de Alirio; nada de su ciclo viaja.
import { router } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { Body, Button, Card, Chip, Label, Muted, Screen, notify } from '../components/ui';
import { t } from '../lib/region';
import { armarSugerencia, mandarSugerencia, versionApp, type TipoSugerencia } from '../lib/sugerencia';
import { fonts, radius, useColors } from '../lib/theme';

const TIPOS: { id: TipoSugerencia; label: string; emoji: string }[] = [
  { id: 'idea', label: 'Una idea', emoji: '💡' },
  { id: 'problema', label: 'Algo no anda', emoji: '🛠️' },
  { id: 'otra', label: 'Otra cosa', emoji: '💬' },
];

export default function Escucharte() {
  const c = useColors();
  const [tipo, setTipo] = useState<TipoSugerencia>('idea');
  const [texto, setTexto] = useState('');
  const [mail, setMail] = useState('');
  const [mandando, setMandando] = useState(false);
  const [listo, setListo] = useState(false);
  const volver = () => (router.canGoBack() ? router.back() : router.replace('/perfil'));
  const campo = { borderRadius: radius.md, backgroundColor: c.bg, padding: 12, fontSize: 16, color: c.text, fontFamily: fonts.regular } as const;

  const mandar = async () => {
    const r = armarSugerencia({ tipo, texto, mail, version: versionApp() });
    if ('error' in r) return notify('Falta un poquito', r.error);
    setMandando(true);
    const ok = await mandarSugerencia(r.cuerpo);
    setMandando(false);
    if (!ok) return notify('No se pudo mandar', 'Revisa tu conexión y vuelve a intentarlo. Lo que escribiste sigue acá.');
    setListo(true);
    setTexto('');
  };

  return (
    <Screen angosta title="Queremos escucharte" subtitle="Savia la armamos con lo que nos cuentas" right={<Button small kind="soft" label="Volver" onPress={volver} />}>
      {listo ? (
        <Card>
          <Label>¡Gracias! 🌸</Label>
          <Body>Lo leemos todo. Si dejaste tu mail y hace falta, te escribimos.</Body>
          <Button label="Contar otra cosa" kind="soft" onPress={() => setListo(false)} />
        </Card>
      ) : (
        <Card>
          <Label>¿Qué nos quieres contar?</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {TIPOS.map((x) => (
              <Chip key={x.id} label={x.label} emoji={x.emoji} selected={tipo === x.id} onPress={() => setTipo(x.id)} />
            ))}
          </View>
          <TextInput
            value={texto}
            onChangeText={setTexto}
            multiline
            maxLength={2000}
            placeholder={t(tipo === 'problema' ? 'Qué pasó y en qué pantalla' : 'Escribe acá, como te salga')}
            placeholderTextColor={c.muted}
            style={[campo, { minHeight: 130, textAlignVertical: 'top' }]}
          />
          <TextInput
            value={mail}
            onChangeText={setMail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder={t('Tu mail, si quieres que te respondamos (opcional)')}
            placeholderTextColor={c.muted}
            style={campo}
          />
          <Button label={mandando ? 'Mandando…' : 'Mandar'} disabled={mandando} onPress={mandar} />
          <Muted>Solo viaja lo que escribes acá (y tu mail, si lo pones). Nada de tu ciclo ni de tu salud.</Muted>
        </Card>
      )}
    </Screen>
  );
}
