// "Resumen" en menopausia (diseño 7l): bochornos por día, puntaje MRS por semana y lo que más registras.
import { router } from 'expo-router';
import { View } from 'react-native';
import { Text } from './Texto';
import { MRS, NIVELES_MRS, bochornosRecientes, diasSinPeriodo, puntajeMrs } from '../content/menopausia';
import { shortDate } from '../lib/dates';
import { useStore } from '../lib/store';
import { fonts, radius, serif, useColors } from '../lib/theme';
import { Button, Card, Columnas, Label, Muted, Screen } from './ui';

export function ResumenMeno() {
  const c = useColors();
  const { data } = useStore();
  const hf = bochornosRecientes(data, 14);
  const conDato = hf.filter((x): x is number => x != null);
  const promedio = conDato.length ? conDato.reduce((a, b) => a + b, 0) / conDato.length : null;
  const semanas = Object.keys(data.mrs).sort().slice(-8);
  const puntajes = semanas.map((s) => ({ semana: s, total: puntajeMrs(data.mrs[s]).total }));
  const ultima = semanas.length ? data.mrs[semanas[semanas.length - 1]] : null;
  const dias = diasSinPeriodo(data);
  const maxHf = Math.max(6, ...conDato);

  // Lo que más registras: los síntomas con más puntaje en la última escala.
  const top = ultima
    ? MRS.map((q, i) => ({ label: q.label, v: Math.max(0, ultima[i]) }))
        .filter((x) => x.v > 0)
        .sort((a, b) => b.v - a.v)
        .slice(0, 4)
    : [];

  const kpis = [
    { v: promedio == null ? '—' : promedio.toFixed(1).replace('.', ','), l: 'bochornos al día' },
    { v: puntajes.length ? String(puntajes[puntajes.length - 1].total) : '—', l: 'puntaje MRS de 44' },
    { v: dias == null ? '—' : String(dias), l: 'días sin período' },
  ];

  return (
    <Screen title="Resumen">
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {kpis.map((k) => (
          <Card key={k.l} style={{ flex: 1, gap: 2, padding: 14 }}>
            <Text style={{ fontFamily: serif, fontSize: 24, color: c.text }}>{k.v}</Text>
            <Muted>{k.l}</Muted>
          </Card>
        ))}
      </View>

      <Columnas
        izquierda={
          <>
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Label style={{ flex: 1 }}>Bochornos por día</Label>
                <Muted>Últimas 2 semanas</Muted>
              </View>
              {conDato.length === 0 ? (
                <Muted>Cuando anotes tus bochornos en Hoy, aparecen aquí.</Muted>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 100 }}>
                  {hf.map((n, i) => (
                    <View
                      key={i}
                      style={{ flex: 1, height: n == null ? 2 : Math.max(4, (n / maxHf) * 100), borderRadius: 4, backgroundColor: n == null ? c.line : i === hf.length - 1 ? c.rosa : '#E9A15F' }}
                    />
                  ))}
                </View>
              )}
            </Card>

            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Label style={{ flex: 1 }}>Puntaje MRS</Label>
                <Muted>Por semana · menos es mejor</Muted>
              </View>
              {puntajes.length === 0 ? (
                <Muted>Responde la escala en "Registro completo de síntomas" para ver tu evolución.</Muted>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 120 }}>
                  {puntajes.map((p, i) => (
                    <View key={p.semana} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                      <Text style={{ fontFamily: fonts.bold, fontSize: 11.5, color: c.text }}>{p.total}</Text>
                      <View style={{ width: '100%', maxWidth: 28, height: Math.max(4, (p.total / 44) * 80), borderRadius: 6, backgroundColor: i === puntajes.length - 1 ? c.rosa : c.rosaSuave }} />
                      <Text style={{ fontFamily: fonts.regular, fontSize: 10, color: c.muted }}>{shortDate(p.semana)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          </>
        }
        derecha={
          <>
            <Card>
              <Label>Lo que más registras</Label>
              {top.length === 0 && <Muted>Todavía no hay síntomas en tu última escala.</Muted>}
              {top.map((x) => (
                <View key={x.label} style={{ gap: 4 }}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={{ flex: 1, fontFamily: fonts.semibold, fontSize: 14, color: c.text }}>{x.label}</Text>
                    <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: c.muted }}>{NIVELES_MRS[x.v]}</Text>
                  </View>
                  <View style={{ height: 6, borderRadius: radius.pill, backgroundColor: c.line }}>
                    <View style={{ width: `${(x.v / 4) * 100}%`, height: 6, borderRadius: radius.pill, backgroundColor: c.rosa }} />
                  </View>
                </View>
              ))}
            </Card>
            <Button kind="soft" label="Controles médicos y tratamiento" onPress={() => router.push('/menopausia')} />
            <Button label="Resumen para tu médica" onPress={() => router.push('/consulta')} />
          </>
        }
      />
    </Screen>
  );
}
