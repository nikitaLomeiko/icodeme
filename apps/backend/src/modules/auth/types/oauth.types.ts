import type { Request } from 'express';

export interface GoogleOAuthUser {
  googleId: string;
  email: string;
  name: {
    givenName?: string;
    familyName?: string;
  };
  picture?: string;
}

export interface GitHubOAuthUser {
  githubId: string;
  email: string;
  name: string;
  picture?: string;
  username?: string;
}

export type OAuthRequest<TUser> = Omit<Request, 'user'> & { user: TUser };
