import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    /**
     * Register a new user
     */
    async register(dto: RegisterDto) {
        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

        // Create the user
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                role: dto.role || 'CASHIER',
            },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        // Generate token
        const token = await this.generateToken(user.id, user.email, user.role);

        return {
            user,
            access_token: token,
        };
    }

    /**
     * Login an existing user
     */
    async login(dto: LoginDto) {
        // Find user by email
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Temporary: Auto-upgrade admin@gmail.com to ADMIN role for development/testing convenience
        if (user.email === 'admin@gmail.com' && user.role !== 'ADMIN') {
            await this.prisma.user.update({
                where: { id: user.id },
                data: { role: 'ADMIN' }
            });
            user.role = 'ADMIN' as any;
        }

        // Generate token
        const token = await this.generateToken(user.id, user.email, user.role);

        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            access_token: token,
        };
    }

    /**
     * Helper method to generate JWT
     */
    private async generateToken(userId: string, email: string, role: string) {
        const payload = { sub: userId, email, role };
        return this.jwtService.signAsync(payload);
    }
}
