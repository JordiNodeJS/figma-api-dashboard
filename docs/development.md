# Configuración para VSCode y Desarrollo con Bun

## Configuración recomendada para .vscode/settings.json

```json
{
  "typescript.preferences.npmScript": "bun",
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  },
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

## Extensiones recomendadas para VSCode

- Tailwind CSS IntelliSense
- TypeScript Importer
- ES7+ React/Redux/React-Native snippets
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens
- Prettier - Code formatter
- ESLint

## Comandos útiles durante el desarrollo

```bash
# Desarrollo
bun dev

# Verificación de tipos
bun run type-check

# Linting
bun run lint

# Limpieza completa y reinstalación
bun run clean

# Agregar dependencia
bun add <package>

# Agregar dependencia de desarrollo
bun add -d <package>

# Actualizar dependencias
bun update

# Información sobre dependencias
bun outdated
```

## Configuración de Bun

Bun utiliza el archivo `bunfig.toml` para configuración personalizada (opcional):

```toml
[install]
# Configurar el registro npm
registry = "https://registry.npmjs.org"

# Configurar cache
cache = true

# Configurar modo production
production = false

[run]
# Configurar variables de entorno
env = "development"
```
