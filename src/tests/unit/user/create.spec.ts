import { CreateUserService } from '../../../services/user/CreateUserService';
import { UserMock } from 'tests/mocks/UserMock';

describe('Create User Service', () => {
  let createUserService: CreateUserService;
  let userMock: UserMock;

  beforeEach(() => {
    userMock = new UserMock();
    createUserService = new CreateUserService(userMock.userRepositoryMock);
  });

  it('should be able to create a new user', async () => {
    const { user } = await createUserService.execute({
      name: 'Pablo',
      email: userMock.notExistsEmail,
      password: '123456',
    });

    expect(user).toEqual(userMock.mockUser);
    expect(userMock.userRepositoryMock.findByEmail).toHaveBeenCalledWith(
      userMock.notExistsEmail,
    );
    expect(userMock.userRepositoryMock.create).toHaveBeenCalledTimes(1);
  });

  it('should not be able to create a new user with an existing email', async () => {
    await expect(
      createUserService.execute({
        name: 'Pablo',
        email: userMock.emailExists,
        password: '123456',
      }),
    ).rejects.toThrow('Email already exists');
  });
});
