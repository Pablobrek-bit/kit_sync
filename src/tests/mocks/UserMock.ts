import type { Role, User } from '@prisma/client';
import type { UserRepository } from 'repository/interfaces/UserRepository';

export class UserMock {
  public userRepositoryMock: jest.Mocked<UserRepository> = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    index: jest.fn(),
  };

  public idLoggedUser = '4a95d2c8-7e33-4215-85f1-46bd6a3a407b';
  public existsId = '4a95d2c8-7e33-4215-85f1-46bd6a3a407e';
  public notExistsId = '4a95d2c8-7e33-4215-85f1-46bd6a3a407s';
  public notExistsEmail = 'aleatorio@gmail.com';
  public emailExists = 'pablo@gmail.com';
  public mockUser: User = {
    id: '4a95d2c8-7e33-4215-85f1-46bd6a3a407e',
    name: 'Pablo',
    email: this.emailExists,
    password: '$2a$08$6lpCFQrZGUQ7sgtjNG360Os2nYaSe8Gdc40zoYZhK9bnBHi5HmIze',
    createdAt: new Date(),
    updatedAt: new Date(),
    role: 'USER' as Role,
  };

  public constructor() {
    this.userRepositoryMock.findById.mockImplementation(async (id) => {
      if (id === this.mockUser.id || id === this.idLoggedUser) {
        this.mockUser.id = id;
        return this.mockUser;
      }
      return null;
    });

    this.userRepositoryMock.findByEmail.mockImplementation(async (email) => {
      if (email === this.emailExists) return this.mockUser;
      return null;
    });

    this.userRepositoryMock.create.mockResolvedValue(this.mockUser);

    this.userRepositoryMock.update.mockImplementation(async (data) => {
      if (data.email && typeof data.email === 'string') {
        this.mockUser.email = data.email;
      }
      if (data.name && typeof data.name === 'string') {
        this.mockUser.name = data.name;
      }

      if (data.password && typeof data.password === 'string') {
        this.mockUser.password = data.password;
      }
      return this.mockUser;
    });
  }
}
