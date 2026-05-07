import { CeldasService } from 'src/celdas/celdas.service';
import { Actor, Tasks } from '../screenplay/screenplay';
import { Scenario, Steps } from '../serenity/serenity';

describe('API Testing - Crear celda (Backend)', () => {
  it('debe crear y guardar una celda valida', async () => {
    const celdaRepo = {
      create: jest.fn((d) => ({ id: 1, ...d })),
      save: jest.fn(async (d) => d),
    };
    const tipoRepo = { findOne: jest.fn(async () => ({ id: 1 })) };
    const sensorRepo = { findOne: jest.fn(async () => ({ id: 1 })) };
    const parqueaderosService = { findParqueaderoById: jest.fn(async () => ({ id: 321 })) };
    const service = new CeldasService(celdaRepo as any, tipoRepo as any, sensorRepo as any, parqueaderosService as any);
    const actor = new Actor('QA Backoffice');
    const scenario = new Scenario('Crear celda');

    const result = await scenario.given(
      Steps.createCelda(() =>
        actor.attemptsTo(
          Tasks.createCelda(service, { idParqueadero: 321, idTipoCelda: 1, idSensor: 1, estado: 'LIBRE' } as any),
        ),
      ),
    );

    expect(result.estado).toBe('LIBRE');
    expect(celdaRepo.save).toHaveBeenCalledTimes(1);
  });
});
