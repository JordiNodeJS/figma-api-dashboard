# Figma Cursor - Consulta tus Drafts de Figma

Esta es una aplicación Next.js 15 con TypeScript y Tailwind CSS 4 que te permite consultar y gestionar tus drafts de Figma de forma fácil y visual.

## Características

- 🎨 Visualización de drafts de Figma en una interfaz moderna
- 🔍 Búsqueda de drafts por nombre
- 📱 Diseño responsivo y optimizado para mobile
- 🌙 Soporte para modo oscuro
- ⚡ Carga rápida con Next.js 15 y Turbopack
- 🔒 Integración segura con la API de Figma

## Configuración

### 1. Obtener un Token de Acceso de Figma

1. Ve a [Figma Account Settings](https://www.figma.com/settings)
2. Navega a la sección "Personal access tokens"
3. Haz clic en "Generate new token"
4. Dale un nombre descriptivo al token (ej: "Figma Cursor App")
5. Copia el token generado (guárdalo en un lugar seguro)

### 2. Configurar Variables de Entorno

1. Copia el archivo `.env.local` en el directorio raíz del proyecto
2. Edita el archivo y reemplaza `your_figma_access_token_here` con tu token de Figma:

```bash
# Figma API Configuration
FIGMA_ACCESS_TOKEN=tu_token_de_figma_aqui
```

### 3. Instalar Dependencias y Ejecutar

**Este proyecto utiliza Bun como gestor de paquetes principal:**

```bash
# Instalar dependencias
bun install

# Ejecutar en modo desarrollo
bun dev
```

## Uso

1. Una vez configurado, abre [http://localhost:3000](http://localhost:3000) en tu navegador
2. Verás una lista de tus drafts más recientes de Figma
3. Puedes buscar drafts específicos usando la barra de búsqueda
4. Haz clic en "Abrir en Figma" para acceder directamente al draft en Figma

## Tecnologías

- **Package Manager**: Bun (optimizado para velocidad)
- **Framework**: Next.js 15 con App Router y Turbopack
- **Lenguaje**: TypeScript 5+ con tipado estricto
- **Estilos**: Tailwind CSS 4
- **React**: React 19 con patrones modernos
- **API**: Integración con Figma REST API

## ¿Por qué Bun?

Bun es un runtime de JavaScript y gestor de paquetes ultrarrápido que:

- Instala dependencias hasta 30x más rápido que npm
- Ejecuta scripts de manera más eficiente
- Es compatible con el ecosistema Node.js/npm existente
- Proporciona mejor experiencia de desarrollo

## Estructura del Proyecto

```
src/
├── app/                 # App Router de Next.js
│   ├── api/            # API Routes
│   │   └── figma/      # Endpoints de Figma
│   ├── globals.css     # Estilos globales
│   ├── layout.tsx      # Layout principal
│   └── page.tsx        # Página principal
├── components/         # Componentes React
│   ├── draft-card.tsx  # Tarjeta de draft
│   ├── figma-drafts.tsx # Componente principal
│   └── loading-spinner.tsx # Spinner de carga
├── lib/               # Utilidades y servicios
│   └── figma-client.ts # Cliente de API de Figma
└── types/             # Definiciones de tipos TypeScript
    └── figma.ts       # Tipos de Figma
```

## Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Inicia el servidor de desarrollo con Turbopack

# Producción
npm run build        # Construye la aplicación para producción
npm run start        # Inicia el servidor de producción

# Calidad de código
npm run lint         # Ejecuta ESLint
```

## Contribuir

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -am 'Agrega nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte

Si tienes algún problema o pregunta, por favor abre un issue en el repositorio de GitHub.
