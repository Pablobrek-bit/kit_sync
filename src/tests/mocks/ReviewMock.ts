import type { Review } from '@prisma/client';
import type { ReviewRepository } from 'repository/interfaces/ReviewRepository';

export class ReviewMock {
  public reviewRepositoryMock: jest.Mocked<ReviewRepository> = {
    create: jest.fn(),
    findById: jest.fn(),
    index: jest.fn(),
    update: jest.fn(),
  };

  public idExists = '4a95d2c8-7e33-4215-85f1-46bd6a3a407a';
  public idNotExists = '4a95d2c8-7e33-4215-85f1-46bd6a3a407s';
  public equipmentIdExists = '4a95d2c8-7e33-4215-85f1-46bd6a3a407b';
  public equipmentIdNotExists = '4a95d2c8-7e33-4215-85f1-46bd6a3a407c';
  public reviewerIdExists = '4a95d2c8-7e33-4215-85f1-46bd6a3a407d';
  public reviewerIdNotExists = '4a95d2c8-7e33-4215-85f1-46bd6a3a407f';
  public idRentalExists = '4a95d2c8-7e33-4215-85f1-46bd6a3a407e';
  public idRentalNotExists = '4a95d2c8-7e33-4215-85f1-46bd6a3a407z';
  public mockReview: Review = {
    id: this.idExists,
    equipmentId: this.equipmentIdExists,
    reviewerId: this.reviewerIdExists,
    rating: 5,
    comment: 'Good equipment',
    createdAt: new Date(),
    updatedAt: new Date(),
    deleted: false,
    rentalId: this.idRentalExists,
    deleteAt: null,
  };

  public constructor() {
    this.reviewRepositoryMock.findById.mockImplementation(async (id) => {
      if (id === this.idExists) {
        return this.mockReview;
      }
      return null;
    });

    this.reviewRepositoryMock.create.mockResolvedValue(this.mockReview);

    this.reviewRepositoryMock.index.mockImplementation(async (data) => {
      if (data.equipmentId === this.equipmentIdNotExists) {
        return [];
      }

      if (data.reviewerId === this.reviewerIdNotExists) {
        return [];
      }

      return [this.mockReview];
    });

    this.reviewRepositoryMock.update.mockImplementation(async (data) => {
      if (data.deleteAt && data.deleteAt instanceof Date) {
        this.mockReview.deleteAt = data.deleteAt;
      }

      if (data.rating && typeof data.rating === 'number') {
        this.mockReview.rating = data.rating;
      }

      if (data.comment && typeof data.comment === 'string') {
        this.mockReview.comment = data.comment;
      }

      if (data.deleted && typeof data.deleted === 'boolean') {
        this.mockReview.deleted = data.deleted;
      }

      this.mockReview.updatedAt = new Date();

      return null;
    });
  }
}
