export type RegisterForm = {
  full_name: string;
  username: string;
  email: string;
  password: string;
};

export type AuthResponse = {
    data(arg0: string, data: any): unknown;
    message: string;
    user?: {
    id: number;
    full_name: string;
    username: string;
    email: string;
  };
  token?: string;
}