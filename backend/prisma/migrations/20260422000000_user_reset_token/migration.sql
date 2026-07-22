-- Şifre sıfırlama token alanları
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetToken" TEXT UNIQUE;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP(3);
