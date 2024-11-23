import type { User } from '@prisma/client';
import type { UserRepository } from 'repository/interfaces/UserRepository';
import bcrypt from 'bcryptjs';
import { InvalidArgumentError } from 'services/error/InvalidArgumentError';

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
      throw new InvalidArgumentError('User not found with the provided email');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new InvalidArgumentError('Invalid password provided');
    }

    return { user };
  }
}
