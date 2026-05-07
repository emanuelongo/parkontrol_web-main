import { ReservasService } from 'src/reservas/reservas.service';
import { NotFoundException } from '@nestjs/common';

describe('Regression Testing - Finalizar reserva (Backend)', () => {
  it('debe mantener NotFoundException para reserva inexistente', async () => {
    const service = new ReservasService(
      { findOne: jest.fn(async () => null), save: jest.fn() } as any,
      { findVehiculoById: jest.fn() } as any,
      { findCeldaById: jest.fn(), actualizarEstado: jest.fn() } as any,
    );

    await expect(service.finalizarReserva(999)).rejects.toBeInstanceOf(NotFoundException);
  });
});
