// Ajustes del blíster digital (Perfil): al activar la pastilla se pide tipo de blíster, fecha de inicio y hora.
// Si ya está activo, se ve un resumen y se puede editar. Con la pastilla apagada, el blíster no aparece en ningún lado.
import { useState, type ReactNode } from 'react';
import { TextInput, View } from 'react-native';
import { MARCAS } from '../content/pastillas';
import { ESQUEMAS, configDesdePillType, diaDelBlister, encabezado, esquema, pillTypeDesdeBlister } from '../lib/blister';
import { PILL_PACKS } from '../lib/cycle';
import { shortDate, timeLabel, today } from '../lib/dates';
import { t } from '../lib/region';
import { useStore } from '../lib/store';
import { radius, useColors } from '../lib/theme';
import type { BlisterConfig, TipoBlister, TipoPastilla } from '../lib/types';
import { MonthGrid } from './MonthGrid';
import { Body, Button, Chip, Divider, Label, Muted, Row, Stepper, Toggle } from './ui';

// Orden fijo: con Object.keys, "28" saldría primero por ser una clave numérica.
const TIPOS: { id: TipoBlister; label: string }[] = [
  ...(['21-7', '24-4', '21-7p', '28'] as const).map((id) => ({ id, label: ESQUEMAS[id].label })),
  { id: 'personalizado', label: 'Personalizado' },
];

const PASTILLAS: { id: TipoPastilla; label: string }[] = [
  { id: 'combinada', label: 'Combinada' },
  { id: 'progestageno', label: 'Solo progestágeno' },
];

const aMinutos = (hora: string) => Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3, 5));
const aHora = (min: number) => timeLabel(Math.floor(min / 60), min % 60);

// Dibujo del blíster: 7 alvéolos por fila. Activa = color; placebo = claro; descanso = contorno punteado.
export function DibujoBlister({ config }: { config: BlisterConfig }) {
  const c = useColors();
  const e = esquema(config);
  const total = e.activas + e.inactivas;
  const color = config.tipoPastilla === 'progestageno' ? c.lavanda : c.rosa;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, width: 7 * 20 + 6 * 6 + 20, alignSelf: 'center', padding: 10, borderRadius: radius.md, backgroundColor: c.bg }}>
      {Array.from({ length: total }, (_, i) => {
        const activa = i < e.activas;
        const descanso = !activa && e.inactiva === 'descanso';
        return (
          <View
            key={i}
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: activa ? color : descanso ? 'transparent' : c.line,
              borderWidth: activa ? 0 : 1.5,
              borderColor: c.muted,
              borderStyle: descanso ? 'dashed' : 'solid',
              opacity: descanso ? 0.6 : 1,
            }}
          />
        );
      })}
    </View>
  );
}

// Formulario: marca (opcional), tipo de blíster, tipo de pastilla, fecha de inicio y hora.
function FormularioBlister({ inicial, nombreInicial, onGuardar, onCancelar }: {
  inicial: BlisterConfig;
  nombreInicial: string;
  onGuardar: (config: BlisterConfig, nombre: string) => void;
  onCancelar: () => void;
}) {
  const c = useColors();
  const [b, setB] = useState<BlisterConfig>(inicial);
  const [nombre, setNombre] = useState(nombreInicial);
  const [elegirFecha, setElegirFecha] = useState(false);
  const set = (patch: Partial<BlisterConfig>) => setB((x) => ({ ...x, ...patch }));
  const input = { borderRadius: radius.md, backgroundColor: c.bg, borderWidth: 1, borderColor: c.line, padding: 12, fontSize: 16, color: c.text };
  const e = esquema(b);
  const fila = (children: ReactNode) => <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{children}</View>;

  return (
    <View style={{ gap: 12 }}>
      <Label>¿Cuál es tu pastilla? (opcional)</Label>
      {fila(
        MARCAS.map((m) => (
          <Chip
            key={m.nombre}
            label={m.nombre}
            color={c.lavanda}
            selected={nombre === m.nombre}
            onPress={() => {
              setNombre(m.nombre);
              setB((x) => ({ inicio: x.inicio, hora: x.hora, ...configDesdePillType(m.esquema) }));
            }}
          />
        )),
      )}
      <TextInput value={nombre} onChangeText={setNombre} placeholder={t('U otra marca')} placeholderTextColor={c.muted} style={input} />

      <Label>¿Cómo es tu blíster?</Label>
      {fila(TIPOS.map((o) => <Chip key={o.id} label={o.label} selected={b.tipo === o.id} onPress={() => set({ tipo: o.id })} />))}
      {b.tipo === 'personalizado' && (
        <>
          <Row label="Pastillas con hormona">
            <Stepper value={e.activas} onChange={(activas) => set({ activas })} min={1} max={84} />
          </Row>
          <Row label="Días sin hormona" hint="Placebo o descanso al final del blíster">
            <Stepper value={e.inactivas} onChange={(inactivas) => set({ inactivas })} min={0} max={14} />
          </Row>
          {e.inactivas > 0 && (
            <Toggle label="Esos días tomo placebo" hint="Apagado: son días de descanso, sin pastilla" value={!!b.inactivasPlacebo} onChange={(inactivasPlacebo) => set({ inactivasPlacebo })} />
          )}
        </>
      )}

      <Label>Tipo de pastilla</Label>
      {fila(PASTILLAS.map((o) => <Chip key={o.id} label={o.label} color={c.lavanda} selected={b.tipoPastilla === o.id} onPress={() => set({ tipoPastilla: o.id })} />))}
      <Muted>{b.tipoPastilla === 'progestageno' ? 'Con solo progestágeno, la ventana para tomarla tarde suele ser de 3 horas.' : 'Con la combinada, la ventana para tomarla tarde suele ser de 12 horas.'} Confírmalo en tu prospecto.</Muted>

      <DibujoBlister config={b} />
      <Muted style={{ textAlign: 'center' }}>{e.inactivas ? (e.inactiva === 'placebo' ? '● con hormona · ○ placebo' : '● con hormona · ◌ descanso') : '● con hormona'}</Muted>

      <Divider />
      <Row label="Empecé el blíster actual" hint={shortDate(b.inicio)}>
        <Button small kind="soft" label={elegirFecha ? 'Cerrar' : 'Cambiar'} onPress={() => setElegirFecha((v) => !v)} />
      </Row>
      {elegirFecha && (
        <>
          <Button small label="Hoy empecé un blíster nuevo" onPress={() => { set({ inicio: today() }); setElegirFecha(false); }} />
          <Muted>O toca el día en que empezaste el blíster actual:</Muted>
          <MonthGrid maxDate={today()} selected={b.inicio} onPress={(inicio) => { set({ inicio }); setElegirFecha(false); }} />
        </>
      )}
      <Row label="Hora de la toma">
        <Stepper value={aMinutos(b.hora)} onChange={(m) => set({ hora: aHora(m) })} min={0} max={23 * 60 + 45} step={15} format={aHora} />
      </Row>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Button label="Guardar blíster" onPress={() => onGuardar(b, nombre.trim())} />
        </View>
        <Button kind="ghost" label="Cancelar" onPress={onCancelar} />
      </View>
    </View>
  );
}

