// "Ayúdanos a mejorar": pruebas de uso hechas por las propias usuarias.
// Nada sale del teléfono hasta que la usuaria decide compartir, y lo compartido no incluye datos de salud.
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, Share, Text, TextInput, View } from 'react-native';
import { Body, Button, Card, Divider, Label, Muted, Screen, confirm, notify, tap } from '../components/ui';
import { CORREO_RESULTADOS, MISIONES, SEQ_EXTREMOS, SEQ_PREGUNTA, SUS, susScore } from '../content/pruebas';
import { longDate, today } from '../lib/dates';
import { useStore } from '../lib/store';
import { fonts, radius, serif, useColors } from '../lib/theme';

function Escala({ n, value, onChange, extremos }: { n: number; value: number; onChange: (v: number) => void; extremos: string[] }) {
  const c = useColors();
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {Array.from({ length: n }, (_, k) => k + 1).map((v) => (
          <Pressable
            key={v}
            accessibilityRole="button"
            accessibilityLabel={String(v)}
            onPress={() => {
              tap();
              onChange(v);
            }}
            style={{ flex: 1, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: value === v ? c.rosa : c.bg, borderWidth: 1, borderColor: c.line }}
          >
            <Text style={{ fontFamily: fonts.bold, color: value === v ? c.onAccent : c.text }}>{v}</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Muted style={{ fontSize: 12 }}>{extremos[0]}</Muted>
        <Muted style={{ fontSize: 12 }}>{extremos[1]}</Muted>
      </View>
    </View>
  );
}

export default function Pruebas() {
  const c = useColors();
  const params = useLocalSearchParams<{ fin?: string; ok?: string; s?: string }>();
  const { data, update, setMision } = useStore();
  const res = data.pruebas;
  const [calificar, setCalificar] = useState<null | { id: string; ok: boolean; segundos: number }>(null);
  const [facilidad, setFacilidad] = useState(0);
  const [comentario, setComentario] = useState('');
  const [idea, setIdea] = useState('');
  const sus = susScore(res.sus);
  const input = { borderRadius: radius.md, backgroundColor: c.bg, padding: 12, fontSize: 15, color: c.text, fontFamily: fonts.regular, minHeight: 70, textAlignVertical: 'top' as const };

  // Al volver de una misión, se pide calificarla.
  useEffect(() => {
    if (params.fin) {
      setMision(null);
      setCalificar({ id: params.fin, ok: params.ok === '1', segundos: Number(params.s ?? 0) });
      setFacilidad(0);
      setComentario('');
    }
  }, [params.fin, params.ok, params.s, setMision]);

  const empezar = (id: string) => {
    setMision({ id, inicio: Date.now() });
    router.replace('/');
  };

  const guardarMision = () => {
    if (!calificar) return;
    const r = { ok: calificar.ok, facilidad, segundos: calificar.segundos, comentario: comentario.trim(), fecha: today() };
    update((d) => ({ ...d, pruebas: { ...d.pruebas, misiones: { ...d.pruebas.misiones, [calificar.id]: r } } }));
    setCalificar(null);
    router.setParams({ fin: undefined, ok: undefined, s: undefined });
  };

  const setSus = (i: number, v: number) =>
    update((d) => {
      const arr = [...d.pruebas.sus];
      while (arr.length < 10) arr.push(0);
      arr[i] = v;
      return { ...d, pruebas: { ...d.pruebas, sus: arr } };
    });

  const informe = () => {
    const lines = [`Resultados de pruebas · Ciclo v1.0 · ${Platform.OS} · ${today()}`, '', 'MISIONES'];
    for (const m of MISIONES) {
      const r = res.misiones[m.id];
      lines.push(r ? `- ${m.titulo}: ${r.ok ? 'lo logró' : 'no pudo'} · ${r.segundos}s · facilidad ${r.facilidad || '—'}/7${r.comentario ? ` · "${r.comentario}"` : ''}` : `- ${m.titulo}: sin hacer`);
    }
    lines.push('', `CUESTIONARIO SUS: ${sus != null ? `${sus}/100` : 'incompleto'}`, `Respuestas: ${res.sus.join(', ') || '—'}`);
    if (res.ideas.length) {
      lines.push('', 'IDEAS Y PROBLEMAS');
      for (const x of res.ideas) lines.push(`- (${x.fecha}) ${x.texto}`);
    }
    lines.push('', 'No incluye datos de salud ni registros del ciclo.');
    return lines.join('\n');
  };

  const compartir = async () => {
    const texto = informe();
    try {
      if (CORREO_RESULTADOS) {
        await Linking.openURL(`mailto:${CORREO_RESULTADOS}?subject=${encodeURIComponent('Pruebas de Ciclo')}&body=${encodeURIComponent(texto)}`);
      } else if (Platform.OS === 'web') {
        if (navigator.share) await navigator.share({ title: 'Pruebas de Ciclo', text: texto });
        else {
          await navigator.clipboard.writeText(texto);
          notify('Copiado', 'Los resultados quedaron copiados. Pégalos donde quieras enviarlos.');
        }
      } else {
        await Share.share({ message: texto, title: 'Pruebas de Ciclo' });
      }
    } catch {
      // La usuaria canceló.
    }
  };

  const hechas = MISIONES.filter((m) => res.misiones[m.id]).length;

  if (calificar) {
    const m = MISIONES.find((x) => x.id === calificar.id);
    return (
      <Screen angosta subtitle="Prueba terminada" title={m?.titulo ?? 'Prueba'}>
        <Card tint={calificar.ok ? c.salviaSuave : c.duraznoSuave}>
          <Body>
            {calificar.ok ? '¡Bien! ' : 'Gracias por intentarlo. '}
            Tardaste {Math.floor(calificar.segundos / 60)}:{String(calificar.segundos % 60).padStart(2, '0')} min.
          </Body>
          {!calificar.ok && <Muted>Que no lo encontraras es justo lo que necesitamos saber para mejorar.</Muted>}
        </Card>
        <Card>
          <Label>{SEQ_PREGUNTA}</Label>
          <Escala n={7} value={facilidad} onChange={setFacilidad} extremos={SEQ_EXTREMOS} />
          <Label>¿Algo que te confundió o que cambiarías? (opcional)</Label>
          <TextInput value={comentario} onChangeText={setComentario} multiline placeholder="Cuéntanos con tus palabras…" placeholderTextColor={c.muted} style={input} />
          <Button label="Guardar" onPress={guardarMision} disabled={!facilidad} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen angosta title="Ayúdanos a mejorar" right={<Button small kind="soft" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/perfil'))} />}>
      <Card tint={c.lavandaSuave}>
        <Text style={{ fontFamily: serif, fontSize: 22, color: c.text }}>🧪 Laboratorio de Ciclo</Text>
        <Body>Haz pruebas cortas para descubrir qué es fácil y qué no. Cada misión empieza en "Hoy": búscala como lo harías normalmente y avísanos si lo lograste.</Body>
        <Muted>Tus resultados se guardan en tu teléfono. Solo salen si tú los compartes, y nunca incluyen datos de tu ciclo.</Muted>
      </Card>

      <Card>
        <Label>
          🎯 Misiones · {hechas} de {MISIONES.length}
        </Label>
        {MISIONES.map((m, i) => {
          const r = res.misiones[m.id];
          return (
            <View key={m.id} style={{ gap: 6 }}>
              {i > 0 && <Divider />}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 20 }}>{r ? (r.ok ? '✅' : '🟠') : '⬜'}</Text>
                <View style={{ flex: 1 }}>
                  <Body style={{ fontWeight: '700' }}>{m.titulo}</Body>
                  <Muted>{m.tarea}</Muted>
                  {r && (
                    <Muted>
                      {r.segundos}s · facilidad {r.facilidad}/7
                    </Muted>
                  )}
                </View>
                <Button small kind={r ? 'ghost' : 'soft'} label={r ? 'Repetir' : 'Empezar'} onPress={() => empezar(m.id)} />
              </View>
            </View>
          );
        })}
      </Card>

      <Card>
        <Label>📝 Cuestionario de 10 preguntas</Label>
        <Muted>Del 1 (muy en desacuerdo) al 5 (muy de acuerdo). Es un cuestionario estándar de facilidad de uso (SUS).</Muted>
        {SUS.map((q, i) => (
          <View key={q} style={{ gap: 6 }}>
            <Body>
              {i + 1}. {q}
            </Body>
            <Escala n={5} value={res.sus[i] ?? 0} onChange={(v) => setSus(i, v)} extremos={['En desacuerdo', 'De acuerdo']} />
          </View>
        ))}
        {sus != null && (
          <Card tint={c.salviaSuave}>
            <Body style={{ fontWeight: '700' }}>Puntaje: {sus} / 100</Body>
            <Muted>{sus >= 80 ? 'Excelente.' : sus >= 68 ? 'Por encima del promedio (68).' : 'Por debajo del promedio: nos ayuda saber qué falló.'}</Muted>
          </Card>
        )}
      </Card>

      <Card>
        <Label>💡 Ideas y problemas</Label>
        <TextInput value={idea} onChangeText={setIdea} multiline placeholder="¿Qué te gustaría que tuviera Ciclo? ¿Algo no funcionó?" placeholderTextColor={c.muted} style={input} />
        <Button
          small
          label="Agregar"
          disabled={!idea.trim()}
          onPress={() => {
            update((d) => ({ ...d, pruebas: { ...d.pruebas, ideas: [...d.pruebas.ideas, { fecha: today(), texto: idea.trim() }] } }));
            setIdea('');
          }}
        />
        {res.ideas.map((x, i) => (
          <Muted key={`${x.fecha}-${i}`}>
            {longDate(x.fecha)}: {x.texto}
          </Muted>
        ))}
      </Card>

      <Button label="📤 Compartir mis resultados" onPress={compartir} disabled={!hechas && !res.sus.length && !res.ideas.length} />
      <Button
        kind="danger"
        small
        label="Borrar resultados de pruebas"
        onPress={async () => {
          if (await confirm('¿Borrar resultados?', 'Se borran misiones, cuestionario e ideas. Tus registros del ciclo no se tocan.', 'Borrar'))
            update((d) => ({ ...d, pruebas: { misiones: {}, sus: [], ideas: [] } }));
        }}
      />
    </Screen>
  );
}
