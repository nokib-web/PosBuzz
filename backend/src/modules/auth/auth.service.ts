import { ConflictException, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    /**
     * Register a new user
     */
    async register(dto: RegisterDto) {
        this.logger.log(`Registering user: ${dto.email}`);

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
                role: (dto.role as Role) || Role.CASHIER,
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
        this.logger.log(`Login attempt: ${dto.email}`);

        // Find user by email
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) {
            this.logger.warn(`Login failed: User not found - ${dto.email}`);
            throw new UnauthorizedException('Invalid credentials');
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);

        if (!isPasswordValid) {
            this.logger.warn(`Login failed: Invalid password - ${dto.email}`);
            throw new UnauthorizedException('Invalid credentials');
        }

        // Temporary: Auto-upgrade admin@gmail.com to ADMIN role for development/testing convenience
        if (user.email === 'admin@gmail.com' && user.role !== Role.ADMIN) {
            this.logger.log(`Upgrading ${user.email} to ADMIN role`);
            const updatedUser = await this.prisma.user.update({
                where: { id: user.id },
                data: { role: Role.ADMIN }
            });
            user.role = updatedUser.role;
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
