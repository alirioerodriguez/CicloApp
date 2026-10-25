// «Qué sale de tu teléfono»: un esquema simple y honesto de dónde quedan los datos y cómo borrarlos.
// Si cambia algo de lo que se guarda o se comparte (nube.ts, pareja.ts), hay que actualizar esta pantalla.
import { router } from 'expo-router';
import { Linking, View } from 'react-native';
import { Text } from '../components/Texto';
import { Body, Button, Card, Label, Muted, Screen } from '../components/ui';
import { CORREO_RESULTADOS } from '../content/pruebas';
import { nubeConfigurada } from '../lib/nube';
import { useColors } from '../lib/theme';

function Bloque({ emoji, titulo, children, tint }: { emoji: string; titulo: string; children: React.ReactNode; tint?: string }) {
  return (
    <Card tint={tint}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Text style={{ fontSize: 26 }}>{emoji}</Text>
        <Label>{titulo}</Label>
      </View>
      {children}
    </Card>
  );
}

export default function PrivacidadDatos() {
  const c = useColors();
  return (
    <Screen angosta title="Qué sale de tu teléfono" right={<Button small kind="soft" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/perfil'))} />}>
      <Bloque emoji="📱" titulo="En tu teléfono" tint={c.salviaSuave}>
        <Body>Todo lo que registras: período, síntomas, ánimo, notas, sueños, pastillas, embarazo y menopausia. Los recordatorios también se programan aquí.</Body>
      </Bloque>

      {nubeConfigurada && (
        <Bloque emoji="☁️" titulo="Una copia en tu cuenta">
          <Body>Para que no pierdas nada si cambias o pierdes el teléfono, se guarda una copia en tu cuenta, en un servidor de Neon en Estados Unidos.</Body>
          <Body>Solo tu sesión puede leerla. Hoy esa copia todavía no está cifrada con una clave tuya: lo estamos preparando.</Body>
        </Bloque>
      )}

      {nubeConfigurada && (
        <Bloque emoji="💞" titulo="Si compartes con tu pareja" tint={c.lavandaSuave}>
          <Body>Solo si tú lo activas, y solo un resumen: tu nombre, tu etapa y las fechas para calcular la fase del día (o de tu embarazo).</Body>
          <Body>Nunca se comparten tus registros, síntomas, ánimo, notas, intimidad ni tu método anticonceptivo. Puedes dejar de compartir cuando quieras.</Body>
        </Bloque>
      )}

      <Bloque emoji="🚫" titulo="Lo que nunca hacemos" tint={c.rosaSuave}>
        <Body>No vendemos tus datos, no mostramos publicidad y no usamos herramientas de seguimiento ni de análisis de terceros.</Body>
      </Bloque>

      <Bloque emoji="🧹" titulo="Cómo borrarlo">
        <Body>En Perfil, «Borrar todos mis datos» borra lo de este teléfono y, si tienes cuenta, la copia en la nube y lo que compartes con tu pareja.</Body>
        {nubeConfigurada && (
          <>
            <Muted>Si además quieres cerrar la cuenta (tu correo y contraseña), escríbenos y la borramos.</Muted>
            <Button small kind="soft" label="Pedir que borren mi cuenta" onPress={() => Linking.openURL(`mailto:${CORREO_RESULTADOS}?subject=${encodeURIComponent('Savia: borrar mi cuenta')}`)} />
          </>
        )}
      </Bloque>
    </Screen>
  );
}
