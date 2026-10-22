// Barra flotante mientras la usuaria hace una prueba de la sección "Ayúdanos a mejorar".
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from './Texto';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MISIONES } from '../content/pruebas';
import { useStore } from '../lib/store';
import { fonts, radius, useColors } from '../lib/theme';

export function MisionBanner() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { mision } = useStore();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!mision) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [mision]);
  if (!mision) return null;
  const m = MISIONES.find((x) => x.id === mision.id);
  const secs = Math.max(0, Math.round((now - mision.inicio) / 1000));
  const finish = (ok: boolean) => router.push({ pathname: '/pruebas', params: { fin: mision.id, ok: ok ? '1' : '0', s: String(secs) } });

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', left: 12, right: 12, top: insets.top + 6, alignItems: 'center' }}
    >
      <View style={{ maxWidth: 560, width: '100%', backgroundColor: c.text, borderRadius: radius.md, padding: 12, gap: 8, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, elevation: 6 }}>
        <Text style={{ color: c.bg, fontFamily: fonts.bold, fontSize: 13 }}>
          Prueba en curso · {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}
        </Text>
        <Text style={{ color: c.bg, fontFamily: fonts.regular, fontSize: 13.5 }}>{m?.tarea}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable onPress={() => finish(true)} style={{ flex: 1, backgroundColor: c.rosa, borderRadius: radius.pill, paddingVertical: 8, alignItems: 'center' }}>
            <Text style={{ color: c.onAccent, fontFamily: fonts.bold }}>¡Lo logré!</Text>
          </Pressable>
          <Pressable onPress={() => finish(false)} style={{ flex: 1, borderWidth: 1.5, borderColor: c.bg, borderRadius: radius.pill, paddingVertical: 8, alignItems: 'center' }}>
            <Text style={{ color: c.bg, fontFamily: fonts.bold }}>No pude</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
