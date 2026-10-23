// Lo que ve la pareja: en qué etapa está ella y qué hacer hoy (misión, plan de cita y comida).
// Se usa en "Acompañar a mi pareja" y como vista previa en "Tu red de apoyo".
import { View } from 'react-native';
import { Text } from './Texto';
import { Body, Card, Label, Muted } from './ui';
import { PRIVACIDAD_PAREJA } from '../content/pareja';
import { longDate } from '../lib/dates';
import { t } from '../lib/region';
import type { VistaPareja } from '../lib/pareja';
import { fonts, serif, useColors } from '../lib/theme';

const ENERGIA = { baja: 'Energía baja', media: 'Energía media', alta: 'Energía alta' } as const;

function Lista({ items }: { items: string[] }) {
  const c = useColors();
  return (
    <View style={{ gap: 6 }}>
      {items.map((x) => (
        <View key={x} style={{ flexDirection: 'row', gap: 8 }}>
          <Text style={{ color: c.rosa, fontFamily: fonts.bold }}>·</Text>
          <Body style={{ flex: 1 }}>{x}</Body>
        </View>
      ))}
    </View>
  );
}

export function TarjetaPareja({ v, previa }: { v: VistaPareja; previa?: boolean }) {
  const c = useColors();
  const p = v.periodo;
  const lineaPeriodo = v.enPeriodo
    ? null
    : p
      ? p.enDias === 0
        ? 'Su período podría llegar en cualquier momento.'
        : p.rango
          ? `Su período podría llegar entre el ${longDate(p.rango[0])} y el ${longDate(p.rango[1])}.`
          : p.enDias === 1
            ? 'Su período llegaría mañana.'
            : `Su período llegaría en ${p.enDias} días (${longDate(p.fecha)}).`
      : null;

  return (
    <View style={{ gap: 14 }}>
      <Card tint={c.rosaSuave}>
        <Text style={{ fontSize: 30 }}>{v.contenido.emoji}</Text>
        <Text style={{ fontFamily: serif, fontSize: 24, lineHeight: 30, color: c.text }}>{v.titulo}</Text>
        {v.dia != null && <Muted>{`Día ${v.dia} de su ciclo`}</Muted>}
        {v.contenido.como && v.fase !== 'general' && <Body>{v.contenido.como}</Body>}
        {lineaPeriodo && <Body>{lineaPeriodo}</Body>}
        {v.energia && (
          <View style={{ alignSelf: 'flex-start', backgroundColor: c.card, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 }}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 13, color: c.text }}>{ENERGIA[v.energia]}</Text>
          </View>
        )}
      </Card>

      {v.mision && (
        <Card>
          <Text style={{ fontFamily: fonts.bold, fontSize: 11.5, letterSpacing: 1.5, color: c.muted }}>TU MISIÓN DE HOY</Text>
          <Text style={{ fontFamily: serif, fontSize: 20, lineHeight: 27, color: c.text }}>{v.mision}</Text>
        </Card>
      )}

      {v.citas.length > 0 && (
        <Card>
          <Label>💞 Ideas de plan</Label>
          <Lista items={v.citas} />
        </Card>
      )}

      {v.platos.length > 0 && (
        <Card>
          <Label>🍽️ Para comer hoy</Label>
          <Lista items={v.platos} />
          {v.ingredientes.length > 0 && (
            <>
              <Muted>Le caen bien estos días:</Muted>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {v.ingredientes.map((a) => (
                  <View key={a.nombre} style={{ backgroundColor: c.bg, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6 }}>
                    <Text style={{ fontSize: 13.5, color: c.text }}>{`${a.emoji} ${t(a.nombre)}`}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
          {v.evitar && <Muted>{v.evitar}</Muted>}
        </Card>
      )}

      {!previa && <Muted style={{ textAlign: 'center' }}>{PRIVACIDAD_PAREJA}</Muted>}
    </View>
  );
}