export function BlisterAjustes() {
  const c = useColors();
  const { data, guardarBlister, updateSettings } = useStore();
  const s = data.settings;
  const b = data.blister;
  const [editando, setEditando] = useState(false);
  const hoy = today();

  const guardar = (config: BlisterConfig, nombre: string) => {
    guardarBlister(config);
    // Lo que todavía leen recordatorios, PDF y estadísticas queda en sincronía con el blíster nuevo.
    const [h, m] = config.hora.split(':').map(Number);
    updateSettings({
      pillMode: true,
      anticonceptivo: 'pastilla',
      pillName: nombre,
      pillType: pillTypeDesdeBlister(config),
      pillPackStart: config.inicio,
      reminders: { ...s.reminders, pill: { ...s.reminders.pill, hour: h, minute: m } },
    });
    setEditando(false);
  };

  const nuevo: BlisterConfig = b ?? { tipo: '21-7', inicio: hoy, hora: timeLabel(s.reminders.pill.hour, s.reminders.pill.minute), tipoPastilla: 'combinada' };
  const formulario = <FormularioBlister inicial={nuevo} nombreInicial={s.pillName} onGuardar={guardar} onCancelar={() => setEditando(false)} />;

  return (
    <>
      <Toggle
        label="Tomo pastilla anticonceptiva"
        hint="Activa tu blíster digital y oculta los días fértiles"
        value={s.pillMode || editando}
        onChange={(on) => {
          if (on) setEditando(true); // se activa al guardar el blíster
          else {
            setEditando(false);
            updateSettings({ pillMode: false, anticonceptivo: s.anticonceptivo === 'pastilla' ? 'ninguno' : s.anticonceptivo });
          }
        }}
      />
      {editando
        ? formulario
        : s.pillMode &&
          b && (
            <>
              <Divider />
              <Body style={{ fontWeight: '600' }}>
                {s.pillName || (b.tipo === 'personalizado' ? t(`Personalizado: ${esquema(b).activas} + ${esquema(b).inactivas}`) : t(ESQUEMAS[b.tipo].label))}
              </Body>
              <Muted>
                {resumen(b, hoy)} · {t(b.tipoPastilla === 'progestageno' ? 'Solo progestágeno' : 'Combinada')} · {b.hora}
              </Muted>
              <Muted>{t(PILL_PACKS[pillTypeDesdeBlister(b)].sangrado)}</Muted>
              <Button small kind="soft" label="Editar blíster" onPress={() => setEditando(true)} />
            </>
          )}
      {s.pillMode && !b && !editando && (
        <>
          <Muted style={{ color: c.text }}>Configura tu blíster para ver qué pastilla te toca cada día.</Muted>
          <Button small label="Configurar blíster" onPress={() => setEditando(true)} />
        </>
      )}
    </>
  );
}

// "Pastilla 14 de 21 · el próximo blíster empieza el 29 oct"
function resumen(b: BlisterConfig, hoy: string): string {
  const h = encabezado(b, hoy);
  const quien = h.tipo === 'activa' ? 'Pastilla' : h.tipo === 'placebo' ? 'Placebo' : 'Descanso';
  return `${t(`${quien} ${h.n} de ${h.de}`)} · ${t(`el próximo blíster empieza el ${shortDate(diaDelBlister(b, hoy).siguienteInicio)}`)}`;
}
