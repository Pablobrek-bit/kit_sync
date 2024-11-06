import type { User } from '@prisma/client';
import type { UserRepository } from 'repository/interfaces/UserRepository';

interface GetUserServiceRequest {
  id: string;
}

interface GetUserServiceResponse {
  user: User;
}

export class GetUserService {
  constructor(private userRepository: UserRepository) {}

  async execute({
    id,
  }: GetUserServiceRequest): Promise<GetUserServiceResponse> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error('User not found');
    }

    return { user };
  }
}
