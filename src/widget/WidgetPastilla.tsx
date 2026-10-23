// Widgets de inicio de la pastilla (Android, react-native-android-widget).
// Chico: "Pastilla 14/21", estado de hoy y botón de check. Mediano: además, la fila de la semana del blíster.
// No usan el tema de la app (corren sin ella): llevan su paleta clara y oscura.
import { FlexWidget, TextWidget, type ColorProp, type WidgetRepresentation } from 'react-native-android-widget';
import { t } from '../lib/region';
import type { DiaWidget, ResumenWidget } from './datosWidget';

export const WIDGET_CHICO = 'PastillaChico';
export const WIDGET_SEMANA = 'PastillaSemana';
export const ACCION_MARCAR = 'MARCAR_PASTILLA';

export interface Paleta {
  fondo: ColorProp;
  texto: ColorProp;
  suave: ColorProp;
  rosa: ColorProp;
  rosaSuave: ColorProp;
  lila: ColorProp;
  lilaSuave: ColorProp;
  salvia: ColorProp;
  salviaSuave: ColorProp;
  durazno: ColorProp;
  duraznoSuave: ColorProp;
  linea: ColorProp;
  boton: ColorProp;
  botonTexto: ColorProp;
}

export const CLARA: Paleta = {
  fondo: '#FBF5F2', texto: '#2A1E28', suave: '#7A6873', rosa: '#C24E7A', rosaSuave: '#F6DCE5', lila: '#8F7FE0', lilaSuave: '#E7E2FB',
  salvia: '#5E9A73', salviaSuave: '#E2EFE6', durazno: '#D98A3D', duraznoSuave: '#FBE8D6', linea: '#E8DEDA', boton: '#7E2F52', botonTexto: '#FFFFFF',
};
export const OSCURA: Paleta = {
  fondo: '#231A21', texto: '#F6EEF1', suave: '#B9A8B2', rosa: '#F0A3C4', rosaSuave: '#4A2A3A', lila: '#BDB3F5', lilaSuave: '#352F52',
  salvia: '#A8D4B4', salviaSuave: '#24382B', durazno: '#F6C58F', duraznoSuave: '#46331F', linea: '#3A2E36', boton: '#F0A3C4', botonTexto: '#231A21',
};

function titulo(r: Extract<ResumenWidget, { activo: true }>): string {
  const quien = r.tipo === 'activa' ? 'Pastilla' : r.tipo === 'placebo' ? 'Placebo' : 'Descanso';
  return `${t(quien)} ${r.n}/${r.de}`;
}

function estadoHoy(r: Extract<ResumenWidget, { activo: true }>): string {
  switch (r.estadoHoy) {
    case 'tomada':
      return t(`Tomada a las ${r.horaToma ?? ''}`).trim();
    case 'tarde':
      return t(`Tomada tarde a las ${r.horaToma ?? ''}`).trim();
    case 'olvidada':
      return t('Marcada como olvidada');
    case 'descanso':
      return t('Hoy no te toca pastilla.');
    default:
      return t(`Hoy a las ${r.hora}`);
  }
}

// Botón de check: solo si hoy toca y aún no se marcó. Si ya se marcó, un check verde fijo.
function Check({ r, p, grande }: { r: Extract<ResumenWidget, { activo: true }>; p: Paleta; grande?: boolean }) {
  const tam = grande ? 46 : 40;
  if (r.estadoHoy === 'pendiente') {
    return (
      <FlexWidget
        clickAction={ACCION_MARCAR}
        accessibilityLabel={t('Ya la tomé')}
        style={{ width: tam, height: tam, borderRadius: tam / 2, backgroundColor: p.boton, alignItems: 'center', justifyContent: 'center' }}
      >
        <TextWidget text="✓" style={{ fontSize: grande ? 24 : 21, color: p.botonTexto, fontWeight: 'bold' }} />
      </FlexWidget>
    );
  }
  const hecho = r.estadoHoy === 'tomada' || r.estadoHoy === 'tarde';
  return (
    <FlexWidget style={{ width: tam, height: tam, borderRadius: tam / 2, backgroundColor: hecho ? p.salviaSuave : p.linea, alignItems: 'center', justifyContent: 'center' }}>
      <TextWidget text={hecho ? '✓' : '–'} style={{ fontSize: grande ? 22 : 20, color: hecho ? (r.estadoHoy === 'tarde' ? p.durazno : p.salvia) : p.suave, fontWeight: 'bold' }} />
    </FlexWidget>
  );
}

