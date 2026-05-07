import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import * as bcrypt from 'bcrypt';
import { expectAuthResult, expectFailure } from 'src/shared/testing/fluent-assertions';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

const validEmail = 'ema1001cano@gmail.com';
const validPassword = 'Prueba1.';
const invalidEmail = 'ema1010@gmail.com';
const invalidPassword = 'prueba1.';

describe('AuthService', () => {
  let service: AuthService;
  let currentUser: any;
  let createdUser: any;
  let lastCreateArgs: any[];
  const usuariosService = {
    findUsuarioByCorreo: async () => currentUser,
    crear: async (...args: any[]) => {
      lastCreateArgs = args;
      return createdUser;
    },
  };
  const jwtService = {
    sign: () => 'token-prueba',
  };

  beforeEach(async () => {
    currentUser = null;
    createdUser = null;
    lastCreateArgs = [];

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsuariosService, useValue: usuariosService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  it('debe devolver token con credenciales validas', async () => {
    // Arrange
    currentUser = {
      id: 1,
      correo: validEmail,
      contrasena: 'hash',
      rol: { nombre: 'ADMINISTRADOR' },
      empresa: { id: 10 },
    };
    const loginDto = { correo: validEmail, contrasena: validPassword };
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    // Act
    const result = await service.login(loginDto);

    // Assert
    expectAuthResult(result).toHaveAccessToken('token-prueba');
    expect(bcrypt.compare).toHaveBeenCalledWith(validPassword, 'hash');
  });

  it('debe rechazar correo invalido', async () => {
    // Arrange
    const loginDto = { correo: invalidEmail, contrasena: validPassword };
    currentUser = null;

    // Act + Assert
    await expectFailure(service.login(loginDto)).toBeUnauthorized();
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('debe rechazar contrasena invalida', async () => {
    // Arrange
    currentUser = {
      id: 1,
      correo: validEmail,
      contrasena: 'hash',
      rol: { nombre: 'ADMINISTRADOR' },
      empresa: { id: 10 },
    };
    const loginDto = { correo: validEmail, contrasena: invalidPassword };

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    // Act + Assert
    await expectFailure(service.login(loginDto)).toBeUnauthorized();
    expect(bcrypt.compare).toHaveBeenCalledWith(invalidPassword, 'hash');
  });

  it('debe registrar usuario delegando a UsuariosService', async () => {
    // Arrange
    const registrarDto = {
      nombre: 'Emanuel',
      correo: validEmail,
      contrasena: validPassword,
      telefono: '3000000000',
      direccion: 'Calle 1',
      idTipoDocumento: 1,
      numeroDocumento: '123456',
      idEmpresa: 10,
    };
    createdUser = { id: 99, correo: validEmail };

    // Act
    const result = await service.registrar(registrarDto as any);

    // Assert
    expect(result).toEqual(createdUser);
    expect(lastCreateArgs[0]).toEqual(registrarDto);
    expect(lastCreateArgs[1]).toBe('ADMINISTRADOR');
  });
});