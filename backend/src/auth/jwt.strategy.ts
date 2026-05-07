import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { JwtPayload, JwtUsuario } from "./interfaces";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){

    constructor (
        configService: ConfigService,
    ){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get<string>('JWT_SECRET') || 'dev-jwt-secret',
            ignoreExpiration: false
        })
    }

    validate(payload: JwtPayload): JwtUsuario{
        return {
            id: payload.id, 
            correo: payload.correo,
            nombreRol: payload.nombreRol,
            idEmpresa: payload.idEmpresa,
        }
    }
}
