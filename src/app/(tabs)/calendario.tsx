import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Legend, MonthGrid } from '../../components/MonthGrid';
import { Body, Button, Card, Columnas, Label, Muted, Row, Screen } from '../../components/ui';
import { AVISO_ANTICONCEPTIVO, confianza } from '../../content/textos';
import { calendarMarks } from '../../lib/cycle';
import { longDate, shortDate, today } from '../../lib/dates';
import { useStore } from '../../lib/store';
import { useColors } from '../../lib/theme';

export default function Calendario() {
  const c = useColors();
  const { data, summary: s, togglePeriodDay } = useStore();
  const [editing, setEditing] = useState(false);
  const marks = useMemo(() => calendarMarks(data, s), [data, s]);
  const t = today();

  return (
    <Screen title="Calendario">
      <Columnas
        desde="escritorio"
        izquierda={
          <>
      <Card tint={editing ? c.rosaSuave : undefined}>
        <MonthGrid
          marks={marks}
          logged={(d) => !!data.logs[d]}
          maxDate={editing ? t : undefined}
          onPress={(d) => (editing ? togglePeriodDay(d) : router.push(`/dia/${d}`))}
        />
        <Legend showFertile={!data.settings.pillMode} />
      </Card>

      <Button label={editing ? '✓ Listo' : '🩸 Marcar días de período'} kind={editing ? 'primary' : 'soft'} onPress={() => setEditing((e) => !e)} />
      <Muted style={{ textAlign: 'center' }}>
        {editing ? 'Toca cada día que tuviste sangrado para marcarlo o desmarcarlo.' : 'Toca un día para ver o editar lo que registraste.'}
      </Muted>
          </>
        }
        derecha={
      <Card>
        <Label>Lo que viene</Label>
        {s.nextStart ? (
          <View style={{ gap: 4 }}>
            <Row
              label="Próximo período"
              hint={
                s.ventana
                  ? `Ventana probable: ${shortDate(s.ventana[0])} – ${shortDate(s.ventana[1])}`
                  : s.lateDays > 0 && !data.settings.ocultarRetrasos
                    ? `Atrasado ${s.lateDays} días`
                    : longDate(s.nextStart)
              }
            />
            {s.fertileStart && s.fertileStart >= t && (
              <Row label="Ventana fértil (estimada)" hint={`${shortDate(s.fertileStart)} – ${shortDate(s.fertileEnd!)} · ovulación estimada ${shortDate(s.ovulation!)}`} />
            )}
            <Row label="Ciclo promedio" hint={`${s.avgCycle} días${s.cycleRange ? ` (entre ${s.cycleRange[0]} y ${s.cycleRange[1]})` : ''} · ${confianza(s.cycles.length).toLowerCase()}`} />
          </View>
        ) : (
          <Body>Marca tu último período para ver las predicciones.</Body>
        )}
        {!data.settings.pillMode && (
          <Muted>{AVISO_ANTICONCEPTIVO}</Muted>
        )}
      </Card>
        }
      />
    </Screen>
  );
}
