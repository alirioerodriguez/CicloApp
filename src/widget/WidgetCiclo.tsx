// Widgets de inicio del ciclo y de la pareja (Android, react-native-android-widget).
// - PeriodoCuenta (chico): cuántos días faltan para el período, o el día del período.
// - CicloHoy (mediano): día del ciclo, fase, próximo período, días fértiles y la barra del ciclo.
// - ParejaHoy (mediano, en el teléfono de la pareja): en qué etapa está ella y la misión del día.
// En modo discreto no dicen "período" ni "fértil". Nunca muestran registros ni intimidad.
import type { ReactNode } from 'react';
import { FlexWidget, TextWidget, type ColorProp, type WidgetRepresentation } from 'react-native-android-widget';
import { CUIDATE } from '../content/cuidate';
import { shortDate } from '../lib/dates';
import type { VistaPareja } from '../lib/pareja';
import { t } from '../lib/region';
import type { ResumenCiclo } from './datosCiclo';
import { CLARA, OSCURA, type Paleta } from './WidgetPastilla';

export const WIDGET_CUENTA = 'PeriodoCuenta';
export const WIDGET_CICLO = 'CicloHoy';
export const WIDGET_PAREJA = 'ParejaHoy';

interface Cuenta {
  grande: string; // número o palabra grande
  unidad: string;
  pie: string | null;
  color: 'rosa' | 'lila' | 'salvia' | 'texto';
}

const dias = (n: number, uno: string, varios: string) => t(n === 1 ? uno : varios);
const fechaCorta = (r: Extract<ResumenCiclo, { tipo: 'ciclo' }>) =>
  r.rango ? `${shortDate(r.rango[0])} – ${shortDate(r.rango[1])}` : r.fecha ? shortDate(r.fecha) : null;

// Lo mismo para los dos widgets de ella: el número grande y su explicación.
export function cuenta(r: ResumenCiclo): Cuenta {
  switch (r.tipo) {
    case 'embarazo':
      return { grande: String(r.semana), unidad: t('semanas de embarazo'), pie: r.faltan != null ? t(`Faltan ${r.faltan} días`) : null, color: 'lila' };
    case 'posparto':
      return { grande: String(r.semana), unidad: t('semanas de posparto'), pie: null, color: 'salvia' };
    case 'pastilla':
      if (r.enPausa) return { grande: t('Hoy'), unidad: t(r.discreto ? 'días de descanso' : 'días sin hormona del blíster'), pie: `${t('Blíster')} ${r.dia}/${r.de}`, color: 'lila' };
      if (r.diasParaPausa == null) return { grande: `${r.dia}/${r.de}`, unidad: t(r.discreto ? 'tu día de hoy' : 'pastilla de hoy'), pie: null, color: 'rosa' };
      return { grande: String(r.diasParaPausa), unidad: dias(r.diasParaPausa, 'día para tu descanso', 'días para tu descanso'), pie: `${t('Blíster')} ${r.dia}/${r.de}`, color: 'lila' };
    case 'ciclo': {
      if (r.enPeriodo) return { grande: String(r.dia), unidad: t(r.discreto ? 'día 1 en curso' : 'día de tu período'), pie: null, color: 'rosa' };
      if (r.atraso > 0) return { grande: String(r.atraso), unidad: dias(r.atraso, r.discreto ? 'día más' : 'día de retraso', r.discreto ? 'días más' : 'días de retraso'), pie: null, color: 'texto' };
      if (r.diasPara === 0 || r.diasPara == null)
        return { grande: t('Hoy'), unidad: t(r.discreto ? 'podría ser tu día 1' : 'podría llegar tu período'), pie: fechaCorta(r), color: 'rosa' };
      return { grande: String(r.diasPara), unidad: dias(r.diasPara, r.discreto ? 'día para tu día 1' : 'día para tu período', r.discreto ? 'días para tu día 1' : 'días para tu período'), pie: fechaCorta(r), color: 'rosa' };
    }
    case 'meno':
      return { grande: '🌸', unidad: t('Toca para registrar tu día'), pie: null, color: 'texto' };
    default:
      return { grande: '🌸', unidad: t('Registra tu período para ver la cuenta'), pie: null, color: 'texto' };
  }
}

const colorDe = (p: Paleta, k: Cuenta['color']): ColorProp => ({ rosa: p.rosa, lila: p.lila, salvia: p.salvia, texto: p.texto })[k];

function Marco({ p, children, uri }: { p: Paleta; children: ReactNode; uri?: string }) {
  return (
    <FlexWidget
      clickAction={uri ? 'OPEN_URI' : 'OPEN_APP'}
      clickActionData={uri ? { uri } : undefined}
      style={{ height: 'match_parent', width: 'match_parent', backgroundColor: p.fondo, borderRadius: 22, padding: 14, flexDirection: 'column', justifyContent: 'space-between' }}
    >
      {children}
    </FlexWidget>
  );
}

function Cuenta({ r, p }: { r: ResumenCiclo; p: Paleta }) {
  const k = cuenta(r);
  return (
    <Marco p={p}>
      <TextWidget text="Savia" style={{ fontSize: 12, color: p.suave, fontWeight: 'bold' }} />
      <FlexWidget style={{ flexDirection: 'column', flexGap: 2 }}>
        <TextWidget text={k.grande} style={{ fontSize: k.grande.length > 4 ? 26 : 38, color: colorDe(p, k.color), fontWeight: 'bold' }} />
        <TextWidget text={k.unidad} maxLines={2} style={{ fontSize: 12.5, color: p.texto }} />
      </FlexWidget>
      <TextWidget text={k.pie ?? ' '} maxLines={1} style={{ fontSize: 11.5, color: p.suave }} />
    </Marco>
  );
}

