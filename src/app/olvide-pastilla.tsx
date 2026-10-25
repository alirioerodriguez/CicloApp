// «¿Olvidaste una pastilla?»: unas preguntas cortas y qué hacer según la guía del CDC (2024) y la OMS.
// Orienta, no prescribe: siempre cierra con «tu prospecto manda» y consultar.
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Body, Button, Card, Chip, Label, Muted, Screen } from '../components/ui';
import { CIERRE, GUIA_ESPECIAL, VOMITO, guiaCombinada, guiaProgestageno, tipoDeGuia, type Olvido, type Respuesta, type TipoGuia } from '../lib/olvidoPastilla';
import { useStore } from '../lib/store';
import { useColors } from '../lib/theme';

function Pregunta({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Label>{titulo}</Label>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{children}</View>
    </View>
  );
}

export default function OlvidePastilla() {
  const c = useColors();
  const { data } = useStore();
  const s = data.settings;
  const [tipo, setTipo] = useState<TipoGuia | null>(s.pillMode ? tipoDeGuia(s.pillType) : null);
  const [olvido, setOlvido] = useState<Olvido | null>(null);
  const [semana, setSemana] = useState<1 | 2 | 3 | null>(null);
  const [horas, setHoras] = useState<'menos' | 'mas' | null>(null);
  const [relaciones, setRelaciones] = useState<boolean | null>(null);

  const continua = tipo === 'combinadaContinua';
  const combinada = tipo === 'combinada' || continua;
  // ¿Qué falta preguntar antes de dar la respuesta?
  const faltaSemana = combinada && olvido === 'dosOMas' && !continua && semana === null;
  const faltaRelaciones =
    (combinada && olvido === 'dosOMas' && !continua && semana === 1 && relaciones === null) || (tipo === 'progestageno' && horas === 'mas' && relaciones === null);

  let respuesta: Respuesta | null = null;
  if (tipo === 'especial') respuesta = GUIA_ESPECIAL;
  else if (combinada && olvido && !faltaSemana && !faltaRelaciones) respuesta = guiaCombinada({ olvido, semana: semana ?? undefined, continua, relaciones: relaciones ?? false });
  else if (tipo === 'progestageno' && horas && !faltaRelaciones) respuesta = guiaProgestageno({ masDe3Horas: horas === 'mas', relaciones: relaciones ?? false });

  const reiniciar = () => {
    setOlvido(null);
    setSemana(null);
    setHoras(null);
    setRelaciones(null);
  };

  return (
    <Screen angosta title="¿Olvidaste una pastilla?" right={<Button small kind="soft" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />}>
      <Card>
        <Pregunta titulo="¿Qué pastilla tomas?">
          {(
            [
              ['combinada', 'Combinada, con pausa o placebo'],
              ['combinadaContinua', 'Combinada continua'],
              ['progestageno', 'Solo progestágeno'],
              ['especial', 'Tipo Qlaira (dosis variables)'],
            ] as [TipoGuia, string][]
          ).map(([k, l]) => (
            <Chip
              key={k}
              label={l}
              selected={tipo === k}
              onPress={() => {
                setTipo(k);
                reiniciar();
              }}
            />
          ))}
        </Pregunta>

        {combinada && (
          <Pregunta titulo="¿Qué olvidaste?">
            <Chip label="Una pastilla con hormona" selected={olvido === 'una'} onPress={() => { reiniciar(); setOlvido('una'); }} />
            <Chip label="Dos o más seguidas" selected={olvido === 'dosOMas'} onPress={() => { reiniciar(); setOlvido('dosOMas'); }} />
            {!continua && <Chip label="Un placebo o un día de pausa" selected={olvido === 'placebo'} onPress={() => { reiniciar(); setOlvido('placebo'); }} />}
          </Pregunta>
        )}

        {combinada && olvido === 'dosOMas' && !continua && (
          <Pregunta titulo="¿En qué semana de pastillas con hormona?">
            {([1, 2, 3] as const).map((n) => (
              <Chip key={n} label={n === 3 ? 'Tercera o última' : n === 1 ? 'Primera' : 'Segunda'} selected={semana === n} onPress={() => { setSemana(n); setRelaciones(null); }} />
            ))}
          </Pregunta>
        )}

        {tipo === 'progestageno' && (
          <Pregunta titulo="¿Cuánto pasó de tu hora de siempre?">
            <Chip label="Menos de 3 horas" selected={horas === 'menos'} onPress={() => { setHoras('menos'); setRelaciones(null); }} />
            <Chip label="Más de 3 horas" selected={horas === 'mas'} onPress={() => { setHoras('mas'); setRelaciones(null); }} />
          </Pregunta>
        )}
        {tipo === 'progestageno' && <Muted>Si tu pastilla es de desogestrel, el margen es de 12 horas: revisa tu prospecto.</Muted>}

        {((combinada && olvido === 'dosOMas' && semana === 1) || (tipo === 'progestageno' && horas === 'mas')) && (
          <Pregunta titulo="¿Tuviste relaciones sin protección en los últimos 5 días?">
            <Chip label="Sí" selected={relaciones === true} onPress={() => setRelaciones(true)} />
            <Chip label="No" selected={relaciones === false} onPress={() => setRelaciones(false)} />
          </Pregunta>
        )}

        {!tipo && <Muted>Elige tu pastilla para empezar. Si la cargaste en Perfil, ya aparece elegida.</Muted>}
      </Card>

      {respuesta && (
        <Card tint={c.salviaSuave}>
          <Label>Qué hacer</Label>
          {respuesta.pasos.map((p, i) => (
            <Body key={p}>
              {i + 1}. {p}
            </Body>
          ))}
          {respuesta.aviso && (
            <View style={{ backgroundColor: c.duraznoSuave, borderRadius: 12, padding: 12 }}>
              <Body style={{ fontWeight: '700' }}>{respuesta.aviso}</Body>
            </View>
          )}
          <Muted>{VOMITO}</Muted>
          <Muted style={{ color: c.text }}>{CIERRE}</Muted>
        </Card>
      )}

      <Muted style={{ textAlign: 'center' }}>Fuentes: CDC, U.S. Selected Practice Recommendations for Contraceptive Use (2024) · OMS, Selected practice recommendations for contraceptive use (2016).</Muted>
    </Screen>
  );
}
