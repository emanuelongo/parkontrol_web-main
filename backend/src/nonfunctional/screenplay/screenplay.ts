export class Actor {
  constructor(public readonly name: string) {}

  async attemptsTo<T>(task: ScreenplayTask<T>): Promise<T> {
    return task(this);
  }
}

export type ScreenplayTask<T> = (actor: Actor) => Promise<T> | T;

export const Tasks = {
  login:
    (service: { login: (dto: any) => Promise<any> }, dto: any): ScreenplayTask<any> =>
    async () => service.login(dto),
  createCelda:
    (service: { crear: (dto: any) => Promise<any> }, dto: any): ScreenplayTask<any> =>
    async () => service.crear(dto),
  finalizeReserva:
    (service: { finalizarReserva: (id: number) => Promise<any> }, idReserva: number): ScreenplayTask<any> =>
    async () => service.finalizarReserva(idReserva),
  consultarOcupacion:
    (service: { getOcupacionByParqueadero: (idParqueadero: number) => Promise<any> }, idParqueadero: number): ScreenplayTask<any> =>
    async () => service.getOcupacionByParqueadero(idParqueadero),
  crearFactura:
    (service: { crearFactura: (dto: any) => Promise<any> }, dto: any): ScreenplayTask<any> =>
    async () => service.crearFactura(dto),
};