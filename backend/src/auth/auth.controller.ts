import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  UseGuards,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import type { Response, Request } from 'express';

class ForgotPasswordDto {
  @IsEmail() @IsNotEmpty()
  email!: string;
}

class ResetPasswordDto {
  @IsString() @IsNotEmpty()
  token!: string;

  @IsString() @MinLength(6)
  newPassword!: string;
}

class VerifyOtpDto {
  @IsEmail() @IsNotEmpty()
  email!: string;

  @IsString() @IsNotEmpty()
  code!: string;
}

class ResendOtpDto {
  @IsEmail() @IsNotEmpty()
  email!: string;
}
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterDealerDto } from './dto/register-dealer.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// ── Cookie Ayarları ───────────────────────────────────────────────────────────
const isProd = process.env.NODE_ENV === 'production';

const ACCESS_COOKIE = 'jwt';
const REFRESH_COOKIE = 'jwt_refresh';

const ACCESS_OPTIONS = {
  httpOnly: true,
  secure:   isProd,
  sameSite: 'lax' as const,
  maxAge:   15 * 60 * 1000,       // 15 dakika
  path:     '/',
};

const REFRESH_OPTIONS = {
  httpOnly: true,
  secure:   isProd,
  sameSite: 'lax' as const,
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 gün
  path:     '/auth/refresh',          // Sadece refresh endpoint'ine gönderilir
};


