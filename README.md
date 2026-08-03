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

## Antes de usar este template

Este repo es una base genérica: al clonarlo para un proyecto real hay que actualizar [`electron-builder.json5`](electron-builder.json5) con los datos de esa app:

- **`appId`** — identificador único de la app (recomendado en notación de dominio inverso, ej. `com.miempresa.miapp`).
- **`productName`** — nombre visible de la app (se usa también en el nombre de los instaladores generados).
- **`publish[0].owner`** y **`publish[0].repo`** — dueño y nombre del repo de GitHub donde se van a publicar los Releases. Vienen precargados con los del repo de este template (`LANapplications/template-desktop-electron`); si no los cambiás por los del repo real, el workflow va a intentar publicar releases ahí en lugar de en tu proyecto (y probablemente falle por falta de permisos).

Sin este paso, tanto los builds locales como el workflow de GitHub Actions van a correr, pero con la identidad y el destino de publicación de este template en lugar de los de tu app.

## Build multiplataforma con GitHub Actions

El workflow [`.github/workflows/release.yml`] compila la app en un runner de Windows y uno de Linux en paralelo, y publica los instaladores como un GitHub Release.

### Cómo funciona

- Se dispara con cada push a `main` que modifique `package.json` (o manualmente desde la pestaña Actions con "Run workflow").
- Job `check-version`: lee la versión de `package.json` y chequea con la GitHub CLI si ya existe un Release con ese tag (`vX.Y.Z`). Si ya existe, el resto se salta — así un push a `main` sin bump de versión no rompe nada ni re-publica de más.
- Job `build` (matriz, si la versión es nueva):
  - `windows-latest` → `electron-builder --win --publish never`
  - `ubuntu-latest` → `electron-builder --linux --publish never`

  Cada uno sube sus instaladores y `.yml` como artifacts de GitHub Actions, **sin publicar todavía**.
- Job `publish` (corre una sola vez, después de que terminen los dos builds): descarga esos artifacts y crea el GitHub Release con todos los archivos juntos, usando [`softprops/action-gh-release`](https://github.com/softprops/action-gh-release).

> ¿Por qué no publicar directo desde cada job de la matriz? `electron-builder` sube el Release como *draft* mientras dura la subida y recién lo despublica al terminar. Con dos runners escribiendo al mismo Release al mismo tiempo, se pisan entre sí y el Release puede quedar trabado en draft para siempre (por eso "Releases" aparecía vacío la primera vez). Separar build y publish en jobs distintos evita esa condición de carrera.

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

## Auto-updater con GitHub Releases

- **macOS:** si en algún momento sumás esa build, tené en cuenta que Squirrel.Mac (el mecanismo que usa `electron-updater` ahí) sí exige que la app esté firmada y notarizada — sin eso el auto-update no funciona en Mac.
- El repo tiene que ser público para que los Releases sean legibles sin autenticación desde la app instalada. Si fuera privado, habría que incluir un token en el cliente, algo que no se recomienda.
- Cada vez que subís la versión en `package.json` y pusheás a `main`, se genera una release nueva: `electron-updater` decide que hay una actualización disponible comparando esa versión contra la ya instalada.
