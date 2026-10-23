// Interruptores junto a los botones del PDF: los estados de ánimo solo salen si ella lo elige,
// y los datos del reloj (si los hay) se pueden quitar.
import { useStore } from '../lib/store';
import { Toggle } from './ui';

export function AnimoEnPdf() {
  const { data, updateSettings } = useStore();
  const hayReloj = Object.keys(data.reloj.dias).length > 0;
  return (
    <>
      <Toggle
        label="Incluir mis estados de ánimo"
        hint="Apagado, el PDF solo lleva lo físico. Tus notas e intimidad nunca se incluyen."
        value={data.settings.pdfAnimo}
        onChange={(pdfAnimo) => updateSettings({ pdfAnimo })}
      />
      {hayReloj && (
        <Toggle
          label="Incluir los datos de mi reloj"
          hint="Pulso, sueño y temperatura por fase, en una página aparte"
          value={data.settings.pdfReloj}
          onChange={(pdfReloj) => updateSettings({ pdfReloj })}
        />
      )}
    </>
  );
}
