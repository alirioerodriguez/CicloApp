// "Controles" en modo embarazo (diseño 7f): consultas de la OMS, exámenes, peso y presión, y bolso del hospital.
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { AVISO_PRESION, BOLSO, CONTROLES_OMS, EXAMENES, presionAlta, proximoControl } from '../content/embarazo';
import { shortDate, today } from '../lib/dates';
import { useEmbarazo } from '../lib/embarazo';
import { fonts, useColors } from '../lib/theme';
import { Check } from './Check';
import { Body, Button, Card, Columnas, Label, Muted, Row, Screen, Stepper } from './ui';

export function ControlesEmbarazo() {
  const c = useColors();
  const { semana, datos, hecho, alternar, guardarMedida } = useEmbarazo();
  const proximo = proximoControl(semana);
  const hoy = datos.medidas[today()];
  // Último valor anotado, para que el stepper arranque de algo razonable.
  const historial = Object.entries(datos.medidas).sort(([a], [b]) => a.localeCompare(b));
  const ultimo = (k: 'kg' | 'sys' | 'dia') => [...historial].reverse().find(([, m]) => m[k] != null)?.[1][k] ?? null;
  const pesos = historial.filter(([, m]) => m.kg != null).slice(-8);
  const kgMin = Math.min(...pesos.map(([, m]) => m.kg!)) - 1;
  const kgMax = Math.max(...pesos.map(([, m]) => m.kg!)) + 1;
  const alta = hoy && presionAlta(hoy.sys, hoy.dia);

  return (
    <Screen title="Controles">
      <Body>La OMS recomienda al menos 8 contactos con tu equipo de salud durante el embarazo.</Body>

      <Columnas
        izquierda={
          <>
            <Card style={{ gap: 0 }}>
              <Label>Tus consultas</Label>
              <Muted>Toca para marcar como hecha.</Muted>
              {CONTROLES_OMS.map((ct, i) => {
                const paso = ct.semana < semana;
                const esProximo = ct === proximo;
                return (
                  <Check
                    key={ct.semana}
                    label={`Contacto ${i + 1} · semana ${ct.semana}`}
                    sub={ct.texto}
                    on={hecho(`control:${ct.semana}`)}
                    onPress={() => alternar(`control:${ct.semana}`)}
                    chip={paso ? 'Pasó' : esProximo ? 'Próxima' : `En ${ct.semana - semana} sem`}
                    chipResaltado={esProximo}
                  />
                );
              })}
            </Card>

            <Card style={{ gap: 0 }}>
              <Label>Exámenes y vacunas</Label>
              {EXAMENES.map((x) => (
                <Check key={x.id} label={x.titulo} sub={x.cuando} on={hecho(`examen:${x.id}`)} onPress={() => alternar(`examen:${x.id}`)} chip="Pendiente" />
              ))}
            </Card>
          </>
        }
        derecha={
          <>
            <Card>
              <Label>Tus datos de hoy</Label>
              <Row label="Peso" hint="Antes de desayunar">
                <Stepper
                  value={Math.round((hoy?.kg ?? ultimo('kg') ?? 60) * 10)}
                  onChange={(v) => guardarMedida({ kg: v / 10 })}
                  min={300}
                  max={1800}
                  format={(v) => `${(v / 10).toFixed(1).replace('.', ',')} kg`}
                />
              </Row>
              <Row label="Presión alta" hint="Sistólica">
                <Stepper value={hoy?.sys ?? ultimo('sys') ?? 110} onChange={(sys) => guardarMedida({ sys })} min={70} max={200} />
              </Row>
              <Row label="Presión baja" hint="Diastólica">
                <Stepper value={hoy?.dia ?? ultimo('dia') ?? 70} onChange={(dia) => guardarMedida({ dia })} min={40} max={130} />
              </Row>
              {alta ? <Body style={{ color: c.durazno, fontWeight: '700' }}>{AVISO_PRESION}</Body> : <Muted>Se guarda solo al cambiar un valor. Lo ves también en el modo consulta.</Muted>}
              {pesos.length >= 2 && (
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 90, marginTop: 6 }}>
                  {pesos.map(([f, m]) => (
                    <View key={f} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                      <View style={{ width: '100%', maxWidth: 26, height: Math.max(6, ((m.kg! - kgMin) / (kgMax - kgMin)) * 64), borderRadius: 6, backgroundColor: f === today() ? c.rosa : c.rosaSuave }} />
                      <Text style={{ fontFamily: fonts.regular, fontSize: 10, color: c.muted }}>{shortDate(f)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>

            <Card style={{ gap: 0 }}>
              <Label>Bolso del hospital</Label>
              <Muted>{semana >= 32 ? 'Ya es buen momento para tenerlo listo.' : 'Prepáralo hacia la semana 32.'}</Muted>
              {BOLSO.map((x, i) => (
                <Check key={x} label={x} on={hecho(`bolso:${i}`)} onPress={() => alternar(`bolso:${i}`)} chip="Falta" />
              ))}
            </Card>

            <Button kind="soft" label="Modo consulta médica" onPress={() => router.push('/consulta')} />
          </>
        }
      />
    </Screen>
  );
}
