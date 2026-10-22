import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { DayMarks } from '../lib/cycle';
import { MONTHS, WEEKDAYS_SHORT, toISO, today } from '../lib/dates';
import { fonts, serif, useColors } from '../lib/theme';
import type { ISODate } from '../lib/types';
import { tap } from './ui';
import { Icono } from './Icono';

interface Props {
  marks?: Record<ISODate, DayMarks>;
  logged?: (date: ISODate) => boolean;
  selected?: ISODate | null;
  maxDate?: ISODate;
  onPress: (date: ISODate) => void;
  initial?: ISODate;
}

export function MonthGrid({ marks = {}, logged, selected, maxDate, onPress, initial }: Props) {
  const c = useColors();
  const t = today();
  const start = initial ?? t;
  const [ym, setYm] = useState({ y: Number(start.slice(0, 4)), m: Number(start.slice(5, 7)) - 1 });

  const first = new Date(ym.y, ym.m, 1, 12);
  const offset = (first.getDay() + 6) % 7; // lunes primero
  const daysInMonth = new Date(ym.y, ym.m + 1, 0).getDate();
  const cells: (ISODate | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => toISO(new Date(ym.y, ym.m, i + 1, 12))),
  ];
  while (cells.length % 7) cells.push(null);

  const move = (n: number) => {
    tap();
    setYm(({ y, m }) => {
      const d = new Date(y, m + n, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };
  const isCurrent = ym.y === Number(t.slice(0, 4)) && ym.m === Number(t.slice(5, 7)) - 1;

  const nav = (txt: string, n: number, label: string) => (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={() => move(n)} hitSlop={10} style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: c.rosaSuave }}>
      <Text style={{ fontSize: 20, color: c.text, marginTop: -2 }}>{txt}</Text>
    </Pressable>
  );

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {nav('‹', -1, 'Mes anterior')}
        <Pressable
          onPress={() => {
            if (!isCurrent) {
              tap();
              setYm({ y: Number(t.slice(0, 4)), m: Number(t.slice(5, 7)) - 1 });
            }
          }}
        >
          <Text style={{ fontFamily: serif, fontSize: 21, color: c.text, textTransform: 'capitalize' }}>
            {MONTHS[ym.m]} {ym.y}
          </Text>
          {!isCurrent && <Text style={{ fontSize: 11, color: c.rosa, textAlign: 'center', fontFamily: fonts.bold }}>volver a hoy</Text>}
        </Pressable>
        {nav('›', 1, 'Mes siguiente')}
      </View>

      <View style={{ flexDirection: 'row' }}>
        {WEEKDAYS_SHORT.map((w, i) => (
          <Text key={i} style={{ flex: 1, textAlign: 'center', fontSize: 12, fontFamily: fonts.bold, color: c.muted }}>
            {w}
          </Text>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((d, i) => {
          if (!d) return <View key={`e${i}`} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} />;
          const mk = marks[d] ?? {};
          const disabled = !!maxDate && d > maxDate;
          const isToday = d === t;
          const isSel = d === selected;
          let bg = 'transparent';
          let fg = c.text;
          let border = 'transparent';
          let dashed = false;
          if (mk.period) {
            bg = c.rosa;
            fg = c.onAccent;
          } else if (mk.predicted) {
            border = c.rosa;
            dashed = true;
          } else if (mk.ovulation) {
            bg = c.durazno;
          } else if (mk.fertile) {
            bg = c.lavandaSuave;
          }
          if (isSel) border = c.text;
          return (
            <View key={d} style={{ width: `${100 / 7}%`, aspectRatio: 1, padding: 3 }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={d}
                disabled={disabled}
                onPress={() => {
                  tap();
                  onPress(d);
                }}
                style={({ pressed }) => ({
                  flex: 1,
                  borderRadius: 999,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: bg,
                  borderWidth: border !== 'transparent' ? 2 : isToday ? 2 : 0,
                  borderStyle: dashed ? 'dashed' : 'solid',
                  borderColor: border !== 'transparent' ? border : c.text,
                  opacity: disabled ? 0.3 : pressed ? 0.6 : 1,
                })}
              >
                <Text style={{ fontSize: 15, color: fg, fontFamily: isToday ? fonts.bold : fonts.medium }}>{Number(d.slice(8))}</Text>
                {logged?.(d) && !mk.period ? <View style={{ position: 'absolute', bottom: 5, width: 4, height: 4, borderRadius: 2, backgroundColor: c.rosa }} /> : null}
                {mk.intimidad ? <View style={{ position: 'absolute', top: 1, right: 1 }}><Icono e="🔥" size={11} color={c.durazno} /></View> : null}
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function Legend({ showFertile }: { showFertile: boolean }) {
  const c = useColors();
  const item = (label: string, style: object) => (
    <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={[{ width: 14, height: 14, borderRadius: 7 }, style]} />
      <Text style={{ fontSize: 12.5, color: c.muted, fontFamily: fonts.regular }}>{label}</Text>
    </View>
  );
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
      {item('Período', { backgroundColor: c.rosa })}
      {item('Estimado', { borderWidth: 2, borderColor: c.rosa, borderStyle: 'dashed' })}
      {showFertile && item('Fértil (est.)', { backgroundColor: c.lavandaSuave, borderWidth: 1, borderColor: c.lavanda })}
      {showFertile && item('Ovulación (est.)', { backgroundColor: c.durazno })}
      {item('Hoy', { borderWidth: 2, borderColor: c.text })}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Icono e="🔥" size={13} color={c.durazno} />
        <Text style={{ fontSize: 12.5, color: c.muted, fontFamily: fonts.regular }}>Intimidad</Text>
      </View>
    </View>
  );
}
