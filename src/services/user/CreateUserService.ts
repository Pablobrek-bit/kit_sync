import type { User } from '@prisma/client';
import type { UserRepository } from 'repository/interfaces/UserRepository';
import bcrypt from 'bcryptjs';

interface CreateUserServiceRequest {
  name: string;
  email: string;
  password: string;
}

interface CreateUserServiceResponse {
  user: Omit<User, 'password'>;
}

export class CreateUserService {
  constructor(private userRepository: UserRepository) {}

  async execute(
    data: CreateUserServiceRequest,
  ): Promise<CreateUserServiceResponse> {
    const existingUser = await this.userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new Error('User already exists');
    }

    const user = await this.userRepository.create({
      email: data.email,
      name: data.name,
      password: await bcrypt.hash(data.password, 8),
    });

    const { ...userWithoutPassword } = user;

    return { user: userWithoutPassword };
  }
}
