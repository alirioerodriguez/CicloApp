// "Cuídate" en modo embarazo (diseño 7h): platos, nutrientes, qué evitar, ejercicio seguro y alarmas.
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ALARMAS_EMBARAZO, EJERCICIO_EMBARAZO, EVITAR_EMBARAZO, NUTRIENTES_EMBARAZO, PLATOS_EMBARAZO, TRIMESTRES, trimestre } from '../content/embarazo';
import { ejercicioById } from '../content/ejercicios';
import { useEmbarazo } from '../lib/embarazo';
import { fonts, radius, serif, useColors } from '../lib/theme';
import { EjercicioCard } from './EjercicioCard';
import { Body, Card, Columnas, Grilla, Label, Muted, Screen, tap } from './ui';

function Lista({ titulo, items, tint }: { titulo: string; items: { emoji: string; titulo: string; texto: string }[]; tint?: string }) {
  const c = useColors();
  return (
    <Card tint={tint}>
      <Label>{titulo}</Label>
      {items.map((r, i) => (
        <View key={r.titulo} style={{ flexDirection: 'row', gap: 12, paddingVertical: 6, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
          <Text style={{ fontSize: 22 }}>{r.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Body style={{ fontWeight: '700' }}>{r.titulo}</Body>
            <Muted>{r.texto}</Muted>
          </View>
        </View>
      ))}
    </Card>
  );
}

export function CuidateEmbarazo() {
  const c = useColors();
  const { semana } = useEmbarazo();
  const tri = TRIMESTRES[trimestre(semana) - 1];
  const [abierto, setAbierto] = useState<string | null>(null);

  return (
    <Screen title="Cuídate">
      <Card tint={c.rosaSuave}>
        <Text style={{ fontFamily: fonts.bold, fontSize: 11.5, letterSpacing: 1.5, color: c.muted, textTransform: 'uppercase' }}>{tri.nombre}</Text>
        <Text style={{ fontFamily: serif, fontSize: 21, lineHeight: 28, color: c.text }}>{tri.linea}</Text>
      </Card>

      <Label style={{ marginTop: 4 }}>Platos para esta etapa</Label>
      <Grilla>
        {PLATOS_EMBARAZO.map((p) => {
          const open = abierto === p.nombre;
          return (
            <Pressable
              key={p.nombre}
              accessibilityRole="button"
              accessibilityState={{ expanded: open }}
              onPress={() => {
                tap();
                setAbierto(open ? null : p.nombre);
              }}
            >
              <Card style={{ flex: 1, gap: 6 }}>
                <View style={{ height: 70, borderRadius: radius.md, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 34 }}>{p.emoji}</Text>
                </View>
                <Label>{p.nombre}</Label>
                <Muted>
                  {p.tiempo} · {p.etiqueta}
                </Muted>
                {open && (
                  <View style={{ gap: 6, marginTop: 4 }}>
                    <Body>{p.porque}</Body>
                    <Body style={{ fontWeight: '700' }}>Ingredientes</Body>
                    {p.ingredientes.map((x) => (
                      <Muted key={x}>• {x}</Muted>
                    ))}
                    <Body style={{ fontWeight: '700' }}>Pasos</Body>
                    {p.pasos.map((x, i) => (
                      <Muted key={x}>
                        {i + 1}. {x}
                      </Muted>
                    ))}
                  </View>
                )}
                <Text style={{ fontFamily: fonts.semibold, fontSize: 13, color: c.rosa }}>{open ? 'Cerrar' : 'Ver receta'}</Text>
              </Card>
            </Pressable>
          );
        })}
      </Grilla>

      <Columnas
        izquierda={
          <>
            <Lista titulo="Nutrientes clave" items={NUTRIENTES_EMBARAZO} />
            <Lista titulo="Mejor evitar" items={EVITAR_EMBARAZO} />
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
                  <Text>⚠️</Text>
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
