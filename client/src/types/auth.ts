export interface User {
  id: string;
  email: string;
  name: string;
  bio: string | null;
  headline: string | null;
  location: string | null;
  website: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  name?: string;
  bio?: string;
  headline?: string;
  location?: string;
  website?: string;
}
