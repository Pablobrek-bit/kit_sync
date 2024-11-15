import type { Role } from '@prisma/client';
import type { UserRepository } from '../../repository/interfaces/UserRepository';
import { CreateUserService } from '../../services/user/CreateUserService';

const emailNotExists = 'pablo@gmail.com';
const emailExists = 'aleatorio@gmail.com';
const mockUser = {
  id: '4a95d2c8-7e33-4215-85f1-46bd6a3a407e',
  name: 'Pablo',
  email: emailNotExists,
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
  let createUserService: CreateUserService;

  beforeEach(() => {
    userRepositoryMock.findByEmail.mockImplementation(async (email) => {
      if (email === emailExists) return mockUser;
      return null;
    });

    userRepositoryMock.create.mockResolvedValue(mockUser);

    createUserService = new CreateUserService(userRepositoryMock);
  });

  it('should be able to create a new user', async () => {
    const { user } = await createUserService.execute({
      name: 'Pablo',
      email: emailNotExists,
      password: '123456',
    });

    expect(user).toEqual(mockUser);
    expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith(emailNotExists);
    expect(userRepositoryMock.create).toHaveBeenCalledTimes(1);
  });
});
