import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class LoginDto {
    @IsEmail({}, { message: 'Invalid email format' })
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

    @IsOptional()
    @IsBoolean()
    remember?: boolean;
}
