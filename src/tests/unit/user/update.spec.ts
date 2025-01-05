import { UpdateUserService } from 'services/user/UpdateUserService';
import { UserMock } from 'tests/mocks/UserMock';

describe('Update User Service', () => {
  let updateUserService: UpdateUserService;
  let userMock: UserMock;

  beforeEach(() => {
    userMock = new UserMock();
    updateUserService = new UpdateUserService(userMock.userRepositoryMock);
  });

  it('should be able to update user email', async () => {
    const { user } = await updateUserService.execute({
      id: userMock.existsId,
      email: userMock.notExistsEmail,
    });

    expect(user.email).toBe(userMock.notExistsEmail);
    expect(userMock.userRepositoryMock.update).toHaveBeenCalledTimes(1);
    expect(userMock.userRepositoryMock.findByEmail).toHaveBeenCalledTimes(1);
  });

  it('should be able to update user name', async () => {
    const newName = 'newName';

    const { user } = await updateUserService.execute({
      id: userMock.existsId,
      name: newName,
    });

    expect(user.name).toBe(newName);
    expect(userMock.userRepositoryMock.update).toHaveBeenCalledTimes(1);
    expect(userMock.userRepositoryMock.findByEmail).toHaveBeenCalledTimes(0);
  });

  it('should be able to update user password', async () => {
    const newPassword = 'newPassword';

    const { user } = await updateUserService.execute({
      id: userMock.existsId,
      password: newPassword,
    });

    expect(user).toHaveProperty('password');
    expect(userMock.userRepositoryMock.update).toHaveBeenCalledTimes(1);
    expect(userMock.userRepositoryMock.findByEmail).toHaveBeenCalledTimes(0);
  });

  it('should not be able to update user email that already exists', async () => {
    await expect(
      updateUserService.execute({
        id: userMock.existsId,
        email: userMock.emailExists,
      }),
    ).rejects.toThrow('Email already in use');
    expect(userMock.userRepositoryMock.update).toHaveBeenCalledTimes(0);
    expect(userMock.userRepositoryMock.findByEmail).toHaveBeenCalledTimes(1);
  });
});
