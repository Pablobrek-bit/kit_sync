import { EquipmentMock } from 'tests/mocks/EquipmentMock';
import { IndexEquipmentService } from '../../../services/equipament/IndexEquipmentService';

const page = 1;
const size = 5;

describe('Index Equipment Service', () => {
  let indexEquipmentService: IndexEquipmentService;
  let equipmentMock: EquipmentMock;

  beforeEach(() => {
    equipmentMock = new EquipmentMock();
    indexEquipmentService = new IndexEquipmentService(
      equipmentMock.equipamentRepositoryMock,
    );
  });

  it('should return all equipments', async () => {
    const { equipments } = await indexEquipmentService.execute({ page, size });

    expect(equipments).toHaveLength(1);
  });

  it('should return equipments by name', async () => {
    const { equipments } = await indexEquipmentService.execute({
      name: 'Furadeira',
      page,
      size,
    });

    expect(equipments).toHaveLength(1);
  });

  it('should return equipments by category', async () => {
    const { equipments } = await indexEquipmentService.execute({
      category: 'Ferramentas',
      page,
      size,
    });

    expect(equipments).toHaveLength(1);
  });

  it('should return equipments by daily price', async () => {
    const { equipments } = await indexEquipmentService.execute({
      dailyPrice: 10,
      page,
      size,
    });

    expect(equipments).toHaveLength(1);
  });

  it('should return equipments by availability', async () => {
    const { equipments } = await indexEquipmentService.execute({
      available: true,
      page,
      size,
    });

    expect(equipments).toHaveLength(1);
  });

  it('should return empty array if no equipment is found', async () => {
    equipmentMock.equipamentRepositoryMock.index.mockResolvedValue([]);

    const { equipments } = await indexEquipmentService.execute({ page, size });

    expect(equipments).toHaveLength(0);
  });

  it('should return empty array if no equipment is found by name', async () => {
    const { equipments } = await indexEquipmentService.execute({
      name: 'Serra',
      page,
      size,
    });

    expect(equipments).toHaveLength(0);
  });

  it('should return empty array if no equipment is found by category', async () => {
    const { equipments } = await indexEquipmentService.execute({
      category: 'Eletrodomésticos',
      page,
      size,
    });

    expect(equipments).toHaveLength(0);
  });

  it('should return empty array if no equipment is found by daily price', async () => {
    const { equipments } = await indexEquipmentService.execute({
      dailyPrice: 20,
      page,
      size,
    });

    expect(equipments).toHaveLength(0);
  });
});
