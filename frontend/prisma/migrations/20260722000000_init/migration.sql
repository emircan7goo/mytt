-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'DEALER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('NONE', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('NEW', 'SECOND_HAND');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('SELL', 'TRADE_IN');

-- CreateEnum
CREATE TYPE "DealerMarketStatus" AS ENUM ('PENDING_ADMIN', 'ACTIVE', 'EXPIRED', 'SOLD', 'CANCELLED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DealerListingType" AS ENUM ('AUCTION', 'DIRECT');

-- CreateEnum
CREATE TYPE "SellRequestStatus" AS ENUM ('PENDING', 'EXPIRED', 'ACCEPTED', 'REJECTED', 'SHIPPED', 'RECEIVED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'ESCROW', 'RELEASED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ShippingStatus" AS ENUM ('WAITING_DEALER_SHIPMENT', 'DEALER_SHIPPED', 'WAREHOUSE_RECEIVED', 'INSPECTION_PASSED', 'ADMIN_SHIPPED', 'DELIVERED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'REJECTED');

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "iban" TEXT NOT NULL,
    "ibanName" TEXT,
    "adminNote" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "processedBy" TEXT,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "googleId" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "b2bStatus" "ApplicationStatus" NOT NULL DEFAULT 'NONE',
    "taxId" TEXT,
    "companyName" TEXT,
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "walletBalance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "iban" TEXT,
    "ibanName" TEXT,
    "location" geometry(Point, 4326),
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifyToken" TEXT,
    "emailVerifyExpiry" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "refreshTokenHash" TEXT,
    "documentsVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "coverImage" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "jobsCompleted" INTEGER NOT NULL DEFAULT 0,
    "address" TEXT,
    "bio" TEXT,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "detailedServices" JSONB,
    "reviews" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "condition" "Condition" NOT NULL DEFAULT 'NEW',
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "specsJson" JSONB,
    "imagesUrl" TEXT[],
    "isSponsored" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "discountedPrice" DOUBLE PRECISION,
    "isOnCampaign" BOOLEAN NOT NULL DEFAULT false,
    "campaignTag" TEXT,
    "campaignEndDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "productId" TEXT,
    "dealerStockId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "amount" DECIMAL(12,2) NOT NULL,
    "commissionRate" DECIMAL(5,4) NOT NULL DEFAULT 0.05,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentToken" TEXT,
    "shippingAddress" TEXT,
    "notes" TEXT,
    "disputeStatus" TEXT,
    "disputeType" TEXT,
    "disputeNote" TEXT,
    "shippingStatus" "ShippingStatus" NOT NULL DEFAULT 'WAITING_DEALER_SHIPMENT',
    "dealerTrackingCode" TEXT,
    "dealerShippedAt" TIMESTAMP(3),
    "warehouseReceivedAt" TIMESTAMP(3),
    "inspectionNotes" TEXT,
    "inspectionPassedAt" TIMESTAMP(3),
    "adminTrackingCode" TEXT,
    "adminShippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealerApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "taxNumber" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DealerApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroSlide" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "title" TEXT,
    "subtitle" TEXT,
    "btnLeftText" TEXT,
    "btnLeftLink" TEXT,
    "btnRightText" TEXT,
    "btnRightLink" TEXT,
    "textColor" TEXT DEFAULT '#ffffff',
    "textAlignment" TEXT DEFAULT 'left',
    "overlayOpacity" INTEGER DEFAULT 40,
    "animationType" TEXT DEFAULT 'fade',
    "buttonStyle" TEXT DEFAULT 'solid',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlobalProduct" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "storage" TEXT,
    "color" TEXT,
    "masterImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "specsJson" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlobalProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealerStock" (
    "id" TEXT NOT NULL,
    "globalProductId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "batteryHealth" INTEGER,
    "hasBox" BOOLEAN NOT NULL DEFAULT false,
    "hasInvoice" BOOLEAN NOT NULL DEFAULT false,
    "hasAccessories" BOOLEAN NOT NULL DEFAULT false,
    "warrantyMonths" INTEGER,
    "imei" TEXT,
    "dealerImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "price" DECIMAL(12,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "adminApproved" BOOLEAN NOT NULL DEFAULT false,
    "adminNote" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DealerStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "grade" TEXT,
    "maxPrice" DECIMAL(12,2),
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteConfig" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "settings" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "adminReply" TEXT,
    "repliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "storage" TEXT,
    "color" TEXT,
    "grade" TEXT NOT NULL,
    "batteryHealth" INTEGER,
    "hasBox" BOOLEAN NOT NULL DEFAULT false,
    "hasInvoice" BOOLEAN NOT NULL DEFAULT false,
    "hasAccessories" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "imagesUrl" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requestType" "RequestType" NOT NULL DEFAULT 'SELL',
    "adminApproved" BOOLEAN NOT NULL DEFAULT false,
    "adminNote" TEXT,
    "approvedAt" TIMESTAMP(3),
    "status" "SellRequestStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "finalPrice" DECIMAL(12,2),
    "winningDealerId" TEXT,
    "shippingCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wishlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dealerStockId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellRequestBid" (
    "id" TEXT NOT NULL,
    "sellRequestId" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellRequestBid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealerMarketItem" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "storage" TEXT,
    "color" TEXT,
    "grade" TEXT NOT NULL,
    "batteryHealth" INTEGER,
    "hasBox" BOOLEAN NOT NULL DEFAULT false,
    "hasInvoice" BOOLEAN NOT NULL DEFAULT false,
    "hasAccessories" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "listingType" "DealerListingType" NOT NULL DEFAULT 'AUCTION',
    "floorPrice" DECIMAL(12,2) NOT NULL,
    "directPrice" DECIMAL(12,2),
    "status" "DealerMarketStatus" NOT NULL DEFAULT 'PENDING_ADMIN',
    "adminApproved" BOOLEAN NOT NULL DEFAULT false,
    "adminNote" TEXT,
    "approvedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "durationHours" INTEGER NOT NULL DEFAULT 1,
    "winningBidderId" TEXT,
    "finalPrice" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DealerMarketItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealerMarketBid" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "bidderId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DealerMarketBid_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Payout_dealerId_idx" ON "Payout"("dealerId");

-- CreateIndex
CREATE INDEX "Payout_status_idx" ON "Payout"("status");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_taxId_key" ON "User"("taxId");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailVerifyToken_key" ON "User"("emailVerifyToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Store_ownerId_key" ON "Store"("ownerId");

-- CreateIndex
CREATE INDEX "Order_buyerId_idx" ON "Order"("buyerId");

-- CreateIndex
CREATE INDEX "Order_sellerId_idx" ON "Order"("sellerId");

-- CreateIndex
CREATE INDEX "Order_paymentStatus_idx" ON "Order"("paymentStatus");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "Order_disputeStatus_idx" ON "Order"("disputeStatus");

-- CreateIndex
CREATE INDEX "Order_dealerStockId_idx" ON "Order"("dealerStockId");

-- CreateIndex
CREATE UNIQUE INDEX "DealerApplication_userId_key" ON "DealerApplication"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GlobalProduct_brand_model_storage_color_key" ON "GlobalProduct"("brand", "model", "storage", "color");

-- CreateIndex
CREATE INDEX "DealerStock_globalProductId_idx" ON "DealerStock"("globalProductId");

-- CreateIndex
CREATE INDEX "DealerStock_storeId_idx" ON "DealerStock"("storeId");

-- CreateIndex
CREATE INDEX "DealerStock_grade_idx" ON "DealerStock"("grade");

-- CreateIndex
CREATE INDEX "DealerStock_createdAt_idx" ON "DealerStock"("createdAt");

-- CreateIndex
CREATE INDEX "Ticket_dealerId_idx" ON "Ticket"("dealerId");

-- CreateIndex
CREATE INDEX "Ticket_status_idx" ON "Ticket"("status");

-- CreateIndex
CREATE INDEX "Ticket_createdAt_idx" ON "Ticket"("createdAt");

-- CreateIndex
CREATE INDEX "SellRequest_userId_idx" ON "SellRequest"("userId");

-- CreateIndex
CREATE INDEX "SellRequest_status_idx" ON "SellRequest"("status");

-- CreateIndex
CREATE INDEX "SellRequest_expiresAt_idx" ON "SellRequest"("expiresAt");

-- CreateIndex
CREATE INDEX "SellRequest_createdAt_idx" ON "SellRequest"("createdAt");

-- CreateIndex
CREATE INDEX "Wishlist_userId_idx" ON "Wishlist"("userId");

-- CreateIndex
CREATE INDEX "Wishlist_dealerStockId_idx" ON "Wishlist"("dealerStockId");

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_userId_dealerStockId_key" ON "Wishlist"("userId", "dealerStockId");

-- CreateIndex
CREATE INDEX "SellRequestBid_sellRequestId_idx" ON "SellRequestBid"("sellRequestId");

-- CreateIndex
CREATE INDEX "SellRequestBid_dealerId_idx" ON "SellRequestBid"("dealerId");

-- CreateIndex
CREATE INDEX "SellRequestBid_amount_idx" ON "SellRequestBid"("amount");

-- CreateIndex
CREATE UNIQUE INDEX "SellRequestBid_sellRequestId_dealerId_key" ON "SellRequestBid"("sellRequestId", "dealerId");

-- CreateIndex
CREATE INDEX "DealerMarketItem_sellerId_idx" ON "DealerMarketItem"("sellerId");

-- CreateIndex
CREATE INDEX "DealerMarketItem_status_idx" ON "DealerMarketItem"("status");

-- CreateIndex
CREATE INDEX "DealerMarketItem_listingType_idx" ON "DealerMarketItem"("listingType");

-- CreateIndex
CREATE INDEX "DealerMarketItem_createdAt_idx" ON "DealerMarketItem"("createdAt");

-- CreateIndex
CREATE INDEX "DealerMarketItem_expiresAt_idx" ON "DealerMarketItem"("expiresAt");

-- CreateIndex
CREATE INDEX "DealerMarketBid_itemId_idx" ON "DealerMarketBid"("itemId");

-- CreateIndex
CREATE INDEX "DealerMarketBid_bidderId_idx" ON "DealerMarketBid"("bidderId");

-- CreateIndex
CREATE INDEX "DealerMarketBid_amount_idx" ON "DealerMarketBid"("amount");

-- CreateIndex
CREATE UNIQUE INDEX "DealerMarketBid_itemId_bidderId_key" ON "DealerMarketBid"("itemId", "bidderId");

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_dealerStockId_fkey" FOREIGN KEY ("dealerStockId") REFERENCES "DealerStock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealerApplication" ADD CONSTRAINT "DealerApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealerStock" ADD CONSTRAINT "DealerStock_globalProductId_fkey" FOREIGN KEY ("globalProductId") REFERENCES "GlobalProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealerStock" ADD CONSTRAINT "DealerStock_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockRequest" ADD CONSTRAINT "StockRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellRequest" ADD CONSTRAINT "SellRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellRequest" ADD CONSTRAINT "SellRequest_winningDealerId_fkey" FOREIGN KEY ("winningDealerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_dealerStockId_fkey" FOREIGN KEY ("dealerStockId") REFERENCES "DealerStock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellRequestBid" ADD CONSTRAINT "SellRequestBid_sellRequestId_fkey" FOREIGN KEY ("sellRequestId") REFERENCES "SellRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellRequestBid" ADD CONSTRAINT "SellRequestBid_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealerMarketItem" ADD CONSTRAINT "DealerMarketItem_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealerMarketItem" ADD CONSTRAINT "DealerMarketItem_winningBidderId_fkey" FOREIGN KEY ("winningBidderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealerMarketBid" ADD CONSTRAINT "DealerMarketBid_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "DealerMarketItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealerMarketBid" ADD CONSTRAINT "DealerMarketBid_bidderId_fkey" FOREIGN KEY ("bidderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

