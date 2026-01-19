import api from "@/lib/api";
import type { RegisterForm, AuthResponse } from "@/Types/auth";

export const registerUser = async (payload: RegisterForm) : Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/register", payload);
    return response.data;
}