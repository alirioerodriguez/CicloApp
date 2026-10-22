// "Cuídate" en menopausia (diseño 7k): pensado para tu edad.
import { router } from 'expo-router';
import { Text } from 'react-native';
import { ejercicioById } from '../content/ejercicios';
import { ALIMENTOS_MENO, CUIDADOS_MENO, EJERCICIO_MENO, MODERACION_MENO, PLATOS_MENO, etapaMeno } from '../content/menopausia';
import { useStore } from '../lib/store';
import { fonts, serif, useColors } from '../lib/theme';
import { EjercicioCard } from './EjercicioCard';
import { ListaEmoji, Platos } from './Platos';
import { Body, Button, Card, Columnas, Label, Muted, Screen } from './ui';

export function CuidateMeno() {
  const c = useColors();
  const { data } = useStore();
  const st = data.settings;
  const etapa = etapaMeno(st.meno.etapa);

  return (
    <Screen title="Cuídate">
      <Card tint={c.duraznoSuave}>
        <Text style={{ fontFamily: fonts.bold, fontSize: 11.5, letterSpacing: 1.5, color: c.muted, textTransform: 'uppercase' }}>
          {etapa.nombre}
          {st.edad ? ` · ${st.edad} años` : ''}
        </Text>
        <Text style={{ fontFamily: serif, fontSize: 21, lineHeight: 28, color: c.text }}>Esta etapa trae cambios, pero también mucho que puedes hacer por ti.</Text>
      </Card>

      <Columnas
        izquierda={
          <>
            <ListaEmoji titulo="Para sentirte mejor" items={CUIDADOS_MENO} />
            <Button kind="soft" label="Cuándo consultar" onPress={() => router.push('/info')} />
          </>
        }
        derecha={
          <>
            <ListaEmoji titulo="Alimentos aliados" items={ALIMENTOS_MENO} />
            <Card tint={c.lavandaSuave}>
              <Label>Con moderación</Label>
              <Body>{MODERACION_MENO}</Body>
            </Card>
          </>
        }
      />

      <Label style={{ marginTop: 4 }}>Platos pensados para ti</Label>
      <Platos platos={PLATOS_MENO} />

      <Label style={{ marginTop: 4 }}>Movimiento a tu medida</Label>
      <Muted>{EJERCICIO_MENO.intro}</Muted>
      {EJERCICIO_MENO.ids.map((id) => {
        const ej = ejercicioById(id);
        return ej ? <EjercicioCard key={id} ej={ej} /> : null;
      })}
    </Screen>
  );
}
