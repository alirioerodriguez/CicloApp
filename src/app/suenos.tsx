// Diario de sueños: se guarda solo en el teléfono y nunca va en el PDF.
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Body, Button, Card, Chip, Label, Muted, Screen, confirm } from '../components/ui';
import { pick } from '../content/cuidate';
import { FRASES_SIGNO, SIGNOS, TIPOS_SUENO } from '../content/suenos';
import { diffDays, longDate, today } from '../lib/dates';
import { newId, useStore } from '../lib/store';
import { supabaseConfigured } from '../lib/supabase';
import { fonts, radius, serif, useColors } from '../lib/theme';

export default function Suenos() {
  const c = useColors();
  const { data, update, updateSettings } = useStore();
  const [texto, setTexto] = useState('');
  const [tipos, setTipos] = useState<string[]>([]);
  const [pickSigno, setPickSigno] = useState(false);
  const signo = SIGNOS.find((x) => x.id === data.settings.signo);
  const dreams = [...data.dreams].sort((a, b) => (a.date < b.date ? 1 : -1));

  const save = () => {
    if (!texto.trim()) return;
    update((d) => ({ ...d, dreams: [...d.dreams, { id: newId(), date: today(), texto: texto.trim(), tipos }] }));
    setTexto('');
    setTipos([]);
  };

  return (
    <Screen angosta title="Diario de sueños" right={<Button small kind="soft" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/perfil'))} />}>
      <Card tint={c.lavandaSuave}>
        {signo && !pickSigno ? (
          <>
            <Muted style={{ fontWeight: '700', letterSpacing: 1.5 }}>TU SIGNO</Muted>
            <Text style={{ fontFamily: serif, fontSize: 28, color: c.text }}>{signo.nombre}</Text>
            <Muted>
              {signo.rango} · Elemento {signo.elemento}
            </Muted>
            <Body>
              Para tu signo hoy: {pick(FRASES_SIGNO, diffDays(today(), '2024-01-01') + signo.nombre.length)} <Text style={{ color: c.muted }}>(solo por diversión)</Text>
            </Body>
            <Button small kind="ghost" label="Cambiar signo" onPress={() => setPickSigno(true)} />
          </>
        ) : (
          <>
            <Label>¿Cuál es tu signo? (opcional, solo por diversión)</Label>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {SIGNOS.map((s) => (
                <Chip
                  key={s.id}
                  label={s.nombre}
                  selected={data.settings.signo === s.id}
                  onPress={() => {
                    updateSettings({ signo: s.id });
                    setPickSigno(false);
                  }}
                />
              ))}
            </View>
          </>
        )}
      </Card>

      <Card>
        <Label>¿Qué soñaste?</Label>
        <TextInput
          value={texto}
          onChangeText={setTexto}
          placeholder="Escríbelo antes de que se te olvide…"
          placeholderTextColor={c.muted}
          multiline
          style={{ minHeight: 100, color: c.text, fontSize: 15, fontFamily: fonts.regular, textAlignVertical: 'top', backgroundColor: c.bg, borderRadius: radius.md, padding: 12 }}
        />
        <Muted>¿Cómo fue el sueño?</Muted>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {TIPOS_SUENO.map((t) => (
            <Chip
              key={t.id}
              emoji={t.emoji}
              label={t.label}
              color={c.lavanda}
              selected={tipos.includes(t.id)}
              onPress={() => setTipos((x) => (x.includes(t.id) ? x.filter((y) => y !== t.id) : [...x, t.id]))}
            />
          ))}
        </View>
        <Button label="Guardar sueño" onPress={save} disabled={!texto.trim()} />
      </Card>

      <Label>
        Tus sueños · {dreams.length} {dreams.length === 1 ? 'sueño' : 'sueños'}
      </Label>
      {dreams.map((d) => (
        <Card key={d.id}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Muted style={{ flex: 1, textTransform: 'capitalize' }}>{longDate(d.date)}</Muted>
            <Text
              onPress={async () => {
                if (await confirm('¿Borrar este sueño?', d.texto.slice(0, 60), 'Borrar')) update((x) => ({ ...x, dreams: x.dreams.filter((y) => y.id !== d.id) }));
              }}
              style={{ color: c.muted, fontFamily: fonts.medium, fontSize: 12.5 }}
            >
              Borrar
            </Text>
          </View>
          {d.tipos.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {d.tipos.map((id) => {
                const t = TIPOS_SUENO.find((x) => x.id === id);
                return t ? <Chip key={id} emoji={t.emoji} label={t.label} color={c.lavanda} selected /> : null;
              })}
            </View>
          )}
          <Body>{d.texto}</Body>
        </Card>
      ))}
      <Muted style={{ textAlign: 'center' }}>Tus sueños son privados{supabaseConfigured ? ': solo tu cuenta puede verlos' : ' y se guardan solo en tu teléfono'}. Nunca van en el resumen para tu médica.</Muted>
    </Screen>
  );
}
