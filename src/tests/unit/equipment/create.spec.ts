import { EquipmentMock } from 'tests/mocks/EquipmentMock';
import { CreateEquipamentService } from '../../../services/equipament/CreateEquipamentService';

describe('Create Equipment Service', () => {
  let createEquipmentService: CreateEquipamentService;
  let equipmentMock: EquipmentMock;

  beforeEach(() => {
    equipmentMock = new EquipmentMock();
    createEquipmentService = new CreateEquipamentService(
      equipmentMock.equipamentRepositoryMock,
    );
  });

  it('should be able to create a new equipment', async () => {
    const { equipment } = await createEquipmentService.execute({
      name: 'Furadeira',
      description: 'Furadeira de impacto',
      category: 'Ferramentas',
      dailyPrice: 10,
      available: true,
      photos: ['https://example.com/photo.jpg'],
      propertyId: '4a95d2c8-7e33-4215-85f1-46bd6a3a407b',
    });

    expect(equipment).toEqual(equipmentMock.mockEquipment);
    expect(equipmentMock.equipamentRepositoryMock.create).toHaveBeenCalledTimes(
      1,
    );
  });
});
