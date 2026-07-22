import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomBytes } from 'crypto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// ✅ Uploads path: development'da process.cwd()/uploads, production'da env override
const UPLOADS_DIR = process.env.UPLOADS_DIR || join(process.cwd(), 'uploads');

const ALLOWED_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
]);

const ALLOWED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif']);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

@ApiTags('uploads')
@Controller('uploads')
export class UploadController {
  /**
   * POST /uploads/image
   * Admin-only image upload. Stores under backend/uploads/, returns public URL.
   */
  @Post('image')
  @UseGuards(JwtAuthGuard)            // Tüm oturumlular yükleyebilir (müşteri + bayi + admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Auth] Upload an image — returns /uploads/<filename> URL' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          console.log('📤 Multer destination dir:', UPLOADS_DIR);
          cb(null, UPLOADS_DIR);
        },
        filename: (_req, file, cb) => {
          const safeExt = extname(file.originalname).toLowerCase().slice(0, 6);
          const id = randomBytes(12).toString('hex');
          cb(null, `${Date.now()}-${id}${safeExt}`);
        },
      }),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, cb) => {
        // MIME type kontrolü
        if (!ALLOWED_MIMES.has(file.mimetype)) {
          return cb(new BadRequestException('Sadece görsel dosyaları yüklenebilir.'), false);
        }
        // Uzantı kontrolü (MIME spoofing önlemi)
        const ext = extname(file.originalname).toLowerCase();
        if (!ALLOWED_EXTS.has(ext)) {
          return cb(new BadRequestException('Desteklenmeyen dosya uzantısı.'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    console.log('✅ Upload attempt - File:', file?.filename || 'NO FILE');
    if (!file) throw new BadRequestException('Dosya bulunamadı.');
    // Göreli yol döndür — domain bağımsız, production'da sorunsuz çalışır.
    // Frontend, API_BASE + path ile tam URL oluşturur.
    return {
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      size: file.size,
      mime: file.mimetype,
    };
  }
}
