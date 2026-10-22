// Tutorial que se muestra al entrar por primera vez (y desde Perfil → Ver el tutorial). Editable.
import { nubeConfigurada } from '../lib/nube';

export interface Slide {
  emoji: string;
  titulo: string;
  texto: string;
  puntos: string[];
  figura?: string; // id de un ejercicio para mostrar animado
  logo?: boolean;
}

export const TUTORIAL: Slide[] = [
  {
    emoji: '🌸',
    logo: true,
    titulo: 'Te damos la bienvenida a Savia',
    texto: 'Registra tu período, entiende tu cuerpo y cuídate a tu ritmo. Te mostramos todo en un minuto.',
    puntos: ['Predicciones que aprenden de ti', 'Ideas y ejercicios según tu fase', nubeConfigurada ? 'Privada: solo tu cuenta ve tus datos' : 'Privada: todo queda en tu teléfono'],
  },
  {
    emoji: '☀️',
    titulo: 'Hoy',
    texto: 'Tu pantalla de cada día.',
    puntos: [
      'El anillo te dice cuántos días faltan para tu período o en qué día del ciclo estás.',
      '"Me vino hoy" marca el inicio de tu período con un toque.',
      'Registra flujo, dolor, ánimo, síntomas, ovarios y senos, intimidad, agua y notas. Todo es opcional.',
    ],
  },
  {
    emoji: '📅',
    titulo: 'Calendario',
    texto: 'Tu mes de un vistazo.',
    puntos: [
      'Rosa: período · borde punteado: período estimado.',
      'Lila y durazno: días fértiles y ovulación estimados (no se muestran si tomas pastilla).',
      'Toca un día para ver o editar lo que anotaste. Usa "Marcar días de período" para corregir fechas.',
    ],
  },
  {
    emoji: '🧘‍♀️',
    figura: 'puente',
    titulo: 'Cuídate y muévete',
    texto: 'Ideas para cada fase de tu ciclo.',
    puntos: [
      'Una recomendación, un mimo y una frase distintos cada día.',
      'Ejercicios animados con las repeticiones y series recomendadas.',
      'Alivio inmediato: respiración guiada y movimientos suaves para los cólicos.',
      'Alimentación por fase y cuándo conviene consultar.',
    ],
  },
  {
    emoji: '📊',
    titulo: 'Resumen',
    texto: 'Lo que tu cuerpo te va contando.',
    puntos: [
      'Ciclo y período promedio, y tus patrones ("tus cólicos suelen aparecer el día 1 y 2").',
      '"Para tu próxima consulta": señales que vale la pena comentar con tu ginecóloga.',
      'Logros, y un resumen en PDF para llevar a tu cita.',
    ],
  },
  {
    emoji: '🩺',
    titulo: 'Salud ginecológica y diario',
    texto: 'Desde Perfil → Más para ti.',
    puntos: [
      'Tus controles (PAP, ecografía, control anual) con aviso unos días antes.',
      'Guía de autoexamen de mamas en el mejor momento del ciclo.',
      'Historial de dolor de ovarios y registro de quistes.',
      'Diario de sueños, solo para ti.',
    ],
  },
  {
    emoji: '🔔',
    titulo: 'Recordatorios',
    texto: 'Funcionan con la app cerrada.',
    puntos: [
      'Pastilla (con aviso si pasó la hora), blíster nuevo y descanso.',
      'Período próximo, registro diario, autoexamen, controles y agua.',
      'Modo discreto: en la pantalla bloqueada solo dice "Savia".',
    ],
  },
  {
    emoji: '🔒',
    titulo: 'Tu privacidad',
    texto: 'Tus datos son tuyos.',
    puntos: [
      ...(nubeConfigurada
        ? [
            'Tus datos se guardan en el teléfono y se respaldan en tu cuenta: si cambias de teléfono, entras con tu correo y están ahí.',
            'Nadie más puede verlos: cada cuenta solo accede a lo suyo. Sin publicidad.',
          ]
        : ['Todo se guarda solo en este teléfono: sin cuentas, sin servidores, sin publicidad.']),
      'Puedes proteger la app con huella o Face ID.',
      'También puedes descargar una copia en un archivo cuando quieras.',
      'Personaliza el color y el modo Noche o Día en Perfil.',
    ],
  },
  {
    emoji: '🧪',
    titulo: 'Ayúdanos a mejorar',
    texto: 'Savia crece con lo que nos cuentas.',
    puntos: [
      'En Perfil → Ayúdanos a mejorar hay pruebas cortas: misiones de 1 minuto y un cuestionario.',
      'Tú decides si compartes los resultados.',
    ],
  },
];
