// "Cuándo consultar": señales de alerta, rangos normales, qué alivia, mitos y fuentes.
// Lo urgente y la ayuda en crisis se ven siempre; el resto se recorre tocando (preguntas, tarjetas de mitos, barras de evidencia).
import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, Share, View } from 'react-native';
import { Text } from '../components/Texto';
import { Body, Button, Card, Label, Muted, Screen, notify, tap } from '../components/ui';
import { FUENTES } from '../content/fuentes';
import { ALIVIO, CRISIS, MITOS, NO_DISPOSITIVO, PASTILLA_OLVIDO, RANGOS_NOTA, RANGOS_PREGUNTAS, SPM, URGENTE, URGENTE_COMBINADA } from '../content/info';
import { RESTA_EFECTO } from '../content/pastillas';
import { PILL_PACKS } from '../lib/cycle';
import { t } from '../lib/region';
import { useStore } from '../lib/store';
import { fonts, radius, useColors } from '../lib/theme';

function List({ items }: { items: string[] }) {
  return (
    <>
      {items.map((x) => (
        <Body key={x}>• {x}</Body>
      ))}
    </>
  );
}

/** Pregunta que se toca: se marca y despliega la explicación. */
function Pregunta({ pregunta, detalle, on, onPress }: { pregunta: string; detalle: string; on: boolean; onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: on }}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => ({ borderRadius: radius.md, borderWidth: 1.5, borderColor: on ? c.rosa : c.line, backgroundColor: on ? c.rosaSuave : 'transparent', padding: 12, gap: 6, opacity: pressed ? 0.75 : 1 })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Text style={{ flex: 1, fontFamily: fonts.semibold, fontSize: 15, color: c.text }}>{pregunta}</Text>
        <Text style={{ fontFamily: fonts.bold, fontSize: 13, color: on ? c.rosa : c.muted }}>{on ? 'Sí' : '›'}</Text>
      </View>
      {on && <Muted>{detalle}</Muted>}
    </Pressable>
  );
}

/** Tarjeta de mito que se da vuelta al tocarla. El texto viene como "mito: respuesta". */
function Mito({ texto }: { texto: string }) {
  const c = useColors();
  const [vuelta, setVuelta] = useState(false);
  const traducido = t(texto);
  const i = traducido.indexOf(': ');
  const frente = i > 0 ? traducido.slice(0, i) : traducido;
  const resto = i > 0 ? traducido.slice(i + 2) : '';
  const dorso = resto.charAt(0).toUpperCase() + resto.slice(1);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={t('Toca para ver la respuesta')}
      onPress={() => {
        tap();
        setVuelta((v) => !v);
      }}
      style={({ pressed }) => ({ borderRadius: radius.md, padding: 14, minHeight: 88, justifyContent: 'center', gap: 4, backgroundColor: vuelta ? c.salviaSuave : c.lavandaSuave, opacity: pressed ? 0.8 : 1 })}
    >
      <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: c.muted, textTransform: 'uppercase' }}>{vuelta ? 'Lo que dice la evidencia' : 'Mito'}</Text>
      {vuelta && dorso ? <Text style={{ fontSize: 13, color: c.muted }}>{frente}</Text> : null}
      <Text style={{ fontFamily: fonts.semibold, fontSize: 15, color: c.text, lineHeight: 21 }}>{vuelta ? dorso || frente : frente}</Text>
      {!vuelta && <Text style={{ fontSize: 12, color: c.rosa, fontFamily: fonts.semibold }}>Toca para ver la respuesta</Text>}
    </Pressable>
  );
}

/** Barra de 3 tramos: cuánta evidencia hay. */
function Evidencia({ nivel }: { nivel: 1 | 2 | 3 }) {
  const c = useColors();
  return (
    <View accessibilityLabel={t(nivel === 3 ? 'Evidencia moderada' : nivel === 2 ? 'Evidencia baja pero consistente' : 'Evidencia limitada')} style={{ flexDirection: 'row', gap: 3 }}>
      {[1, 2, 3].map((k) => (
        <View key={k} style={{ width: 18, height: 6, borderRadius: 3, backgroundColor: k <= nivel ? c.salvia : c.line }} />
      ))}
    </View>
  );
}

