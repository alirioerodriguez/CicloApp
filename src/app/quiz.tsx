// "¿Cómo estás de verdad?" (diseño 7b y 7c): bienvenida, 4 preguntas con "No sé", una carga respirando
// y tu flor de hoy con los colores de tus respuestas.
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Flor } from '../components/Flor';
import { Icono } from '../components/Icono';
import { Body, Button, Card, Label, Muted, Screen, tap } from '../components/ui';
import { COLOR_NIVEL, RESULTADOS, idea, nivel, preguntas, type Pregunta, type Respuesta } from '../content/quiz';
import { today } from '../lib/dates';
import { useStore } from '../lib/store';
import { fonts, radius, serif, useColors } from '../lib/theme';

type Paso = 'inicio' | 0 | 1 | 2 | 3 | 'cargando' | 'flor';

export default function Quiz() {
  const c = useColors();
  const { data, update } = useStore();
  const qs = useMemo(() => preguntas(data.settings.etapa), [data.settings.etapa]);
  const [paso, setPaso] = useState<Paso>('inicio');
  const [r, setR] = useState<Partial<Record<Pregunta['k'], Respuesta>>>({});
  const salir = () => (router.canGoBack() ? router.back() : router.replace('/'));

  // La carga dura lo que una respiración larga.
  useEffect(() => {
    if (paso !== 'cargando') return;
    const id = setTimeout(() => setPaso('flor'), 2200);
    return () => clearTimeout(id);
  }, [paso]);

  const res = nivel(qs, r);
  const colores = res.valores.map((v) => (v == null ? c.rosaSuave : COLOR_NIVEL[v]));

  const guardar = () => {
    update((d) => ({ ...d, quiz: { ...d.quiz, [today()]: { nivel: res.nivel, respuestas: r as Record<string, Respuesta> } } }));
    router.replace('/');
  };

  if (paso === 'inicio') {
    return (
      <Screen angosta right={<Button small kind="soft" label="Cerrar" onPress={salir} />}>
        <View style={{ alignItems: 'center', gap: 14, marginTop: 12 }}>
          <Flor colores={[]} abierta={false} size={210} />
          <Text style={{ fontFamily: serif, fontSize: 30, color: c.text, textAlign: 'center' }}>¿Cómo estás de verdad?</Text>
          <Body style={{ textAlign: 'center' }}>4 preguntas, 1 minuto. No hay respuestas buenas ni malas, y siempre puedes decir "No sé".</Body>
        </View>
        <Button label="Empezar" onPress={() => setPaso(0)} />
      </Screen>
    );
  }

  if (paso === 'cargando') {
    return (
      <Screen angosta>
        <View style={{ alignItems: 'center', gap: 14, marginTop: 40 }}>
          <Flor colores={colores} abierta={false} size={210} />
          <Text style={{ fontFamily: serif, fontSize: 24, color: c.text, textAlign: 'center' }}>Inhala… exhala…</Text>
          <Muted>Estamos armando tu flor de hoy.</Muted>
        </View>
      </Screen>
    );
  }

  if (paso === 'flor') {
    const R = RESULTADOS[res.nivel];
    const [ic, tip] = idea(data.settings.etapa, r.pide, res.peor);
    return (
      <Screen angosta right={<Button small kind="soft" label="Cerrar" onPress={salir} />}>
        <View style={{ alignItems: 'center', gap: 10 }}>
          <Flor colores={colores} size={260} />
          <Text style={{ fontFamily: fonts.bold, fontSize: 11.5, letterSpacing: 1.5, color: c.muted }}>TU FLOR DE HOY</Text>
          <Text style={{ fontFamily: serif, fontSize: 28, color: c.text, textAlign: 'center' }}>{R.titulo}</Text>
          <Body style={{ textAlign: 'center' }}>{R.texto}</Body>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {qs.slice(0, 3).map((q, i) => (
              <View key={q.k} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.card, borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 5 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colores[i] }} />
                <Text style={{ fontFamily: fonts.semibold, fontSize: 12.5, color: c.text }}>{q.area}</Text>
              </View>
            ))}
          </View>
        </View>
        <Card tint={c.rosaSuave} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icono e={ic} size={26} />
          <View style={{ flex: 1 }}>
            <Label>Un detalle para ti</Label>
            <Body>{tip}</Body>
          </View>
        </Card>
        <Text style={{ fontFamily: 'Fraunces_400Regular_Italic', fontSize: 19, color: c.text, textAlign: 'center' }}>"{R.frase}"</Text>
        <Button label="Guardar en mi día" onPress={guardar} />
        {res.nivel === 'cuidado' && <Muted style={{ textAlign: 'center' }}>Si sientes que no puedes con esto o piensas en hacerte daño, busca ayuda hoy: habla con tu médica o llama al 911.</Muted>}
      </Screen>
    );
  }

  const q = qs[paso];
  const actual = r[q.k];
  const elegir = (v: Respuesta) => {
    tap();
    setR({ ...r, [q.k]: v });
  };
  const siguiente = () => setPaso(paso < 3 ? ((paso + 1) as Paso) : 'cargando');

  return (
    <Screen angosta right={<Button small kind="soft" label="Cerrar" onPress={salir} />}>
      <View style={{ flexDirection: 'row', gap: 6 }} accessibilityLabel={`Pregunta ${paso + 1} de 4`}>
        {qs.map((_, j) => (
          <View key={j} style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: j <= paso ? c.rosa : c.line }} />
        ))}
      </View>
      <Text style={{ fontFamily: fonts.bold, fontSize: 11.5, letterSpacing: 1.5, color: c.rosa, textTransform: 'uppercase' }}>
        Pregunta {paso + 1} de 4 · {q.kicker}
      </Text>
      <Text style={{ fontFamily: serif, fontSize: 28, lineHeight: 34, color: c.text }}>{q.titulo}</Text>
      <Muted>{q.ayuda}</Muted>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {q.opciones.map(([e, titulo, sub], i) => {
          const on = actual === i;
          return (
            <Pressable
              key={titulo}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => elegir(i)}
              style={({ pressed }) => ({
                flexBasis: '47%',
                flexGrow: 1,
                minHeight: 120,
                padding: 14,
                gap: 6,
                borderRadius: radius.lg,
                borderWidth: on ? 2 : 1,
                borderColor: on ? c.rosa : c.line,
                backgroundColor: on ? c.rosaSuave : c.card,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Icono e={e} size={26} />
              <Text style={{ fontFamily: fonts.bold, fontSize: 15, color: c.text }}>{titulo}</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 17, color: c.muted }}>{sub}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ selected: actual === 'x' }}
        onPress={() => elegir('x')}
        style={{ alignItems: 'center', paddingVertical: 12, borderRadius: radius.pill, borderWidth: 1, borderStyle: 'dashed', borderColor: actual === 'x' ? c.rosa : c.line }}
      >
        <Text style={{ fontFamily: fonts.semibold, color: actual === 'x' ? c.text : c.muted }}>No sé o prefiero no decir</Text>
      </Pressable>

      {actual != null && actual !== 'x' && (
        <Card tint={c.lavandaSuave}>
          <Body>{q.nota}</Body>
        </Card>
      )}

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Button kind="soft" label="Atrás" onPress={() => setPaso(paso === 0 ? 'inicio' : ((paso - 1) as Paso))} />
        </View>
        <View style={{ flex: 2 }}>
          <Button label={paso === 3 ? 'Ver mi flor' : 'Siguiente'} onPress={siguiente} disabled={actual == null} />
        </View>
      </View>
    </Screen>
  );
}
