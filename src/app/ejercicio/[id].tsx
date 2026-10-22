// Un ejercicio: animación, contador de repeticiones/series y descansos.
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { Figura } from '../../components/Figura';
import { Body, Button, Card, Label, Muted, Screen, tap } from '../../components/ui';
import { ADAPTADO, ADAPTADO_ESPECIAL, NOMBRE_ETAPA } from '../../content/confianza';
import { AVISO_EJERCICIO, ejercicioById } from '../../content/ejercicios';
import { useStore } from '../../lib/store';
import { fonts, radius, serif, useColors } from '../../lib/theme';

const DESCANSO = 20; // segundos entre series

type Estado = 'listo' | 'activo' | 'pausa' | 'descanso' | 'fin';

export default function EjercicioScreen() {
  const c = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const ej = ejercicioById(id ?? '');
  const { data } = useStore();
  const etapa = data.settings.etapa;
  const adaptado = !ej
    ? null
    : etapa === 'especial'
      ? data.settings.condiciones.map((k) => ADAPTADO_ESPECIAL[k]?.[ej.id]).find(Boolean) ?? null
      : ADAPTADO[etapa]?.[ej.id] ?? null;
  const [estado, setEstado] = useState<Estado>('listo');
  const [serie, setSerie] = useState(1);
  const [rep, setRep] = useState(0);
  const [restante, setRestante] = useState(ej?.segundos ?? 0);
  const [descanso, setDescanso] = useState(DESCANSO);
  const key = useRef(0); // reinicia la animación en cada serie

  const porTiempo = !!ej?.segundos;
  const larga = (ej?.segundos ?? 0) > 300; // caminatas: se muestra en minutos

  const terminarSerie = () => {
    if (!ej) return;
    tap();
    if (serie >= ej.series) setEstado('fin');
    else {
      setEstado('descanso');
      setDescanso(DESCANSO);
    }
  };

  // Cuenta regresiva para ejercicios de mantener o por tiempo.
  useEffect(() => {
    if (estado !== 'activo' || !porTiempo) return;
    const t = setInterval(() => setRestante((r) => r - 1), 1000);
    return () => clearInterval(t);
  }, [estado, porTiempo]);
  useEffect(() => {
    if (porTiempo && estado === 'activo' && restante <= 0) terminarSerie();
  }, [restante]); // eslint-disable-line react-hooks/exhaustive-deps

  // Descanso entre series.
  useEffect(() => {
    if (estado !== 'descanso') return;
    const t = setInterval(() => setDescanso((d) => d - 1), 1000);
    return () => clearInterval(t);
  }, [estado]);
  useEffect(() => {
    if (estado === 'descanso' && descanso <= 0) {
      setSerie((s) => s + 1);
      setRep(0);
      setRestante(ej?.segundos ?? 0);
      key.current++;
      setEstado('activo');
    }
  }, [descanso]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ej) {
    return (
      <Screen angosta title="Ejercicio">
        <Body>No encontramos ese ejercicio.</Body>
        <Button label="Volver" onPress={() => router.back()} />
      </Screen>
    );
  }

  const onRep = () => {
    if (porTiempo || estado !== 'activo') return;
    tap();
    setRep((r) => {
      const n = r + 1;
      if (ej.reps && n >= ej.reps) setTimeout(terminarSerie, 300);
      return n;
    });
  };

  const reiniciar = () => {
    setSerie(1);
    setRep(0);
    setRestante(ej.segundos ?? 0);
    key.current++;
    setEstado('listo');
  };

  const fmt = (s: number) => (larga ? `${Math.ceil(s / 60)} min` : `${Math.max(0, s)} s`);
  const contador =
    estado === 'fin'
      ? '¡Lo lograste! 🎉'
      : estado === 'descanso'
        ? `Descansa · ${descanso} s`
        : porTiempo
          ? fmt(restante)
          : `${rep} de ${ej.reps}`;

  return (
    <Screen angosta subtitle={ej.dosis} title={ej.nombre} right={<Button small kind="soft" label="Cerrar" onPress={() => (router.canGoBack() ? router.back() : router.replace('/ejercicios'))} />}>
      <Card style={{ alignItems: 'center', paddingVertical: 10 }}>
        <Figura
          key={key.current}
          a={ej.a}
          b={ej.b}
          bendF={ej.bendF}
          bendB={ej.bendB}
          segundosPorRep={ej.segundosPorRep}
          sostener={ej.sostener && estado === 'activo'}
          frontal={ej.frontal}
          playing={estado !== 'pausa' && estado !== 'descanso' && estado !== 'fin'}
          size={260}
          onRep={onRep}
        />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ backgroundColor: c.rosaSuave, borderRadius: radius.pill, paddingVertical: 6, paddingHorizontal: 14 }}>
            <Text style={{ fontFamily: fonts.bold, color: c.text }}>
              Serie {Math.min(serie, ej.series)} de {ej.series}
            </Text>
          </View>
        </View>
        <Text style={{ fontFamily: serif, fontSize: 38, color: c.text, marginTop: 6 }}>{estado === 'listo' ? ej.dosis.split('·')[0].trim() : contador}</Text>
        {estado === 'listo' && <Muted>Mira el movimiento y toca empezar cuando estés lista.</Muted>}
      </Card>

      {estado === 'listo' && <Button label="▶ Empezar" onPress={() => setEstado('activo')} />}
      {estado === 'activo' && (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Button kind="soft" label="⏸ Pausa" onPress={() => setEstado('pausa')} />
          </View>
          <View style={{ flex: 1 }}>
            <Button kind="ghost" label="Terminé la serie" onPress={terminarSerie} />
          </View>
        </View>
      )}
      {estado === 'pausa' && <Button label="▶ Seguir" onPress={() => setEstado('activo')} />}
      {estado === 'descanso' && <Button kind="soft" label="Saltar descanso" onPress={() => setDescanso(0)} />}
      {estado === 'fin' && (
        <View style={{ gap: 10 }}>
          <Button label="Listo 💗" onPress={() => (router.canGoBack() ? router.back() : router.replace('/ejercicios'))} />
          <Button kind="ghost" label="Repetir" onPress={reiniciar} />
        </View>
      )}

      <Card>
        <Label>Cómo hacerlo</Label>
        {ej.pasos.map((p, i) => (
          <Body key={p}>
            {i + 1}. {p}
          </Body>
        ))}
        {ej.ojo ? <Muted>👀 {ej.ojo}</Muted> : null}
      </Card>
      {adaptado && (
        <Card tint={c.lavandaSuave}>
          <Label>Adaptado a ti · {NOMBRE_ETAPA[etapa]}</Label>
          <Body>{adaptado}</Body>
        </Card>
      )}
      <Card tint={c.salviaSuave}>
        <Label>Por qué ayuda</Label>
        <Body>{ej.porque}</Body>
      </Card>
      <Muted style={{ textAlign: 'center' }}>{AVISO_EJERCICIO}</Muted>
    </Screen>
  );
}
