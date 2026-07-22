import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto, RoleEnum } from './dto/register.dto';
import { RegisterDealerDto } from './dto/register-dealer.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { Role, ApplicationStatus } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma:      PrismaService,
    private jwtService:  JwtService,
    private mail:        MailService,
  ) {}

  /** 6 haneli doğrulama kodu üretir */
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async register(registerDto: RegisterDto) {
    const { email, password, role, name } = registerDto;

    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Bu e-posta adresi zaten kullanımda.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let userRole: Role = Role.CUSTOMER;
    if (role === RoleEnum.DEALER) userRole = Role.DEALER;

    // Önce kullanıcıyı token'sız oluştur (ID'ye ihtiyacımız var)
    const user = await this.prisma.user.create({
      data: {
        email,
        password:      hashedPassword,
        role:          userRole,
        name:          name ?? null,
        emailVerified: false,
      },
    });

    // OTP oluştur ve kaydet — userId prefix ile unique'liği garantile
    const otp = this.generateOtp();
    const emailVerifyToken  = `${user.id.slice(0, 8)}-${otp}`;
    const emailVerifyExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 dakika

    await this.prisma.user.update({
      where: { id: user.id },
      data:  { emailVerifyToken, emailVerifyExpiry },
    });

    // OTP kodunu e-posta ile gönder
    await this.mail.sendVerificationCode({
      email,
      name: name ?? email.split('@')[0],
      code: otp,
    });

    const { password: _, emailVerifyToken: __, ...userWithoutSensitive } = user;
    return {
      ...userWithoutSensitive,
      message: 'Kayıt başarılı! E-posta adresinize 6 haneli doğrulama kodu gönderdik.',
    };
  }

  // ── [DEV ONLY] OTP kodunu döndür ─────────────────────────────────────────
  async getDevOtp(email: string): Promise<{ email: string; code: string | null; expiresAt: Date | null }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { email: true, emailVerifyToken: true, emailVerifyExpiry: true, emailVerified: true },
    });
    if (!user) throw new BadRequestException('Kullanıcı bulunamadı');
    if (user.emailVerified) return { email, code: null, expiresAt: null };
    const code = user.emailVerifyToken ? user.emailVerifyToken.split('-').pop() ?? null : null;
    return { email, code, expiresAt: user.emailVerifyExpiry };
  }

  // ── OTP ile e-posta doğrulama ─────────────────────────────────────────────
  async verifyOtp(email: string, code: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) throw new BadRequestException('Bu e-posta adresi bulunamadı.');
    if (user.emailVerified) return; // Zaten doğrulanmış

    if (!user.emailVerifyToken) {
      throw new BadRequestException('Doğrulama kodu bulunamadı. Lütfen yeni kod isteyin.');
    }

    if (!user.emailVerifyExpiry || user.emailVerifyExpiry < new Date()) {
      throw new BadRequestException('Doğrulama kodunun süresi dolmuş. Lütfen yeni kod isteyin.');
    }

    // Token formatı: "{userId_prefix}-{otp}"
    const storedOtp = user.emailVerifyToken.split('-').pop();
    if (storedOtp !== code.trim()) {
      throw new BadRequestException('Doğrulama kodu hatalı. Lütfen tekrar deneyin.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data:  { emailVerified: true, emailVerifyToken: null, emailVerifyExpiry: null },
    });
  }

  // ── OTP yeniden gönder ────────────────────────────────────────────────────
  async resendOtp(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.emailVerified) return; // Sessizce geç

    const otp               = this.generateOtp();
    const emailVerifyToken  = `${user.id.slice(0, 8)}-${otp}`;
    const emailVerifyExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data:  { emailVerifyToken, emailVerifyExpiry },
    });

    await this.mail.sendVerificationCode({
      email,
      name: user.name ?? email.split('@')[0],
      code: otp,
    });
  }

  // ── E-posta doğrulama ──────────────────────────────────────────────────────
  async verifyEmail(token: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { emailVerifyToken: token },
    });

    if (!user) {
      throw new BadRequestException('Geçersiz doğrulama bağlantısı.');
    }

    if (!user.emailVerifyExpiry || user.emailVerifyExpiry < new Date()) {
      throw new BadRequestException(
        'Doğrulama bağlantısının süresi dolmuş. Lütfen tekrar kayıt olun veya destek ile iletişime geçin.',
      );
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified:    true,
        emailVerifyToken: null,
        emailVerifyExpiry: null,
      },
    });
  }

  async registerDealer(registerDealerDto: RegisterDealerDto) {
    const { email, password, name, companyName, taxId } = registerDealerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Bu e-posta adresi ile zaten bir hesap var');
    }

    const existingTax = await this.prisma.user.findFirst({
      where: { taxId },
    });
    const existingTaxApp = await this.prisma.dealerApplication.findFirst({
      where: { taxNumber: taxId },
    });
    if (existingTax || existingTaxApp) {
      throw new ConflictException('Bu vergi numarası sistemde kayıtlı');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Atomic creation using Prisma nested create
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.CUSTOMER,
        b2bStatus: ApplicationStatus.PENDING,
        companyName,
        taxId,
        dealerApplication: {
          create: {
            companyName,
            taxNumber: taxId,
            status: ApplicationStatus.PENDING,
          },
        },
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // select ile PostGIS geometry(location) alanını dışarıda bırak — Prisma serialization hatası önlenir
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id:               true,
        email:            true,
        password:         true,
        role:             true,
        name:             true,
        isActive:         true,
        refreshTokenHash: true,
        commissionRate:   true,
        b2bStatus:        true,
        emailVerified:    true,
        emailVerifyToken: true,
      },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('E-posta veya şifre hatalı.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('E-posta veya şifre hatalı.');
    }

    // E-posta doğrulanmamışsa girişi engelle
    // Güvenlik: Sadece aktif doğrulama token'ı olan yeni kayıtları bloke et.
    // emailVerifyToken = null → eski kullanıcı veya zaten doğrulanmış → serbest.
    if (!user.emailVerified && user.emailVerifyToken) {
      throw new ForbiddenException(
        'E-posta adresiniz doğrulanmamış. Kayıt e-postanızdaki doğrulama bağlantısına tıklayın.',
      );
    }

    const payload        = { email: user.email, sub: user.id, role: user.role };
    const roleNormalized = user.role.toLowerCase() as 'customer' | 'dealer' | 'admin';

    // 15 dakikalık access + 7 günlük refresh
    const accessToken  = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign({ sub: user.id }, { expiresIn: '7d' });

    // Refresh token'ı hash'le, DB'ye kaydet
    const refreshHash = await bcrypt.hash(refreshToken, 8);
    await this.prisma.user.update({
      where: { id: user.id },
      data:  { refreshTokenHash: refreshHash },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? user.email.split('@')[0],
        role: roleNormalized,
        commissionRate: user.commissionRate,
        b2bStatus: user.b2bStatus,
      },
    };
  }

  // ── Refresh token ile yeni access token al ────────────────────────────────
  async refreshTokens(userId: string, rawRefreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Geçersiz oturum');
    }
    const isValid = await bcrypt.compare(rawRefreshToken, user.refreshTokenHash);
    if (!isValid) throw new UnauthorizedException('Geçersiz refresh token');

    // Token rotation
    const payload      = { email: user.email, sub: user.id, role: user.role };
    const accessToken  = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign({ sub: user.id }, { expiresIn: '7d' });

    await this.prisma.user.update({
      where: { id: user.id },
      data:  { refreshTokenHash: await bcrypt.hash(refreshToken, 8) },
    });

    return { accessToken, refreshToken };
  }

  // ── Logout — refresh token geçersiz kıl ──────────────────────────────────
  async revokeRefreshToken(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data:  { refreshTokenHash: null },
    }).catch(() => {}); // Kullanıcı bulunamazsa sessizce geç
  }

  // ── Şifre Sıfırlama — Link Gönder ────────────────────────────────────────
  async forgotPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Kullanıcı yoksa da hata verme — enumeration saldırısını önle
    if (!user) return;

    const token  = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 saat

    await this.prisma.user.update({
      where: { id: user.id },
      data:  { resetToken: token, resetTokenExpiry: expiry },
    });

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const resetUrl    = `${frontendUrl}/sifre-sifirla?token=${token}`;

    await this.mail.sendPasswordReset({
      email,
      name:     user.name ?? email.split('@')[0],
      resetUrl,
    });
  }

  // ── Şifre Sıfırlama — Yeni Şifre Kaydet ──────────────────────────────────
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { resetToken: token } });

    if (!user || !user.resetTokenExpiry) {
      throw new BadRequestException('Geçersiz veya süresi dolmuş sıfırlama bağlantısı');
    }

    if (user.resetTokenExpiry < new Date()) {
      throw new BadRequestException('Sıfırlama bağlantısının süresi dolmuş. Lütfen tekrar isteyin.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password:         hashedPassword,
        resetToken:       null,
        resetTokenExpiry: null,
      },
    });
  }
}
