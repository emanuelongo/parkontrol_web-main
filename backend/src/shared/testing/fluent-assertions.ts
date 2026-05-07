import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export const expectAuthResult = (result: any) => {
  const fluent = {
    toHaveAccessToken(expectedToken: string) {
      expect(result).toEqual(
        expect.objectContaining({ access_token: expectedToken }),
      );
      return fluent;
    },
  };

  return fluent;
};

export const expectCeldaResult = (result: any) => {
  const fluent = {
    toBeCreatedAs(expected: {
      id: number;
      estado: string;
      parqueadero: any;
      tipoCelda: any;
      sensor: any;
    }) {
      expect(result).toEqual({
        id: expected.id,
        estado: expected.estado,
        parqueadero: expected.parqueadero,
        tipoCelda: expected.tipoCelda,
        sensor: expected.sensor,
      });
      return fluent;
    },
  };

  return fluent;
};

export const expectReservaResult = (result: any) => {
  const fluent = {
    toBeFinalizadaConCelda(idCelda: number) {
      expect(result).toEqual({
        id: 1,
        fechaSalida: expect.any(Date),
        estado: 'CERRADA',
        celda: { id: idCelda },
      });
      return fluent;
    },
  };

  return fluent;
};

export const expectOcupacionResult = (result: any) => {
  const fluent = {
    toMatchParqueadero(expected: {
      idParqueadero: number;
      totalCeldas: number;
      celdasOcupadas: number;
    }) {
      expect(result).toEqual(expected);
      return fluent;
    },
    toBeNull() {
      expect(result).toBeNull();
      return fluent;
    },
  };

  return fluent;
};

export const expectFacturaResult = (result: any) => {
  const fluent = {
    toBeCreatedAs(expected: {
      id: number;
      pago: any;
      clienteFactura: any;
      cufe: string;
      urlPdf: string;
      enviada: 'N' | 'Y';
    }) {
      expect(result).toEqual({
        id: expected.id,
        pago: expected.pago,
        clienteFactura: expected.clienteFactura,
        cufe: expected.cufe,
        urlPdf: expected.urlPdf,
        enviada: expected.enviada,
        fechaCreacion: expect.any(Date),
      });
      return fluent;
    },
  };

  return fluent;
};

export const expectFailure = (action: Promise<unknown>) => {
  const fluent = {
    async toBeUnauthorized() {
      await expect(action).rejects.toBeInstanceOf(UnauthorizedException);
      return fluent;
    },
    async toBeBadRequest() {
      await expect(action).rejects.toBeInstanceOf(BadRequestException);
      return fluent;
    },
    async toBeNotFound() {
      await expect(action).rejects.toBeInstanceOf(NotFoundException);
      return fluent;
    },
  };

  return fluent;
};
