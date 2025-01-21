import type { Message } from '@prisma/client';
import type { MessageRepository } from 'repository/interfaces/MessageRepository';
import type { RentalRepository } from 'repository/interfaces/RentalRepository';
import { InvalidArgumentError } from 'services/error/InvalidArgumentError';

interface CreateMessageServiceRequest {
  text: string;
  rentalId: string;
  receiverId: string;
  senderId: string;
}

interface CreateMessageServiceResponse {
  message: Message;
}

export class CreateMessageService {
  constructor(
    private messageRepository: MessageRepository,
    private rentalRepository: RentalRepository,
  ) {}

  async execute({
    receiverId,
    rentalId,
    senderId,
    text,
  }: CreateMessageServiceRequest): Promise<CreateMessageServiceResponse> {
    const rental = await this.rentalRepository.findById(rentalId);

    if (!rental) {
      throw new InvalidArgumentError('Rental not found');
    }

    if (rental.status !== 'ACCEPTED') {
      throw new InvalidArgumentError('Rental is not active');
    }

    if (receiverId === senderId) {
      throw new InvalidArgumentError(
        'Sender and receiver must be different users',
      );
    }

    if (rental.renterId !== senderId && rental.ownerId !== senderId) {
      throw new InvalidArgumentError('Unauthorized sender');
    } else if (
      rental.renterId !== receiverId &&
      rental.ownerId !== receiverId
    ) {
      throw new InvalidArgumentError('Unauthorized receiver');
    }

    const message = await this.messageRepository.create({
      rentalId,
      receiverId,
      senderId,
      text,
    });

    return { message };
  }
}
