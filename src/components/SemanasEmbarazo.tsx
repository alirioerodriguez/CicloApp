// "Tus 40 semanas" (diseño 7e): todas las semanas por trimestre, con el tamaño del bebé y los controles.
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Text } from './Texto';
import { CONTROLES_OMS, TRIMESTRES, bebe } from '../content/embarazo';
import { useEmbarazo } from '../lib/embarazo';
import { fonts, serif, useColors } from '../lib/theme';
import { Card, Grilla, Screen } from './ui';
import { Icono } from './Icono';

export function SemanasEmbarazo() {
  const c = useColors();
  const { semana } = useEmbarazo();
  const controles = new Set(CONTROLES_OMS.map((x) => x.semana));

  return (
    <Screen title="Tus 40 semanas">
      <View style={{ height: 8, borderRadius: 4, backgroundColor: c.line }}>
        <View style={{ width: `${Math.min(100, (semana / 40) * 100)}%`, height: 8, borderRadius: 4, backgroundColor: c.rosa }} />
      </View>
      <Grilla>
        {TRIMESTRES.map((t) => (
          <Card key={t.n} style={{ gap: 0 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', paddingBottom: 6 }}>
              <Text style={{ flex: 1, fontFamily: fonts.bold, fontSize: 16, color: c.text }}>{t.nombre}</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 12.5, color: c.muted }}>{t.rango}</Text>
            </View>
            {Array.from({ length: t.hasta - t.desde + 1 }, (_, i) => t.desde + i).map((w) => {
              const b = bebe(w);
              const hoy = w === semana;
              return (
                <Pressable
                  key={w}
                  accessibilityRole="button"
                  accessibilityLabel={`Semana ${w}: ${b.fruta}`}
                  onPress={() => router.push(`/?semana=${w}`)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingVertical: 8,
                    paddingHorizontal: 6,
                    borderTopWidth: 1,
                    borderTopColor: c.line,
                    borderRadius: hoy ? 12 : 0,
                    backgroundColor: hoy ? c.rosaSuave : pressed ? c.bg : 'transparent',
                  })}
                >
                  <Text style={{ width: 28, fontFamily: serif, fontSize: 18, color: hoy ? c.text : c.muted }}>{w}</Text>
                  <Icono e={b.emoji} size={20} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: fonts.semibold, fontSize: 14.5, color: c.text }}>{b.fruta.replace(/^una? /, '').replace(/^./, (x) => x.toUpperCase())}</Text>
                    <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: c.muted }}>
                      {b.cm} · {b.peso}
                    </Text>
                  </View>
                  {hoy ? (
                    <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: c.rosa }}>Hoy</Text>
                  ) : controles.has(w) ? (
                    <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: c.lavandaTexto }}>control</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </Card>
        ))}
      </Grilla>
    </Screen>
  );
}
