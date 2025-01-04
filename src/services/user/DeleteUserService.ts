import type { UserRepository } from 'repository/interfaces/UserRepository';
import { InvalidArgumentError } from 'services/error/InvalidArgumentError';

interface DeleteUserServiceRequest {
  userId: string;
  id: string;
}

export class DeleteUserService {
  constructor(private userRepository: UserRepository) {}

  async execute({ id, userId }: DeleteUserServiceRequest): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new InvalidArgumentError('User not found with the provided ID');
    }

    if (user.id === id) {
      throw new InvalidArgumentError("You can't only delete your own user");
    }

    await this.userRepository.delete(userId);
  }
}
