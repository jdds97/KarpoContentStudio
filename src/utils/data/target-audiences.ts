// Datos de público objetivo - Target Audiences
export interface TargetAudience {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  problems: string[];
  advantages: string[];
  idealFor: string[];
  image: string;
}

export const targetAudiences: TargetAudience[] = [
  {
    id: "photographers",
    title: "Fotógrafos Profesionales y Aficionados",
    subtitle: "Alquila un Espacio Profesional para Elevar tu Fotografía",
    description: "Tanto si eres un fotógrafo profesional con clientes exigentes como si eres un aficionado apasionado que busca mejorar su portafolio, contar con un espacio adecuado puede marcar la diferencia entre una sesión exitosa y una llena de limitaciones.",
    problems: [
      "Falta de un entorno controlado: Las sesiones en exteriores dependen del clima y la luz natural, lo que puede dificultar la consistencia en los resultados.",
      "Limitaciones de espacio: No siempre se cuenta con un lugar amplio y bien equipado para realizar producciones de calidad.",
      "Costos elevados de equipo: Invertir en iluminación, fondos y accesorios de calidad puede ser costoso para fotógrafos independientes o en crecimiento.",
      "Dificultad para generar contenido profesional: Para atraer clientes o construir un portafolio sólido, se necesita un ambiente profesional que refleje calidad."
    ],
    advantages: [
      "Espacio versátil y bien equipado – Contamos con diferentes sets, fondos intercambiables e iluminación profesional para que puedas experimentar sin límites.",
      "Control total sobre la iluminación – Evita las preocupaciones del clima y logra la luz perfecta para cada toma con nuestros equipos de iluminación premium.",
      "Acceso a equipo profesional sin inversión inicial – Usa flashes, softboxes, reflectores y más sin la necesidad de comprarlos.",
      "Ambiente cómodo y privado – Ideal para sesiones con clientes, campañas comerciales o sesiones creativas sin interrupciones.",
      "Flexibilidad horaria – Reserva por horas, medio día o jornada completa, adaptándonos a tu flujo de trabajo.",
      "Ubicación estratégica – Fácil acceso para ti y tus clientes, sin complicaciones logísticas."
    ],
    idealFor: [
      "Fotógrafos profesionales que buscan un entorno de calidad para sus proyectos comerciales, editoriales o sesiones con clientes.",
      "Fotógrafos aficionados que quieren mejorar su portafolio y practicar en un espacio profesional sin limitaciones."
    ],
    image: "/images/spaces/principal-optimized.webp"
  },
  {
    id: "brands",
    title: "Marcas de Ropa y Complementos, Empresas y Startups",
    subtitle: "Un Espacio Profesional para Potenciar tu Contenido Visual",
    description: "Ya sea que representes una marca de moda, seas diseñador independiente, formes parte de una empresa consolidada o estés lanzando una startup, la calidad del contenido visual es esencial para destacar en un mercado saturado. Un espacio profesional puede ser la clave para diferenciarte de la competencia.",
    problems: [
      "Dificultad para crear contenido atractivo y profesional: La presentación visual de tus productos puede impactar directamente en las ventas y en la percepción de tu marca.",
      "Falta de un entorno adecuado para sesiones fotográficas y video: La fotografía improvisada en espacios no preparados puede afectar la estética y calidad de las imágenes.",
      "Costos elevados en producción externa: Alquilar múltiples espacios, equipos y personal puede ser costoso y complicado de gestionar.",
      "Limitaciones de logística y ambientación: No siempre se dispone de un set adaptable que permita cambiar escenografías, fondos y estilos de iluminación con facilidad."
    ],
    advantages: [
      "Espacio diseñado para marcas y campañas publicitarias – Sets personalizables con iluminación profesional y fondos intercambiables.",
      "Ambiente controlado y adaptable – Captura la esencia de tu producto sin preocuparte por factores externos como la iluminación o el clima.",
      "Producción de alta calidad sin inversión inicial – Accede a un estudio completamente equipado sin la necesidad de comprar equipo costoso.",
      "Privacidad y comodidad – Ideal para sesiones con modelos, grabaciones de campañas y contenido de branding sin interrupciones.",
      "Flexibilidad horaria y facilidad de reserva – Nos adaptamos a tu ritmo de trabajo con opciones de alquiler por horas, medio día o jornada completa.",
      "Ubicación estratégica – Fácil acceso para equipos de trabajo, modelos y colaboradores, optimizando tiempos y logística."
    ],
    idealFor: [
      "Marcas de ropa y accesorios que necesitan imágenes de impacto para e-commerce, catálogos y redes sociales.",
      "Diseñadores independientes que buscan capturar la esencia de sus colecciones en un entorno profesional.",
      "Empresas que requieren contenido visual para su branding y comunicación corporativa.",
      "Startups que necesitan imágenes atractivas y diferenciadoras para el lanzamiento de sus productos."
    ],
    image: "/images/spaces/black-zone-optimized.webp"
  },
  {
    id: "agencies",
    title: "Agencias de Publicidad y Marketing, Freelancers y Profesionales Independientes",
    subtitle: "Un Espacio Versátil para Crear, Conectar y Potenciar tu Negocio",
    description: "Si eres parte de una agencia de publicidad o marketing, eres freelancer o un profesional independiente, sabes que contar con un espacio adecuado puede marcar la diferencia en la calidad de tus proyectos y en la imagen que proyectas a clientes y colaboradores. Un estudio profesional y adaptable te permitirá optimizar cada producción, evento o reunión.",
    problems: [
      "Dificultad para encontrar un espacio profesional y versátil: Muchos estudios están diseñados solo para fotografía, sin la flexibilidad para otros usos como grabaciones, reuniones o eventos.",
      "Falta de equipamiento técnico para producciones de calidad: Contar con iluminación, fondos y equipo adecuado es esencial para campañas impactantes.",
      "Altos costos en la producción de contenido para clientes: Rentar diferentes espacios para fotografía, reuniones y eventos puede ser costoso y poco eficiente.",
      "Espacios limitados para networking y encuentros profesionales: No siempre es fácil encontrar un lugar cómodo y bien ubicado para organizar reuniones, meetups o talleres."
    ],
    advantages: [
      "Espacio adaptable para múltiples necesidades – Desde sesiones de fotos y videos hasta reuniones y eventos de networking, nuestro estudio se ajusta a tu proyecto.",
      "Equipamiento profesional incluido – Iluminación avanzada, fondos personalizables y herramientas de producción para contenido de alta calidad.",
      "Ambiente privado y profesional – Ideal para presentaciones de clientes, talleres, meetups o charlas sin interrupciones.",
      "Flexibilidad de uso – Disponible para producciones de agencias, reuniones de equipo, coworking y networking.",
      "Fácil acceso y ubicación estratégica – Perfecto para recibir clientes, colaboradores y equipos de trabajo sin complicaciones logísticas.",
      "Opción de asistencia técnica – Apoyo adicional para montaje, producción y optimización del espacio según tus necesidades."
    ],
    idealFor: [
      "Agencias de publicidad y marketing que necesitan un entorno profesional para crear contenido personalizado y de alto impacto.",
      "Freelancers y profesionales independientes que buscan un espacio donde puedan realizar reuniones, talleres y presentaciones.",
      "Organizadores de eventos de networking que requieren un ambiente privado y profesional para sus encuentros.",
      "Equipos creativos que necesitan un espacio versátil para brainstorming, coworking y producción de contenido."
    ],
    image: "/images/spaces/cyclorama-optimized.webp"
  },
  {
    id: "podcasters",
    title: "Podcasters y Creadores de Contenido Audiovisual",
    subtitle: "Un Espacio Profesional para Elevar tu Podcast y Contenido Audiovisual",
    description: "Tanto si eres un podcaster profesional, un creador de contenido en crecimiento o estás iniciando en el mundo del audiovisual, la calidad de tu producción es clave para destacar. Contar con un espacio adecuado puede marcar la diferencia en el impacto y credibilidad de tu contenido.",
    problems: [
      "Dificultad para encontrar un espacio insonorizado y equipado: La grabación en casa o en entornos no preparados puede afectar la calidad del sonido y la producción general.",
      "Altos costos de equipamiento: Micrófonos, cámaras, iluminación y acondicionamiento acústico pueden representar una inversión inicial elevada.",
      "Falta de un fondo y ambientación adecuados: No todos los creadores tienen acceso a un set profesional que les permita generar contenido visual atractivo y dinámico.",
      "Problemas de iluminación y sonido: La mala calidad de audio y video puede afectar la retención de la audiencia y la profesionalidad del contenido."
    ],
    advantages: [
      "Sala equipada para podcasters – Micrófonos de alta calidad, buena iluminación y paredes con diferentes estilos para adaptar cada episodio.",
      "Espacio insonorizado y profesional – Evita ruidos externos y graba con una calidad óptima sin interrupciones.",
      "Iluminación y escenografía personalizable – Adapta el fondo y la ambientación según el estilo de tu contenido.",
      "Acceso a equipo profesional sin inversión inicial – Micrófonos, cámaras y herramientas de edición listas para usar.",
      "Espacio adaptable para videos y streamings – Perfecto para Youtubers, creadores de contenido y streamers que buscan mejorar la producción de sus videos.",
      "Ubicación estratégica y comodidad – Un entorno diseñado para la creatividad, sin distracciones ni complicaciones logísticas."
    ],
    idealFor: [
      "Podcasters que quieren producir episodios con calidad profesional sin preocuparse por la inversión en equipos.",
      "Creadores de contenido audiovisual que necesitan un set adaptable para grabar videos de alto impacto.",
      "Youtubers y streamers que buscan un espacio bien iluminado y versátil para generar contenido.",
      "Equipos de producción que requieren un entorno controlado para entrevistas, grabaciones y transmisiones en vivo."
    ],
    image: "/images/spaces/sample.webp"
  }
];
