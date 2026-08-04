import http from "node:http";
import { shell } from "electron";
import { win } from "../window/createWindow";


// Flujo de login de Auth0 en el NAVEGADOR del sistema, donde el usuario ya tiene
// sus sesiones de Google/Auth0 abiertas: si elige una cuenta logueada, entra
// directo. La app espera el redirect en un servidor loopback temporal.
//
// El servidor es un único singleton reutilizable: si el usuario reintenta (por
// ejemplo, cerró la pestaña sin querer), descartamos el intento anterior y
// reusamos el mismo servidor, así no hay choques de puerto ni botones colgados.


let server: http.Server | null = null;
let pending: {
  resolve: (url: string) => void;
  reject: (err: Error) => void;
} | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;


function teardown(): void {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (server) {
    server.close();
    server = null;
  }
  pending = null;
}


export function runBrowserFlow(
  targetUrl: string,
  redirectUri: string
): Promise<string> {
  const { port, pathname } = new URL(redirectUri);
  const portNumber = Number(port);

  // Descarta un intento anterior sin terminar, pero NO cierra el servidor: el
  // nuevo intento lo reusa.
  if (pending) {
    pending.reject(new Error("REPLACED"));
    pending = null;
  }
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }

  return new Promise<string>((resolve, reject) => {
    pending = { resolve, reject };

    // Corta si el usuario nunca completa, para no dejar el server colgado.
    timer = setTimeout(() => {
      const p = pending;
      teardown();
      p?.reject(new Error("Se agotó el tiempo de espera del login"));
    }, 5 * 60 * 1000);

    const openBrowser = () => void shell.openExternal(targetUrl);

    // Reusa el servidor si ya está levantado; si no, lo crea.
    if (server) {
      openBrowser();
      return;
    }

    const srv = http.createServer((req, res) => {
      if (!req.url || !req.url.startsWith(pathname)) {
        res.statusCode = 404;
        res.end("Not found");
        return;
      }

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(
        `<!doctype html><html lang="es"><body style="font-family:system-ui,sans-serif;text-align:center;padding-top:3rem">
          <h2>Listo</h2>
          <p>Ya podés cerrar esta pestaña y volver a la app.</p>
        </body></html>`
      );

      const fullUrl = `http://127.0.0.1:${portNumber}${req.url}`;
      const p = pending;
      teardown();
      p?.resolve(fullUrl);
      if (win && !win.isDestroyed()) win.focus();
    });

    srv.on("error", (err) => {
      const p = pending;
      teardown();
      p?.reject(
        new Error(
          `No se pudo abrir el login (¿puerto ${portNumber} ocupado?): ${err.message}`
        )
      );
    });

    server = srv;
    srv.listen(portNumber, "127.0.0.1", openBrowser);
  });
}
