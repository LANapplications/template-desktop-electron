# template-desktop-electron

App de escritorio con Electron.

## Desarrollo

```bash
npm install
cp .env.example .env   # completar con tus datos de Auth0 y del backend
npm run dev
```

### Configurar Auth0 (para una app de escritorio)

Se usa una app de tipo **Native** con **Authorization Code + PKCE**. El login se
abre en el **navegador del sistema** (así reusa las sesiones de Google/Auth0 que
el usuario ya tiene abiertas: si elige una cuenta logueada, entra directo, sin
tipear la contraseña). Cuando Auth0 redirige de vuelta, la app lo recibe en un
**servidor loopback temporal** (`http://127.0.0.1:41730/callback`) que se levanta
solo durante el login y se cierra al terminar.

Pasos en el [dashboard de Auth0](https://manage.auth0.com):

1. **Applications → Create Application → Native.** Anotá el **Domain** y el
   **Client ID**.
2. En la pestaña **Settings** de esa app:
   - **Allowed Callback URLs:** `http://127.0.0.1:41730/callback` (mismo valor que
     `AUTH0_CALLBACK_URL` del `.env`, con el mismo puerto).
3. **APIs:** usá la misma **API** (mismo *Identifier* / `audience`) que valida el
   backend. Si todavía no existe, creala en **APIs → Create API** (el *Identifier*
   es un string cualquiera, no hace falta que sea una URL real).
4. **Autorizá la app contra la API.** Este tenant exige un *grant* explícito
   entre el client y la API (si no, el login falla con *"Client is not authorized
   to access resource server"* aunque el `audience` esté bien). Andá a
   **Applications → tu app Native → pestaña APIs**, abrí **tu API** y, en la
   solapa **User-Delegated Access**, tildá **Always grant all permissions** y hacé
   clic en **Grant Access → Save**.
5. **Refresh tokens:** en la app Native, en **Settings → Advanced → Grant Types**
   verificá que estén tildados *Authorization Code* y *Refresh Token*; y en la
   **API**, activá *Allow Offline Access*. Esto es lo que hace que la sesión
   persista al cerrar y reabrir la app (el scope `offline_access`).
6. Copiá `Domain`, `Client ID` y `audience` al `.env` (ver `.env.example`).

> El backend tiene que apuntar al **mismo** `AUTH0_DOMAIN` y `AUTH0_AUDIENCE`,
> porque valida los tokens que emite este mismo tenant.

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
