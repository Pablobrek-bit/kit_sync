import type { Role } from '@prisma/client';
import type { UserRepository } from '../../../repository/interfaces/UserRepository';
import { AuthService } from '../../../services/user/AuthService';

const emailNotExists = 'pablo@gmail.com';
const emailExists = 'aleatorio@gmail.com';
const mockUser = {
  id: '4a95d2c8-7e33-4215-85f1-46bd6a3a407e',
  name: 'Pablo',
  email: emailExists,
  password: '$2a$08$6lpCFQrZGUQ7sgtjNG360Os2nYaSe8Gdc40zoYZhK9bnBHi5HmIze',
  createdAt: new Date(),
  updatedAt: new Date(),
  role: 'USER' as Role,
};

const userRepositoryMock: jest.Mocked<UserRepository> = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  index: jest.fn(),
};

describe('Create User Service', () => {
  let authService: AuthService;

  beforeEach(() => {
    userRepositoryMock.findByEmail.mockImplementation(async (email) => {
      if (email === emailExists) return mockUser;
      return null;
    });

    authService = new AuthService(userRepositoryMock);
  });

  it('should be able to authenticate a user', async () => {
    const { user } = await authService.execute({
      email: emailExists,
      password: '123456',
    });

    expect(user).toEqual(mockUser);
    expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith(emailExists);
    expect(userRepositoryMock.findByEmail).toHaveBeenCalledTimes(1);
  });

  it('should not be able to authenticate a user with an invalid password', async () => {
    await expect(
      authService.execute({
        email: emailExists,
        password: 'wrong-password',
      }),
    ).rejects.toThrow('Invalid password');
  });

  it('should not be able to authenticate a user that does not exist', async () => {
    await expect(
      authService.execute({
        email: emailNotExists,
        password: '123456',
      }),
    ).rejects.toThrow('User not found');
  });

  it('should not be able to authenticate a user with an invalid email', async () => {
    await expect(
      authService.execute({
        email: emailNotExists,
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
