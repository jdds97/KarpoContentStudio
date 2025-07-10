# The Content Studio - KarpoContentStudio

## Propósito del Proyecto

**The Content Studio** es una plataforma web profesional para un estudio creativo multifuncional ubicado en Sevilla. La aplicación permite a fotógrafos, creadores de contenido, podcasters, marcas y profesionales del marketing descubrir, explorar y reservar espacios creativos especializados para sus producciones.

### Características Principales

- **Gestión de Reservas**: Sistema completo de reservas con calendario integrado y validación de disponibilidad en tiempo real
- **Espacios Multifuncionales**: Presentación de diferentes espacios (ciclorama, zona de fondos de colores, Creative Studio)
- **Público Objetivo**: Secciones dedicadas a diferentes perfiles profesionales
- **Sistema de Tarifas**: Información detallada de precios y paquetes disponibles
- **Panel Administrativo**: Gestión completa de reservas, calendario y configuración
- **Experiencia Responsiva**: Diseño optimizado para todos los dispositivos

## Stack Tecnológico

### Frontend & Framework
- **[Astro](https://astro.build/)** - Framework web moderno para sitios de alto rendimiento
- **TypeScript** - Tipado estático para JavaScript
- **Tailwind CSS** - Framework de utilidades CSS para diseño responsivo

### Backend & Base de Datos
- **Supabase** - Backend como servicio con PostgreSQL
- **Resend** - Servicio de email transaccional para notificaciones

### Herramientas de Desarrollo
- **Jest** - Framework de testing para JavaScript/TypeScript
- **ESLint** - Análisis estático de código
- **Node.js** - Entorno de ejecución para desarrollo

### Hosting & Deployment
- **Cloudflare Pages** - Hosting y CDN para el frontend
- **Adaptadores**: Configuración dual (Node.js para desarrollo, Cloudflare para producción)

## Estructura del Proyecto

```
src/
├── actions/           # Acciones del servidor (Astro Actions)
├── components/        # Componentes reutilizables
│   ├── booking/      # Componentes del sistema de reservas
│   ├── common/       # Componentes compartidos (Header, Footer, SEO)
│   ├── faq/          # Componentes de preguntas frecuentes
│   ├── home/         # Componentes específicos de la homepage
│   ├── icons/        # Iconos SVG como componentes
│   ├── rates/        # Componentes de tarifas y precios
│   └── studio/       # Componentes de espacios del estudio
├── layouts/          # Layouts base para páginas
├── lib/              # Bibliotecas y utilidades (Supabase, validaciones)
├── pages/            # Páginas de la aplicación (rutas)
│   ├── admin/        # Panel administrativo
│   ├── api/          # Endpoints de API
│   └── *.astro       # Páginas públicas
├── scripts/          # Scripts de cliente para interactividad
├── styles/           # Estilos globales y CSS
├── tests/            # Suite de pruebas
│   ├── api/          # Tests de endpoints
│   ├── frontend/     # Tests de componentes frontend
│   └── integration/  # Tests de integración
├── types/            # Definiciones de tipos TypeScript
└── utils/            # Utilidades, constantes y datos
    ├── admin/        # Utilidades específicas del admin
    ├── constants/    # Configuración del sitio
    ├── data/         # Datos estáticos y esquemas
    └── types/        # Tipos compartidos
```

## Páginas y Funcionalidades

### Páginas Públicas
- **Homepage** (`/`) - Presentación principal con hero section y overview de servicios
- **Espacios del Estudio** (`/studio-spaces`) - Galería detallada de los espacios disponibles
- **Público Objetivo** (`/target-audiences`) - Secciones para diferentes tipos de usuarios
- **Tarifas** (`/rates`) - Información de precios y paquetes
- **FAQ** (`/faq`) - Preguntas frecuentes organizadas por categorías
- **Contacto** (`/contact`) - Formulario de contacto e información
- **Reservas** (`/booking`) - Sistema completo de reservas con calendario

### Panel Administrativo
- **Dashboard** (`/admin`) - Panel principal de administración
- **Gestión de Reservas** - CRUD completo de reservas
- **Calendario** - Vista de calendario con disponibilidad
- **Configuración** - Ajustes del sistema

### API Endpoints
- **Reservas** (`/api/bookings/*`) - CRUD de reservas
- **Calendario** (`/api/calendar/*`) - Validación de disponibilidad
- **Email** (`/api/email/*`) - Envío de notificaciones
- **Descuentos** (`/api/discounts/*`) - Sistema de códigos promocionales

## Arquitectura y Patrones

### Gestión de Estado
- **Utilidades Centralizadas**: Configuración y datos en `/src/utils/`
- **Validación de Esquemas**: Zod para validación de formularios y API
- **Tipado Fuerte**: TypeScript en toda la aplicación

### Sistema de Componentes
- **Componentes Astro**: Para rendering del servidor
- **Scripts de Cliente**: JavaScript vanilla para interactividad
- **Diseño Modular**: Componentes reutilizables y especializados

### Base de Datos
- **Supabase PostgreSQL**: Almacenamiento principal
- **Row Level Security**: Seguridad a nivel de fila
- **Triggers y Funciones**: Lógica de negocio en la base de datos

### Comunicación
- **Resend**: Email transaccional para confirmaciones y notificaciones
- **Webhooks**: Integración con servicios externos
- **Real-time**: Actualizaciones en tiempo real para el calendario

## Características Técnicas

### Rendimiento
- **Server-Side Rendering**: Astro para carga rápida inicial
- **Optimización de Imágenes**: Compresión automática y lazy loading
- **CSS Optimizado**: Tailwind CSS con purging automático
- **Minificación**: Compresión de assets en producción

### SEO y Accesibilidad
- **Meta Tags Dinámicos**: SEO optimizado por página
- **Structured Data**: Datos estructurados para motores de búsqueda
- **Responsive Design**: Adaptación a todos los dispositivos
- **Web Vitals**: Optimización para Core Web Vitals

### Seguridad
- **Validación de Entrada**: Sanitización de todos los inputs
- **HTTPS**: Comunicación segura
- **CORS**: Configuración de políticas de origen cruzado
- **Environment Variables**: Configuración segura de credenciales

## Testing

El proyecto incluye una suite completa de tests:

### Tests de API
- Validación de endpoints de reservas
- Tests de disponibilidad de calendario
- Validación de esquemas de datos

### Tests Frontend
- Validación de formularios
- Interactividad de componentes
- Manejo de estados de error

### Tests de Integración
- Flujos completos de usuario
- Integración con servicios externos
- Escenarios de error y recuperación

## Configuración del Entorno

### Variables de Entorno Requeridas
```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Resend (Email)
RESEND_API_KEY=your_resend_api_key

# Configuración adicional
PUBLIC_SITE_URL=your_site_url
```

### Scripts Disponibles
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build para producción
- `npm run preview` - Vista previa del build
- `npm test` - Ejecutar tests
- `npm run check` - Verificación de tipos TypeScript

## Contribución

Este proyecto está desarrollado para The Content Studio y mantiene altos estándares de calidad:

- **Código TypeScript**: Tipado estático obligatorio
- **Tests**: Cobertura de código requerida
- **Documentación**: Comentarios JSDoc para funciones complejas
- **Estilo de Código**: Configuración de ESLint y Prettier

---

**The Content Studio** - El espacio donde tu creatividad cobra vida en Sevilla.