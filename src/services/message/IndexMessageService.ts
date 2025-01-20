import type { Message } from '@prisma/client';
import type { MessageRepository } from 'repository/interfaces/MessageRepository';
import type { RentalRepository } from 'repository/interfaces/RentalRepository';
import { InvalidArgumentError } from 'services/error/InvalidArgumentError';

interface IndexMessageServiceRequest {
  rentalId: string;
}

interface IndexMessageServiceResponse {
  messages: Message[];
}

export class IndexMessageService {
  constructor(
    private messageRepository: MessageRepository,
    private rentalRepository: RentalRepository,
  ) {}

  async execute({
    rentalId,
  }: IndexMessageServiceRequest): Promise<IndexMessageServiceResponse> {
    const rental = await this.rentalRepository.findById(rentalId);

    if (!rental) {
      throw new InvalidArgumentError('Rental not found');
    }

    const messages = await this.messageRepository.index({ rentalId });

    return { messages };
  }
}
