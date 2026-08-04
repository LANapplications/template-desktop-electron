// Configuración de Auth0 y del backend. Los valores se inyectan en tiempo de
// build (ver vite.config.ts): en dev salen del .env, en el build de CI de las
// Variables del repo. Viven en el proceso MAIN: el access token nunca llega al
// renderer.


export const authConfig = {
  domain: process.env.AUTH0_DOMAIN ?? "",
  clientId: process.env.AUTH0_CLIENT_ID ?? "",
  audience: process.env.AUTH0_AUDIENCE ?? "",
  // "offline_access" es lo que habilita el refresh token (sesión persistente).
  scope: process.env.AUTH0_SCOPE || "openid profile email offline_access",
  // "login" fuerza a mostrar siempre la pantalla de login de Auth0 (para poder
  // entrar/registrarse con cualquier cuenta), en vez de reusar la última sesión
  // y saltar directo al consentimiento. Dejar vacío para reusar la sesión.
  prompt: process.env.AUTH0_PROMPT || "login",
  // URL loopback donde la app escucha el redirect del navegador (ver
  // browserAuth.ts). Tiene que tener puerto y estar registrada en "Allowed
  // Callback URLs" de la app en Auth0.
  callbackUrl: process.env.AUTH0_CALLBACK_URL || "http://127.0.0.1:41730/callback",
};


export const apiConfig = {
  baseUrl: process.env.API_URL || "http://localhost:4000",
};


// Corta temprano con un mensaje claro si falta configurar Auth0.
export function assertAuthConfig(): void {
  const missing = (["domain", "clientId", "audience"] as const).filter(
    (key) => !authConfig[key]
  );
  if (missing.length > 0) {
    const vars = missing
      .map((key) => ({ domain: "AUTH0_DOMAIN", clientId: "AUTH0_CLIENT_ID", audience: "AUTH0_AUDIENCE" }[key]))
      .join(", ");
    throw new Error(`Auth0 no está configurado. Completá ${vars} en el archivo .env`);
  }
}
