import { User, IUser, UserRole } from '@/models/schemas';
import { Schema } from 'mongoose';

// In-memory storage for development/fallback
const inMemoryUsers: any[] = [
  {
    _id: 'demo-admin-1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@orbittravels.com',
    password: '$2b$10$SsJmvURqS73JrIhQQ5KJLeO/EequZrcft/q/uRwbd5nVCnaclvM4y', // Password: Admin@123
    role: 'ADMIN',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export class AuthRepository {
  async findUserByEmail(email: string): Promise<IUser | null> {
    try {
      return await User.findOne({ email: email.toLowerCase() });
    } catch (error: any) {
      // Fall back to in-memory storage
      const user = inMemoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      return user || null;
    }
  }

  async findUserById(id: string): Promise<Partial<IUser> | null> {
    try {
      return await User.findById(id).select('_id email firstName lastName role isActive createdAt updatedAt');
    } catch (error: any) {
      // Fall back to in-memory storage
      const user = inMemoryUsers.find(u => u._id === id);
      if (user) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
      return null;
    }
  }

  async createUser(data: Partial<IUser>): Promise<IUser> {
    try {
      const user = await User.create(data);
      return (user && (user as any).toObject ? (user as any).toObject() : user) as IUser;
    } catch (error: any) {
      // Fall back to in-memory storage
      const newUser = {
        _id: `user-${Date.now()}`,
        ...data,
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryUsers.push(newUser);
      return newUser as IUser;
    }
  }

  async updateUser(id: string, data: Partial<IUser>): Promise<Partial<IUser> | null> {
    try {
      return await User.findByIdAndUpdate(id, data, { new: true }).select('_id email firstName lastName role isActive createdAt updatedAt');
    } catch (error: any) {
      // Fall back to in-memory storage
      const user = inMemoryUsers.find(u => u._id === id);
      if (user) {
        Object.assign(user, data, { updatedAt: new Date() });
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
      return null;
    }
  }

  async getAllUsers(skip: number = 0, limit: number = 10): Promise<{ users: Partial<IUser>[]; total: number }> {
    try {
      const [users, total] = await Promise.all([
        User.find()
          .skip(skip)
          .limit(limit)
          .select('_id email firstName lastName role isActive createdAt updatedAt')
          .sort({ createdAt: -1 }),
        User.countDocuments(),
      ]);

      return { users: users.map(u => u.toObject()) as Partial<IUser>[], total };
    } catch (error: any) {
      // Fall back to in-memory storage
      const users = inMemoryUsers
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(skip, skip + limit)
        .map(u => {
          const { password, ...userWithoutPassword } = u;
          return userWithoutPassword;
        });
      return { users: users as Partial<IUser>[], total: inMemoryUsers.length };
    }
  }

  async deleteUser(id: string): Promise<Partial<IUser> | null> {
    try {
      const res = await User.findByIdAndDelete(id);
      return res as unknown as Partial<IUser> | null;
    } catch (error: any) {
      // Fall back to in-memory storage
      const index = inMemoryUsers.findIndex(u => u._id === id);
      if (index > -1) {
        const user = inMemoryUsers.splice(index, 1)[0];
        return user;
      }
      return null;
    }
  }

  async isEmailExists(email: string): Promise<boolean> {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      return user !== null;
    } catch (error: any) {
      // Fall back to in-memory storage
      return inMemoryUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
    }
  }
}

export const authRepository = new AuthRepository();
