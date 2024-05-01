import { OAuth } from "@raycast/api";
import fetch from "node-fetch";
import { Todo } from "../types";

// Register a new OAuth app via https://wip.co/oauth/applications
// For the redirect URL enter: https://raycast.com/redirect
// For the website URL enter: https://raycast.com

interface Preferences {
  apiUrl: string;
  clientId: string;
}

// const clientId = "nzJzX-pGkEIM2Zjbf-uVkdlCBOZA0dEQAKDtoZGjnLc"
// const apiUrl = "http://localhost:3000"
const clientId = "THXW84IpDZ58z9eYYCs3OcrG-vAwY6nUme1Ta4ckEHE"
const apiUrl = "https://wip.co"

const client = new OAuth.PKCEClient({
  redirectMethod: OAuth.RedirectMethod.Web,
  providerName: "WIP",
  providerIcon: "icon.svg",
  providerId: "wip",
  description: "Connect your WIP account",
});

// Authorization

export async function authorize(): Promise<void> {
  const tokenSet = await client.getTokens();
  if (tokenSet?.accessToken) {
    if (tokenSet.refreshToken && tokenSet.isExpired()) {
      await client.setTokens(await refreshTokens(tokenSet.refreshToken));
    }
    return;
  }

  const authRequest = await client.authorizationRequest({
    endpoint: `${apiUrl}/oauth/authorize`,
    clientId: clientId,
    scope: "",
  });
  const { authorizationCode } = await client.authorize(authRequest);
  await client.setTokens(await fetchTokens(authRequest, authorizationCode));
}

export async function fetchTokens(
  authRequest: OAuth.AuthorizationRequest,
  authCode: string
): Promise<OAuth.TokenResponse> {
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("code", authCode);
  params.append("code_verifier", authRequest.codeVerifier);
  params.append("grant_type", "authorization_code");
  params.append("redirect_uri", authRequest.redirectURI);

  const response = await fetch(`${apiUrl}/oauth/token`, { method: "POST", body: params });
  if (!response.ok) {
    console.error("fetch tokens error:", await response.text());
    throw new Error(response.statusText);
  }
  return (await response.json()) as OAuth.TokenResponse;
}

async function refreshTokens(refreshToken: string): Promise<OAuth.TokenResponse> {
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("refresh_token", refreshToken);
  params.append("grant_type", "refresh_token");

  const response = await fetch(`${apiUrl}/oauth/token`, { method: "POST", body: params });
  if (!response.ok) {
    console.error("refresh tokens error:", await response.text());
    throw new Error(response.statusText);
  }

  const tokenResponse = (await response.json()) as OAuth.TokenResponse;
  tokenResponse.refresh_token = tokenResponse.refresh_token ?? refreshToken;
  return tokenResponse;
}

// API

export async function fetchUser(): Promise<{ id: string; username: string }[]> {
  const response = await fetch(`${apiUrl}/api/v1/users/me.json`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${(await client.getTokens())?.accessToken}`,
    },
  });
  if (!response.ok) {
    console.error("fetch user error:", await response.text());
    throw new Error(response.statusText);
  }
  const json = (await response.json()) as { id: number; first_name: string; last_name: string; username: string; streak: number; best_streak: number; completed_todos_count: number; time_zone: string; streaking: boolean; url: string; avatar_url: string };
  return { id: json.id.toString(), username: json.username };
}

interface StreakResponse {
  streak: number;
  best_streak: number;
  streaking: boolean;
}

export async function fetchStreak(): Promise<StreakResponse> {
  const response = await fetch(`${apiUrl}/api/v1/users/me/streak.json`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${(await client.getTokens())?.accessToken}`,
    },
  });
  if (!response.ok) {
    console.error("fetch streak error:", await response.text());
    throw new Error(response.statusText);
  }
  return (await response.json()) as StreakResponse;
}

interface TodoResponse {
  todos: Todo[];
}

export async function fetchTodos(): Promise<Todo[]> {
  const params = new URLSearchParams();
  params.append("query", "raycast");

  const response = await fetch(`${apiUrl}/api/v1/users/me/todos.json?` + params.toString(), {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${(await client.getTokens())?.accessToken}`,
    },
  });
  if (!response.ok) {
    console.error("fetch items error:", await response.text());
    throw new Error(response.statusText);
  }
  const json = (await response.json()) as TodoResponse;
  return json.todos;
}
