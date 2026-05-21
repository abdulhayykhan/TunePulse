import type { NextAuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import type { JWT } from "next-auth/jwt";

type SpotifyToken = JWT & {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  error?: string;
};

async function refreshAccessToken(token: SpotifyToken): Promise<SpotifyToken> {
  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret || !token.refreshToken) {
      throw new Error("Missing Spotify refresh token configuration");
    }

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      error: undefined,
    };
  } catch {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID ?? "",
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: ["user-top-read", "user-read-recently-played", "user-read-private"].join(" "),
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, user }) {
      const typedToken = token as SpotifyToken;

      if (account && user) {
        return {
          ...typedToken,
          id: user.id,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : Date.now() + 3600 * 1000,
        };
      }

      if (typedToken.accessTokenExpires && Date.now() < typedToken.accessTokenExpires - 60_000) {
        return typedToken;
      }

      return refreshAccessToken(typedToken);
    },
    async session({ session, token }) {
      const typedToken = token as SpotifyToken;

      if (session.user) {
        session.user.id = typedToken.id ?? typedToken.sub ?? session.user.id;
      }

      session.accessToken = typedToken.accessToken;
      session.refreshToken = typedToken.refreshToken;
      session.error = typedToken.error;

      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};