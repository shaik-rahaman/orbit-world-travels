import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '@/config/env';
import {
  UnauthorizedException,
  NotFoundException,
  ConflictException,
} from '@/shared/exceptions';
import { AuthRepository } from './auth.repository';
import {
  CreateUserDTO,
  LoginDTO,
  UpdateUserDTO,
  UserResponseDTO,
} from '@/shared/dtos';
import { JWTTokens } from '@/shared/utils';

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  async register(data: CreateUserDTO): Promise<UserResponseDTO> {
    // Check if user exists
    const existingUser = await this.authRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Parse name: if name is provided, split it; otherwise use firstName/lastName
    let firstName = data.firstName || '';
    let lastName = data.lastName || '';

    if (data.name && !firstName && !lastName) {
      const nameParts = data.name.trim().split(/\s+/);
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ') || 'User';
    }

    // Create user
    const user = await this.authRepository.createUser({
      firstName,
      lastName,
      email: data.email,
      password: hashedPassword,
      role: (data.role as any) || 'STAFF',
    });

    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } as UserResponseDTO;
  }

  async login(data: LoginDTO): Promise<JWTTokens & { user: UserResponseDTO }> {
    // Find user
    const user = await this.authRepository.findUserByEmail(data.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      } as any,
      (config.jwt.secret as any) || 'your-secret-key',
      { expiresIn: (config.jwt.expiresIn as any) || '24h' } as any
    );

    return {
      accessToken,
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async getUserById(id: string): Promise<UserResponseDTO> {
    const user = await this.authRepository.findUserById(id);
    if (!user) {
      throw new NotFoundException('User');
    }

    return user as UserResponseDTO;
  }

  async updateUser(
    id: string,
    data: UpdateUserDTO
  ): Promise<UserResponseDTO> {
    // Verify user exists
    const user = await this.authRepository.findUserById(id);
    if (!user) {
      throw new NotFoundException('User');
    }

    // Check email uniqueness if changing email
    if (data.email && data.email !== user.email) {
      const existingUser = await this.authRepository.findUserByEmail(
        data.email
      );
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }

    const updatedUser = await this.authRepository.updateUser(id, data as any);
    return updatedUser as UserResponseDTO;
  }

  async getAllUsers(
    page: number = 1,
    limit: number = 10
  ): Promise<{ users: UserResponseDTO[]; total: number }> {
    const skip = (page - 1) * limit;
    const { users, total } = await this.authRepository.getAllUsers(skip, limit);

    return {
      users: users as UserResponseDTO[],
      total,
    };
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.authRepository.findUserById(id);
    if (!user) {
      throw new NotFoundException('User');
    }

    await this.authRepository.deleteUser(id);
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
