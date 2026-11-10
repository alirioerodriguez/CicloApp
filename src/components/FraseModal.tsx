// Pide una frase para cifrar o abrir un respaldo. Funciona igual en el teléfono y en la web (Alert.prompt no existe en Android).
// Calcular la clave tarda unos segundos: se muestra «Protegiendo…» y no se puede tocar nada mientras tanto.
import { useState } from 'react';
import { Modal, Pressable, TextInput, View } from 'react-native';
import { FRASE_MIN, ErrorCifrado } from '../lib/cifrado';
import { radius, useColors } from '../lib/theme';
import { t } from '../lib/region';
import { Text } from './Texto';
import { Body, Button, Muted } from './ui';

interface Props {
  visible: boolean;
  titulo: string;
  mensaje: string;
  /** Crear una frase nueva: se pide dos veces y se avisa que sin ella no hay forma de recuperar nada. */
  crear?: boolean;
  okLabel: string;
  onCancel: () => void;
  /** Hace el trabajo con la frase. Si tira un error, el mensaje se muestra acá y la ventana sigue abierta. */
  onOk: (frase: string) => Promise<void>;
}

// Solo se monta abierta: así cada vez que se abre arranca con los campos vacíos, sin reiniciarlos en un efecto.
export function FraseModal(props: Props) {
  return props.visible ? <Contenido {...props} /> : null;
}

function Contenido({ titulo, mensaje, crear, okLabel, onCancel, onOk }: Props) {
  const c = useColors();
  const [frase, setFrase] = useState('');
  const [repetida, setRepetida] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [trabajando, setTrabajando] = useState(false);

  const lista = frase.normalize('NFKC').length >= FRASE_MIN && (!crear || frase === repetida);

  const confirmar = async () => {
    if (!lista || trabajando) return;
    setError(null);
    setTrabajando(true);
    try {
      await onOk(frase);
    } catch (e) {
      setTrabajando(false);
      setError(e instanceof ErrorCifrado ? e.message : e instanceof Error ? e.message : String(e));
    }
  };

  const campo = { borderRadius: radius.md, backgroundColor: c.bg, padding: 12, fontSize: 16, color: c.text };
  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => { if (!trabajando) onCancel(); }}>
      <View style={{ flex: 1, backgroundColor: '#0008', justifyContent: 'center', padding: 20 }}>
        <View style={{ backgroundColor: c.card, borderRadius: radius.lg, padding: 20, gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: c.text }}>{t(titulo)}</Text>
          <Muted>{t(mensaje)}</Muted>
          {crear && (
            <View style={{ backgroundColor: c.rosaSuave, borderRadius: radius.md, padding: 12 }}>
              <Body>{t('Si olvidas esta frase, nadie puede recuperar tu respaldo: ni tú ni nosotras. Anótala en un lugar seguro.')}</Body>
            </View>
          )}
          <TextInput
            value={frase}
            onChangeText={setFrase}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!trabajando}
            placeholder={t(`Tu frase (mínimo ${FRASE_MIN} caracteres)`)}
            placeholderTextColor={c.muted}
            style={campo}
            accessibilityLabel={t('Tu frase')}
          />
          {crear && (
            <TextInput
              value={repetida}
              onChangeText={setRepetida}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!trabajando}
              placeholder={t('Repite la frase')}
              placeholderTextColor={c.muted}
              style={campo}
              accessibilityLabel={t('Repite la frase')}
            />
          )}
          {crear && repetida.length > 0 && frase !== repetida && <Muted>{t('Las dos frases no coinciden.')}</Muted>}
          {error && (
            <Text accessibilityRole="alert" style={{ color: '#D0506A', fontSize: 14 }}>
              {t(error)}
            </Text>
          )}
          {trabajando && <Muted>{t('Protegiendo… puede tardar unos segundos.')}</Muted>}
          <Button label={trabajando ? 'Protegiendo…' : okLabel} onPress={confirmar} disabled={!lista || trabajando} />
          <Pressable accessibilityRole="button" onPress={() => !trabajando && onCancel()} style={{ alignItems: 'center', padding: 8 }}>
            <Text style={{ color: c.muted }}>{t('Cancelar')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
