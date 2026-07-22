/**
 * TELEFONCUM — E-TİCARET MOCK DATA LAYER v2.0
 * =====================================================
 * RBAC: 3 rol: customer | dealer | admin
 * Satıcılar TAMAMEN ANONİM (frontend DTO'sunda satıcı adı/numarası YOK)
 * Katalog tabanlı: serbest başlık yok, standart field'lar var
 * Kozmetik grade sistemi: A | B | C
 * =====================================================
 */

// ─── RBAC Rolleri ────────────────────────────────────────────────────────────
export type UserRole = 'customer' | 'dealer' | 'admin';

export interface MockUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  status?: 'active' | 'pending_kyc' | 'banned';
  commissionRate?: number; // % (dealer için)
  joinedAt?: string;
  totalOrders?: number;
  totalRevenue?: number;
}

// ─── Cihaz Durum Sistemi ───────────────────────────────────────────────────────
export type CosmeticGrade = 'A+' | 'A' | 'B' | 'C';

export const GRADE_LABELS: Record<string, string> = {
  'A+': 'Tertemiz',
  'A':  'Çok İyi',
  'B':  'İyi',
  'C':  'Yenilenmiş',
};

export const GRADE_DESCRIPTIONS: Record<string, string> = {
  'A+': 'Hiç kullanılmamış gibi. Herhangi bir çizik veya iz bulunmaz.',
  'A':  'Gözle zor fark edilen kılcal izler olabilir. Mükemmele çok yakın.',
  'B':  'Belirgin kullanım izi var, tüm özellikleri tam çalışır durumda.',
  'C':  'Gözle görülen iz veya çizikler mevcut. Eksiksiz çalışır.',
};

// ─── Mytt Test Raporu Şeması ───────────────────────────────────────────
export interface TestReport {
  screen:       'Orijinal' | 'Değiştirilmiş' | 'Kusursuz';
  battery:      number;
  camera:       'Mükemmel' | 'İyi' | 'Sorunsuz';
  speakers:     'Mükemmel' | 'İyi' | 'Çalışıyor';
  faceId:       boolean;
  touchId:      boolean;
  wifi:         boolean;
  cellular:     boolean;
  charging:     'Hızlı Şarj' | 'Normal' | 'Çalışıyor';
  testedAt:     string;
}

// ─── Ürün Kataloğu DTO ────────────────────────────────────────────────────────
export interface MockProduct {
  id:             string;
  brand:          'Apple' | 'Samsung' | 'Xiaomi' | 'Google' | 'OnePlus' | 'Huawei';
  model:          string;
  storage:        string;
  color:          string;
  cosmeticGrade:  CosmeticGrade;
  batteryHealth:  number;
  price:          number;
  originalPrice:  number;
  image:          string;
  images:         string[];
  inStock:        boolean;
  stockCount:     number;
  isHot:          boolean;
  testReport:     TestReport;
  warrantyMonths: 6;
  _sellerId:      string;
}

// ─── Sipariş State Machine ────────────────────────────────────────────────────
export type OrderStep =
  | 'payment_received'
  | 'ops_received'
  | 'testing'
  | 'shipped';

export type DealerOrderStatus = 'pending' | 'shipped' | 'delivered' | 'returned';

export interface OrderTimelineStep {
  step:        OrderStep;
  label:       string;
  description: string;
  icon:        string;
}

export const ORDER_TIMELINE: OrderTimelineStep[] = [
  { step: 'payment_received', label: 'Ödeme Alındı',                    description: 'Ödemeniz teslimata kadar güvence altında tutulmaktadır.',  icon: 'CreditCard' },
  { step: 'ops_received',     label: 'Operasyon Merkezi Teslim Aldı',   description: 'Mytt ekibi cihazı satıcıdan teslim aldı.',      icon: 'PackageCheck' },
  { step: 'testing',          label: 'Test & Kalite Kontrol',            description: '47 noktalı test prosedürümüz uygulanıyor.',           icon: 'FlaskConical' },
  { step: 'shipped',          label: 'Kargolandı',                       description: 'Cihazınız garanti belgesiyle kargoya verildi.',       icon: 'Truck' },
];

// ─── BRANDS ──────────────────────────────────────────────────────────────────
export interface MockBrand {
  id:   string;
  name: string;
  logo: string;
}

