import { ReservasService } from 'src/reservas/reservas.service';

describe('Performance Testing - Finalizar reserva (Backend)', () => {
  it('debe finalizar reserva en tiempo acotado', async () => {
    const service = new ReservasService(
      {
        findOne: jest.fn(async () => ({ id: 1, fechaSalida: null, estado: 'ABIERTA', celda: { id: 2 } })),
        save: jest.fn(async (d) => d),
      } as any,
      { findVehiculoById: jest.fn() } as any,
      { findCeldaById: jest.fn(), actualizarEstado: jest.fn(async () => undefined) } as any,
    );

    const start = performance.now();
    await service.finalizarReserva(1);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(300);
  });
});
