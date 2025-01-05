import { AuthService } from '../../../services/user/AuthService';
import { UserMock } from 'tests/mocks/UserMock';

describe('Auth User Service', () => {
  let authService: AuthService;
  let userMock: UserMock;

  beforeEach(() => {
    userMock = new UserMock();
    authService = new AuthService(userMock.userRepositoryMock);
  });

  it('should be able to authenticate a user', async () => {
    const { user } = await authService.execute({
      email: userMock.emailExists,
      password: '123456',
    });

    expect(user).toEqual(userMock.mockUser);
    expect(userMock.userRepositoryMock.findByEmail).toHaveBeenCalledWith(
      userMock.emailExists,
    );
    expect(userMock.userRepositoryMock.findByEmail).toHaveBeenCalledTimes(1);
  });

  it('should not be able to authenticate a user with an invalid password', async () => {
    await expect(
      authService.execute({
        email: userMock.emailExists,
        password: 'wrong-password',
      }),
    ).rejects.toThrow('Invalid password');
  });

  it('should not be able to authenticate a user that does not exist', async () => {
    await expect(
      authService.execute({
        email: userMock.notExistsEmail,
        password: '123456',
      }),
    ).rejects.toThrow('User not found');
  });

  it('should not be able to authenticate a user with an invalid email', async () => {
    await expect(
      authService.execute({
        email: userMock.notExistsEmail,
        password: '123456',
      }),
    ).rejects.toThrow('User not found');
  });

  it('should not be able to authenticate a user without email', async () => {
    await expect(
      authService.execute({
        email: '',
        password: '123456',
      }),
    ).rejects.toThrow('User not found');
  });
});
