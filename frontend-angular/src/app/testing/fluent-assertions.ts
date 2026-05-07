export const expectLoginFlow = (ctx: {
  loginSpy: jasmine.Spy;
  navigateSpy: jasmine.Spy;
  errorMessage: string;
}) => {
  const fluent = {
    toAttemptWith(credentials: { correo: string; contrasena: string }) {
      expect(ctx.loginSpy).toHaveBeenCalledWith(credentials);
      return fluent;
    },
    toRedirectTo(path: string) {
      expect(ctx.navigateSpy).toHaveBeenCalledWith([path]);
      return fluent;
    },
    toShowRejectedAccess() {
      expect(ctx.errorMessage).toContain('Acceso rechazado');
      return fluent;
    },
  };

  return fluent;
};

export const expectCeldaCreationFlow = (ctx: {
  createSpy: jasmine.Spy;
  refreshSpy: jasmine.Spy;
  errorMessage: string;
}) => {
  const fluent = {
    toCreateCelda() {
      expect(ctx.createSpy).toHaveBeenCalled();
      return fluent;
    },
    toRefreshParqueadero(idParqueadero: number) {
      expect(ctx.refreshSpy).toHaveBeenCalledWith(idParqueadero);
      return fluent;
    },
    toShowErrorContaining(text: string) {
      expect(ctx.errorMessage).toContain(text);
      return fluent;
    },
    toHaveNoError() {
      expect(ctx.errorMessage).toBe('');
      return fluent;
    },
  };

  return fluent;
};

export const expectReservaFinalizacionFlow = (ctx: {
  openDialogSpy: jasmine.Spy;
  createPagoSpy: jasmine.Spy;
}) => {
  const fluent = {
    toOpenDialog() {
      expect(ctx.openDialogSpy).toHaveBeenCalled();
      return fluent;
    },
    toProcessPayment() {
      expect(ctx.createPagoSpy).toHaveBeenCalled();
      return fluent;
    },
  };

  return fluent;
};

export const expectOcupacionDashboard = (ctx: {
  promedioOcupacion: number;
  totalReservas: number;
  ingresosTotal: number;
  facturacionTotal: number;
}) => {
  const fluent = {
    toHavePromedio(expected: number) {
      expect(ctx.promedioOcupacion).toBe(expected);
      return fluent;
    },
    toHaveTotales(expected: {
      totalReservas: number;
      ingresosTotal: number;
      facturacionTotal: number;
    }) {
      expect(ctx.totalReservas).toBe(expected.totalReservas);
      expect(ctx.ingresosTotal).toBe(expected.ingresosTotal);
      expect(ctx.facturacionTotal).toBe(expected.facturacionTotal);
      return fluent;
    },
  };

  return fluent;
};

export const expectFacturaCreationFlow = (ctx: {
  createFacturaSpy: jasmine.Spy;
  mensajeExito: string;
  errorMessage: string;
}) => {
  const fluent = {
    toAttemptCreateWith(dto: {
      idPago: number;
      idClienteFactura: number;
      cufe: string;
      urlPdf: string;
    }) {
      expect(ctx.createFacturaSpy).toHaveBeenCalledWith(dto);
      return fluent;
    },
    toShowSuccessContaining(text: string) {
      expect(ctx.mensajeExito).toContain(text);
      return fluent;
    },
    toShowErrorContaining(text: string) {
      expect(ctx.errorMessage).toContain(text);
      return fluent;
    },
    toClearSuccess() {
      expect(ctx.mensajeExito).toBe('');
      return fluent;
    },
    toClearError() {
      expect(ctx.errorMessage).toBe('');
      return fluent;
    },
  };

  return fluent;
};
