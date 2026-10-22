// Pantalla de inicio de sesión: entrar, crear cuenta o recuperar la contraseña.
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { resetPassword, signIn, signUp } from '../lib/supabase';
import { fonts, radius, serif, useColors } from '../lib/theme';
import { Logo } from './Logo';

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

  const cambiar = (m: Modo) => {
    setModo(m);
    setError(null);
    setAviso(null);
  };

  const enviar = async () => {
    setError(null);
    setAviso(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Escribe un correo válido.');
    if (modo !== 'olvide' && password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');
    if (modo === 'crear' && password !== password2) return setError('Las contraseñas no coinciden.');
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
            <Logo size={96} />
            <Text style={{ fontFamily: serif, fontSize: 38, color: c.text }}>savia</Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 15.5, lineHeight: 22, color: c.muted, textAlign: 'center' }}>
              Registra tu período, entiende tu cuerpo y cuídate a tu ritmo.
            </Text>
          </View>

          <Text style={{ fontFamily: serif, fontSize: 24, color: c.text }}>{TITULOS[modo]}</Text>
          {modo === 'olvide' && (
            <Text style={{ fontFamily: fonts.regular, color: c.muted, fontSize: 14 }}>Escribe tu correo y te enviamos un enlace para crear una contraseña nueva.</Text>
          )}

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Tu correo"
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
                placeholder="Contraseña"
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
              placeholder="Repite la contraseña"
              placeholderTextColor={c.muted}
              secureTextEntry={!verPass}
              autoCapitalize="none"
              autoComplete="new-password"
              accessibilityLabel="Repite la contraseña"
              style={input}
              onSubmitEditing={enviar}
            />
          )}

          {error ? <Text style={{ fontFamily: fonts.medium, color: c.durazno, fontSize: 14 }}>{error}</Text> : null}
          {aviso ? <Text style={{ fontFamily: fonts.medium, color: c.salvia, fontSize: 14 }}>{aviso}</Text> : null}

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
