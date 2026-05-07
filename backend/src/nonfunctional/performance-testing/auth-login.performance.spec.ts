import { AuthService } from 'src/auth/auth.service';

describe('Performance Testing - Iniciar sesion (Backend)', () => {
  it('debe responder login en tiempo acotado', async () => {
    const service = new AuthService(
      { sign: jest.fn(() => 't') } as any,
      {
        findUsuarioByCorreo: jest.fn(async () => ({
          id: 1,
          correo: 'admin@test.com',
          contrasena: 'hash',
          rol: { nombre: 'ADMINISTRADOR' },
          empresa: { id: 1 },
        })),
      } as any,
    );
    jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);

    const start = performance.now();
    await service.login({ correo: 'admin@test.com', contrasena: 'ok' } as any);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(300);
  });
});
