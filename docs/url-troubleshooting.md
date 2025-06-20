# Diagnóstico de URLs de Figma

## URLs Verificadas que Funcionan ✅

### API Endpoints Locales

- ✅ `http://localhost:3000/` - Página principal
- ✅ `http://localhost:3000/api/figma/user` - Información de usuario
- ✅ `http://localhost:3000/api/figma/drafts` - Lista de drafts
- ✅ `http://localhost:3000/api/figma/test` - Test de conexión API
- ✅ `http://localhost:3000/api/figma/verify` - Verificar archivos específicos

### URLs de Figma Reales

- ✅ `https://api.figma.com/v1/me` - API de usuario
- ✅ `https://api.figma.com/v1/files/{fileKey}` - Acceso a archivos específicos

## Posibles Causas del Error 404

### 1. URLs de Archivo Inexistentes

Los archivos de ejemplo (`sample-file-key-1`, `sample-file-key-2`) no son reales.

**Solución**: Usar URLs reales de tus archivos de Figma.

### 2. Formato de URL Incorrecto

Formato correcto de URLs de Figma:

```
https://www.figma.com/file/FILE_KEY/FILE_NAME
https://www.figma.com/design/FILE_KEY/FILE_NAME
```

### 3. Archivo Privado o Sin Acceso

El archivo existe pero no tienes permisos para accederlo.

### 4. Token Sin Permisos Suficientes

Tu token personal puede no tener acceso a ciertos archivos o equipos.

## Cómo Obtener URLs Reales de Tus Proyectos

### Método 1: Desde Figma Desktop/Web

1. Abre Figma en tu navegador
2. Ve a tu dashboard/inicio
3. Copia la URL de cualquier archivo
4. Ejemplo: `https://www.figma.com/file/abc123/Mi-Proyecto`

### Método 2: Usar Herramienta de Verificación

Usa nuestro endpoint de verificación para validar URLs:

```bash
curl -X POST http://localhost:3000/api/figma/verify \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.figma.com/file/TU_FILE_KEY/TU_ARCHIVO"}'
```

## Comandos de Diagnóstico

```bash
# Verificar conexión básica
curl http://localhost:3000/api/figma/user

# Verificar drafts disponibles
curl http://localhost:3000/api/figma/drafts

# Probar acceso a archivo específico de Figma
curl -H "X-Figma-Token: TU_TOKEN" \
  "https://api.figma.com/v1/files/FILE_KEY_REAL"

# Verificar URL específica con nuestra herramienta
curl -X POST http://localhost:3000/api/figma/verify \
  -H "Content-Type: application/json" \
  -d '{"url": "TU_URL_DE_FIGMA"}'
```

## Próximos Pasos

1. **Obtén una URL real** de un archivo de Figma tuyo
2. **Testa la URL** con nuestro endpoint de verificación
3. **Verifica permisos** del token en Figma
4. **Usa archivos accesibles** para pruebas reales
