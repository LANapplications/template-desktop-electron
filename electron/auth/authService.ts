import crypto from "node:crypto";
import { authConfig, apiConfig, assertAuthConfig } from "../config/authConfig";
import { tokenStore, StoredTokens } from "./tokenStore";
import { runBrowserFlow } from "./browserAuth";
import type { User } from "../types";


type TokenResponse = {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
};


// --- Helpers PKCE / JWT ---------------------------------------------------

function base64url(buffer: Buffer): string {
  return buffer.toString("base64url");
}

function createPkce(): { verifier: string; challenge: string } {
  const verifier = base64url(crypto.randomBytes(32));
  const challenge = base64url(
    crypto.createHash("sha256").update(verifier).digest()
  );
  return { verifier, challenge };
}

function decodeJwt(token: string): Record<string, unknown> {
  const payload = token.split(".")[1] ?? "";
  const json = Buffer.from(payload, "base64url").toString("utf8");
  return JSON.parse(json) as Record<string, unknown>;
}


// --- Flujo de autenticación (Authorization Code + PKCE) -------------------

async function authorize(screenHint?: "signup"): Promise<void> {
  assertAuthConfig();

  const { verifier, challenge } = createPkce();
  const state = base64url(crypto.randomBytes(16));

  const params = new URLSearchParams({
    response_type: "code",
    client_id: authConfig.clientId,
    redirect_uri: authConfig.callbackUrl,
    scope: authConfig.scope,
    audience: authConfig.audience,
    code_challenge: challenge,
    code_challenge_method: "S256",
    state,
  });
  // "signup" abre directo la pantalla de registro de la Universal Login.
  if (screenHint) params.set("screen_hint", screenHint);

  // "login" fuerza la pantalla de login de Auth0 (para entrar/registrarse con
  // cualquier cuenta) en vez de reusar la sesión y saltar al consentimiento.
  if (authConfig.prompt) params.set("prompt", authConfig.prompt);

  const authorizeUrl = `https://${authConfig.domain}/authorize?${params.toString()}`;
  const redirectedUrl = await runBrowserFlow(authorizeUrl, authConfig.callbackUrl);

  const url = new URL(redirectedUrl);
  const error = url.searchParams.get("error");
  if (error) {
    // El usuario rechazó/canceló el login: no es un error para mostrar.
    if (error === "access_denied") throw new Error("AUTH_CANCELLED");
    throw new Error(url.searchParams.get("error_description") ?? error);
  }

  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  if (!code) throw new Error("Auth0 no devolvió un authorization code");
  if (returnedState !== state) throw new Error("State inválido (posible CSRF)");

  const tokens = await exchangeCode(code, verifier);
  persist(tokens);
}

async function exchangeCode(
  code: string,
  verifier: string
): Promise<TokenResponse> {
  const res = await fetch(`https://${authConfig.domain}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: authConfig.clientId,
      code_verifier: verifier,
      code,
      redirect_uri: authConfig.callbackUrl,
    }),
  });
  if (!res.ok) {
    throw new Error("No se pudieron obtener los tokens de Auth0");
  }
  return (await res.json()) as TokenResponse;
}

function persist(tokens: TokenResponse): void {
  const stored: StoredTokens = {
    access_token: tokens.access_token,
    id_token: tokens.id_token,
    refresh_token: tokens.refresh_token,
    expires_at: Date.now() + tokens.expires_in * 1000,
  };
  tokenStore.save(stored);
}


// --- API pública del servicio --------------------------------------------

export const authService = {
  login(): Promise<void> {
    return authorize();
  },

  register(): Promise<void> {
    return authorize("signup");
  },

  logout(): void {
    // Cierra la sesión de la app (borra los tokens). No abre el navegador: la
    // sesión de Auth0/Google del navegador se mantiene, y el próximo login usa
    // prompt=select_account para dejar elegir la cuenta igual.
    tokenStore.clear();
  },

  isAuthenticated(): boolean {
    const tokens = tokenStore.load();
    if (!tokens) return false;
    // Con refresh token la sesión sigue viva aunque el access token esté vencido.
    return Boolean(tokens.refresh_token) || Date.now() < tokens.expires_at;
  },

  // Devuelve un access token vigente, refrescándolo si hace falta.
  // USO INTERNO DEL MAIN: no se expone al renderer.
  async getAccessToken(): Promise<string> {
    const tokens = tokenStore.load();
    if (!tokens) throw new Error("No hay una sesión activa");

    // Margen de 60s para no usar un token a punto de vencer.
    if (Date.now() < tokens.expires_at - 60_000) {
      return tokens.access_token;
    }

    if (!tokens.refresh_token) {
      throw new Error("La sesión expiró. Iniciá sesión de nuevo");
    }

    const res = await fetch(`https://${authConfig.domain}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "refresh_token",
        client_id: authConfig.clientId,
        refresh_token: tokens.refresh_token,
      }),
    });
    if (!res.ok) {
      tokenStore.clear();
      throw new Error("No se pudo refrescar la sesión");
    }

    const refreshed = (await res.json()) as TokenResponse;
    // Con rotación de refresh tokens Auth0 devuelve uno nuevo; si no, se
    // conserva el anterior.
    persist({
      ...refreshed,
      refresh_token: refreshed.refresh_token ?? tokens.refresh_token,
    });
    return refreshed.access_token;
  },

  // Combina los claims del id_token (email) con /users/me (id + role de la app).
  async getUser(): Promise<User | null> {
    const tokens = tokenStore.load();
    if (!tokens) return null;

    const claims = decodeJwt(tokens.id_token);
    const email = typeof claims.email === "string" ? claims.email : undefined;

    try {
      const accessToken = await this.getAccessToken();
      const res = await fetch(`${apiConfig.baseUrl}/users/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const me = (await res.json()) as { id: string; role: string };
        return { id: me.id, role: me.role, email };
      }
    } catch {
      // Sin backend disponible caemos a lo que tengamos del id_token.
    }

    const sub = typeof claims.sub === "string" ? claims.sub : "";
    return { id: sub, role: "user", email };
  },
};
