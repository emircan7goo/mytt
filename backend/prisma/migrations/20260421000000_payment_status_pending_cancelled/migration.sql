-- PaymentStatus enum'a PENDING ve CANCELLED değerleri ekle
-- PostgreSQL'de enum değerleri yalnızca eklenebilir, silinemez
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'PENDING';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';

-- Order tablosuna paymentToken alanı ekle (PayTR geçici token)
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentToken" TEXT;

-- paymentStatus için varsayılan değeri PENDING yap
ALTER TABLE "Order" ALTER COLUMN "paymentStatus" SET DEFAULT 'PENDING'::"PaymentStatus";
