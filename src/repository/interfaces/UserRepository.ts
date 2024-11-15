import type { Prisma, User } from '@prisma/client';

export interface UserRepository {
  create(data: Prisma.UserCreateInput): Promise<User>;

  findByEmail(email: string): Promise<User | null>;

  findById(id: string): Promise<User | null>;

  update(data: Prisma.UserUpdateInput): Promise<User>;

  delete(id: string): Promise<void>;

  index(data: {
    name?: string;
    createdAt?: string;
    updatedAt?: string;
    sort: 'name' | 'createdAt' | 'updatedAt';
    order: 'asc' | 'desc';
    page: number;
    size: number;
  }): Promise<User[]>;
}
