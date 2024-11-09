import type { User } from '@prisma/client';
import type { UserRepository } from 'repository/interfaces/UserRepository';
import bcrypt from 'bcryptjs';

interface AuthServiceRequest {
  email: string;
  password: string;
}

interface AuthServiceResponse {
  user: User;
}

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async execute({
    email,
    password,
  }: AuthServiceRequest): Promise<AuthServiceResponse> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error('User not found');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error('Invalid password');
    }

    return { user };
  }
}
