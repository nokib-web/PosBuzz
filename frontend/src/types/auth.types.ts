export interface User {
    id: string;
    email: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface AuthResponse {
    user: User;
    access_token: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface RegisterDto {
    email: string;
    password: string;
}
