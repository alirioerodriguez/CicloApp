// Modo pareja: lo que ve quien la acompaña. Acciones concretas para hoy, planes y comida según su fase.
// Habla a la pareja de "tú" y sin suponer su género. Nunca menciona síntomas ni anticoncepción, ni nada de lo que ella registra.
// `cercania` es una pista sutil y general de la fase (no un dato de ella): solo se muestra si ella la elige compartir.
// Información de bienestar general, no consejo médico. Fuentes de alimentación: ver content/alimentos.

export type FasePareja = 'menstrual' | 'folicular' | 'ovulatoria' | 'lutea' | 'spm' | 'general' | 'embarazo' | 'posparto' | 'meno';

export interface ContenidoPareja {
  nombre: string; // nombre corto de la fase para la pareja
  emoji: string;
  como: string | null; // cómo puede sentirse
  energia: 'baja' | 'media' | 'alta' | null;
  misiones: string[]; // una por día, rotan
  citas: string[];
  platos: string[];
  mimos: string[]; // masajes y cuidados, uno por día
  cercania: string | null; // pista sutil de cercanía; solo si ella elige compartirla
  evitar: string | null;
}

export const PAREJA: Record<FasePareja, ContenidoPareja> = {
  menstrual: {
    nombre: 'Fase menstrual',
    emoji: '🌙',
    como: 'Tiene menos energía y puede tener cólicos. Lo que más ayuda: calma y cero presión.',
    energia: 'baja',
    misiones: [
      'Encárgate de la cena hoy sin preguntarle qué quiere: resuélvelo tú.',
      'Prepárale una bolsa de agua tibia o una infusión caliente.',
      'Hazte cargo de una tarea de la casa que normalmente hace ella.',
      'Propón un plan tranquilo en casa y deja que ella elija la película.',
      'Llévale un chocolate oscuro: tiene magnesio y le cae bien estos días.',
    ],
    citas: ['Noche de manta, película y comida pedida.', 'Un desayuno tranquilo en casa, sin apuro.', 'Un paseo corto y lento, si a ella le provoca.'],
    platos: ['Sopa caliente de pollo y verduras', 'Lentejas guisadas con arroz', 'Carne magra a la plancha con espinaca', 'Un chocolate caliente'],
    mimos: ['Un masaje suave en la parte baja de la espalda, con una bolsa de agua tibia.', 'Masajéale los pies con crema mientras ven algo.', 'Un abrazo largo y una manta: a veces es todo lo que hace falta.'],
    cercania: null,
    evitar: 'Mejor sin café ni té junto a la comida: le quitan el hierro que más necesita estos días.',
  },
  folicular: {
    nombre: 'Fase folicular',
    emoji: '🌱',
    como: 'Le vuelve la energía y suele tener más ganas de salir y probar cosas nuevas.',
    energia: 'alta',
    misiones: [
      'Proponle un plan nuevo esta semana: un sitio que no conozcan.',
      'Pregúntale por sus proyectos: es buen momento para planear juntos.',
      'Invítala a moverse contigo: una caminata larga, bici o baile.',
      'Sorpréndela con una salida espontánea.',
    ],
    citas: ['Probar un restaurante nuevo.', 'Una clase juntos: baile, cocina o cerámica.', 'Un paseo de día: playa, montaña o parque.'],
    platos: ['Ensalada con pollo a la plancha y aguacate', 'Ceviche o pescado fresco', 'Arroz con verduras y huevo', 'Frutas frescas con yogur'],
    mimos: ['Un masaje de hombros después de un día largo.', 'Prepárale una ducha caliente con su música favorita.', 'Un masaje de cuello y cabeza, sin apuro.'],
    cercania: 'Con la energía de vuelta suelen volver las ganas de cercanía. Buen momento para coquetear, si ella también quiere.',
    evitar: null,
  },
  ovulatoria: {
    nombre: 'Su mejor momento',
    emoji: '✨',
    como: 'Está en su punto de más energía y más sociable del mes.',
    energia: 'alta',
    misiones: [
      'Planea una cita de noche: es su mejor momento para salir.',
      'Organiza algo con amigos: suele disfrutar más la compañía.',
      'Dile algo que admiras de ella.',
      'Propón esa salida que tenían pendiente.',
    ],
    citas: ['Cena fuera y algo de música en vivo.', 'Plan con amigos: parrilla, karaoke o juegos.', 'Una escapada de un día.'],
    platos: ['Pescado al horno con verduras', 'Ensalada de espinaca, frutos rojos y nueces', 'Brócoli o coliflor salteados con pollo', 'Agua de frutas fresca'],
    mimos: ['Un masaje relajante con aceite, música suave y sin apuro.', 'Un masaje de espalda completo, con las luces bajas.', 'Acaríciale el pelo mientras charlan.'],
    cercania: 'Suelen ser sus días de más ganas de cercanía. Si la vienes cuidando, la noche puede terminar muy bien… si ella también quiere.',
    evitar: null,
  },
  lutea: {
    nombre: 'Fase lútea',
    emoji: '🍂',
    como: 'Su energía empieza a bajar y puede tener más hambre. Mejor planes con calma.',
    energia: 'media',
    misiones: [
      'Ten a mano algo rico y sano para picar: frutos secos o fruta con mantequilla de maní.',
      'Ayúdala con sus pendientes: ofrécete a hacer una diligencia.',
      'Propón una caminata suave después de cenar.',
      'Prepara algo caliente y reconfortante para la noche.',
    ],
    citas: ['Cocinar juntos en casa.', 'Una caminata tranquila al atardecer.', 'Juegos de mesa o una serie juntos.'],
    platos: ['Batata o papa al horno con pollo', 'Pasta integral con salsa de tomate y verduras', 'Avena con fruta y canela', 'Pescado con arroz integral'],
    mimos: ['Un masaje de pies al final del día.', 'Un masaje en la espalda baja con aceite tibio.', 'Una infusión caliente y un rato abrazados en el sofá.'],
    cercania: null,
    evitar: 'Mejor poca sal y poco alcohol: aumentan la hinchazón.',
  },
  spm: {
    nombre: 'Días antes de su período',
    emoji: '🌧️',
    como: 'Puede estar más sensible, cansada o con antojos. No es contigo: es hormonal y pasa.',
    energia: 'baja',
    misiones: [
      'No juzgues sus antojos: llévale algo dulce o su comida favorita.',
      'Baja el ritmo: deja las conversaciones pesadas para otro día.',
      'Pregúntale cómo se siente y escucha sin intentar arreglarlo.',
      'Asegúrate de que en casa haya lo que suele necesitar esos días.',
      'Ofrécele un masaje en la espalda o los pies.',
    ],
    citas: ['Plan en casa: su comida favorita y una película.', 'Un baño tibio preparado por ti.', 'Una salida corta y sin presión.'],
    platos: ['Chocolate oscuro con frutos secos', 'Crema de calabaza o de zanahoria', 'Avena caliente con canela y fruta', 'Arroz con pollo'],
    mimos: ['Un masaje suave en la espalda o la cabeza, sin que tenga que pedirlo.', 'Masajéale los pies mientras ven su serie favorita.', 'Prepárale un baño tibio con sales o aceite.'],
    cercania: null,
    evitar: 'Mejor poco café y poca sal: pueden empeorar la irritabilidad y la hinchazón.',
  },
  general: {
    nombre: 'Hoy',
    emoji: '🤝',
    como: null,
    energia: null,
    misiones: [
      'Pregúntale qué necesita hoy, sin dar por hecho cómo se siente.',
      'Encárgate de una comida hoy.',
      'Dile algo que admiras de ella.',
      'Propón un plan que a ella le guste.',
    ],
    citas: ['Cocinar juntos en casa.', 'Probar un sitio nuevo.', 'Un paseo al aire libre.'],
    platos: ['Pollo o pescado con verduras', 'Lentejas guisadas con arroz', 'Frutas frescas con yogur'],
    mimos: ['Un masaje de hombros sin que te lo pida.', 'Un abrazo largo al llegar a casa.'],
    cercania: null,
    evitar: null,
  },
  embarazo: {
    nombre: 'Embarazo',
    emoji: '🤰',
    como: 'Su cuerpo trabaja todo el día: el cansancio y los cambios de ánimo son normales.',
    energia: null,
    misiones: [
      'Ofrécete a acompañarla a su próximo control.',
      'Encárgate de una comida hoy.',
      'Dale un masaje suave en los pies o la espalda.',
      'Preparen juntos algo para la llegada del bebé.',
    ],
    citas: ['Una cena tranquila en casa.', 'Un paseo corto al aire libre.', 'Una sesión de fotos de la barriga.'],
    platos: ['Lentejas guisadas con arroz', 'Pollo bien cocido con verduras', 'Frutas bien lavadas con yogur'],
    mimos: ['Un masaje suave en los pies o la espalda baja, sin presionar fuerte.', 'Ayúdala a ponerse crema en la barriga o las piernas.'],
    cercania: null,
    evitar: 'Nada de carnes, pescados ni huevos crudos o poco cocidos, y nada de alcohol.',
  },
  posparto: {
    nombre: 'Posparto',
    emoji: '🍼',
    como: 'Está recuperándose y durmiendo poco. Tu ayuda práctica vale más que cualquier regalo.',
    energia: null,
    misiones: [
      'Encárgate de una toma de noche para que ella duerma 4 horas seguidas.',
      'Atiende las visitas y ponles límite si ella está cansada.',
      'Tenle siempre agua y algo de comer a mano.',
      'Encárgate de la casa hoy: lavar, cocinar y ordenar.',
    ],
    citas: ['Un rato a solas mientras alguien de confianza cuida al bebé.', 'Un paseo corto con el bebé.'],
    platos: ['Sopa o guiso nutritivo', 'Avena con fruta', 'Algo fácil de comer con una mano: frutos secos, queso o fruta'],
    mimos: ['Un masaje de hombros y cuello: cargar al bebé cansa mucho.', 'Cuida tú al bebé y regálale una ducha larga y tranquila.'],
    cercania: null,
    evitar: null,
  },
  meno: {
    nombre: 'Menopausia',
    emoji: '🌸',
    como: 'Puede tener bochornos o dormir mal. Paciencia y buen descanso ayudan mucho.',
    energia: null,
    misiones: [
      'Baja la temperatura del cuarto esta noche.',
      'Propón una caminata juntos.',
      'Pregúntale cómo durmió y ayúdala a descansar.',
      'Dile algo que admiras de ella.',
    ],
    citas: ['Una clase de baile o yoga juntos.', 'Una cena ligera y temprano.', 'Un paseo al aire libre.'],
    platos: ['Pescado con verduras', 'Yogur o queso con fruta', 'Ensalada con garbanzos'],
    mimos: ['Un masaje de pies antes de dormir.', 'Un masaje de cuello y hombros para ayudarla a relajarse.'],
    cercania: null,
    evitar: 'Mejor poco alcohol, picante y café en la noche: pueden empeorar los bochornos.',
  },
};

export const INTRO_PAREJA =
  'Con un código, tu pareja ve en Savia en qué etapa estás y qué puede hacer por ti cada día. Nunca ve tus síntomas, tus notas, tu ánimo ni tu vida íntima.';

export const PRIVACIDAD_PAREJA = 'Solo ve lo que ella eligió compartir. Nunca sus síntomas, notas, ánimo ni vida íntima.';
