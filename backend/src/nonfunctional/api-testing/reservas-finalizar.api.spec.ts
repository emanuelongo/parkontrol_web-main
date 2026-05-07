import { ReservasService } from 'src/reservas/reservas.service';
import { Actor, Tasks } from '../screenplay/screenplay';
import { Scenario, Steps } from '../serenity/serenity';

describe('API Testing - Finalizar reserva (Backend)', () => {
  it('debe cerrar reserva y liberar celda', async () => {
    const reservaRepo = {
      findOne: jest.fn(async () => ({ id: 1, fechaSalida: null, estado: 'ABIERTA', celda: { id: 20 } })),
      save: jest.fn(async (d) => d),
    };
    const celdasService = { findCeldaById: jest.fn(), actualizarEstado: jest.fn(async () => undefined) };
    const service = new ReservasService(
      reservaRepo as any,
      { findVehiculoById: jest.fn() } as any,
      celdasService as any,
    );
    const actor = new Actor('QA Backoffice');
    const scenario = new Scenario('Finalizar reserva');

    const result = await scenario.given(
      Steps.finalizeReserva(() => actor.attemptsTo(Tasks.finalizeReserva(service, 1))),
    );

    expect(result.estado).toBe('CERRADA');
    expect(celdasService.actualizarEstado).toHaveBeenCalledWith(20, 'LIBRE');
  });
});
