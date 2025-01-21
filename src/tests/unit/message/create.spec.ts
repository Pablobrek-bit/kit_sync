import { CreateMessageService } from 'services/message/CreateMessageService';
import { MessageMock } from 'tests/mocks/MessageMock';
import { RentalMock } from 'tests/mocks/RentalMock';

describe('Create Message Service', () => {
  let createMessageService: CreateMessageService;
  let messageMock: MessageMock;
  let rentalMock: RentalMock;

  beforeEach(() => {
    messageMock = new MessageMock();
    rentalMock = new RentalMock();
    rentalMock.mockRental.status = 'ACCEPTED';
    createMessageService = new CreateMessageService(
      messageMock.messageRepositoryMock,
      rentalMock.rentalRepositoryMock,
    );
  });

  it('should be able to create a new message', async () => {
    const { message } = await createMessageService.execute({
      receiverId: messageMock.idReceiverExists,
      rentalId: messageMock.idRentalExists,
      senderId: messageMock.idSenderExists,
      text: 'Olá, tudo bem?',
    });

    expect(message).toEqual(messageMock.mockMessage);
    expect(messageMock.messageRepositoryMock.create).toHaveBeenCalledTimes(1);
  });

  it('should not be able to create a new message with invalid rental', async () => {
    await expect(
      createMessageService.execute({
        receiverId: messageMock.idReceiverExists,
        rentalId: messageMock.idRentalNotExists,
        senderId: messageMock.idSenderExists,
        text: 'Olá, tudo bem?',
      }),
    ).rejects.toThrow('Rental not found');
  });

  it('should not be able to create a new message with inactive rental', async () => {
    rentalMock.mockRental.status = 'REJECTED';
    await expect(
      createMessageService.execute({
        receiverId: messageMock.idReceiverExists,
        rentalId: messageMock.idRentalExists,
        senderId: messageMock.idSenderExists,
        text: 'Olá, tudo bem?',
      }),
    ).rejects.toThrow('Rental is not active');
  });

  it('should not be able to create a new message with unauthorized sender', async () => {
    await expect(
      createMessageService.execute({
        receiverId: messageMock.idReceiverExists,
        rentalId: messageMock.idRentalExists,
        senderId: messageMock.idSenderNotExists,
        text: 'Olá, tudo bem?',
      }),
    ).rejects.toThrow('Unauthorized sender');
  });

  it('should not be able to create a new message with unauthorized receiver', async () => {
    await expect(
      createMessageService.execute({
        receiverId: messageMock.idReceiverNotExists,
        rentalId: messageMock.idRentalExists,
        senderId: messageMock.idSenderExists,
        text: 'Olá, tudo bem?',
      }),
    ).rejects.toThrow('Unauthorized receiver');
  });

  it('should not be able to create a new message with sender and receiver equals', async () => {
    await expect(
      createMessageService.execute({
        receiverId: messageMock.idSenderExists,
        rentalId: messageMock.idRentalExists,
        senderId: messageMock.idSenderExists,
        text: 'Olá, tudo bem?',
      }),
    ).rejects.toThrow('Sender and receiver must be different users');
  });
});
