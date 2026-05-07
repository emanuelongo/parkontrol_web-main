import { VistasService } from 'src/vistas/vistas.service';
import { Actor, Tasks } from '../screenplay/screenplay';
import { Scenario, Steps } from '../serenity/serenity';

describe('API Testing - Consultar ocupacion por parqueadero (Backend)', () => {
  it('debe transformar llaves y devolver el primer registro', async () => {
    const dataSource = {
      query: jest.fn(async () => [{ ID_PARQUEADERO: 321, TOTAL_CELDAS: 10, CELDAS_OCUPADAS: 3 }]),
    };
    const service = new VistasService({} as any, {} as any, {} as any, {} as any, dataSource as any);
    const actor = new Actor('QA Backoffice');
    const scenario = new Scenario('Consultar ocupacion por parqueadero');

    const result = await scenario.given(
      Steps.consultarOcupacion(() => actor.attemptsTo(Tasks.consultarOcupacion(service, 321))),
    );

    expect(result).toEqual({ idParqueadero: 321, totalCeldas: 10, celdasOcupadas: 3 });
  });
});
