import { AuthService } from 'src/auth/auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('Regression Testing - Iniciar sesion (Backend)', () => {
  it('debe mantener UnauthorizedException con password invalido', async () => {
    const service = new AuthService(
      { sign: jest.fn() } as any,
      { findUsuarioByCorreo: jest.fn(async () => ({ contrasena: 'hash' })) } as any,
    );
    jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(false);

    await expect(service.login({ correo: 'a@a.com', contrasena: 'bad' } as any)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('debe mantener UnauthorizedException cuando no existe usuario', async () => {
    const service = new AuthService(
      { sign: jest.fn() } as any,
      { findUsuarioByCorreo: jest.fn(async () => null) } as any,
    );

    await expect(service.login({ correo: 'x@x.com', contrasena: '123' } as any)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