export default function Info() {
  const c = useColors();
  const { data } = useStore();
  const [fuentes, setFuentes] = useState(false);
  const [marcadas, setMarcadas] = useState<number[]>([]);
  const [spm, setSpm] = useState(false);
  const pill = data.settings.pillMode;
  const combinada = pill && !PILL_PACKS[data.settings.pillType].soloProgestageno;
  const alternar = (i: number) => setMarcadas((m) => (m.includes(i) ? m.filter((x) => x !== i) : [...m, i]));

  const compartir = async () => {
    const lista = marcadas.map((i) => `• ${t(RANGOS_PREGUNTAS[i].pregunta)}`).join('\n');
    try {
      await Share.share({ message: `${t('Para comentar en mi consulta')}:\n${lista}` });
    } catch {
      notify(t('No se pudo compartir'), lista);
    }
  };

  return (
    <Screen angosta title="Cuándo consultar" right={<Button small kind="soft" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/cuidate'))} />}>
      <Card tint={c.rosaSuave}>
        <Label>Busca atención hoy</Label>
        <List items={combinada ? [...URGENTE, URGENTE_COMBINADA] : URGENTE} />
      </Card>

      <Card>
        <Label>¿Te pasa algo de esto?</Label>
        <Muted>Tócalo y te explicamos. Lo que marques queda listo para comentarlo en tu consulta.</Muted>
        <View style={{ gap: 8 }}>
          {RANGOS_PREGUNTAS.map((r, i) => (
            <Pregunta key={r.pregunta} pregunta={r.pregunta} detalle={r.detalle} on={marcadas.includes(i)} onPress={() => alternar(i)} />
          ))}
        </View>
        <Muted>{RANGOS_NOTA}</Muted>
        {marcadas.length > 0 && (
          <View style={{ gap: 6, padding: 12, borderRadius: radius.md, backgroundColor: c.salviaSuave }}>
            <Body style={{ fontWeight: '700' }}>Para comentar en tu consulta</Body>
            {marcadas.map((i) => (
              <Body key={i}>• {RANGOS_PREGUNTAS[i].pregunta}</Body>
            ))}
            <Button small kind="soft" label="Compartir la lista" onPress={compartir} />
          </View>
        )}
      </Card>

      <Card tint={c.lavandaSuave}>
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: spm }} onPress={() => setSpm((v) => !v)} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Label>SPM y TDPM</Label>
          </View>
          <Text style={{ fontFamily: fonts.semibold, color: c.rosa }}>{spm ? 'Ocultar' : '¿Qué es?'}</Text>
        </Pressable>
        {spm && <Body>{SPM}</Body>}
        <Body style={{ fontWeight: '700' }}>{CRISIS}</Body>
      </Card>

      <Card tint={c.salviaSuave}>
        <Label>Qué alivia los cólicos (sin medicamentos)</Label>
        <Muted>La barra muestra cuánta evidencia hay.</Muted>
        {ALIVIO.map((a) => (
          <View key={a.medida} style={{ gap: 4, paddingVertical: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Body style={{ flex: 1, fontWeight: '700' }}>{a.medida}</Body>
              <Evidencia nivel={a.nivel} />
            </View>
            <Muted>{a.evidencia}</Muted>
          </View>
        ))}
      </Card>

      <Card>
        <Label>¿Mito o realidad?</Label>
        <Muted>Toca cada tarjeta para ver la respuesta.</Muted>
        <View style={{ gap: 8 }}>
          {MITOS.map((m) => (
            <Mito key={m} texto={m} />
          ))}
        </View>
      </Card>

      {pill && (
        <Card tint={c.duraznoSuave}>
          <Label>Sobre tu pastilla</Label>
          <Body>{RESTA_EFECTO}</Body>
          <Body>{PASTILLA_OLVIDO}</Body>
          <Button small kind="soft" label="¿Olvidaste una pastilla? Guía rápida" onPress={() => router.push('/olvide-pastilla')} />
        </Card>
      )}

      <Muted>{NO_DISPOSITIVO}</Muted>

      <Button kind="ghost" small label={fuentes ? 'Ocultar fuentes' : `Ver las ${FUENTES.length} fuentes`} onPress={() => setFuentes((v) => !v)} />
      {fuentes && (
        <Card>
          {FUENTES.map((f, i) => (
            <Text
              key={f.titulo}
              onPress={f.url ? () => Linking.openURL(f.url!) : undefined}
              style={{ fontSize: 13, lineHeight: 18, color: f.url ? c.rosa : c.muted }}
            >
              {i + 1}. {f.titulo}
            </Text>
          ))}
        </Card>
      )}
    </Screen>
  );
}
