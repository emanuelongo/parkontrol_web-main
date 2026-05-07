import { VistasService } from 'src/vistas/vistas.service';

describe('Security Testing - Consultar ocupacion por parqueadero (Backend)', () => {
  it('debe usar consulta parametrizada en lugar de concatenar entrada', async () => {
    const dataSource = { query: jest.fn(async () => []) };
    const service = new VistasService({} as any, {} as any, {} as any, {} as any, dataSource as any);

    await service.getOcupacionByParqueadero('1 OR 1=1' as any);

    expect(dataSource.query).toHaveBeenCalledWith(expect.any(String), ['1 OR 1=1']);
  });
});
