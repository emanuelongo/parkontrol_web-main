import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { Actor, Tasks } from '../screenplay/screenplay';
import { Scenario, Steps } from '../serenity/serenity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('API Testing - Iniciar sesion (Backend)', () => {
  it('debe retornar access_token con credenciales validas', async () => {
    const jwtService = {
      sign: jest.fn(() => 'token-prueba'),
    } as unknown as JwtService;
    const usuariosService = {
      findUsuarioByCorreo: jest.fn().mockResolvedValue({
        id: 1,
        correo: 'admin@test.com',
        contrasena: 'hash',
        rol: { nombre: 'ADMINISTRADOR' },
        empresa: { id: 10 },
      }),
    } as unknown as UsuariosService;
    (
      bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>
    ).mockResolvedValue(true as never);
    const service = new AuthService(jwtService, usuariosService);
    const actor = new Actor('QA Backoffice');
    const scenario = new Scenario('Iniciar sesion');
    const loginDto = { correo: 'admin@test.com', contrasena: 'secreto' };

    const result = (await scenario.given(
      Steps.login(() => actor.attemptsTo(Tasks.login(service, loginDto))),
    )) as {
      access_token: string;
    };

    expect(result).toEqual({ access_token: 'token-prueba' });
  });
});
