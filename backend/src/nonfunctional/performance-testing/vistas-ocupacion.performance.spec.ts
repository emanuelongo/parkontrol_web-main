import { VistasService } from 'src/vistas/vistas.service';

describe('Performance Testing - Consultar ocupacion por parqueadero (Backend)', () => {
  it('debe calcular ocupacion de dataset grande en tiempo acotado', async () => {
    const rows = Array.from({ length: 1000 }, (_, i) => ({ ID_PARQUEADERO: i + 1, TOTAL_CELDAS: 100, CELDAS_OCUPADAS: i % 100 }));
    const dataSource = { query: jest.fn(async () => [rows[320]]) };
    const service = new VistasService({} as any, {} as any, {} as any, {} as any, dataSource as any);

    const start = performance.now();
    await service.getOcupacionByParqueadero(321);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(300);
  });
});
