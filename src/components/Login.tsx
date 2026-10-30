// Pantalla de inicio de sesión: entrar, crear cuenta o recuperar la contraseña.
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, TextInput, View } from 'react-native';
import { Text } from './Texto';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { googleDisponible, resetPassword, signIn, signInGoogle, signUp } from '../lib/nube';
import { fonts, radius, serif, useColors } from '../lib/theme';
import Svg, { Path } from 'react-native-svg';
import { Logo } from './Logo';
import { t } from '../lib/region';

type Modo = 'entrar' | 'crear' | 'olvide';

const TITULOS: Record<Modo, string> = { entrar: 'Entrar', crear: 'Crear cuenta', olvide: 'Recuperar contraseña' };

export function Login() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const [modo, setModo] = useState<Modo>('entrar');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [verPass, setVerPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  // Consentimiento explícito para datos de salud (sensibles en MX, CO y AR): apagado hasta que ella lo prenda.
  const [acepto, setAcepto] = useState(false);
  const FALTA_ACEPTAR = 'Para crear la cuenta necesitas aceptar cómo cuidamos tus datos de salud.';

  const cambiar = (m: Modo) => {
    setModo(m);
    setError(null);
    setAviso(null);
  };

  const enviar = async () => {
    setError(null);
    setAviso(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Escribe un correo válido.');
    if (modo !== 'olvide' && password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.');
    if (modo === 'crear' && password !== password2) return setError('Las contraseñas no coinciden.');
    if (modo === 'crear' && !acepto) return setError(FALTA_ACEPTAR);
    setBusy(true);
    try {
      if (modo === 'entrar') await signIn(email, password);
      else if (modo === 'crear') {
        const lista = await signUp(email, password);
        if (!lista) {
          setAviso('¡Listo! Te enviamos un correo para confirmar tu cuenta. Ábrelo y después entra aquí.');
          setModo('entrar');
        }
      } else {
        await resetPassword(email);
        setAviso('Si existe una cuenta con ese correo, te llegará un enlace para crear una contraseña nueva.');
        setModo('entrar');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const input = {
    borderRadius: radius.md,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.line,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: c.text,
    fontFamily: fonts.regular,
  };
  const link = (label: string, m: Modo) => (
    <Pressable accessibilityRole="button" onPress={() => cambiar(m)} hitSlop={8}>
      <Text style={{ fontFamily: fonts.semibold, color: c.rosa, fontSize: 14.5 }}>{label}</Text>
    </Pressable>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, paddingHorizontal: 24 }}
      >
        <View style={{ maxWidth: 420, width: '100%', alignSelf: 'center', gap: 14 }}>
          <View style={{ alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Logo size={96} animated />
            <Text style={{ fontFamily: serif, fontSize: 38, color: c.text }}>savia</Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 15.5, lineHeight: 22, color: c.muted, textAlign: 'center' }}>
              Registra tu período, entiende tu cuerpo y cuídate a tu ritmo.
            </Text>
          </View>

          {googleDisponible && modo !== 'olvide' && (
            <>
              <Pressable
                accessibilityRole="button"
                onPress={async () => {
                  setError(null);
                  if (modo === 'crear' && !acepto) return setError(FALTA_ACEPTAR);
                  try {
                    await signInGoogle();
                  } catch (e) {
                    setError(e instanceof Error ? e.message : String(e));
                  }
                }}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  paddingVertical: 14,
                  borderRadius: radius.pill,
                  borderWidth: 1,
                  borderColor: c.line,
                  backgroundColor: c.card,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <LogoGoogle />
                <Text style={{ fontFamily: fonts.bold, fontSize: 15.5, color: c.text }}>Continuar con Google</Text>
              </Pressable>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: c.line }} />
                <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: c.muted }}>o con tu correo</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: c.line }} />
              </View>
            </>
          )}

          <Text style={{ fontFamily: serif, fontSize: 24, color: c.text }}>{TITULOS[modo]}</Text>
          {modo === 'olvide' && (
            <Text style={{ fontFamily: fonts.regular, color: c.muted, fontSize: 14 }}>Escribe tu correo y te enviamos un enlace para crear una contraseña nueva.</Text>
          )}

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder={t('Tu correo')}
            placeholderTextColor={c.muted}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            accessibilityLabel="Correo"
            style={input}
          />
          {modo !== 'olvide' && (
            <View>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder={t('Contraseña')}
                placeholderTextColor={c.muted}
                secureTextEntry={!verPass}
                autoCapitalize="none"
                autoComplete={modo === 'crear' ? 'new-password' : 'current-password'}
                textContentType={modo === 'crear' ? 'newPassword' : 'password'}
                accessibilityLabel="Contraseña"
                style={[input, { paddingRight: 70 }]}
                onSubmitEditing={modo === 'entrar' ? enviar : undefined}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={verPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onPress={() => setVerPass((v) => !v)}
                style={{ position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' }}
              >
                <Text style={{ fontFamily: fonts.semibold, color: c.muted, fontSize: 13 }}>{verPass ? 'Ocultar' : 'Ver'}</Text>
              </Pressable>
            </View>
          )}
          {modo === 'crear' && (
            <TextInput
              value={password2}
              onChangeText={setPassword2}
              placeholder={t('Repite la contraseña')}
              placeholderTextColor={c.muted}
              secureTextEntry={!verPass}
              autoCapitalize="none"
              autoComplete="new-password"
              accessibilityLabel="Repite la contraseña"
              style={input}
              onSubmitEditing={enviar}
            />
          )}

          {modo === 'crear' && (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: c.card, borderRadius: radius.md, padding: 12, borderWidth: 1, borderColor: c.line }}>
              <Switch value={acepto} onValueChange={setAcepto} trackColor={{ true: c.rosa, false: c.line }} thumbColor="#fff" accessibilityLabel={t('Acepto cómo se cuidan mis datos de salud')} />
              <Text style={{ flex: 1, fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 19, color: c.text }}>
                Acepto que Savia guarde mis datos de salud (ciclo, síntomas, embarazo) en este teléfono y una copia en mi cuenta, en un servidor en Estados Unidos, para no perderlos. No se venden ni se usan para publicidad, y puedo borrarlos cuando quiera desde Perfil.
              </Text>
            </View>
          )}

          {error ? <Text style={{ fontFamily: fonts.medium, color: c.duraznoTexto, fontSize: 14 }}>{error}</Text> : null}
          {aviso ? <Text style={{ fontFamily: fonts.medium, color: c.salviaTexto, fontSize: 14 }}>{aviso}</Text> : null}

          <Pressable
            accessibilityRole="button"
            onPress={enviar}
            disabled={busy}
            style={({ pressed }) => ({
              backgroundColor: c.rosa,
              borderRadius: radius.pill,
              paddingVertical: 15,
              alignItems: 'center',
              opacity: pressed || busy ? 0.75 : 1,
              marginTop: 4,
            })}
          >
            {busy ? (
              <ActivityIndicator color={c.onAccent} />
            ) : (
              <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: c.onAccent }}>
                {modo === 'entrar' ? 'Entrar' : modo === 'crear' ? 'Crear mi cuenta' : 'Enviar enlace'}
              </Text>
            )}
          </Pressable>

          <View style={{ alignItems: 'center', gap: 12, marginTop: 4 }}>
            {modo === 'entrar' && link('¿Olvidaste tu contraseña?', 'olvide')}
            {modo === 'entrar' ? (
              <Text style={{ fontFamily: fonts.regular, color: c.muted, fontSize: 14.5 }}>
                ¿No tienes cuenta? <Text onPress={() => cambiar('crear')} style={{ fontFamily: fonts.semibold, color: c.rosa }}>Crear cuenta</Text>
              </Text>
            ) : (
              link('Ya tengo cuenta: entrar', 'entrar')
            )}
          </View>

          <Text style={{ fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 18, color: c.muted, textAlign: 'center', marginTop: 10 }}>
            Tus registros son privados: solo tu cuenta puede verlos. Nunca los vendemos ni los usamos para publicidad.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// La "G" de Google con sus colores oficiales (marca de terceros: no se recolorea).
function LogoGoogle() {
  return (
    <Svg width={18} height={18} viewBox="0 0 48 48">
      <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </Svg>
  );
}
