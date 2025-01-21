import type { Message } from '@prisma/client';
import type { MessageRepository } from 'repository/interfaces/MessageRepository';

export class MessageMock {
  messageRepositoryMock: jest.Mocked<MessageRepository> = {
    create: jest.fn(),
    index: jest.fn(),
  };

  public idMessageNotExists = '4a95d2c8-7e33-4215-85f1-46bd6a3a408e';
  public idMessageExists = '4a95d2c8-7e33-4215-85f1-46bd6a3a408b';
  public idSenderExists = '4a95d2c8-7e33-4215-85f1-46bd6a3a407b';
  public idSenderNotExists = '4a95d2c8-7e33-4215-85f1-46bd6a3a408d';
  public idReceiverExists = '4a95d2c8-7e33-4215-85f1-46bd6a3a407d';
  public idReceiverNotExists = '4a95d2c8-7e33-4215-85f1-46bd6a3a408g';
  public idRentalExists = '4a95d2c8-7e33-4215-85f1-46bd6a3a407e';
  public idRentalNotExists = '4a95d2c8-7e33-4215-85f1-46bd6a3a407z';
  public mockMessage: Message = {
    id: this.idMessageExists,
    text: 'Olá, tudo bem?',
    senderId: this.idSenderExists,
    receiverId: this.idReceiverExists,
    rentalId: this.idRentalExists,
    createdAt: new Date(),
  };

  public constructor() {
    this.messageRepositoryMock.index.mockResolvedValue([this.mockMessage]);
    this.messageRepositoryMock.index.mockImplementation(async (data) => {
      const messages = [this.mockMessage];

      if (data.senderId) {
        return messages.filter((message) => message.senderId === data.senderId);
      }

      if (data.receiverId) {
        return messages.filter(
          (message) => message.receiverId === data.receiverId,
        );
      }

      if (data.rentalId) {
        return messages.filter((message) => message.rentalId === data.rentalId);
      }

      return messages;
    });

    this.messageRepositoryMock.create.mockImplementation(async () => {
      return this.mockMessage;
    });
  }
}
