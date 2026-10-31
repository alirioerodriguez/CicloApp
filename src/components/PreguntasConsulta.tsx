// Embarazo: «Preguntas para mi próxima consulta». Se anotan en la semana y en la consulta se van marcando.
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { Check } from './Check';
import { Body, Button, Card, Label, Muted } from './ui';
import { today } from '../lib/dates';
import { semanasEmbarazo } from '../content/embarazo';
import { MAX_PREGUNTA, agregarPregunta, limpiarConversadas, marcarPregunta } from '../lib/preguntasConsulta';
import { t } from '../lib/region';
import { newId, useStore } from '../lib/store';
import { radius, useColors } from '../lib/theme';

export function PreguntasConsulta() {
  const c = useColors();
  const { data, update } = useStore();
  const [texto, setTexto] = useState('');
  const e = data.embarazo;
  const preguntas = Array.isArray(e.preguntas) ? e.preguntas : [];
  const conversadas = preguntas.filter((p) => p.hecha).length;

  const anotar = () => {
    if (!texto.trim()) return;
    const semana = data.settings.embarazo.fpp ? semanasEmbarazo(data.settings.embarazo.fpp) : null;
    update((d) => ({ ...d, embarazo: agregarPregunta(d.embarazo, texto, today(), semana, newId()) }));
    setTexto('');
  };

  return (
    <Card>
      <Label>Preguntas para mi próxima consulta</Label>
      <Muted>Anota las dudas cuando aparecen en la semana. En la consulta, márcalas a medida que las conversas.</Muted>
      <TextInput
        value={texto}
        onChangeText={setTexto}
        onSubmitEditing={anotar}
        placeholder={t('Por ejemplo: ¿puedo viajar en avión?')}
        placeholderTextColor={c.muted}
        maxLength={MAX_PREGUNTA}
        returnKeyType="done"
        accessibilityLabel={t('Nueva pregunta para la consulta')}
        style={{ borderRadius: radius.md, backgroundColor: c.bg, padding: 12, fontSize: 16, color: c.text }}
      />
      <Button small label="Anotar pregunta" onPress={anotar} disabled={!texto.trim()} />
      {preguntas.length === 0 ? (
        <Body>Todavía no anotaste ninguna.</Body>
      ) : (
        <View>
          {preguntas.map((p) => (
            <Check
              key={p.id}
              label={p.texto}
              sub={p.semana ? `${t('Semana')} ${p.semana}` : undefined}
              on={p.hecha}
              textoHecho="Conversada"
              onPress={() => update((d) => ({ ...d, embarazo: marcarPregunta(d.embarazo, p.id, !p.hecha) }))}
            />
          ))}
        </View>
      )}
      {conversadas > 0 && <Button small kind="ghost" label="Quitar las ya conversadas" onPress={() => update((d) => ({ ...d, embarazo: limpiarConversadas(d.embarazo) }))} />}
    </Card>
  );
}
