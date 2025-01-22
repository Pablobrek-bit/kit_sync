import { InvalidArgumentError } from 'services/error/InvalidArgumentError';
import { IndexMessageService } from 'services/message/IndexMessageService';
import { MessageMock } from 'tests/mocks/MessageMock';
import { RentalMock } from 'tests/mocks/RentalMock';

describe('Index Message Service', () => {
  let indexMessageService: IndexMessageService;
  let messageMock: MessageMock;
  let rentalMock: RentalMock;

  beforeEach(() => {
    messageMock = new MessageMock();
    rentalMock = new RentalMock();
    indexMessageService = new IndexMessageService(
      messageMock.messageRepositoryMock,
      rentalMock.rentalRepositoryMock,
    );
  });

  it('should be able to index all messages', async () => {
    const { messages } = await indexMessageService.execute({});

    expect(messages).toHaveLength(1);
    expect(messageMock.messageRepositoryMock.index).toHaveBeenCalledTimes(1);
  });

  it('should be able to index all messages by rental', async () => {
    const { messages } = await indexMessageService.execute({
      rentalId: messageMock.idRentalExists,
    });

    expect(messages).toHaveLength(1);
  });

  it('should not be able to index any message by rental id not exists', async () => {
    await expect(
      indexMessageService.execute({
        rentalId: messageMock.idRentalNotExists,
      }),
    ).rejects.toBeInstanceOf(InvalidArgumentError);

    expect(messageMock.messageRepositoryMock.index).toHaveBeenCalledTimes(0);
  });
});
