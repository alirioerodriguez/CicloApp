// Reloj y apps de salud: conectar Apple Salud (iPhone) o Health Connect (Android: Samsung Health, Fitbit,
// Google Fit, Xiaomi…) y ver cómo cambian pulso, sueño, pasos y temperatura en cada fase del ciclo.
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Platform, View } from 'react-native';
import { Text } from '../components/Texto';
import { Body, Button, Card, Label, Muted, Screen, Toggle, confirm, notify } from '../components/ui';
import { shortDate, today } from '../lib/dates';
import { fuenteSalud, type EstadoFuente } from '../lib/fuentesSalud';
import { formatoSueno, formatoTemp, resumenReloj, type CampoReloj, type FaseReloj } from '../lib/reloj';
import { t } from '../lib/region';
import { sincronizarReloj } from '../lib/sincronizarReloj';
import { useStore } from '../lib/store';
import { fonts, useColors } from '../lib/theme';

const FILAS: { campo: CampoReloj; label: string; fmt: (v: number) => string }[] = [
  { campo: 'fcReposo', label: 'Pulso en reposo', fmt: (v) => `${Math.round(v)} lpm` },
  { campo: 'vfc', label: 'Variabilidad cardíaca', fmt: (v) => `${Math.round(v)} ms` },
  { campo: 'sueno', label: 'Sueño', fmt: formatoSueno },
  { campo: 'pasos', label: 'Pasos al día', fmt: (v) => Math.round(v).toLocaleString() },
  { campo: 'tempPiel', label: 'Temperatura al dormir', fmt: formatoTemp },
  { campo: 'tempBasal', label: 'Temperatura basal', fmt: (v) => `${v.toFixed(2)} °C` },
];
const FASES: { id: FaseReloj; label: string }[] = [
  { id: 'menstrual', label: 'Menstrual' },
  { id: 'folicular', label: 'Folicular' },
  { id: 'lutea', label: 'Lútea' },
];

