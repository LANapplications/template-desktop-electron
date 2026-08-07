# template-desktop-electron

App de escritorio con Electron.

## Desarrollo

```bash
npm install
npm run dev
```

## Antes de usar este template

Este repo es una base genérica: al clonarlo para un proyecto real hay que actualizar [`electron-builder.json5`](electron-builder.json5) con los datos de esa app:

- **`appId`** — identificador único de la app (recomendado en notación de dominio inverso, ej. `com.miempresa.miapp`).
- **`productName`** — nombre visible de la app (se usa también en el nombre de los instaladores generados).
- **`publish[0].owner`** y **`publish[0].repo`** — dueño y nombre del repo de GitHub donde se van a publicar los Releases. Vienen precargados con los del repo de este template (`LANapplications/template-desktop-electron`); si no los cambiás por los del repo real, el workflow va a intentar publicar releases ahí en lugar de en tu proyecto (y probablemente falle por falta de permisos).

Sin este paso, tanto los builds locales como el workflow de GitHub Actions van a correr, pero con la identidad y el destino de publicación de este template en lugar de los de tu app.

## Build multiplataforma con GitHub Actions

El workflow [`.github/workflows/release.yml`] compila la app en un runner de Windows y uno de Linux en paralelo, y publica los instaladores como un GitHub Release.

### Pasos para generar una release

1. Actualizá la versión en `package.json` (ej. `"version": "0.1.0"`).
2. Variables de entorno: En Github anda a Settings del repo, secrets and variables - Actions y agregalas como Variables.
3. Commiteá y pusheá a `main`:
   ```bash
   git add package.json
   git commit -m "Bump version to 0.1.0"
   git push origin main
   ```
4. Entrá a la pestaña **Actions** del repo en GitHub y esperá a que terminen los jobs.
5. Los instaladores (`YourAppName-Windows-0.1.0-Setup.exe` y `YourAppName-Linux-0.1.0.AppImage`) van a quedar publicados en **Releases**, junto con los archivos `latest.yml` / `latest-linux.yml` que usa el auto-updater.

## Auto-updater con GitHub Releases

- **macOS:** si en algún momento sumás esa build, tené en cuenta que Squirrel.Mac (el mecanismo que usa `electron-updater` ahí) sí exige que la app esté firmada y notarizada — sin eso el auto-update no funciona en Mac.
- El repo tiene que ser PÚBLICO para que los Releases sean legibles sin autenticación desde la app instalada.
- Cada vez que subís la versión en `package.json` y pusheás a `main`, se genera una release nueva: `electron-updater` decide que hay una actualización disponible comparando esa versión contra la ya instalada.

### Si el día de mañana el repo pasa a ser privado

Este template queda con el repo público, pero si en un proyecto real necesitás mantener el código privado, el auto-updater igual puede funcionar. Opciones:

1. **Repo de releases separado y público.** El código fuente queda en el repo privado; un segundo repo, vacío y público, se usa solo para publicar Releases. `electron-updater` apunta ahí (`publish.owner`/`publish.repo` en `electron-builder.json5`) y no necesita ningún token embebido porque ese repo es público. El workflow de CI sí necesita un Personal Access Token con permiso sobre ese repo (el `GITHUB_TOKEN` automático no alcanza para publicar en un repo distinto al que corre el workflow).
2. **Hosting propio, provider `generic`.** En vez de GitHub, `electron-updater` busca las actualizaciones en una URL que vos controlás:

   ```json5
   "publish": [
     { "provider": "generic", "url": "https://tusitio.com/updates/" }
   ]
   ```

   Ahí hay que subir, en una misma carpeta plana (sin subcarpetas por plataforma):
   - `latest.yml` (Windows) y `latest-linux.yml` (Linux) — los manifiestos que `electron-updater` lee primero (versión, nombre de archivo, hash, fecha). Sin esto no detecta que hay una versión nueva.
   - Los instaladores (`.exe`, `.AppImage`) con el mismo nombre que aparece dentro de esos `.yml`.
