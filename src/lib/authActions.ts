import { prisma } from './prisma'; // Importing the Prisma client
import bcrypt from 'bcryptjs'; // Importing bcrypt for password hashing

export async function registerUser(name: string, email: string, password: string) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return { success: false, error: 'User already exists' };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword // Correctly use hashedPassword
      }
    });

    // Optionally: create a new session for the user
    // const sessionToken = /* generate session token */;
    // await prisma.session.create({
    //   data: {
    //     sessionToken,
    //     userId: newUser.id,
    //     expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    //   }
    // });

    return { success: true };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Registration failed' };
  }
}