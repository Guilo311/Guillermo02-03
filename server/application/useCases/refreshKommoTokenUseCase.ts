export interface RefreshKommoTokenInput {
  userId: number;
  refreshToken: string;
  accountDomain: string;
}

export interface RefreshKommoTokenResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  provider: "kommo";
}

export async function refreshKommoTokenUseCase(_input: RefreshKommoTokenInput): Promise<RefreshKommoTokenResult> {
  const response = await fetch(`https://${_input.accountDomain}/oauth2/access_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.KOMMO_CLIENT_ID,
      client_secret: process.env.KOMMO_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: _input.refreshToken,
      redirect_uri: process.env.KOMMO_REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    return {
      success: false,
      provider: "kommo",
    };
  }

  const payload = await response.json() as Record<string, unknown>;
  const expiresIn = typeof payload.expires_in === "number" ? payload.expires_in : 86_400;
  return {
    success: true,
    accessToken: typeof payload.access_token === "string" ? payload.access_token : undefined,
    refreshToken: typeof payload.refresh_token === "string" ? payload.refresh_token : undefined,
    expiresAt: new Date(Date.now() + (expiresIn * 1000)).toISOString(),
    provider: "kommo",
  };
}
