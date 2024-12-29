import type { User } from '@prisma/client';
import type { UserRepository } from 'repository/interfaces/UserRepository';

interface IndexUserServiceRequest {
  name?: string;
  createdAt?: string;
  updatedAt?: string;
  email?: string;
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

  async execute({
    createdAt,
    updatedAt,
    ...data
  }: IndexUserServiceRequest): Promise<IndexUserServiceResponse> {
    let createdAtConverted: Date | undefined;
    let updatedAtConverted: Date | undefined;

    const parseDate = (dateString: string) => {
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day);
    };

    if (createdAt) {
      createdAtConverted = parseDate(createdAt);
    }

    if (updatedAt) {
      updatedAtConverted = parseDate(updatedAt);
    }

    const users = await this.userRepository.index({
      ...data,
      createdAt: createdAtConverted,
      updatedAt: updatedAtConverted,
    });

    return { users };
  }
}