// Barra del ciclo: un trazo por día; período en rosa, días fértiles en verde y hoy más alto.
function Barra({ r, p }: { r: Extract<ResumenCiclo, { tipo: 'ciclo' }>; p: Paleta }) {
  return (
    <FlexWidget style={{ flexDirection: 'row', width: 'match_parent', height: 16, alignItems: 'center', flexGap: 2 }}>
      {r.marcas.map((m, i) => {
        const hoy = i + 1 === r.dia;
        const color: ColorProp = r.discreto ? (hoy ? p.texto : p.linea) : m === 'periodo' ? p.rosa : m === 'fertil' ? p.salvia : hoy ? p.texto : p.linea;
        return <FlexWidget key={i} style={{ flex: 1, height: hoy ? 16 : 8, borderRadius: 3, backgroundColor: color, borderWidth: hoy ? 2 : 0, borderColor: p.texto }} />;
      })}
    </FlexWidget>
  );
}

function Ciclo({ r, p }: { r: ResumenCiclo; p: Paleta }) {
  if (r.tipo !== 'ciclo') {
    // Embarazo, posparto, pastilla o sin datos: la misma cuenta, en ancho.
    const k = cuenta(r);
    return (
      <Marco p={p}>
        <TextWidget text="Savia" style={{ fontSize: 12, color: p.suave, fontWeight: 'bold' }} />
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', flexGap: 12 }}>
          <TextWidget text={k.grande} style={{ fontSize: 40, color: colorDe(p, k.color), fontWeight: 'bold' }} />
          <FlexWidget style={{ flexDirection: 'column', flex: 1 }}>
            <TextWidget text={k.unidad} maxLines={2} style={{ fontSize: 14, color: p.texto }} />
            {k.pie ? <TextWidget text={k.pie} style={{ fontSize: 12, color: p.suave }} /> : <TextWidget text=" " style={{ fontSize: 2 }} />}
          </FlexWidget>
        </FlexWidget>
      </Marco>
    );
  }
  const k = cuenta(r);
  const fase = r.discreto || !r.fase ? null : t(CUIDATE[r.fase].nombre);
  const fertil = !r.discreto && r.fertil ? `${t('Días fértiles')}: ${shortDate(r.fertil[0])} – ${shortDate(r.fertil[1])}` : null;
  return (
    <Marco p={p}>
      <FlexWidget style={{ flexDirection: 'row', width: 'match_parent', justifyContent: 'space-between', alignItems: 'center' }}>
        <FlexWidget style={{ flexDirection: 'column' }}>
          <TextWidget text={`${t('Día')} ${r.dia}`} style={{ fontSize: 22, color: p.texto, fontWeight: 'bold' }} />
          <TextWidget text={fase ?? t('de tu ciclo')} style={{ fontSize: 12.5, color: p.suave }} />
        </FlexWidget>
        <FlexWidget style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
          <TextWidget text={k.grande} style={{ fontSize: 22, color: colorDe(p, k.color), fontWeight: 'bold' }} />
          <TextWidget text={k.unidad} maxLines={1} style={{ fontSize: 11.5, color: p.suave }} />
        </FlexWidget>
      </FlexWidget>
      <Barra r={r} p={p} />
      <TextWidget text={fertil ?? (k.pie ? `${t('Próximo')}: ${k.pie}` : ' ')} maxLines={1} style={{ fontSize: 11.5, color: p.suave }} />
    </Marco>
  );
}

function Pareja({ v, p }: { v: VistaPareja | null; p: Paleta }) {
  if (!v) {
    return (
      <Marco p={p} uri="ciclo://acompanar">
        <TextWidget text="Savia" style={{ fontSize: 13, color: p.texto, fontWeight: 'bold' }} />
        <TextWidget text={t('Toca para conectar con el código de tu pareja.')} maxLines={3} style={{ fontSize: 13, color: p.suave }} />
        <TextWidget text=" " style={{ fontSize: 2 }} />
      </Marco>
    );
  }
  const pe = v.periodo;
  const linea = v.enPeriodo ? t('Está con su período') : pe ? (pe.enDias === 0 ? t('Su período: en cualquier momento') : pe.enDias === 1 ? t('Su período: mañana') : t(`Su período: en ${pe.enDias} días`)) : null;
  return (
    <Marco p={p} uri="ciclo://acompanar">
      <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', flexGap: 8, width: 'match_parent' }}>
        <TextWidget text={v.contenido.emoji} style={{ fontSize: 20 }} />
        <FlexWidget style={{ flexDirection: 'column', flex: 1 }}>
          <TextWidget text={t(v.titulo)} maxLines={2} truncate="END" style={{ fontSize: 14, color: p.texto, fontWeight: 'bold' }} />
          {linea ? <TextWidget text={linea} maxLines={1} style={{ fontSize: 11.5, color: p.rosa }} /> : <TextWidget text=" " style={{ fontSize: 2 }} />}
        </FlexWidget>
      </FlexWidget>
      <TextWidget text={v.mision ? `${t('Hoy')}: ${t(v.mision)}` : t('Ábrela para ver cómo acompañarla hoy.')} maxLines={3} truncate="END" style={{ fontSize: 12.5, color: p.texto }} />
    </Marco>
  );
}

export function widgetCiclo(nombre: string, r: ResumenCiclo): WidgetRepresentation {
  const Vista = nombre === WIDGET_CICLO ? Ciclo : Cuenta;
  return { light: <Vista r={r} p={CLARA} />, dark: <Vista r={r} p={OSCURA} /> };
}

export function widgetPareja(v: VistaPareja | null): WidgetRepresentation {
  return { light: <Pareja v={v} p={CLARA} />, dark: <Pareja v={v} p={OSCURA} /> };
}
