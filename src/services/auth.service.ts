import { prisma } from '../config/db';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';
import { AppError } from '../utils/errors';

export class AuthService {
  static async register(data: { email: string; password: string; displayName: string }) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new AppError(400, 'Email sudah terdaftar');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        displayName: data.displayName,
      },
    });

    const token = generateToken(user.id);
    return { user: { id: user.id, email: user.email, displayName: user.displayName }, token };
  }

  static async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new AppError(400, 'Email atau password salah');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError(400, 'Email atau password salah');
    }

    const token = generateToken(user.id);
    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        experienceLevel: user.experienceLevel,
        age: user.age,
        weightKg: user.weightKg,
      },
      token,
    };
  }
}