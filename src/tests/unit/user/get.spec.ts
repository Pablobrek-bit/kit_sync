import { GetUserService } from 'services/user/GetUserService';
import { UserMock } from 'tests/mocks/UserMock';

describe('Get User Service', () => {
  let getUserService: GetUserService;
  let userMock: UserMock;

  beforeEach(() => {
    userMock = new UserMock();
    getUserService = new GetUserService(userMock.userRepositoryMock);
  });

  it('should be able to get a user', async () => {
    const { user } = await getUserService.execute({ id: userMock.existsId });

    expect(user).toEqual(userMock.mockUser);
    expect(userMock.userRepositoryMock.findById).toHaveBeenCalled();
    expect(userMock.userRepositoryMock.findById).toHaveBeenCalledWith(
      userMock.existsId,
    );
  });

  it('should not be able to get a user that does not exist', async () => {
    await expect(
      getUserService.execute({ id: userMock.notExistsId }),
    ).rejects.toThrow('User not found');
  });
});
