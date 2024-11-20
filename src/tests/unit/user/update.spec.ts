import type { Prisma, Role } from '@prisma/client';
import type { UserRepository } from '../../../repository/interfaces/UserRepository';
import { UpdateUserService } from 'services/user/UpdateUserService';

const existsId = '4a95d2c8-7e33-4215-85f1-46bd6a3a407e';
const existsEmail = 'pablo@gmail.com';
const notExistsEmail = 'aleatorio@gmail.com';
const mockUser = {
  id: '4a95d2c8-7e33-4215-85f1-46bd6a3a407e',
  name: 'Pablo',
  email: 'pablo@gmail.com',
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
  let updateUserService: UpdateUserService;

  beforeEach(() => {
    userRepositoryMock.findByEmail.mockImplementation(async (email) => {
      if (email === existsEmail) {
        return mockUser;
      }
      return null;
    });

    userRepositoryMock.update.mockImplementation(
      async (data: Prisma.UserUpdateInput) => {
        if (data.email && typeof data.email === 'string') {
          mockUser.email = data.email;
        }
        if (data.name && typeof data.name === 'string') {
          mockUser.name = data.name;
        }

        if (data.password && typeof data.password === 'string') {
          mockUser.password = data.password;
        }
        return mockUser;
      },
    );

    updateUserService = new UpdateUserService(userRepositoryMock);
  });

  it('should be able to update user email', async () => {
    const response = await updateUserService.execute({
      id: existsId,
      email: notExistsEmail,
    });

    expect(response.user.email).toBe(notExistsEmail);
    expect(userRepositoryMock.update).toHaveBeenCalledTimes(1);
    expect(userRepositoryMock.findByEmail).toHaveBeenCalledTimes(1);
  });

  it('should be able to update user name', async () => {
    const newName = 'newName';

    const response = await updateUserService.execute({
      id: existsId,
      name: newName,
    });

    expect(response.user.name).toBe(newName);
    expect(userRepositoryMock.update).toHaveBeenCalledTimes(1);
    expect(userRepositoryMock.findByEmail).toHaveBeenCalledTimes(0);
  });

  it('should be able to update user password', async () => {
    const newPassword = 'newPassword';

    const response = await updateUserService.execute({
      id: existsId,
      password: newPassword,
    });

    expect(response.user).toHaveProperty('password');
    expect(userRepositoryMock.update).toHaveBeenCalledTimes(1);
    expect(userRepositoryMock.findByEmail).toHaveBeenCalledTimes(0);
  });

  it('should not be able to update user email that already exists', async () => {
    await expect(
      updateUserService.execute({
        id: existsId,
        email: existsEmail,
      }),
    ).rejects.toThrow('Email already in use');
    expect(userRepositoryMock.update).toHaveBeenCalledTimes(0);
    expect(userRepositoryMock.findByEmail).toHaveBeenCalledTimes(1);
  });
});
