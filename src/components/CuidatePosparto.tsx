// "Cuídate" en modo posparto (diseño 8f): Edimburgo adaptado, comer dando pecho y alarmas.
import { Pressable, Text, View } from 'react-native';
import {
  ALARMAS_POSPARTO,
  COMER_DANDO_PECHO,
  COMER_POSPARTO,
  EDIMBURGO,
  EDIMBURGO_INTRO,
  MENSAJE_EDIMBURGO,
  lunes,
  nivelEdimburgo,
} from '../content/posparto';
import { useStore } from '../lib/store';
import { fonts, radius, serif, useColors } from '../lib/theme';
import { Body, Card, Columnas, Label, Muted, Screen, tap } from './ui';
import { Icono, IconoBurbuja } from './Icono';

export function CuidatePosparto() {
  const c = useColors();
  const { data, update } = useStore();
  const semana = lunes();
  // -1 = sin responder.
  const resp = data.edimburgo[semana] ?? EDIMBURGO.map(() => -1);
  const completa = resp.every((x) => x >= 0);
  const nivel = nivelEdimburgo(resp.map((x) => Math.max(0, x)));
  // La pregunta de hacerse daño no espera a que termine el resto.
  const mostrar = completa || nivel === 'urgente';
  const responder = (q: number, i: number) => {
    tap();
    update((d) => {
      const actual = d.edimburgo[semana] ?? EDIMBURGO.map(() => -1);
      return { ...d, edimburgo: { ...d.edimburgo, [semana]: actual.map((x, k) => (k === q ? i : x)) } };
    });
  };
  const tint = nivel === 'urgente' ? c.duraznoSuave : nivel === 'cargada' ? c.duraznoSuave : c.salviaSuave;
  const comer = data.settings.posparto.alimentacion === 'formula' ? COMER_POSPARTO : COMER_DANDO_PECHO;

  return (
    <Screen title="Cuídate">
      <Columnas
        izquierda={
          <Card>
            <Text style={{ fontFamily: serif, fontSize: 20, color: c.text }}>¿Cómo está tu corazón esta semana?</Text>
            <Muted>{EDIMBURGO_INTRO}</Muted>
            {EDIMBURGO.map((q, qi) => (
              <View key={q.pregunta} style={{ gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: c.line }}>
                <Body style={{ fontWeight: '600' }}>{q.pregunta}</Body>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {q.opciones.map((o, i) => {
                    const on = resp[qi] === i;
                    return (
                      <Pressable
                        key={o}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: on }}
                        onPress={() => responder(qi, i)}
                        style={({ pressed }) => ({
                          flex: 1,
                          minHeight: 44,
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingHorizontal: 4,
                          paddingVertical: 6,
                          borderRadius: radius.md,
                          borderWidth: on ? 1.5 : 1,
                          borderColor: on ? c.rosa : 'transparent',
                          backgroundColor: on ? c.rosaSuave : c.bg,
                          opacity: pressed ? 0.8 : 1,
                        })}
                      >
                        <Text style={{ fontFamily: fonts.semibold, fontSize: 12.5, color: c.text, textAlign: 'center' }}>{o}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
            {mostrar ? (
              <Card tint={tint} style={{ marginTop: 4 }}>
                <Body style={nivel === 'urgente' ? { fontWeight: '700' } : undefined}>{MENSAJE_EDIMBURGO[nivel]}</Body>
              </Card>
            ) : (
              <Muted>Responde las 4 preguntas. Puedes volver a hacerlo cada semana.</Muted>
            )}
          </Card>
        }
        derecha={
          <>
            <Card>
              <Label>{data.settings.posparto.alimentacion === 'formula' ? 'Comer en tu recuperación' : 'Comer dando pecho'}</Label>
              {comer.map((r, i) => (
                <View key={r.titulo} style={{ flexDirection: 'row', gap: 12, paddingVertical: 6, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
                  <IconoBurbuja e={r.emoji} size={34} />
                  <View style={{ flex: 1 }}>
                    <Body style={{ fontWeight: '700' }}>{r.titulo}</Body>
                    <Muted>{r.texto}</Muted>
                  </View>
                </View>
              ))}
            </Card>

            <Card tint={c.duraznoSuave}>
              <Label>Busca ayuda ya si notas</Label>
              {ALARMAS_POSPARTO.map((a) => (
                <View key={a} style={{ flexDirection: 'row', gap: 10 }}>
                  <Icono e="⚠️" size={18} color={c.text} />
                  <Body style={{ flex: 1 }}>{a}</Body>
                </View>
              ))}
              <Muted>En una emergencia, ve a la emergencia más cercana o llama al 911.</Muted>
            </Card>
          </>
        }
      />
    </Screen>
  );
}
