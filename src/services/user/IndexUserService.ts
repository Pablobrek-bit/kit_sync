import type { User } from '@prisma/client';
import type { UserRepository } from 'repository/interfaces/UserRepository';

interface IndexUserServiceRequest {
  name?: string;
  createdAt?: string;
  updatedAt?: string;
  sort: 'name' | 'createdAt' | 'updatedAt';
  order: 'asc' | 'desc';
  page: number;
  size: number;
}

interface IndexUserServiceResponse {
  users: User[];
}
export class IndexUserService {
  constructor(private userRepository: UserRepository) {}

  async execute(
    data: IndexUserServiceRequest,
  ): Promise<IndexUserServiceResponse> {
    const users = await this.userRepository.index(data);

    return { users };
  }
}
