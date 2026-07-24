/**
 * POST /api/uploads/image — Vercel Blob'a görsel yükler.
 * (backend/src/upload/upload.controller.ts'ten taşındı)
 *
 * NestJS'te Multer diskStorage kullanılıyordu — Vercel serverless'te
 * dosya sistemi geçici/instance'a özel olduğu için bu çalışmaz. Bunun
 * yerine Vercel Blob'a (S3 benzeri, proje ile birlikte gelir) yüklüyoruz.
 * Dönen URL zaten mutlak (https://*.public.blob.vercel-storage.com/...)
 * olduğu için lib/resolveUrl.ts'teki "harici URL" dalı bunu olduğu gibi
 * kullanır — ek bir değişiklik gerekmedi.
 */
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getAuthUser } from '@/lib/auth-server';

const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']);
const ALLOWED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif']);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function extOf(filename: string): string {
  const i = filename.lastIndexOf('.');
  return i === -1 ? '' : filename.slice(i).toLowerCase();
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ message: 'Dosya bulunamadı.' }, { status: 400 });
  }
  if (!ALLOWED_MIMES.has(file.type)) {
    return NextResponse.json({ message: 'Sadece görsel dosyaları yüklenebilir.' }, { status: 400 });
  }
  const ext = extOf(file.name);
  if (!ALLOWED_EXTS.has(ext)) {
    return NextResponse.json({ message: 'Desteklenmeyen dosya uzantısı.' }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ message: 'Dosya boyutu 10 MB sınırını aşıyor.' }, { status: 400 });
  }

  const safeExt = ext.slice(0, 6);
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 24);
  const filename = `${Date.now()}-${id}${safeExt}`;

  const blob = await put(filename, file, {
    access: 'public',
    contentType: file.type,
  });

  return NextResponse.json({
    url: blob.url,
    filename,
    size: file.size,
    mime: file.type,
  }, { status: 201 });
}
