import type { Role } from '@prisma/client';
import type { UserRepository } from '../../../repository/interfaces/UserRepository';
import { GetUserService } from 'services/user/GetUserService';

const notExistsId = '4a95d2c8-7e33-4215-85f1-46bd6a3a407e';
const existsId = '4a95d2c8-7e33-4215-85f1-46bd6a3a407a';
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
  let getUserService: GetUserService;

  beforeEach(() => {
    userRepositoryMock.findById.mockImplementation(async (id) => {
      if (id === existsId) return mockUser;
      return null;
    });

    getUserService = new GetUserService(userRepositoryMock);
  });

  it('should be able to get a user', async () => {
    const response = await getUserService.execute({ id: existsId });

    expect(response).toHaveProperty('user');
    expect(response.user).toEqual(mockUser);
    expect(userRepositoryMock.findById).toHaveBeenCalled();
    expect(userRepositoryMock.findById).toHaveBeenCalledWith(existsId);
  });

  it('should not be able to get a user that does not exist', async () => {
    await expect(getUserService.execute({ id: notExistsId })).rejects.toThrow(
      'User not found',
    );
  });
});
