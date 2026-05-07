import { AuthService } from 'src/auth/auth.service';

describe('Security Testing - Iniciar sesion (Backend)', () => {
  it('no debe incluir password en payload del token', async () => {
    const sign = jest.fn(() => 'token-prueba');
    const service = new AuthService(
      { sign } as any,
      {
        findUsuarioByCorreo: jest.fn(async () => ({
          id: 1,
          correo: 'admin@test.com',
          contrasena: 'hash-secreto',
          rol: { nombre: 'ADMINISTRADOR' },
          empresa: { id: 1 },
        })),
      } as any,
    );
    jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);

    await service.login({ correo: 'admin@test.com', contrasena: 'ok' } as any);

    const payload = sign.mock.calls[0][0];
    expect(payload.contrasena).toBeUndefined();
  });
});
