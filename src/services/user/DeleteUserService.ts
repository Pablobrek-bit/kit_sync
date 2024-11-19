import type { UserRepository } from 'repository/interfaces/UserRepository';

interface DeleteUserServiceRequest {
  userId: string;
  id: string;
}

export class DeleteUserService {
  constructor(private userRepository: UserRepository) {}

  async execute({ id, userId }: DeleteUserServiceRequest): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.id === id) {
      throw new Error('You can only delete your own user');
    }

    await this.userRepository.delete(id);
  }
}
