// Tarjeta del blíster digital (arriba de todo en Hoy). Alvéolos en filas de 7 con la inicial del día,
// como un blíster real. Tocar el de hoy lo marca como tomado; tocar uno pasado permite corregirlo.
import { useRef, useState } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { diaDelBlister, encabezado, estadoDelDia, horaLimite, HORAS_TARDE, type EstadoDia } from '../lib/blister';
import { addDays, diffDays, fromISO, inDays, inicialesSemana, longDate, nowTime, today } from '../lib/dates';
import { useStore } from '../lib/store';
import { fonts, radius, serif, useColors } from '../lib/theme';
import type { BlisterConfig, EstadoToma, ISODate } from '../lib/types';
import { Icono } from './Icono';
import { Text } from './Texto';
import { Body, Button, Card, Chip, Muted, tap } from './ui';

const TAM = 34; // diámetro del alvéolo

const ETIQUETA: Record<EstadoDia, string> = {
  tomada: 'tomada',
  tarde: 'tomada tarde',
  olvidada: 'olvidada',
  pendiente: 'pendiente',
  futura: 'por tomar',
  descanso: 'descanso',
};

function Alveolo({ fecha, numero, estado, placebo, hoy, seleccionado, onPress }: {
  fecha: ISODate;
  numero: number;
  estado: EstadoDia;
  placebo: boolean;
  hoy: boolean;
  seleccionado: boolean;
  onPress: () => void;
}) {
  const c = useColors();
  const escala = useRef(new Animated.Value(1)).current;
  const reventado = estado === 'tomada' || estado === 'tarde';
  const descanso = estado === 'descanso';
  const tocable = !descanso && estado !== 'futura';

  // La pastilla que queda dentro del alvéolo (no se ve si ya se tomó o es descanso).
  const colorPastilla = placebo ? c.lavanda : c.rosa;
  const fondo = descanso ? 'transparent' : estado === 'olvidada' ? c.duraznoSuave : reventado ? c.bg : placebo ? c.lavandaSuave : c.rosaSuave;
  const borde = hoy ? c.text : estado === 'olvidada' ? c.durazno : estado === 'tarde' ? c.durazno : descanso ? c.muted : c.line;

  // "Presionar": el alvéolo se hunde un poco y vuelve, como al reventar el aluminio.
  const presionar = () => {
    Animated.sequence([
      Animated.timing(escala, { toValue: 0.82, duration: 90, useNativeDriver: true }),
      Animated.spring(escala, { toValue: 1, friction: 4, tension: 160, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${placebo ? 'Placebo' : 'Pastilla'} ${numero}, ${longDate(fecha)}, ${ETIQUETA[estado]}`}
      accessibilityState={{ selected: seleccionado, disabled: !tocable }}
      disabled={!tocable}
      onPress={presionar}
      style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }}
    >
      <Animated.View
        style={{
          width: TAM,
          height: TAM,
          borderRadius: TAM / 2,
          backgroundColor: fondo,
          borderWidth: hoy || seleccionado ? 2.5 : 1.5,
          borderColor: seleccionado ? c.rosa : borde,
          borderStyle: descanso ? 'dashed' : 'solid',
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale: escala }],
          opacity: estado === 'futura' ? 0.75 : 1,
        }}
      >
        {!reventado && !descanso && (
          <View style={{ width: TAM - 12, height: TAM - 12, borderRadius: (TAM - 12) / 2, backgroundColor: estado === 'olvidada' ? c.durazno : colorPastilla, opacity: estado === 'olvidada' ? 0.55 : 1 }} />
        )}
        {reventado && <Icono e="✅" size={15} color={estado === 'tarde' ? c.durazno : c.salvia} strokeWidth={2.4} />}
      </Animated.View>
    </Pressable>
  );
}

// Corregir un día pasado (o hoy): a tiempo, tarde, olvidada o quitar el registro.
function Editor({ b, fecha, onCerrar }: { b: BlisterConfig; fecha: ISODate; onCerrar: () => void }) {
  const c = useColors();
  const { data, marcarToma, quitarToma } = useStore();
  const actual = data.tomasPastilla[fecha];
  const elegir = (estado: EstadoToma) => {
    tap();
    // Se conserva la hora real si ya estaba registrada; si no, para hoy se usa la de ahora.
    const hora = estado === 'olvidada' ? null : actual?.hora ?? (fecha === today() ? nowTime() : b.hora);
    marcarToma(fecha, hora, estado);
    onCerrar();
  };
  const opciones: { estado: EstadoToma; label: string }[] = [
    { estado: 'tomada', label: 'La tomé a tiempo' },
    { estado: 'tarde', label: 'La tomé tarde' },
    { estado: 'olvidada', label: 'La olvidé' },
  ];
  return (
    <View style={{ gap: 8, padding: 12, borderRadius: radius.md, backgroundColor: c.bg }}>
      <Body style={{ fontWeight: '600' }}>{longDate(fecha).charAt(0).toUpperCase() + longDate(fecha).slice(1)}</Body>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {opciones.map((o) => (
          <Chip key={o.estado} label={o.label} selected={actual?.estado === o.estado} onPress={() => elegir(o.estado)} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {actual && <Button small kind="ghost" label="Quitar registro" onPress={() => { quitarToma(fecha); onCerrar(); }} />}
        <Button small kind="ghost" label="Cerrar" onPress={onCerrar} />
      </View>
    </View>
  );
}

export function TarjetaBlister() {
  const c = useColors();
  const { data, marcarToma } = useStore();
  const [editando, setEditando] = useState<ISODate | null>(null);
  const b = data.blister;
  if (!data.settings.pillMode || !b) return null;

  const hoy = today();
  const dia = diaDelBlister(b, hoy);
  const enc = encabezado(b, hoy);
  const estadoHoy = estadoDelDia(b, data.tomasPastilla, hoy, hoy);
  const tomaHoy = data.tomasPastilla[hoy];
  const fechas = Array.from({ length: dia.total }, (_, i) => addDays(dia.inicioBlister, i));
  const filas = Array.from({ length: Math.ceil(dia.total / 7) }, (_, f) => fechas.slice(f * 7, f * 7 + 7));
  // Iniciales arriba según el día de la semana en que empezó el blíster (L M M J V S D o M T W T F S S).
  const iniciales = Array.from({ length: 7 }, (_, i) => inicialesSemana()[(fromISO(addDays(dia.inicioBlister, i)).getDay() + 6) % 7]);
  const olvidos = fechas.filter((f) => f < hoy && estadoDelDia(b, data.tomasPastilla, f, hoy) === 'olvidada').length;
  const pasoVentana = estadoHoy === 'pendiente' && Date.now() > horaLimite(b, hoy).getTime();

  const titulo = enc.tipo === 'activa' ? `Pastilla ${enc.n} de ${enc.de}` : enc.tipo === 'placebo' ? `Placebo ${enc.n} de ${enc.de}` : `Descanso ${enc.n} de ${enc.de}`;
  const linea =
    estadoHoy === 'descanso'
      ? 'Hoy no te toca pastilla.'
      : tomaHoy
        ? `${tomaHoy.estado === 'tarde' ? 'Tomada tarde' : tomaHoy.estado === 'olvidada' ? 'Marcada como olvidada' : 'Tomada'}${tomaHoy.hora ? ` a las ${tomaHoy.hora}` : ''}`
        : 'Toca el alvéolo de hoy cuando la tomes.';

  const tocar = (fecha: ISODate) => {
    if (fecha === hoy && !tomaHoy) {
      tap();
      marcarToma(hoy, nowTime());
      setEditando(null);
    } else setEditando(editando === fecha ? null : fecha);
  };

  return (
    <Card style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontFamily: serif, fontSize: 22, color: c.text }}>{titulo}</Text>
          <Muted>{linea}</Muted>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: c.bg, borderRadius: 99, paddingVertical: 5, paddingHorizontal: 10 }}>
          <Icono e="⏰" size={14} color={c.muted} />
          <Text style={{ fontFamily: fonts.semibold, fontSize: 13, color: c.text }}>{b.hora}</Text>
        </View>
      </View>

      <View style={{ backgroundColor: c.bg, borderRadius: radius.lg, paddingVertical: 10, paddingHorizontal: 6, gap: 2 }}>
        <View style={{ flexDirection: 'row' }}>
          {iniciales.map((l, i) => (
            <Text key={i} style={{ flex: 1, textAlign: 'center', fontSize: 11.5, fontFamily: fonts.bold, color: c.muted }}>{l}</Text>
          ))}
        </View>
        {filas.map((fila, fi) => (
          <View key={fi} style={{ flexDirection: 'row' }}>
            {fila.map((f) => {
              const d = diaDelBlister(b, f);
              return (
                <Alveolo
                  key={f}
                  fecha={f}
                  numero={d.numero}
                  estado={estadoDelDia(b, data.tomasPastilla, f, hoy)}
                  placebo={d.alveolo === 'placebo'}
                  hoy={f === hoy}
                  seleccionado={editando === f}
                  onPress={() => tocar(f)}
                />
              );
            })}
            {Array.from({ length: 7 - fila.length }, (_, i) => <View key={`v${i}`} style={{ flex: 1 }} />)}
          </View>
        ))}
      </View>

      {editando && <Editor b={b} fecha={editando} onCerrar={() => setEditando(null)} />}

      {pasoVentana && (
        <Muted>{`Pasaron más de ${HORAS_TARDE[b.tipoPastilla]} horas de tu hora habitual: si la tomas ahora quedará como tomada tarde.`}</Muted>
      )}
      {olvidos > 0 && (
        <View style={{ backgroundColor: c.duraznoSuave, borderRadius: radius.md, padding: 12, gap: 2 }}>
          <Body style={{ fontWeight: '600' }}>{olvidos === 1 ? 'Hay una pastilla sin marcar en este blíster.' : `Hay ${olvidos} pastillas sin marcar en este blíster.`}</Body>
          <Muted style={{ color: c.text }}>Revisa el prospecto o consulta a tu médico. Si sí la tomaste, toca el alvéolo para corregirlo.</Muted>
        </View>
      )}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <Leyenda color={c.rosaSuave} punto={c.rosa} texto="Por tomar" />
        <Leyenda color={c.bg} borde={c.line} icono texto="Tomada" />
        <Leyenda color={c.bg} borde={c.durazno} icono iconoColor={c.durazno} texto="Tarde" />
        <Leyenda color={c.duraznoSuave} punto={c.durazno} texto="Olvidada" />
        {fechas.some((f) => diaDelBlister(b, f).alveolo === 'placebo') && <Leyenda color={c.lavandaSuave} punto={c.lavanda} texto="Placebo" />}
        {fechas.some((f) => diaDelBlister(b, f).alveolo === 'descanso') && <Leyenda color="transparent" borde={c.muted} punteado texto="Sin pastilla" />}
      </View>
      <Muted>{`Blíster nuevo ${inDays(diffDays(dia.siguienteInicio, hoy))}`}</Muted>
    </Card>
  );
}

function Leyenda({ color, punto, borde, punteado, icono, iconoColor, texto }: { color: string; punto?: string; borde?: string; punteado?: boolean; icono?: boolean; iconoColor?: string; texto: string }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: color, borderWidth: borde ? 1.2 : 0, borderColor: borde, borderStyle: punteado ? 'dashed' : 'solid', alignItems: 'center', justifyContent: 'center' }}>
        {punto && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: punto }} />}
        {icono && <Icono e="✅" size={9} color={iconoColor ?? c.salvia} strokeWidth={3} />}
      </View>
      <Text style={{ fontSize: 11.5, color: c.muted, fontFamily: fonts.medium }}>{texto}</Text>
    </View>
  );
}