// Auth controller — endpoint bazlı throttle
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  // Register: 10 istek / 60 saniye (daha cömert)
  @Post('register')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 409, description: 'User already exists.' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('register-dealer')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @ApiOperation({ summary: 'Register a new B2B dealer application' })
  @ApiResponse({ status: 201, description: 'Application successfully received.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 409, description: 'User or Tax ID already exists.' })
  async registerDealer(@Body() registerDealerDto: RegisterDealerDto) {
    return this.authService.registerDealer(registerDealerDto);
  }

  /**
   * LOGIN — JWT'yi HttpOnly cookie olarak set eder.
   * Response body'de artık accessToken yoktur, sadece user bilgisi.
   */
  @Post('login')
  @Throttle({ default: { ttl: 60_000, limit: 5 } }) // Brute-force: 5 deneme / 60s
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user — sets HttpOnly JWT cookie' })
  @ApiResponse({ status: 200, description: 'Successful login. Cookie set.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: any,
  ) {
    const result = await this.authService.login(loginDto);
    // Access token — 15 dakika
    res.cookie(ACCESS_COOKIE,  result.accessToken,  ACCESS_OPTIONS);
    // Refresh token — 7 gün, sadece /auth/refresh'e gider
    res.cookie(REFRESH_COOKIE, result.refreshToken, REFRESH_OPTIONS);
    return { user: result.user };
  }

  /**
   * POST /auth/refresh — Refresh token ile yeni access token al
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh token ile yeni access token al' })
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: any) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    if (!refreshToken) {
      throw new BadRequestException('Refresh token bulunamadı');
    }

    // ✅ İmza + expiry doğrulaması — base64 decode DEĞİL
    let userId: string;
    try {
      const payload = this.jwtService.verify<{ sub: string }>(refreshToken);
      userId = payload.sub;
    } catch {
      throw new UnauthorizedException('Geçersiz veya süresi dolmuş refresh token');
    }

    const tokens = await this.authService.refreshTokens(userId, refreshToken);
    res.cookie(ACCESS_COOKIE,  tokens.accessToken,  ACCESS_OPTIONS);
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, REFRESH_OPTIONS);
    return { ok: true };
  }

  /**
   * LOGOUT — Her iki cookie'yi temizler, refresh token DB'den siler.
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout — clears JWT cookies' })
  async logout(@Req() req: any, @Res({ passthrough: true }) res: any) {
    // Refresh token'ı DB'den sil — imzasız decode yerine verify kullan
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    if (refreshToken) {
      try {
        const payload = this.jwtService.verify<{ sub: string }>(refreshToken);
        if (payload?.sub) await this.authService.revokeRefreshToken(payload.sub);
      } catch {
        // Token süresi dolmuşsa bile cookie'yi temizliyoruz, hata verme
      }
    }
    res.clearCookie(ACCESS_COOKIE,  { ...ACCESS_OPTIONS, maxAge: undefined });
    res.clearCookie(REFRESH_COOKIE, { ...REFRESH_OPTIONS, maxAge: undefined });
    return { message: 'Çıkış yapıldı.' };
  }

  /**
   * ME — Cookie'deki JWT ile oturum bilgisini döndürür.
   * Frontend, sayfa yüklendiğinde bu endpoint'i çağırarak session'ı restore eder.
   */
  /**
   * POST /auth/forgot-password — Şifre sıfırlama linki gönderir
   */
  @Post('forgot-password')
  @Throttle({ default: { ttl: 300_000, limit: 3 } }) // 3 istek / 5 dakika
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Şifre sıfırlama emaili gönder' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
    // Daima aynı yanıtı dön — e-posta enumeration'ı önle
    return { message: 'Eğer bu e-posta kayıtlıysa sıfırlama bağlantısı gönderildi.' };
  }

  /**
   * POST /auth/reset-password — Yeni şifre kaydet
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Yeni şifre kaydet (token doğrulama)' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.newPassword);
    return { message: 'Şifreniz başarıyla güncellendi.' };
  }

  /**
   * POST /auth/verify-otp — 6 haneli kod ile e-posta doğrulama
   */
  @Post('verify-otp')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'OTP kodu ile e-posta doğrulama' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    await this.authService.verifyOtp(dto.email, dto.code);
    return { message: 'E-posta adresiniz başarıyla doğrulandı! Şimdi giriş yapabilirsiniz.' };
  }

  /**
   * POST /auth/resend-otp — Yeni doğrulama kodu gönder
   */
  @Post('resend-otp')
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Yeni OTP kodu gönder' })
  async resendOtp(@Body() dto: ResendOtpDto) {
    await this.authService.resendOtp(dto.email);
    return { message: 'Yeni doğrulama kodu gönderildi.' };
  }

  /**
   * GET /auth/verify-email?token=... — Eski link tabanlı doğrulama (geriye dönük uyumluluk)
   */
  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'E-posta adresini doğrula (token ile — eski yöntem)' })
  @ApiResponse({ status: 200, description: 'E-posta başarıyla doğrulandı.' })
  @ApiResponse({ status: 400, description: 'Geçersiz veya süresi dolmuş token.' })
  async verifyEmail(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Doğrulama token\'ı eksik.');
    }
    await this.authService.verifyEmail(token);
    return { message: 'E-posta adresiniz başarıyla doğrulandı! Şimdi giriş yapabilirsiniz.' };
  }

  /**
   * GET /auth/dev-otp?email=... — SADECE development: OTP kodunu döndürür
   * Production'da 404 verir (endpoint hiç yokmuş gibi).
   */
  @Get('dev-otp')
  @HttpCode(HttpStatus.OK)
  async devOtp(@Query('email') email: string) {
    // Production'da endpoint tamamen gizlenir — 404 ile görünmez yapılır
    if (process.env.NODE_ENV === 'production') {
      throw new NotFoundException();
    }
    if (!email) throw new BadRequestException('email parametresi gerekli');
    const user = await this.authService.getDevOtp(email);
    return user;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current session user from cookie' })
  @ApiResponse({ status: 200, description: 'Current user info.' })
  @ApiResponse({ status: 401, description: 'Not authenticated.' })
  async me(@Req() req: Request & { user?: any }) {
    // JwtAuthGuard doğruladı, req.user Prisma'dan gelen user objesi
    const user = req.user as {
      id: string;
      email: string;
      name: string | null;
      role: string;
      commissionRate: number;
      b2bStatus: string;
      walletBalance: any;
    };
    return {
      id: user.id,
      email: user.email,
      name: user.name ?? user.email.split('@')[0],
      role: user.role.toLowerCase(),
      commissionRate: user.commissionRate,
      b2bStatus: user.b2bStatus,
      walletBalance: Number(user.walletBalance ?? 0),
    };
  }
}
