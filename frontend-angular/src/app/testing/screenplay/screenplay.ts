import { firstValueFrom } from 'rxjs';

export class Actor {
  constructor(public readonly name: string) {}

  async attemptsTo<T>(task: ScreenplayTask<T>): Promise<T> {
    return task(this);
  }
}

export type ScreenplayTask<T> = (actor: Actor) => Promise<T> | T;

export const Tasks = {
  login:
    (service: { login: (dto: any) => any }, dto: any): ScreenplayTask<any> =>
    async () => firstValueFrom(service.login(dto)),
  createCelda:
    (service: { create: (dto: any) => any }, dto: any): ScreenplayTask<any> =>
    async () => firstValueFrom(service.create(dto)),
  finalizeReserva:
    (service: { finalizar: (id: number) => any }, idReserva: number): ScreenplayTask<any> =>
    async () => firstValueFrom(service.finalizar(idReserva)),
  consultarOcupacion:
    (service: { getOcupacion: (idEmpresa?: number) => any }, idEmpresa?: number): ScreenplayTask<any> =>
    async () => firstValueFrom(service.getOcupacion(idEmpresa)),
  crearFactura:
    (service: { crearFactura: (dto: any) => any }, dto: any): ScreenplayTask<any> =>
    async () => firstValueFrom(service.crearFactura(dto)),
};