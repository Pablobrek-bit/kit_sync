import type { User } from '@prisma/client';
import type { UserRepository } from 'repository/interfaces/UserRepository';
import bcrypt from 'bcryptjs';
import { InvalidArgumentError } from 'services/error/InvalidArgumentError';

interface UpdateUserServiceRequest {
  id: string;
  name?: string;
  email?: string;
  password?: string;
}

interface UpdateUserServiceResponse {
  user: User;
}

export class UpdateUserService {
  constructor(private userRepository: UserRepository) {}

  async execute({
    id,
    email,
    name,
    password,
  }: UpdateUserServiceRequest): Promise<UpdateUserServiceResponse> {
    if (email) {
      const user = await this.userRepository.findByEmail(email);

      if (user) {
        throw new InvalidArgumentError('Email already in use');
      }
    }

    const passwordHash = password ? await bcrypt.hash(password, 8) : undefined;

    const user = await this.userRepository.update({
      id,
      email,
      name,
      password: passwordHash,
    });

    return { user };
  }
}
