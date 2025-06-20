# Guía: Cómo Acceder a Tus Proyectos Reales de Figma

## ✅ Estado: Todas las URLs están verificadas y funcionando

### URLs de la Aplicación (Funcionando)

- ✅ Principal: http://localhost:3000/
- ✅ Diagnósticos: http://localhost:3000/diagnostics
- ✅ API Usuario: http://localhost:3000/api/figma/user
- ✅ API Drafts: http://localhost:3000/api/figma/drafts

## 🎯 Obtener URLs de Tus Proyectos Reales

### Método 1: Desde Figma Web

1. Ve a https://www.figma.com
2. Inicia sesión con tu cuenta
3. Ve a tu dashboard/archivos recientes
4. Copia la URL de cualquier archivo, ejemplo:
   ```
   https://www.figma.com/file/abc123def456/Mi-Proyecto-Genial
   ```

### Método 2: Verificar URL Específica

1. Ve a http://localhost:3000/diagnostics
2. Pega la URL de tu archivo de Figma
3. Haz clic en "Verificar URL"
4. La aplicación te dirá si el archivo es accesible

### Método 3: Probar con curl

```bash
# Verificar archivo específico
curl -X POST http://localhost:3000/api/figma/verify \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://www.figma.com/file/TU_FILE_KEY/TU_ARCHIVO"}'
```

## 🔍 Formato Correcto de URLs de Figma

### URLs Válidas:

```
https://www.figma.com/file/ABC123/nombre-del-archivo
https://www.figma.com/design/ABC123/nombre-del-archivo
https://figma.com/file/ABC123/nombre-del-archivo
```

### Extraer File Key:

De la URL `https://www.figma.com/file/ABC123/nombre`, el file key es `ABC123`

## 🚨 Posibles Problemas y Soluciones

### Problema: "File not found or not accessible"

**Causas:**

- El archivo es privado y tu token no tiene acceso
- El file key es incorrecto
- El archivo fue eliminado

**Solución:**

1. Verifica que el archivo existe en tu dashboard de Figma
2. Asegúrate de que tienes permisos de acceso
3. Prueba con un archivo público o de tu propiedad

### Problema: Error 403 en thumbnails

**Causa:** Las URLs de thumbnails de ejemplo no son reales
**Solución:** Normal - solo afecta a los archivos de ejemplo

### Problema: No aparecen archivos reales

**Causa:** La API de Figma requiere URLs específicas o acceso a equipos
**Solución:** Proporciona URLs específicas de tus archivos

## 🛠️ Testing y Diagnósticos

### Para probar tu configuración:

1. **Abrir**: http://localhost:3000/diagnostics
2. **Probar endpoints**: Click en "Probar Todos los Endpoints"
3. **Verificar archivo**: Pega una URL real de Figma y prueba

### Para obtener información de tu cuenta:

```bash
curl http://localhost:3000/api/figma/user
```

## 📝 Próximos Pasos

1. **Ve a Figma**: https://www.figma.com
2. **Copia URL**: De cualquier archivo tuyo
3. **Pega en diagnósticos**: http://localhost:3000/diagnostics
4. **Verifica acceso**: Usa el botón "Verificar URL"

## 📞 Soporte

Si sigues teniendo problemas:

1. Verifica que tu token de Figma esté actualizado
2. Prueba con diferentes archivos
3. Revisa los permisos en Figma
4. Usa la página de diagnósticos para más información
