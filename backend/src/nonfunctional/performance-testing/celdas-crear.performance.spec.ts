import { CeldasService } from 'src/celdas/celdas.service';

describe('Performance Testing - Crear celda (Backend)', () => {
  it('debe crear celda en tiempo acotado', async () => {
    const service = new CeldasService(
      { create: jest.fn((d) => d), save: jest.fn(async (d) => d) } as any,
      { findOne: jest.fn(async () => ({ id: 1 })) } as any,
      { findOne: jest.fn(async () => ({ id: 1 })) } as any,
      { findParqueaderoById: jest.fn(async () => ({ id: 1 })) } as any,
    );

    const start = performance.now();
    await service.crear({ idParqueadero: 1, idTipoCelda: 1, idSensor: 1, estado: 'LIBRE' } as any);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(300);
  });
});
