<p align="center">
  <img src="public/images/logos/logo-black-optimized.webp" alt="The Content Studio" width="300">
</p>

<h1 align="center">The Content Studio</h1>

<p align="center">
  <strong>Plataforma de reservas para estudio creativo multifuncional</strong>
</p>

<p align="center">
  <a href="https://contentstudiokrp.es">
    <img src="https://img.shields.io/badge/Website-contentstudiokrp.es-black?style=for-the-badge" alt="Website">
  </a>
  <img src="https://img.shields.io/badge/Astro-5.x-BC52EE?style=for-the-badge&logo=astro&logoColor=white" alt="Astro">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/Cloudflare-Pages-F38020?style=flat-square&logo=cloudflare&logoColor=white" alt="Cloudflare">
  <img src="https://img.shields.io/badge/Resend-Email-000000?style=flat-square" alt="Resend">
  <img src="https://img.shields.io/badge/License-Private-red?style=flat-square" alt="License">
</p>

---

## Tabla de Contenidos

- [Sobre el Proyecto](#sobre-el-proyecto)
- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Scripts Disponibles](#scripts-disponibles)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Despliegue](#despliegue)
- [Contribución](#contribución)

---

## Sobre el Proyecto

**The Content Studio** es una plataforma web completa para la gestión y reserva de espacios creativos en Sevilla. Diseñada para fotógrafos, creadores de contenido, podcasters, marcas y profesionales del marketing, ofrece una experiencia de usuario optimizada con un sistema de reservas en tiempo real.

### Problema que Resuelve

- Gestión manual de reservas y disponibilidad
- Comunicación fragmentada con clientes
- Falta de visibilidad online para estudios creativos
- Procesos de reserva tediosos y propensos a errores

### Solución

Una plataforma integral que automatiza el proceso de reserva, muestra los espacios de forma atractiva y gestiona las comunicaciones con los clientes de manera eficiente.

---

## Características

### Sistema de Reservas
- Calendario interactivo con disponibilidad en tiempo real
- Validación automática de conflictos de horarios
- Soporte para múltiples espacios simultáneos
- Sistema de códigos de descuento promocionales
- Confirmación automática por email

### Gestión de Espacios
- **Ciclorama** - Fondo infinito profesional 6x4m
- **Black Zone** - Zona oscura para fotografía de producto
- **Zona Principal** - Espacio versátil multiusos
- **Podcast Studio** - Configuración optimizada para audio

### Panel Administrativo
- Dashboard con métricas y estadísticas
- Gestión completa de reservas (CRUD)
- Vista de calendario administrativa
- Configuración de disponibilidad y precios

### Experiencia de Usuario
- Diseño responsive para todos los dispositivos
- Optimización SEO con datos estructurados
- Rendimiento optimizado (Core Web Vitals)
- Interfaz intuitiva y accesible

---

## Stack Tecnológico

| Categoría | Tecnología | Propósito |
|-----------|------------|-----------|
| **Framework** | Astro 5.x | SSR/SSG híbrido, Server Islands |
| **Lenguaje** | TypeScript 5.x | Tipado estático |
| **Estilos** | Tailwind CSS 3.x | Utility-first CSS |
| **Base de Datos** | Supabase (PostgreSQL) | Backend as a Service |
| **Email** | Resend | Emails transaccionales |
| **Hosting** | Cloudflare Pages | Edge deployment |
| **Validación** | Zod | Schema validation |
| **Testing** | Jest | Unit & Integration tests |

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     Cloudflare Pages                        │
│                    (Edge Deployment)                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                      Astro Server                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Pages     │  │   Actions   │  │   API Endpoints     │  │
│  │   (SSR)     │  │  (Server)   │  │   (/api/*)          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
         ▼                ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Supabase   │  │   Resend    │  │  Cloudflare │
│  (Database) │  │   (Email)   │  │   (Assets)  │
└─────────────┘  └─────────────┘  └─────────────┘
```

### Patrones Implementados

- **Server Islands**: Componentes diferidos para mejor TTFB
- **Astro Actions**: Mutaciones type-safe del servidor
- **Row Level Security**: Políticas de seguridad en PostgreSQL
- **Edge Functions**: Procesamiento en el edge para baja latencia

---

## Instalación

### Prerrequisitos

- Node.js 18.x o superior
- npm o pnpm
- Cuenta en Supabase
- Cuenta en Resend (para emails)

### Pasos

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/KarpoContentStudio.git
cd KarpoContentStudio

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Configurar variables de entorno (ver sección Configuración)

# Iniciar servidor de desarrollo
npm run dev
```

---

## Configuración

### Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
# Supabase - Base de datos
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Resend - Emails
RESEND_API_KEY=re_tu_api_key

# Configuración del sitio
PUBLIC_SITE_URL=https://tu-dominio.com
ADMIN_EMAIL=admin@tu-dominio.com
```

### Configuración de Supabase

Ejecutar los scripts SQL en el orden indicado:

1. `scripts/supabase-complete-setup.sql` - Tablas y configuración base
2. `scripts/add-apertura40-discount.sql` - Códigos de descuento (opcional)

---

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia servidor de desarrollo en `localhost:4321` |
| `npm run build` | Genera build de producción |
| `npm run preview` | Vista previa del build de producción |
| `npm run check` | Verificación de tipos TypeScript |
| `npm test` | Ejecuta suite de tests |
| `npm run lint` | Análisis estático con ESLint |

---

## Estructura del Proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── booking/         # Sistema de reservas
│   ├── common/          # Header, Footer, SEO, Button
│   ├── home/            # Secciones de la homepage
│   ├── icons/           # Iconos SVG como componentes
│   ├── rates/           # Tarifas y precios
│   └── studio/          # Espacios del estudio
├── layouts/             # Layouts base (Layout.astro, AdminLayout.astro)
├── lib/                 # Utilidades core
│   ├── actions/         # Astro Actions (server mutations)
│   ├── supabase.ts      # Cliente de Supabase
│   ├── calendar.ts      # Lógica del calendario
│   └── database.types.ts # Tipos de la BD
├── pages/               # Rutas de la aplicación
│   ├── admin/           # Panel administrativo
│   ├── api/             # API endpoints
│   └── *.astro          # Páginas públicas
├── styles/              # CSS global
├── tests/               # Suite de pruebas
└── utils/               # Utilidades y constantes
    ├── constants/       # Configuración del sitio
    ├── data/            # Datos estáticos, templates
    └── promotions.ts    # Sistema de promociones
```

---

## API Reference

### Endpoints Públicos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/calendar/availability` | Disponibilidad mensual |
| `GET` | `/api/calendar/day-details` | Detalles de un día |
| `POST` | `/api/discount/validate` | Validar código descuento |

### Endpoints Autenticados

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/bookings/update` | Actualizar reserva |
| `POST` | `/api/auth/signin` | Iniciar sesión admin |
| `POST` | `/api/auth/signout` | Cerrar sesión |

### Astro Actions

```typescript
// Crear reserva
actions.createBooking(formData)

// Confirmar reserva
actions.confirmBooking({ bookingId, adminPassword })

// Cancelar reserva
actions.cancelBooking({ bookingId, reason })
```

---

## Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests con coverage
npm test -- --coverage

# Ejecutar tests en modo watch
npm test -- --watch
```

### Estructura de Tests

```
src/tests/
├── api/              # Tests de endpoints
├── frontend/         # Tests de componentes
├── integration/      # Tests E2E
└── utils/            # Tests de utilidades
```

---

## Despliegue

### Cloudflare Pages

El proyecto está configurado para despliegue automático en Cloudflare Pages:

1. Conectar repositorio en Cloudflare Dashboard
2. Configurar variables de entorno en Settings
3. Build command: `npm run build`
4. Output directory: `dist`

### Variables de Entorno en Producción

Configurar en Cloudflare Pages > Settings > Environment Variables:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `PUBLIC_SITE_URL`

---

## Contribución

### Convenciones de Código

- **TypeScript**: Tipado estricto obligatorio
- **Componentes**: PascalCase para archivos `.astro`
- **Utilidades**: camelCase para funciones
- **CSS**: Tailwind utilities, evitar CSS custom

### Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
style: formateo
refactor: refactorización
test: tests
chore: mantenimiento
```

---

## Licencia

Este proyecto es software privado desarrollado para **The Content Studio**.

---

<p align="center">
  <strong>The Content Studio</strong><br>
  <em>Tu espacio creativo en Sevilla</em>
</p>

<p align="center">
  <a href="https://contentstudiokrp.es">Website</a> •
  <a href="https://contentstudiokrp.es/contact">Contacto</a> •
  <a href="https://contentstudiokrp.es/booking">Reservar</a>
</p>
