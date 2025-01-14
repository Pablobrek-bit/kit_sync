import { CreateRentalService } from 'services/rental/CreateRentalService';
import { EquipmentMock } from 'tests/mocks/EquipmentMock';
import { RentalMock } from 'tests/mocks/RentalMock';
import { UserMock } from 'tests/mocks/UserMock';

describe('Create Rental Service', () => {
  let createRentalService: CreateRentalService;
  let equipmentMock: EquipmentMock;
  let rentalMock: RentalMock;
  let userMock: UserMock;

  beforeEach(() => {
    equipmentMock = new EquipmentMock();
    rentalMock = new RentalMock();
    userMock = new UserMock();

    createRentalService = new CreateRentalService(
      rentalMock.rentalRepositoryMock,
      equipmentMock.equipamentRepositoryMock,
      userMock.userRepositoryMock,
    );
  });

  // it('should be able to create a rental', async () => {
  //   await createRentalService.execute({
  //     equipmentId: idEquipmentExists,
  //     renterId: mockRental.renterId,
  //     startAt: new Date().toISOString(),
  //     endAt: new Date().toISOString(),
  //   });

  //   expect(rentalRepositoryMock.create).toHaveBeenCalledTimes(1);
  //   expect(rentalRepositoryMock.create).toHaveBeenCalledWith({
  //     equipmentId: idEquipmentExists,
  //     renterId: mockRental.renterId,
  //     startAt: expect.any(Date),
  //     endAt: expect.any(Date),
  //     status: RentalStatus.PENDING,
  //     total: 10,
  //   });
  //   expect(equipamentRepositoryMock.findById).toHaveBeenCalledTimes(1);
  // });

  // =========================================================

  it('should not be able to create a rental with invalid equipment id', async () => {
    await expect(
      createRentalService.execute({
        equipmentId: 'invalid-id',
        renterId: rentalMock.mockRental.renterId,
        startAt: new Date().toISOString(),
        endAt: new Date().toISOString(),
        ownerId: userMock.ownerMock.id,
      }),
    ).rejects.toBeInstanceOf(Error);

    expect(rentalMock.rentalRepositoryMock.create).toHaveBeenCalledTimes(0);
    expect(
      equipmentMock.equipamentRepositoryMock.findById,
    ).toHaveBeenCalledTimes(1);
  });

  it('should not be able to create a rental with invalid renter id', async () => {
    await expect(
      createRentalService.execute({
        equipmentId: equipmentMock.idEquipmentExists,
        renterId: 'invalid-id',
        startAt: new Date().toISOString(),
        endAt: new Date().toISOString(),
        ownerId: userMock.ownerMock.id,
      }),
    ).rejects.toBeInstanceOf(Error);

    expect(rentalMock.rentalRepositoryMock.create).toHaveBeenCalledTimes(0);
    expect(
      equipmentMock.equipamentRepositoryMock.findById,
    ).toHaveBeenCalledTimes(1);
  });

  it('should not be able to create a rental with invalid date range', async () => {
    await expect(
      createRentalService.execute({
        equipmentId: equipmentMock.idEquipmentExists,
        renterId: rentalMock.mockRental.renterId,
        startAt: new Date().toISOString(),
        endAt: new Date().toISOString(),
        ownerId: userMock.ownerMock.id,
      }),
    ).rejects.toBeInstanceOf(Error);

    expect(rentalMock.rentalRepositoryMock.create).toHaveBeenCalledTimes(0);
    expect(userMock.userRepositoryMock.findById).toHaveBeenCalledTimes(1);
  });

  it('should not be able to create a rental with equipment not available', async () => {
    equipmentMock.equipamentRepositoryMock.findById.mockResolvedValueOnce({
      ...equipmentMock.mockEquipment,
      available: false,
    });

    await expect(
      createRentalService.execute({
        equipmentId: equipmentMock.idEquipmentExists,
        renterId: rentalMock.mockRental.renterId,
        startAt: new Date().toISOString(),
        endAt: new Date().toISOString(),
        ownerId: userMock.ownerMock.id,
      }),
    ).rejects.toBeInstanceOf(Error);

    expect(rentalMock.rentalRepositoryMock.create).toHaveBeenCalledTimes(0);
    expect(
      equipmentMock.equipamentRepositoryMock.findById,
    ).toHaveBeenCalledTimes(1);
  });

  it('should not be able to create a rental with equipment not found', async () => {
    equipmentMock.equipamentRepositoryMock.findById.mockResolvedValueOnce(null);

    await expect(
      createRentalService.execute({
        equipmentId: equipmentMock.idEquipmentExists,
        renterId: rentalMock.mockRental.renterId,
        startAt: new Date().toISOString(),
        endAt: new Date().toISOString(),
        ownerId: userMock.ownerMock.id,
      }),
    ).rejects.toBeInstanceOf(Error);

    expect(rentalMock.rentalRepositoryMock.create).toHaveBeenCalledTimes(0);
    expect(
      equipmentMock.equipamentRepositoryMock.findById,
    ).toHaveBeenCalledTimes(1);
  });
});
