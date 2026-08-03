# template-desktop-electron

App de escritorio con Electron.

## Desarrollo

```bash
npm install
npm run dev
```

## Builds locales

```bash
npm run dist:win    # instalador NSIS para Windows
npm run dist:linux   # AppImage para Linux
npm run dist:mac     # dmg para macOS
```
## Build multiplataforma con GitHub Actions

El workflow [`.github/workflows/release.yml`] compila la app en un runner de Windows y uno de Linux en paralelo, y publica los instaladores como un GitHub Release.

### Cómo funciona

- Se dispara con cada push a `main` que modifique `package.json` (o manualmente desde la pestaña Actions con "Run workflow").
- Un job previo (`check-version`) lee la versión de `package.json` y chequea con la GitHub CLI si ya existe un Release con ese tag (`vX.Y.Z`). Si ya existe, el build se salta — así un push a `main` sin bump de versión no rompe nada ni re-publica de más.
- Si la versión es nueva, corre la matriz de 2 jobs:
  - `windows-latest` → `electron-builder --win`
  - `ubuntu-latest` → `electron-builder --linux`

### Pasos para generar una release

1. Actualizá la versión en `package.json` (ej. `"version": "0.1.0"`).
2. Commiteá y pusheá a `main`:
   ```bash
   git add package.json
   git commit -m "Bump version to 0.1.0"
   git push origin main
   ```
3. Entrá a la pestaña **Actions** del repo en GitHub y esperá a que terminen los jobs.
4. Los instaladores (`YourAppName-Windows-0.1.0-Setup.exe` y `YourAppName-Linux-0.1.0.AppImage`) van a quedar publicados en **Releases**, junto con los archivos `latest.yml` / `latest-linux.yml` que usa el auto-updater.

> Antes de tu primera release real, cambiá `appId` y `productName` en [`electron-builder.json5`](electron-builder.json5) por los datos reales de tu app.

## Auto-updater con GitHub Releases

- **macOS:** si en algún momento sumás esa build, tené en cuenta que Squirrel.Mac (el mecanismo que usa `electron-updater` ahí) sí exige que la app esté firmada y notarizada — sin eso el auto-update no funciona en Mac.
- El repo tiene que ser público para que los Releases sean legibles sin autenticación desde la app instalada. Si fuera privado, habría que incluir un token en el cliente, algo que no se recomienda.
- Cada vez que subís la versión en `package.json` y pusheás a `main`, se genera una release nueva: `electron-updater` decide que hay una actualización disponible comparando esa versión contra la ya instalada.
