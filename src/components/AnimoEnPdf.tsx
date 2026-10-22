// Interruptor junto a los botones del PDF: los estados de ánimo solo salen si ella lo elige.
import { useStore } from '../lib/store';
import { Toggle } from './ui';

export function AnimoEnPdf() {
  const { data, updateSettings } = useStore();
  return (
    <Toggle
      label="Incluir mis estados de ánimo"
      hint="Apagado, el PDF solo lleva lo físico. Tus notas e intimidad nunca se incluyen."
      value={data.settings.pdfAnimo}
      onChange={(pdfAnimo) => updateSettings({ pdfAnimo })}
    />
  );
}