// Curva de temperatura del último ciclo: una barra por noche, hacia arriba si está sobre la línea base.
function Curva({ puntos, salto }: { puntos: { dia: number; valor: number }[]; salto: number | null }) {
  const c = useColors();
  const max = Math.max(0.3, ...puntos.map((p) => Math.abs(p.valor)));
  const alto = 46;
  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', height: alto * 2, gap: 2 }}>
        {puntos.map((p) => {
          const h = Math.max(2, (Math.abs(p.valor) / max) * alto);
          const arriba = p.valor >= 0;
          const desdeSalto = salto != null && p.dia >= salto;
          return (
            <View key={p.dia} style={{ flex: 1, height: alto * 2, justifyContent: 'center' }}>
              <View style={{ height: alto, justifyContent: 'flex-end' }}>{arriba && <View style={{ height: h, borderRadius: 2, backgroundColor: desdeSalto ? c.rosa : c.lavanda }} />}</View>
              <View style={{ height: alto }}>{!arriba && <View style={{ height: h, borderRadius: 2, backgroundColor: c.line }} />}</View>
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Muted>{`${t('Día')} ${puntos[0]?.dia ?? ''}`}</Muted>
        <Muted>{`${t('Día')} ${puntos[puntos.length - 1]?.dia ?? ''}`}</Muted>
      </View>
    </View>
  );
}

export default function Reloj() {
  const c = useColors();
  const { data, summary, update, updateSettings } = useStore();
  const r = data.reloj;
  const conectada = !!r.fuente && r.fuente === fuenteSalud.fuente;
  const [estado, setEstado] = useState<EstadoFuente | null>(null);
  const [busy, setBusy] = useState(false);
  const web = Platform.OS === 'web';
  const nombre = fuenteSalud.nombre || (Platform.OS === 'ios' ? 'Apple Salud' : 'Health Connect');

  useEffect(() => {
    fuenteSalud.estado().then(setEstado).catch(() => setEstado('no'));
  }, []);

  const traer = async () => {
    setBusy(true);
    try {
      const n = await sincronizarReloj({ ...data, reloj: { ...r, fuente: fuenteSalud.fuente } }, update, true);
      if (n === 0) notify('Sin datos nuevos', `Revisa que tu reloj o tu app sincronice con ${nombre} y que Savia tenga permiso.`);
    } catch (e) {
      notify('No se pudo leer', (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const conectar = async () => {
    setBusy(true);
    try {
      const ok = await fuenteSalud.conectar();
      if (!ok) return notify('Sin permiso', `Para leer tus datos, Savia necesita permiso en ${nombre}.`);
      update((d) => ({ ...d, reloj: { ...d.reloj, fuente: fuenteSalud.fuente } }));
      await sincronizarReloj({ ...data, reloj: { ...r, fuente: fuenteSalud.fuente, ultimaSync: null } }, update, true);
    } catch (e) {
      notify('No se pudo conectar', (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const desconectar = () => update((d) => ({ ...d, reloj: { ...d.reloj, fuente: null } }));
  const borrar = async () => {
    if (!(await confirm('¿Borrar los datos del reloj?', 'Se borran de Savia. En tu reloj y en tu app de salud no se borra nada.', 'Borrar'))) return;
    update((d) => ({ ...d, reloj: { fuente: null, ultimaSync: null, dias: {} } }));
  };

  const hoy = today();
  const res = resumenReloj(data, summary, hoy);
  const hay = res.noches > 0;
  const ultimoSalto = res.saltos[res.saltos.length - 1] ?? null;
  const saltoCurva = ultimoSalto && res.curva.some((p) => p.fecha === ultimoSalto.fecha) ? ultimoSalto.diaCiclo : null;

  return (
    <Screen angosta title="Reloj y apps de salud" right={<Button small kind="soft" label="Volver" onPress={() => (router.canGoBack() ? router.back() : router.replace('/perfil'))} />}>
      <Body>Suma a tu ciclo lo que mide tu reloj o tu teléfono: pasos, pulso, sueño y temperatura. Así ves cómo cambian en cada fase y lo llevas a tu consulta.</Body>

      <Card>
        <Label>{web ? '📱 Se conecta desde tu teléfono' : `⌚ ${nombre}`}</Label>
        {web ? (
          <Muted>Abre Savia en tu iPhone o Android para conectar Apple Salud o Health Connect. Aquí ves lo que ya trajo tu teléfono.</Muted>
        ) : estado == null ? (
          <ActivityIndicator color={c.rosa} />
        ) : estado === 'instalar' ? (
          <>
            <Body>Para leer tus datos hace falta instalar o actualizar Health Connect.</Body>
            <Button label="Abrir Google Play" onPress={() => Linking.openURL('market://details?id=com.google.android.apps.healthdata').catch(() => {})} />
          </>
        ) : estado === 'no' ? (
          <Muted>{`Este teléfono no tiene ${nombre}.`}</Muted>
        ) : conectada ? (
          <>
            <Body>{r.ultimaSync ? `✓ Conectada. Última lectura: ${shortDate(r.ultimaSync.slice(0, 10))}, ${r.ultimaSync.slice(11, 16)}.` : '✓ Conectada.'}</Body>
            <Button label={busy ? 'Leyendo…' : 'Sincronizar ahora'} disabled={busy} onPress={traer} />
            <Button kind="soft" label="Revisar permisos" onPress={fuenteSalud.abrirAjustes} />
            <Button kind="ghost" label="Desconectar" onPress={desconectar} />
          </>
        ) : (
          <>
            <Button label={busy ? 'Conectando…' : `Conectar con ${nombre}`} disabled={busy} onPress={conectar} />
            <Muted>
              {Platform.OS === 'ios'
                ? 'Lee lo que guardan en Salud tu Apple Watch y apps como Oura o Garmin. La temperatura al dormir necesita Apple Watch Series 8, Ultra o más nuevo.'
                : '¿Usas Samsung Health, Fitbit, Google Fit, Xiaomi u otra? Actívala para que comparta con Health Connect (en Samsung Health: Ajustes › Health Connect). La temperatura de la piel la dan relojes como Galaxy Watch, Pixel Watch, Fitbit u Oura.'}
            </Muted>
          </>
        )}
      </Card>

      {hay && (
        <>
          <Card>
            <Label>Tu cuerpo en cada fase</Label>
            <Muted>{`Promedios de ${res.noches} ${res.noches === 1 ? 'día' : 'días'} con datos, desde el ${shortDate(res.desde!)}.`}</Muted>
            <View style={{ flexDirection: 'row', paddingTop: 4 }}>
              <View style={{ flex: 1.4 }} />
              {FASES.map((f) => (
                <Text key={f.id} style={{ flex: 1, textAlign: 'right', fontFamily: fonts.bold, fontSize: 12.5, color: c.muted }}>
                  {f.label}
                </Text>
              ))}
            </View>
            {FILAS.filter((x) => FASES.some((f) => res.porFase[f.id][x.campo] != null)).map((x) => (
              <View key={x.campo} style={{ flexDirection: 'row', paddingVertical: 6, borderTopWidth: 1, borderTopColor: c.line }}>
                <Text style={{ flex: 1.4, fontSize: 13.5, color: c.text }}>{x.label}</Text>
                {FASES.map((f) => {
                  const v = res.porFase[f.id][x.campo];
                  return (
                    <Text key={f.id} style={{ flex: 1, textAlign: 'right', fontSize: 13.5, color: c.text, fontFamily: fonts.semibold }}>
                      {v == null ? '–' : t(x.fmt(v))}
                    </Text>
                  );
                })}
              </View>
            ))}
            {res.difFcReposo != null && Math.abs(res.difFcReposo) >= 1 && (
              <Body>
                {res.difFcReposo > 0
                  ? `En tu fase lútea, tu pulso en reposo está ${res.difFcReposo.toFixed(1)} lpm más alto que en la folicular. Es un cambio esperable por la progesterona.`
                  : `En tu fase lútea, tu pulso en reposo está ${Math.abs(res.difFcReposo).toFixed(1)} lpm más bajo que en la folicular.`}
              </Body>
            )}
          </Card>

          {res.curva.length > 0 && (
            <Card>
              <Label>🌡️ Temperatura de tu último ciclo</Label>
              <Curva puntos={res.curva} salto={saltoCurva} />
              {res.saltos.length > 0 ? (
                <>
                  {res.saltos
                    .slice(-3)
                    .reverse()
                    .map((x) => (
                      <Body key={x.inicioCiclo}>{`• Ciclo del ${shortDate(x.inicioCiclo)}: subió el día ${x.diaCiclo} (${shortDate(x.fecha)}), ${formatoTemp(x.subida)}.`}</Body>
                    ))}
                  <Muted>La temperatura suele subir justo después de ovular y mantenerse hasta el período. Es un dato para conversar con tu médica, no un método anticonceptivo.</Muted>
                </>
              ) : (
                <Muted>Todavía no se ve una subida clara de temperatura. Hacen falta varias noches seguidas con el reloj puesto.</Muted>
              )}
            </Card>
          )}

          <Card>
            <Toggle label="Incluir en el PDF para tu médica" hint="Promedios por fase y la subida de temperatura de cada ciclo" value={data.settings.pdfReloj} onChange={(pdfReloj) => updateSettings({ pdfReloj })} />
          </Card>
        </>
      )}

      <Muted>{`Savia solo lee: no escribe nada en tu reloj ni en ${nombre}. Los datos quedan en tu teléfono y en tu respaldo, y nunca se comparten con tu pareja.`}</Muted>
      {hay && <Button kind="danger" small label="Borrar los datos del reloj de Savia" onPress={borrar} />}
    </Screen>
  );
}
