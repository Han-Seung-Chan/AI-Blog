export interface User {
  id: string;
  email: string;
  role?: string;
  name?: string;
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
  role: string;
}
