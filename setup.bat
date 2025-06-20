@echo off
echo 🚀 Configurando Figma Cursor con Bun...

REM Verificar si Bun está instalado
where bun >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Bun no está instalado. Por favor instala Bun desde https://bun.sh
    echo Ejecuta: powershell -c "irm bun.sh/install.ps1 | iex"
    pause
    exit /b 1
)

echo ✅ Bun está disponible

REM Instalar dependencias
echo 📦 Instalando dependencias...
bun install

REM Verificar si existe .env.local
if not exist ".env.local" (
    echo ⚠️  Creando archivo .env.local...
    echo # Figma API Configuration > .env.local
    echo FIGMA_ACCESS_TOKEN=your_figma_access_token_here >> .env.local
    echo 📝 Por favor, edita .env.local y agrega tu token de Figma
) else (
    echo ✅ .env.local ya existe
)

REM Verificar TypeScript
echo 🔍 Verificando tipos...
bun run type-check

echo 🎉 ¡Configuración completada!
echo.
echo Para comenzar el desarrollo:
echo   bun dev
echo.
echo No olvides configurar tu token de Figma en .env.local
pause