// Un alvéolo de la semana, con los mismos estados que la tarjeta de Hoy.
function Alveolo({ d, p }: { d: DiaWidget; p: Paleta }) {
  const tomado = d.estado === 'tomada' || d.estado === 'tarde';
  const fondo: ColorProp = d.estado === 'descanso' ? p.fondo : d.estado === 'olvidada' ? p.duraznoSuave : tomado ? p.fondo : d.placebo ? p.lilaSuave : p.rosaSuave;
  const borde: ColorProp = d.hoy ? p.texto : d.estado === 'olvidada' || d.estado === 'tarde' ? p.durazno : d.estado === 'descanso' ? p.suave : p.linea;
  return (
    <FlexWidget style={{ flex: 1, alignItems: 'center', flexGap: 4 }}>
      <TextWidget text={d.inicial} style={{ fontSize: 11, color: p.suave, fontWeight: 'bold' }} />
      <FlexWidget
        style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: fondo, borderWidth: d.hoy ? 2 : 1, borderColor: borde, borderStyle: d.estado === 'descanso' ? 'dashed' : 'solid', alignItems: 'center', justifyContent: 'center' }}
      >
        {tomado ? (
          <TextWidget text="✓" style={{ fontSize: 13, color: d.estado === 'tarde' ? p.durazno : p.salvia, fontWeight: 'bold' }} />
        ) : d.estado !== 'descanso' ? (
          <FlexWidget style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: d.estado === 'olvidada' ? p.durazno : d.placebo ? p.lila : p.rosa }} />
        ) : null}
      </FlexWidget>
    </FlexWidget>
  );
}

function SinBlister({ p }: { p: Paleta }) {
  return (
    <FlexWidget clickAction="OPEN_APP" style={{ height: 'match_parent', width: 'match_parent', backgroundColor: p.fondo, borderRadius: 22, padding: 14, justifyContent: 'center', flexGap: 4 }}>
      <TextWidget text="Savia" style={{ fontSize: 15, color: p.texto, fontWeight: 'bold' }} />
      <TextWidget text={t('Configura tu blíster para ver qué pastilla te toca cada día.')} maxLines={3} style={{ fontSize: 12, color: p.suave }} />
    </FlexWidget>
  );
}

function Chico({ r, p }: { r: ResumenWidget; p: Paleta }) {
  if (!r.activo) return <SinBlister p={p} />;
  return (
    <FlexWidget clickAction="OPEN_APP" style={{ height: 'match_parent', width: 'match_parent', backgroundColor: p.fondo, borderRadius: 22, padding: 14, justifyContent: 'space-between' }}>
      <FlexWidget style={{ flexDirection: 'column', flexGap: 2 }}>
        <TextWidget text={titulo(r)} style={{ fontSize: 18, color: p.texto, fontWeight: 'bold' }} />
        <TextWidget text={estadoHoy(r)} maxLines={2} style={{ fontSize: 12, color: p.suave }} />
      </FlexWidget>
      <FlexWidget style={{ flexDirection: 'row', width: 'match_parent', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextWidget text={`⏰ ${r.hora}`} style={{ fontSize: 12, color: p.suave }} />
        <Check r={r} p={p} />
      </FlexWidget>
    </FlexWidget>
  );
}

function Semana({ r, p }: { r: ResumenWidget; p: Paleta }) {
  if (!r.activo) return <SinBlister p={p} />;
  return (
    <FlexWidget clickAction="OPEN_APP" style={{ height: 'match_parent', width: 'match_parent', backgroundColor: p.fondo, borderRadius: 22, padding: 14, flexGap: 10 }}>
      <FlexWidget style={{ flexDirection: 'row', width: 'match_parent', alignItems: 'center', justifyContent: 'space-between' }}>
        <FlexWidget style={{ flexDirection: 'column', flexGap: 2 }}>
          <TextWidget text={titulo(r)} style={{ fontSize: 18, color: p.texto, fontWeight: 'bold' }} />
          <TextWidget text={`${estadoHoy(r)} · ⏰ ${r.hora}`} maxLines={1} truncate="END" style={{ fontSize: 12, color: p.suave }} />
        </FlexWidget>
        <Check r={r} p={p} grande />
      </FlexWidget>
      <FlexWidget style={{ flexDirection: 'row', width: 'match_parent', backgroundColor: p.linea, borderRadius: 16, paddingVertical: 8, paddingHorizontal: 4 }}>
        {r.semana.map((d) => (
          <Alveolo key={d.fecha} d={d} p={p} />
        ))}
      </FlexWidget>
    </FlexWidget>
  );
}

export function widgetPastilla(nombre: string, r: ResumenWidget): WidgetRepresentation {
  const Vista = nombre === WIDGET_SEMANA ? Semana : Chico;
  return { light: <Vista r={r} p={CLARA} />, dark: <Vista r={r} p={OSCURA} /> };
}
