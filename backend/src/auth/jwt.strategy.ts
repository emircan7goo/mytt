import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';

/**
 * JWT Strategy — Cookie-First, Bearer Fallback
 *
 * Önce HttpOnly 'jwt' cookie'sinden token okur.
 * Cookie yoksa Authorization: Bearer header'ına bakar (Swagger / test için).
 * Bu şekilde hem güvenli production cookie akışı hem de API test araçları desteklenir.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      // Cookie'den veya Bearer header'dan token al
      jwtFromRequest: ExtractJwt.fromExtractors([
        // 1. Önce HttpOnly cookie'yi dene
        (req: Request) => {
          const token = req?.cookies?.['jwt'];
          return token ?? null;
        },
        // 2. Fallback: Authorization: Bearer <token>
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET as string,
      // cookie'yi okuyabilmek için request objesini validate'e ilet
      passReqToCallback: false,
    });
  }

  async validate(payload: { sub: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException();
    }
    if (user.isActive === false) {
      throw new UnauthorizedException('Hesabınız devre dışı bırakılmış.');
    }

    return user;
  }
}
