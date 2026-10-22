// "Cuídate" en modo embarazo (diseño 7h): platos, nutrientes, qué evitar, ejercicio seguro y alarmas.
import { View } from 'react-native';
import { Text } from './Texto';
import { ALARMAS_EMBARAZO, EJERCICIO_EMBARAZO, EVITAR_EMBARAZO, NUTRIENTES_EMBARAZO, PLATOS_EMBARAZO, TRIMESTRES, trimestre } from '../content/embarazo';
import { ejercicioById } from '../content/ejercicios';
import { useEmbarazo } from '../lib/embarazo';
import { fonts, serif, useColors } from '../lib/theme';
import { EjercicioCard } from './EjercicioCard';
import { ListaEmoji, Platos } from './Platos';
import { Body, Card, Columnas, Label, Muted, Screen } from './ui';
import { Icono } from './Icono';

export function CuidateEmbarazo() {
  const c = useColors();
  const { semana } = useEmbarazo();
  const tri = TRIMESTRES[trimestre(semana) - 1];

  return (
    <Screen title="Cuídate">
      <Card tint={c.rosaSuave}>
        <Text style={{ fontFamily: fonts.bold, fontSize: 11.5, letterSpacing: 1.5, color: c.muted, textTransform: 'uppercase' }}>{tri.nombre}</Text>
        <Text style={{ fontFamily: serif, fontSize: 21, lineHeight: 28, color: c.text }}>{tri.linea}</Text>
      </Card>

      <Label style={{ marginTop: 4 }}>Platos para esta etapa</Label>
      <Platos platos={PLATOS_EMBARAZO} />

      <Columnas
        izquierda={
          <>
            <ListaEmoji titulo="Nutrientes clave" items={NUTRIENTES_EMBARAZO} />
            <ListaEmoji titulo="Mejor evitar" items={EVITAR_EMBARAZO} />
          </>
        }
        derecha={
          <>
            <Label>Movimiento seguro</Label>
            <Muted>{EJERCICIO_EMBARAZO.intro}</Muted>
            {EJERCICIO_EMBARAZO.ids.map((id) => {
              const ej = ejercicioById(id);
              return ej ? <EjercicioCard key={id} ej={ej} /> : null;
            })}
            <Card tint={c.duraznoSuave}>
              <Label>Busca ayuda ya si notas</Label>
              {ALARMAS_EMBARAZO.map((a) => (
                <View key={a} style={{ flexDirection: 'row', gap: 10 }}>
                  <Icono e="⚠️" size={18} color={c.text} />
                  <Body style={{ flex: 1 }}>{a}</Body>
                </View>
              ))}
              <Muted>En una emergencia, ve a la emergencia más cercana o llama al 911.</Muted>
            </Card>
          </>
        }
      />
    </Screen>
  );
}
