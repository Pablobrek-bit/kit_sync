import { DeleteUserService } from 'services/user/DeleteUserService';
import { UserMock } from 'tests/mocks/UserMock';

describe('Create User Service', () => {
  let deleteUserService: DeleteUserService;
  let userMock: UserMock;

  beforeEach(() => {
    userMock = new UserMock();
    deleteUserService = new DeleteUserService(userMock.userRepositoryMock);
  });

  it('should delete a user', async () => {
    await deleteUserService.execute({
      id: userMock.idLoggedUser,
      userId: userMock.existsId,
    });
    expect(userMock.userRepositoryMock.delete).toHaveBeenCalledTimes(1);
    expect(userMock.userRepositoryMock.findById).toHaveBeenCalledTimes(1);
  });

  it('should not delete a user that does not exist', async () => {
    await expect(
      deleteUserService.execute({
        id: userMock.notExistsId,
        userId: userMock.notExistsId,
      }),
    ).rejects.toThrow('User not found');
    expect(userMock.userRepositoryMock.delete).toHaveBeenCalledTimes(0);
  });

  it('should not delete a user that is not the user itself', async () => {
    await expect(
      deleteUserService.execute({
        id: userMock.idLoggedUser,
        userId: userMock.idLoggedUser,
      }),
    ).rejects.toThrow('You can only delete your own user');
    expect(userMock.userRepositoryMock.delete).toHaveBeenCalledTimes(0);
  });
});
