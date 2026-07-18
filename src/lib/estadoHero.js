export const ESTADO_HERO = {
  borrador: {
    mascot: '/img/IAseñalandoderecha.svg',
    titulo: 'Aún no has enviado tu solicitud',
    detalle: 'Sube tu certificado de notas y envíala cuando estés listo.',
  },
  enviada: {
    mascot: '/img/Iaesperando.svg',
    titulo: 'Tu solicitud fue enviada',
    detalle: 'Un coordinador la revisará pronto.',
  },
  en_revision: {
    mascot: '/img/Iaesperando.svg',
    titulo: 'Un coordinador está revisando tu solicitud',
    detalle: 'Te avisaremos cuando avance a la siguiente etapa.',
  },
  procesando_ia: {
    mascot: '/img/Iapensando.svg',
    titulo: 'La IA está analizando tu homologación',
    detalle: 'Puede tardar hasta 1 minuto. Vuelve a esta página en un momento.',
    pulse: true,
  },
  revision_coordinador: {
    mascot: '/img/Iaesperando.svg',
    titulo: 'El coordinador está revisando el análisis de la IA',
    detalle: 'Pronto enviará tu solicitud al vicerrector para la decisión final.',
  },
  pendiente_rector: {
    mascot: '/img/Iaesperando.svg',
    titulo: 'Tu solicitud está pendiente de aprobación del vicerrector',
    detalle: 'Te notificaremos apenas se tome una decisión.',
  },
  aprobada: {
    mascot: '/img/Iaaprobada.svg',
    titulo: 'Tu homologación fue aprobada',
    detalle: 'Descarga la resolución oficial de homologación.',
    tono: 'success',
  },
  rechazada: {
    mascot: '/img/Iaerror.svg',
    titulo: 'Tu solicitud fue rechazada',
    tono: 'danger',
  },
};
