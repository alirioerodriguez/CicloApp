// Tarjetas de platos con receta desplegable (embarazo y menopausia).
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { fonts, radius, useColors } from '../lib/theme';
import { Body, Card, Grilla, Label, Muted, tap } from './ui';

export interface Plato {
  emoji: string;
  nombre: string;
  tiempo: string;
  etiqueta: string;
  porque: string;
  ingredientes: string[];
  pasos: string[];
}

export function Platos({ platos }: { platos: Plato[] }) {
  const c = useColors();
  const [abierto, setAbierto] = useState<string | null>(null);
  return (
    <Grilla>
      {platos.map((p) => {
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
  );
}

// Lista con emoji, título y texto (nutrientes, alimentos, cuidados).
export function ListaEmoji({ titulo, items, tint }: { titulo: string; items: { emoji: string; titulo: string; texto: string }[]; tint?: string }) {
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
