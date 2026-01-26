import api from '../utils/axios';
import { AuthResponse, LoginDto, RegisterDto } from '../types/auth.types';

export const authService = {
    login: async (dto: LoginDto): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', dto);
        return response.data;
    },

    register: async (dto: RegisterDto): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/register', dto);
        return response.data;
    },

    getCurrentUser: async (): Promise<AuthResponse['user']> => {
        const response = await api.get<AuthResponse['user']>('/auth/me');
        return response.data;
    },
};
