export interface User {
  id: string;
  email: string;
  role?: "admin" | "user";
  name?: string;
  created_at?: string;
  profile_image?: string | null;
}

export interface AuthSession {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface LoginResponse {
  user: User;
  session: AuthSession;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: "admin" | "user";
}
export interface User {
  id: string;
  email: string;
  role?: "admin" | "user";
  name?: string;
  created_at?: string;
  profile_image?: string | null;
}

export interface AuthSession {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface LoginResponse {
  user: User;
  session: AuthSession;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: "admin" | "user";
}