export const BRANDS: MockBrand[] = [
  { id: 'apple',   name: 'Apple',   logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
  { id: 'samsung', name: 'Samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' },
  { id: 'xiaomi',  name: 'Xiaomi',  logo: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Xiaomi_logo.svg' },
  { id: 'google',  name: 'Google',  logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg' },
];

// ─── MOCK PRODUCTS ────────────────────────────────────────────────────────────
export const MOCK_PRODUCTS: MockProduct[] = [];

// ─── CART ─────────────────────────────────────────────────────────────────────
export interface CartItem {
  productId: string;
  product:   MockProduct;
  quantity:  number;
}

// ─── TRUST BADGES ─────────────────────────────────────────────────────────────
export const TRUST_BADGES = [
  { icon: 'RotateCcw',    label: '%100 İade Garantisi',    tooltip: '14 gün içinde koşulsuz iade' },
  { icon: 'FlaskConical', label: 'Uzman Testinden Geçti',  tooltip: '47 noktalı kalite kontrol' },
  { icon: 'Truck',        label: 'Aynı Gün Kargo',         tooltip: '15:00\'a kadar verilen siparişler' },
];

// ─── FOOTER DATA ──────────────────────────────────────────────────────────────
export const FOOTER_DATA = {
  sections: [
    { title: 'Müşteri Hizmetleri', links: ['Sipariş Takibi', 'İade & Değişim', 'Garanti Başvurusu', 'Canlı Destek'] },
    { title: 'Garanti Koşulları',  links: ['6 Ay Garanti Kapsamı', 'Test Prosedürü', 'Kozmetik Grading', 'Alışveriş Güvencesi'] },
    { title: 'Kurumsal',           links: ['Hakkımızda', 'Kariyer', 'Basın', 'Yatırımcılar'] },
    { title: 'Operasyon Merkezlerimiz', links: ['İstanbul Levent', 'Ankara Çankaya', 'İzmir Alsancak', 'Bursa Nilüfer'] },
  ],
};

// ─── MOCK USERS (RBAC demo) ───────────────────────────────────────────────────
export const MOCK_USERS: MockUser[] = [];

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const MOCK_NOTIFICATIONS: any[] = [];

// ═══════════════════════════════════════════════════════════════════════════════
// DEALER PANEL — MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════════

export interface MonthlyRevenueData {
  month:   string;
  ciro:    number;  // TL
  kar:     number;  // TL
  iade:    number;  // %
}

export const DEALER_MONTHLY_STATS: MonthlyRevenueData[] = [];

export interface DealerOrder {
  orderCode:  string;
  productModel: string;
  grade:      CosmeticGrade;
  price:      number;
  status:     DealerOrderStatus;
  date:       string;
}

export const DEALER_ORDERS: DealerOrder[] = [];

export interface DealerListing {
  id:        string;
  model:     string;
  storage:   string;
  grade:     CosmeticGrade;
  price:     number;
  stock:     number;
  active:    boolean;
}

export const DEALER_LISTINGS: DealerListing[] = [];

// Katalog — bayi ilan açarken seçeceği model listesi
export const CATALOG_PHONES = [
  'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16', 'iPhone 16 Plus',
  'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'iPhone 15 Plus',
  'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14', 'iPhone 14 Plus',
  'iPhone 13 Pro', 'iPhone 13', 'iPhone 12 Pro', 'iPhone 12',
  'Samsung Galaxy S24 Ultra', 'Samsung Galaxy S24+', 'Samsung Galaxy S24',
  'Samsung Galaxy S23 Ultra', 'Samsung Galaxy S23+', 'Samsung Galaxy S23',
  'Samsung Galaxy A55', 'Samsung Galaxy A35',
  'Xiaomi 14 Ultra', 'Xiaomi 14 Pro', 'Xiaomi 14',
  'Google Pixel 9 Pro', 'Google Pixel 9', 'Google Pixel 8 Pro', 'Google Pixel 8',
];

export const DEALER_ESCROW = {
  pending:     148320,  // Bekleyen hak ediş (TL)
  withdrawable: 73500,  // Çekilebilir bakiye (TL)
  lastPayout:   45000,  // Son ödeme (TL)
  lastPayoutDate: '2026-04-01',
};

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN PANEL — MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════════

export const ADMIN_METRICS = {
  gmv: 0, commission: 0, activeListings: 0, totalUsers: 0, totalDealers: 0, pendingKyc: 0, openDisputes: 0, avgOrderValue: 0, growthRate: 0,
};

export const ADMIN_PLATFORM_CHART: any[] = [];

export interface AdminUser {
  id:            string;
  name:          string;
  email:         string;
  role:          UserRole;
  status:        'active' | 'pending_kyc' | 'banned';
  joinedAt:      string;
  totalOrders?:  number;
  totalRevenue?: number;
  commissionRate?: number;
}

export const ADMIN_USERS: AdminUser[] = [];

export interface AdminDispute {
  id:          string;
  orderCode:   string;
  type:        'iade_talebi' | 'hasar' | 'teslim_edilmedi' | 'yanlis_urun';
  amount:      number;
  status:      'open' | 'in_review' | 'resolved' | 'escalated';
  openedAt:    string;
  description: string;
}

export const ADMIN_DISPUTES: AdminDispute[] = [];

// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOMER PANEL — MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════════

export interface CustomerOrder {
  orderCode:       string;
  productModel:    string;
  productImage:    string;
  grade:           CosmeticGrade;
  price:           number;
  currentStep:     OrderStep;
  purchaseDate:    string;      // ISO string
  warrantyEndDate: string;      // ISO string (purchaseDate + 6 months)
  trackingCode?:   string;
}

export const CUSTOMER_ORDERS: CustomerOrder[] = [];
