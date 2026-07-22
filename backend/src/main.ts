import 'dotenv/config'; // .env dosyasını process.env'e yükle
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';

// ✅ Uploads path: process.env override veya fallback to cwd/uploads (development'da çalışır)
const uploadsDir = process.env.UPLOADS_DIR || join(process.cwd(), 'uploads');

async function bootstrap() {
  // JWT_SECRET zorunlu — eksikse başlatma
  if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set.');
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);

  // ── Güvenlik HTTP başlıkları (Helmet) ────────────────────────────────────
  const isProd = process.env.NODE_ENV === 'production';
  app.use(
    helmet({
      // Content Security Policy — production'da sıkı, dev'de kapalı (Swagger için)
      contentSecurityPolicy: isProd
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc:  ["'self'", 'www.paytr.com'],
              frameSrc:   ["'self'", 'www.paytr.com'],
              imgSrc:     ["'self'", 'data:', 'blob:', '*.cloudinary.com'],
              connectSrc: ["'self'"],
              styleSrc:   ["'self'", "'unsafe-inline'"],
              fontSrc:    ["'self'", 'data:'],
            },
          }
        : false,
      crossOriginEmbedderPolicy: false, // PayTR iframe için devre dışı
      hsts: isProd
        ? { maxAge: 31_536_000, includeSubDomains: true, preload: true }
        : false,
    }),
  );

  // ── Gzip sıkıştırma ───────────────────────────────────────────────────────
  app.use(compression());

  // Cookie parser — HttpOnly JWT cookie okumak için zorunlu
  app.use(cookieParser());

  // Statik dosya servisi — /uploads/* (admin'in yüklediği görseller)
  console.log('📁 Serving static uploads from:', uploadsDir);
  
  // Content-Type header'ı set et
  app.use('/uploads', (req, res, next) => {
    const path = req.path.toLowerCase();
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (path.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    } else if (path.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
    next();
  });
  
  app.use('/uploads', express.static(uploadsDir));

  // Global Pipelines and Filters
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger (OpenAPI) Configuration
  const config = new DocumentBuilder()
    .setTitle('Mytt API')
    .setDescription('Mytt platform backend API dokümantasyonu')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('jwt', { type: 'http', scheme: 'bearer' }, 'jwt-cookie')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  SwaggerModule.setup('api', app, document);

  // CORS — credentials:true ile cookie gönderebilmek için origin whitelist zorunlu
  const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter((o) => {
      try {
        const u = new URL(o);
        return u.protocol === 'http:' || u.protocol === 'https:';
      } catch {
        console.warn(`[CORS] Invalid origin ignored: ${o}`);
        return false;
      }
    });

  app.enableCors({
    origin: (origin, callback) => {
      // Server-to-server veya curl isteklerine (origin yok) dev'de izin ver
      if (!origin && !isProd) return callback(null, true);
      if (!origin) return callback(new Error('CORS: Origin zorunlu'), false);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // null (not Error) prevents Express from converting the rejection to a 500
      callback(null, false);
    },
    credentials: true, // Cookie'nin cross-origin gönderilmesi için şart
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count'], // Pagination için
    maxAge: 86_400, // Preflight cache — 24 saat
  });

  await app.listen(3001);
  console.log('Application is running on: http://localhost:3001');
  console.log('Swagger docs available at: http://localhost:3001/api-docs');
}
bootstrap();
