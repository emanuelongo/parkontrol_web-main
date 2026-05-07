import { firstValueFrom } from 'rxjs';

export class Scenario {
  constructor(public readonly name: string) {}

  async given<T>(step: SerenityStep<T>): Promise<T> {
    return step(this);
  }
}

export type SerenityStep<T> = (scenario: Scenario) => Promise<T> | T;

export const Steps = {
  login:
    (service: { login: (dto: any) => any }, dto: any): SerenityStep<any> =>
    async () => firstValueFrom(service.login(dto)),
  createCelda:
    (service: { create: (dto: any) => any }, dto: any): SerenityStep<any> =>
    async () => firstValueFrom(service.create(dto)),
  finalizarReserva:
    (service: { finalizar: (id: number) => any }, idReserva: number): SerenityStep<any> =>
    async () => firstValueFrom(service.finalizar(idReserva)),
  consultarOcupacion:
    (service: { getOcupacion: (idEmpresa?: number) => any }, idEmpresa?: number): SerenityStep<any> =>
    async () => firstValueFrom(service.getOcupacion(idEmpresa)),
  crearFactura:
    (service: { crearFactura: (dto: any) => any }, dto: any): SerenityStep<any> =>
    async () => firstValueFrom(service.crearFactura(dto)),
};