import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpresasModule } from './empresas/empresas.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ParqueaderosModule } from './parqueaderos/parqueaderos.module';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';
import { CeldasModule } from './celdas/celdas.module';
import { VehiculosModule } from './vehiculos/vehiculos.module';
import { ReservasModule } from './reservas/reservas.module';
import { TarifasModule } from './tarifas/tarifas.module';
import { PagosModule } from './pagos/pagos.module';
import { FacturacionModule } from './facturacion/facturacion.module';
import { ReportesModule } from './reportes/reportes.module';
import { VistasModule } from './vistas/vistas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'oracle',
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: Number(configService.get<number>('DB_PORT') || 1521),
        username: configService.get<string>('DB_USERNAME') || 'parkontrol',
        password: configService.get<string>('DB_PASSWORD') || 'parkontrol',
        sid: configService.get<string>('DB_SID') || 'XE',
        synchronize: false,
        dropSchema: false,
        autoLoadEntities: true,
        logging: true,
        extra: {
          poolMin: 1,
          poolMax: 1,
          poolIncrement: 0,
        },
      }),
    }),
    SharedModule,
    AuthModule,
    EmpresasModule,
    UsuariosModule,
    ParqueaderosModule,
    CeldasModule,
    VehiculosModule,
    TarifasModule,
    ReservasModule,
    PagosModule,
    FacturacionModule,
    ReportesModule,
    VistasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
