// Modo consulta médica (diseño 8i): tarjeta clara para mostrar en la consulta y exportar el historial.
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Share, View } from 'react-native';
import { Text } from './Texto';
import { AnimoEnPdf } from './AnimoEnPdf';
import { PreguntasConsulta } from './PreguntasConsulta';
import { exportBackup, exportCsv, shareReport } from '../lib/backup';
import { consulta, consultaTexto } from '../lib/consulta';
import { useStore } from '../lib/store';
import { fonts, radius, serif } from '../lib/theme';
import { Body, Button, Card, Chip, Columnas, Label, Muted, Screen, notify } from './ui';

// La tarjeta es siempre clara, también en modo Noche: se lee mejor al mostrarla a la médica.
const PAPEL = { bg: '#FFFFFF', text: '#2A1E28', muted: '#7A6873', line: '#EFE6EA', barra: '#C24E7A', acento: '#B8325C' };

async function compartirTexto(texto: string) {
  if (Platform.OS === 'web') {
    if (typeof navigator !== 'undefined' && navigator.share) return navigator.share({ title: 'Resumen para mi consulta', text: texto });
    await navigator.clipboard?.writeText(texto);
    return notify('Copiado', 'El resumen quedó copiado. Pégalo en WhatsApp o en un correo.');
  }
  await Share.share({ message: texto, title: 'Resumen para mi consulta' });
}

export function ConsultaMedica({ enPestana }: { enPestana?: boolean }) {
  const { data, summary } = useStore();
  const [meses, setMeses] = useState<3 | 6>(3);
  const r = useMemo(() => consulta(data, summary, meses), [data, summary, meses]);
  const fallo = (titulo: string) => (e: unknown) => notify(titulo, e instanceof Error ? e.message : String(e));

  return (
    <Screen
      title="Modo consulta"
      subtitle="Muéstraselo a tu médica en 30 segundos"
      right={enPestana ? undefined : <Button small kind="soft" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/estadisticas'))} />}
    >
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Chip label="3 meses" selected={meses === 3} onPress={() => setMeses(3)} />
        <Chip label="6 meses" selected={meses === 6} onPress={() => setMeses(6)} />
      </View>

      <Columnas
        izquierda={
          <View style={{ backgroundColor: PAPEL.bg, borderRadius: radius.lg, padding: 18, gap: 14 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', columnGap: 10 }}>
              <Text style={{ fontFamily: serif, fontSize: 22, color: PAPEL.text }}>{r.quien}</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 12.5, color: PAPEL.muted }}>{r.modo}</Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              {r.kpis.map((k) => (
                <View key={k.label} style={{ flex: 1, backgroundColor: '#F7F1F4', borderRadius: radius.md, padding: 10, gap: 2 }}>
                  <Text style={{ fontFamily: serif, fontSize: 22, color: PAPEL.text }}>{k.valor}</Text>
                  <Text style={{ fontFamily: fonts.regular, fontSize: 11.5, color: PAPEL.muted }}>{k.label}</Text>
                </View>
              ))}
            </View>

            <View style={{ gap: 8 }}>
              <Text style={{ fontFamily: fonts.bold, fontSize: 11.5, letterSpacing: 1.5, color: PAPEL.muted }}>LO MÁS FRECUENTE</Text>
              {r.frecuentes.length === 0 && <Text style={{ fontFamily: fonts.regular, color: PAPEL.muted }}>Nada registrado en este período.</Text>}
              {r.frecuentes.map((f) => (
                <View key={f.label} style={{ gap: 4 }}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={{ flex: 1, fontFamily: fonts.medium, fontSize: 14, color: PAPEL.text }}>{f.label}</Text>
                    <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: PAPEL.muted }}>{f.nivel}</Text>
                  </View>
                  <View style={{ height: 5, borderRadius: 3, backgroundColor: PAPEL.line }}>
                    <View style={{ width: `${Math.max(4, Math.round(f.pct * 100))}%`, height: 5, borderRadius: 3, backgroundColor: PAPEL.barra }} />
                  </View>
                </View>
              ))}
            </View>

            <View style={{ gap: 6 }}>
              <Text style={{ fontFamily: fonts.bold, fontSize: 11.5, letterSpacing: 1.5, color: PAPEL.acento }}>PARA CONVERSAR</Text>
              {r.conversar.map((x) => (
                <View key={x} style={{ flexDirection: 'row', gap: 8 }}>
                  <Text style={{ color: PAPEL.text }}>•</Text>
                  <Text style={{ flex: 1, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: PAPEL.text }}>{x}</Text>
                </View>
              ))}
            </View>
            {r.preguntas.length > 0 && (
              <View style={{ gap: 6 }}>
                <Text style={{ fontFamily: fonts.bold, fontSize: 11.5, letterSpacing: 1.5, color: PAPEL.acento }}>MIS PREGUNTAS</Text>
                {r.preguntas.map((x) => (
                  <View key={x} style={{ flexDirection: 'row', gap: 8 }}>
                    <Text style={{ color: PAPEL.text }}>?</Text>
                    <Text style={{ flex: 1, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: PAPEL.text }}>{x}</Text>
                  </View>
                ))}
              </View>
            )}
            <Text style={{ fontFamily: fonts.regular, fontSize: 11.5, color: PAPEL.muted }}>{r.diasRegistrados} días registrados. Datos anotados por ella misma; no es un diagnóstico.</Text>
          </View>
        }
        derecha={
          <>
            {data.settings.etapa === 'embarazo' && <PreguntasConsulta />}
            <AnimoEnPdf />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Button label="Descargar PDF" onPress={() => shareReport(data, summary).catch(fallo('No se pudo crear el PDF'))} />
              </View>
              <View style={{ flex: 1 }}>
                <Button kind="soft" label="Compartir" onPress={() => compartirTexto(consultaTexto(r)).catch(() => {})} />
              </View>
            </View>
            <Card>
              <Label>Tus datos son tuyos</Label>
              <Body>Tu historial siempre es gratis y nunca se vende. Llévatelo cuando quieras.</Body>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Button kind="soft" label="Exportar JSON" onPress={() => exportBackup(data).catch(fallo('No se pudo exportar'))} />
                </View>
                <View style={{ flex: 1 }}>
                  <Button kind="soft" label="Exportar CSV" onPress={() => exportCsv(data).catch(fallo('No se pudo exportar'))} />
                </View>
              </View>
              <Muted>El JSON es tu respaldo completo y sirve para restaurar tus datos en Savia. El CSV se abre en Excel o Google Sheets y no incluye la intimidad.</Muted>
            </Card>
          </>
        }
      />
    </Screen>
  );
}
