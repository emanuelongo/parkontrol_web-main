import { VistasService } from 'src/vistas/vistas.service';

describe('Regression Testing - Consultar ocupacion por parqueadero (Backend)', () => {
  it('debe conservar respuesta vacia cuando no hay datos', async () => {
    const dataSource = { query: jest.fn(async () => []) };
    const service = new VistasService({} as any, {} as any, {} as any, {} as any, dataSource as any);

    const result = await service.getOcupacionByParqueadero(321);

    expect(result).toBeNull();
  });
});
