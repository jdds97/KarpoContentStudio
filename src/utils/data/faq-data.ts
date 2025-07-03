// FAQ Categories and Questions Data
export interface FaqQuestion {
  question: string;
  answer: string;
}

export interface FaqCategory {
  title: string;
  questions: FaqQuestion[];
}

export const faqCategories: FaqCategory[] = [
  {
    title: "Espacio",
    questions: [
      {
        question: "¿Cuántas zonas tiene el estudio?",
        answer: "El estudio cuenta con cuatro zonas diferenciadas, cada una diseñada para diferentes tipos de producciones. Tenemos el Ciclorama, la Zona de Fondos de Colores, la Black Zone y el Creative Studio. Puedes consultar sus características en la página de <a href='/studio-spaces' class='text-primary-black underline'>Estudio</a>."
      },
      {
        question: "¿Qué hace especial al Creative Studio?",
        answer: "El Creative Studio es nuestro espacio más versátil, diseñado específicamente para podcasters y creadores de contenido. Cuenta con cuatro paredes temáticas diferentes (ladrillo industrial, minimalista blanco, madera natural y fondo oscuro elegante), una televisión de 55 pulgadas integrada, paneles acústicos decorativos y mobiliario modular. Es ideal para grabar contenido variado sin cambiar de ubicación, perfecto para podcasts, YouTube, entrevistas corporativas y streaming profesional."
      },
      {
        question: "¿Hay un espacio disponible para maquillaje y vestuario?",
        answer: "Sí, contamos con una zona de maquillaje y vestuario equipada con espejo, camerino, dos burros con perchas y un área cómoda para cambios de ropa."
      },
      {
        question: "¿La limpieza está incluida en el precio?",
        answer: "Cada cliente es responsable de dejar el estudio en las mismas condiciones en las que lo encontró. Al finalizar la reserva (dentro del tiempo contratado), todo el equipo debe ser desmontado y colocado en su sitio.<br><br>Para grupos de más de 5 personas, se aplicará una tarifa desde 50€ por limpieza básica. En caso de dejar residuos como basura, huellas en el suelo, restos de comida o bebidas, se aplicará un cargo adicional por limpieza extra."
      },
      {
        question: "¿Se puede traer comida o bebidas al estudio?",
        answer: "Sí, puedes traer tu propia comida y bebida. Además, ponemos a tu disposición microondas, frigorífico y una máquina de café, con cápsulas, leche y agua incluidas en el alquiler.<br><br>Es importante recoger todos los restos y limpiar la zona después de su uso. En caso de no hacerlo, se aplicará un cargo adicional por limpieza."
      },
      {
        question: "¿Está permitido el uso de glitter, confeti o materiales similares?",
        answer: "No. Está estrictamente prohibido el uso de glitter, plumas pequeñas, polvos de color, pinturas en spray, confeti o petardos dentro del estudio."
      },
      {
        question: "¿El estudio cuenta con mobiliario y atrezzo?",
        answer: "Sí, disponemos de muebles, atrezzo y plantas para personalizar los sets. La mayoría de estos elementos están incluidos en el precio de alquiler."
      },
      {
        question: "¿Solo alquilan el espacio o también ofrecen servicios de fotografía?",
        answer: "Nuestro estudio se alquila principalmente para fotógrafos y otros proyectos creativos. Si necesitas un fotógrafo, podemos recomendarte especialistas de nuestra lista de colaboradores."
      },
      {
        question: "¿Realizan colaboraciones?",
        answer: "Actualmente, priorizamos las reservas de pago, por lo que no ofrecemos colaboraciones no remuneradas."
      },
      {
        question: "¿Se permite el acceso con mascotas?",
        answer: "Sí, siempre que estén bajo supervisión y no representen un riesgo para el equipo o las instalaciones. El cliente será responsable de cualquier daño o limpieza adicional que requiera su presencia."
      },
      {
        question: "¿El estudio es accesible para personas con movilidad reducida?",
        answer: "Sí, nuestras instalaciones cuentan con acceso adaptado para facilitar la entrada y el desplazamiento de personas con movilidad reducida."
      }
    ]
  },
  {
    title: "Reservas",
    questions: [
      {
        question: "¿Puedo visitar el estudio antes de reservar?",
        answer: "Sí, si deseas conocer el estudio antes de realizar tu reserva, contáctanos por teléfono o email para coordinar una visita en uno de los horarios disponibles."
      },
      {
        question: "¿Cómo puedo reservar el estudio?",
        answer: "Para consultar disponibilidad o realizar una reserva, puedes hacerlo a través de nuestra página web en la sección de <a href='/booking' class='text-primary-black underline'>Reservas</a>, donde encontrarás la opción de 'RESERVAR AHORA'."
      },
      {
        question: "¿Es necesario realizar un prepago para reservar el estudio?",
        answer: "Sí, para confirmar tu reserva, es necesario realizar el pago del importe total en el momento de la solicitud.<br><br>Una vez realizada la reserva, recibirás un correo de confirmación con todos los detalles y un enlace para efectuar el pago.<br><br>Las reservas no quedan aseguradas hasta que el pago ha sido procesado correctamente. En caso de no completar el pago en un plazo determinado, la disponibilidad del estudio podría cambiar.<br><br>Si tienes dudas antes de realizar el pago, contáctanos y estaremos encantados de ayudarte."
      },
      {
        question: "¿Puedo modificar o cancelar mi reserva?",
        answer: "Si necesitas modificar o cancelar tu reserva, debes hacerlo con al menos 48 horas de antelación a la hora de inicio de la sesión. Puedes gestionar la cancelación o modificación desde el correo de confirmación de la reserva.<br><br>En este caso, recibirás un reembolso completo (excluyendo los costes de procesamiento).<br><br>Las cancelaciones realizadas con menos de 48 horas de antelación no son reembolsables."
      },
      {
        question: "¿Me pueden enviar la factura de mi reserva?",
        answer: "Sí, para solicitar una factura, envíanos un email con los datos fiscales de tu empresa a contacto@contentstudiokrp.es."
      },
      {
        question: "¿El estudio cuenta con parking o zona de carga y descarga?",
        answer: "Sí, nuestro estudio está ubicado en una calle amplia dentro de un polígono industrial, permitiendo la carga y descarga de materiales en la puerta."
      },
      {
        question: "¿Cómo llegar al estudio?",
        answer: "El estudio está situado en una zona con excelente conexión, cerca de la S-40 y con acceso directo desde la A-92. La dirección exacta es: Calle Industria 123, Polígono Industrial, Dos Hermanas. Si tienes dudas, contáctanos y estaremos encantados de ayudarte."
      },
      {
        question: "¿Puedo reservar el estudio por solo 1 hora?",
        answer: "El tiempo mínimo de reserva es de 2 horas.<br><br>Si solo necesitas utilizar el estudio por una hora, te recomendamos compartir la reserva con otro fotógrafo o planificar varias sesiones seguidas para aprovechar el tiempo contratado."
      },
      {
        question: "¿Puedo llegar antes para maquillarme y prepararme?",
        answer: "Si necesitas tiempo para maquillaje y preparación antes de la sesión, debes incluirlo dentro del horario de tu reserva.<br><br>No contamos con una sala de maquillaje independiente fuera de las zonas de shooting, y las reservas suelen programarse sin pausas entre ellas."
      },
      {
        question: "¿Puedo llegar antes para montar el equipo?",
        answer: "El tiempo de reserva contratado incluye montaje, desmontaje, preparación de modelos (maquillaje y cambios de ropa) y limpieza del espacio usado.<br><br>Si necesitas tiempo adicional para montaje, te recomendamos reservar tiempo extra."
      },
      {
        question: "¿Qué sucede si llego tarde a mi reserva?",
        answer: "El tiempo de reserva comienza y finaliza en el horario acordado. En caso de retraso, el tiempo perdido será asumido por el cliente y no se podrá extender la reserva."
      },
      {
        question: "¿Se puede alquilar el estudio para eventos?",
        answer: "En general, sí alquilamos el estudio para eventos profesionales y workshops. Si estás interesado en realizar un evento, envíanos un mensaje a contacto@contentstudiokrp.es con los detalles, y evaluaremos tu solicitud."
      },
      {
        question: "¿Qué ocurre si necesito más tiempo del reservado?",
        answer: "Si durante tu sesión necesitas tiempo adicional, puedes extender tu reserva si hay disponibilidad. El coste de la hora extra es de 90€ +IVA por hora o fracción.<br><br>Te recomendamos reservar con tiempo de margen para evitar prisas y garantizar que puedas completar tu proyecto sin limitaciones de tiempo."
      }
    ]
  },
  {
    title: "Equipamiento",
    questions: [
      {
        question: "¿Qué tipo de iluminación tiene el estudio?",
        answer: "El estudio cuenta con entrada de luz natural, gracias a la posibilidad de abrir el portón principal.<br><br>Además, disponemos de una amplia variedad de equipos de iluminación profesional, como flashes Godox AD600Pro, SK400II, paneles LED bicolor, y diversos modificadores de luz."
      },
      {
        question: "¿Si necesito ayuda con el equipo de iluminación, me pueden asistir?",
        answer: "Sí, si es la primera vez que visitas nuestro estudio, te enseñaremos a utilizar nuestro equipo de iluminación.<br><br>Si requieres asistencia específica para montar un esquema de iluminación según tus referencias, ofrecemos un servicio de asistencia profesional por un coste adicional de 20€ por hora."
      },
      {
        question: "¿El estudio cuenta con un ciclorama?",
        answer: "Sí, nuestro ciclorama se encuentra en la zona Cyclorama y cuenta con 4 metros de ancho por 6 metros de largo.<br><br>El uso del ciclorama está incluido en la tarifa de alquiler. Sin embargo, si necesitas que sea repintado antes de tu sesión, avísanos con 72 horas de antelación. Este servicio tiene un coste adicional de 50€."
      },
      {
        question: "¿Qué fondos de color están disponibles en el estudio?",
        answer: "Disponemos de fondos de papel Colorama de 2,7 metros en una amplia gama de colores: Blanco, Verde (Chromakey), Celeste, Rojo, Azul, Rosa, Amarillo, Negro y otros colores que vamos incorporando regularmente según la demanda.<br><br>El coste por uso es de 20€ por metro pisado. Para evitar daños, ofrecemos una plancha de metacrilato transparente de 2m x 1m, que permite trabajar sin afectar los fondos y mejora los resultados en la imagen final.<br><br>Además, contamos con pared de roble clásico y reverso en mármol gris móviles, y escenarios vestidos en la zona Creative Studio, que pueden utilizarse como fondos adicionales."
      },
      {
        question: "¿El estudio tiene aire acondicionado y calefacción?",
        answer: "Sí, contamos con aire acondicionado y calefacción en la zona de grabación de podcasts.<br><br>En el resto del estudio, al ser un espacio diáfano, disponemos de ventilación natural, ventiladores y radiadores adicionales según la temporada."
      },
      {
        question: "¿Hay conexión a Internet en el estudio?",
        answer: "Sí, ofrecemos conexión WIFI de alta velocidad en todas las zonas del estudio."
      },
      {
        question: "¿El estudio cuenta con un chromakey?",
        answer: "Sí, disponemos de un fondo verde de 2.7 metros en la zona de fondos de colores, ideal para grabaciones con chromakey."
      },
      {
        question: "¿El estudio dispone de un proyector?",
        answer: "No contamos con proyector en nuestras instalaciones, pero puedes traer el tuyo o, si lo necesitas, podemos ayudarte a gestionar el alquiler de uno para tu proyecto."
      }
    ]
  }
];
