export interface User {
  id: string;
  email: string;
  role?: "admin" | "user";
  name?: string;
  created_at?: string;
  profile_image?: string | null;
  blog_id?: string | null;
  phone?: string | null;
  bank_name?: string | null;
  account_number?: string | null;
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

export interface UserRegisterData {
  email: string;
  password: string;
  name: string;
  role: "admin" | "user";
  blogId?: string;
  phone?: string;
  bankName?: string;
  accountNumber?: string;
}
