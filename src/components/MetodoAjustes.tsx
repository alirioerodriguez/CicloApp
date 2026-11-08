// Recordatorio de anillo, parche o inyección (Perfil). Las cuentas están en lib/metodosCalendario; los avisos se
// programan en lib/notifications. La usuaria marca cuándo empezó y la app avisa cada cambio a la hora elegida.
import { useState } from 'react';
import { View } from 'react-native';
import { addDays, today } from '../lib/dates';
import { proximosRecordatorios } from '../lib/metodosCalendario';
import { ensurePermission, notificationsSupported } from '../lib/notifications';
import { t } from '../lib/region';
import { useStore } from '../lib/store';
import { useColors } from '../lib/theme';
import type { MetodoAviso } from '../lib/types';
import { Body, Button, Chip, Divider, Muted, Row, Stepper, Toggle, notify } from './ui';

const METODOS: { id: MetodoAviso['tipo']; label: string; inicio: string }[] = [
  { id: 'anillo', label: 'Anillo', inicio: '¿Hace cuántos días te pusiste el anillo actual?' },
  { id: 'parche', label: 'Parche', inicio: '¿Hace cuántos días te pusiste el primer parche de este ciclo?' },
  { id: 'inyeccion_mensual', label: 'Inyección mensual', inicio: '¿Hace cuántos días fue tu última inyección?' },
  { id: 'inyeccion_trimestral', label: 'Inyección trimestral', inicio: '¿Hace cuántos días fue tu última inyección?' },
];

const fechaCorta = (iso: string) => {
  const [, m, d] = iso.split('-').map(Number);
  return `${d}/${m}`;
};

export function MetodoAjustes() {
  const c = useColors();
  const { data, updateSettings } = useStore();
  const actual = data.settings.metodo;
  const [editando, setEditando] = useState(false);
  const [tipo, setTipo] = useState<MetodoAviso['tipo']>(actual?.tipo ?? 'anillo');
  const [hace, setHace] = useState(0);
  const [hora, setHora] = useState(actual?.hour ?? 9);
  const hoy = today();

  const guardar = async () => {
    if (notificationsSupported && !(await ensurePermission())) {
      notify('Sin permiso para avisarte', 'Activa las notificaciones de Savia en los ajustes del teléfono para recibir el recordatorio.');
    }
    updateSettings({ metodo: { tipo, inicio: addDays(hoy, -hace), on: true, hour: hora } });
    setEditando(false);
  };

  const proximos = actual ? proximosRecordatorios(actual.tipo, actual.inicio, hoy, 3) : [];
  const elegido = METODOS.find((m) => m.id === tipo)!;

  return (
    <>
      <Toggle
        label="Uso anillo, parche o inyección"
        hint="Te avisa cuándo sacar, poner o cambiar, y cuándo toca la inyección"
        value={!!actual?.on || editando}
        onChange={(on) => {
          if (on) setEditando(true);
          else {
            setEditando(false);
            if (actual) updateSettings({ metodo: { ...actual, on: false } });
          }
        }}
      />
      {editando ? (
        <View style={{ gap: 12 }}>
          <Divider />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {METODOS.map((m) => (
              <Chip key={m.id} label={m.label} color={c.lavanda} selected={tipo === m.id} onPress={() => setTipo(m.id)} />
            ))}
          </View>
          <Row label={elegido.inicio} hint={hace === 0 ? t('Hoy') : t(`El ${fechaCorta(addDays(hoy, -hace))}`)}>
            <Stepper value={hace} onChange={setHace} min={0} max={tipo === 'inyeccion_trimestral' ? 91 : tipo === 'inyeccion_mensual' ? 30 : 27} />
          </Row>
          <Row label="Hora del aviso">
            <Stepper value={hora} onChange={setHora} min={6} max={23} format={(h) => `${h}:00`} />
          </Row>
          <Muted>Cuentas del esquema habitual del prospecto (NHS y OMS). Si tu médica te indicó otro, sigue el suyo.</Muted>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button small label="Guardar" onPress={guardar} />
            <Button small kind="soft" label="Cancelar" onPress={() => setEditando(false)} />
          </View>
        </View>
      ) : (
        actual?.on && (
          <>
            <Divider />
            <Body style={{ fontWeight: '600' }}>{t(METODOS.find((m) => m.id === actual.tipo)!.label)}</Body>
            {proximos.map((r) => (
              <Muted key={r.fecha}>
                {fechaCorta(r.fecha)} · {t(r.texto)}
              </Muted>
            ))}
            <Muted>{t(`Aviso a las ${actual.hour}:00.`)}</Muted>
            <Button
              small
              kind="soft"
              label="Editar"
              onPress={() => {
                setTipo(actual.tipo);
                setHora(actual.hour);
                setEditando(true);
              }}
            />
          </>
        )
      )}
    </>
  );
}
