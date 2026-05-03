# 🚀 Deploy Neuralhop Planner a GitHub Pages

## 📋 Pasos para Deploy Automático

### 1. 📤 Subir a GitHub
```bash
git add .
git commit -m "Ready for GitHub Pages deploy"
git push origin main
```

### 2. 🔧 Configurar GitHub Pages
1. Ve a tu repositorio en GitHub
2. Click `Settings` → `Pages`
3. Source: `GitHub Actions`

### 3. 🔐 Configurar Secrets (Variables de Firebase)
1. Ve a `Settings` → `Secrets and variables` → `Actions`
2. Click `New repository secret`
3. Añade estas variables:

```
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_FIREBASE_MEASUREMENT_ID=tu_measurement_id
```

### 4. 🎯 Deploy Automático
- Cada push a `main` hará deploy automático
- URL: `https://[tu-usuario].github.io/Neuralhop-Quantum-Pro/`

## 🛠️ Deploy Manual (si prefieres)

### Opción A: CLI
```bash
npm install -g gh-pages
npm run build
gh-pages -d dist
```

### Opción B: Arrastrar y soltar
1. Ejecuta `npm run build`
2. Ve a `Settings` → `Pages`
3. Arrastra la carpeta `dist` a la sección "Build and deployment"

## 🔍 Verificar Deploy
- Tu app estará en: `https://[tu-usuario].github.io/Neuralhop-Quantum-Pro/`
- Verifica que Firebase funcione correctamente
- Prueba todas las funcionalidades

## 🎉 ¡Listo!
Tu Neuralhop Planner estará disponible globalmente con URL gratuita y sin límites.
