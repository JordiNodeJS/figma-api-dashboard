#!/bin/bash

echo "🚀 Configurando Figma Cursor con Bun..."

# Verificar si Bun está instalado
if ! command -v bun &> /dev/null; then
    echo "❌ Bun no está instalado. Instalando Bun..."
    curl -fsSL https://bun.sh/install | bash
    source ~/.bashrc
fi

echo "✅ Bun está disponible"

# Instalar dependencias
echo "📦 Instalando dependencias..."
bun install

# Verificar si existe .env.local
if [ ! -f ".env.local" ]; then
    echo "⚠️  Creando archivo .env.local..."
    echo "# Figma API Configuration" > .env.local
    echo "FIGMA_ACCESS_TOKEN=your_figma_access_token_here" >> .env.local
    echo "📝 Por favor, edita .env.local y agrega tu token de Figma"
else
    echo "✅ .env.local ya existe"
fi

# Verificar TypeScript
echo "🔍 Verificando tipos..."
bun run type-check

echo "🎉 ¡Configuración completada!"
echo ""
echo "Para comenzar el desarrollo:"
echo "  bun dev"
echo ""
echo "No olvides configurar tu token de Figma en .env.local"
