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
import { cuenta, type Cuenta } from './textos';

export { cuenta };

export const WIDGET_CUENTA = 'PeriodoCuenta';
export const WIDGET_CICLO = 'CicloHoy';
export const WIDGET_PAREJA = 'ParejaHoy';

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

// Alto (en dp) desde el que el widget de pareja muestra los consejos: cómo se siente, plan y comida.
export const ALTO_CONSEJOS = 170;

function Consejo({ titulo, texto, p }: { titulo: string; texto: string; p: Paleta }) {
  return (
    <FlexWidget style={{ flexDirection: 'column', width: 'match_parent' }}>
      <TextWidget text={titulo} style={{ fontSize: 10.5, color: p.suave, fontWeight: 'bold', letterSpacing: 0.08 }} />
      <TextWidget text={texto} maxLines={2} truncate="END" style={{ fontSize: 12.5, color: p.texto }} />
    </FlexWidget>
  );
}

function Pareja({ v, p, alto }: { v: VistaPareja | null; p: Paleta; alto: number }) {
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
  const encabezado = (
    <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', flexGap: 8, width: 'match_parent' }}>
      <TextWidget text={v.contenido.emoji} style={{ fontSize: 20 }} />
      <FlexWidget style={{ flexDirection: 'column', flex: 1 }}>
        <TextWidget text={t(v.titulo)} maxLines={2} truncate="END" style={{ fontSize: 14, color: p.texto, fontWeight: 'bold' }} />
        {linea ? <TextWidget text={linea} maxLines={1} style={{ fontSize: 11.5, color: p.rosa }} /> : <TextWidget text=" " style={{ fontSize: 2 }} />}
      </FlexWidget>
    </FlexWidget>
  );
  // Agrandado hacia abajo: los consejos del día.
  const como = v.fase !== 'general' ? v.contenido.como : null;
  if (alto >= ALTO_CONSEJOS && (como || v.mision || v.plan || v.plato)) {
    return (
      <FlexWidget
        clickAction="OPEN_URI"
        clickActionData={{ uri: 'ciclo://acompanar' }}
        style={{ height: 'match_parent', width: 'match_parent', backgroundColor: p.fondo, borderRadius: 22, padding: 14, flexGap: 8 }}
      >
        {encabezado}
        {como ? <Consejo titulo={t('CÓMO SE SIENTE')} texto={t(como)} p={p} /> : null}
        {v.mision ? <Consejo titulo={t('TU MISIÓN DE HOY')} texto={t(v.mision)} p={p} /> : null}
        {v.plan ? <Consejo titulo={t('UN PLAN')} texto={t(v.plan)} p={p} /> : null}
        {v.plato ? <Consejo titulo={t('PARA COMER')} texto={t(v.plato)} p={p} /> : null}
      </FlexWidget>
    );
  }
  return (
    <Marco p={p} uri="ciclo://acompanar">
      {encabezado}
      <TextWidget text={v.mision ? `${t('Hoy')}: ${t(v.mision)}` : t('Ábrela para ver cómo acompañarla hoy.')} maxLines={3} truncate="END" style={{ fontSize: 12.5, color: p.texto }} />
    </Marco>
  );
}

export function widgetCiclo(nombre: string, r: ResumenCiclo): WidgetRepresentation {
  const Vista = nombre === WIDGET_CICLO ? Ciclo : Cuenta;
  return { light: <Vista r={r} p={CLARA} />, dark: <Vista r={r} p={OSCURA} /> };
}

/** `alto`: el alto del widget en dp (Android lo informa al dibujar). Sin dato, la versión de 4×2. */
export function widgetPareja(v: VistaPareja | null, alto = 0): WidgetRepresentation {
  return { light: <Pareja v={v} p={CLARA} alto={alto} />, dark: <Pareja v={v} p={OSCURA} alto={alto} /> };
}
