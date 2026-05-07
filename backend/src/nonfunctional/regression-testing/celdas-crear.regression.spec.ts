import { CeldasService } from 'src/celdas/celdas.service';
import { NotFoundException } from '@nestjs/common';

describe('Regression Testing - Crear celda (Backend)', () => {
  it('debe mantener error cuando tipo de celda no existe', async () => {
    const service = new CeldasService(
      { create: jest.fn(), save: jest.fn() } as any,
      { findOne: jest.fn(async () => null) } as any,
      { findOne: jest.fn(async () => ({ id: 1 })) } as any,
      { findParqueaderoById: jest.fn(async () => ({ id: 1 })) } as any,
    );

    await expect(service.crear({ idParqueadero: 1, idTipoCelda: 999, idSensor: 1, estado: 'LIBRE' } as any)).rejects.toBeInstanceOf(NotFoundException);
  });
});
