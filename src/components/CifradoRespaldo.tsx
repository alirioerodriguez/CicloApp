// Perfil → Tu cuenta: cifrar el respaldo de la nube con una frase que solo sabe la usuaria (AES-256-GCM, lib/cifrado).
// Con el cifrado activo Neon y Vercel guardan datos ilegibles. La frase no se guarda: al reabrir la app hay que ponerla.
import { useState } from 'react';
import { useStore } from '../lib/store';
import { FraseModal } from './FraseModal';
import { Body, Button, Divider, Muted, confirm, notify } from './ui';

type Que = 'activar' | 'desbloquear' | null;

export function CifradoRespaldo() {
  const { cifradoNube, activarCifradoNube, desbloquearNube, desactivarCifradoNube } = useStore();
  const [abierto, setAbierto] = useState<Que>(null);

  return (
    <>
      <Divider />
      <Body style={{ fontWeight: '600' }}>Cifrar mi respaldo</Body>
      {cifradoNube === 'no' && (
        <>
          <Muted>Tu respaldo en la nube se guarda protegido por tu cuenta. Si quieres que nadie pueda leerlo, ni siquiera quien administra el servidor, cífralo con una frase que solo tú sabes.</Muted>
          <Button small kind="soft" label="Cifrar mi respaldo" onPress={() => setAbierto('activar')} />
        </>
      )}
      {cifradoNube === 'bloqueado' && (
        <>
          <Muted>Tu respaldo está cifrado. Pon tu frase para verlo y seguir respaldando. Mientras tanto, tus datos siguen guardados en este teléfono.</Muted>
          <Button small label="Poner mi frase" onPress={() => setAbierto('desbloquear')} />
        </>
      )}
      {cifradoNube === 'activo' && (
        <>
          <Muted>✓ Tu respaldo está cifrado. Al cerrar la app tendrás que volver a poner tu frase.</Muted>
          <Button
            small
            kind="ghost"
            label="Dejar de cifrar"
            onPress={async () => {
              if (!(await confirm('¿Dejar de cifrar?', 'Tu respaldo volverá a guardarse sin cifrar, protegido solo por tu cuenta.', 'Dejar de cifrar'))) return;
              try {
                await desactivarCifradoNube();
              } catch (e) {
                notify('No se pudo', e instanceof Error ? e.message : String(e));
              }
            }}
          />
        </>
      )}

      <FraseModal
        visible={abierto === 'activar'}
        crear
        titulo="Cifrar mi respaldo"
        mensaje="Elige una frase larga que puedas recordar. Con ella se cifran tus datos antes de salir de tu teléfono."
        okLabel="Cifrar"
        onCancel={() => setAbierto(null)}
        onOk={async (frase) => {
          await activarCifradoNube(frase);
          setAbierto(null);
          notify('Listo', 'Tu respaldo ahora está cifrado.');
        }}
      />
      <FraseModal
        visible={abierto === 'desbloquear'}
        titulo="Tu frase"
        mensaje="Pon la frase con la que cifraste tu respaldo."
        okLabel="Abrir"
        onCancel={() => setAbierto(null)}
        onOk={async (frase) => {
          await desbloquearNube(frase);
          setAbierto(null);
        }}
      />
    </>
  );
}
