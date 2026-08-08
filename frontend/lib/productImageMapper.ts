/**
 * productImageMapper.ts
 * Marka ve modele göre yüksek çözünürlüklü, hotlink engeline takılmayan
 * şeffaf ve stüdyo kalitesinde akıllı telefon görselleri sağlar.
 */

const MODEL_PHOTOS: Record<string, string> = {
  // ── SAMSUNG GALAXY SERİSİ ──
  'samsung s24 ultra':     'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
  'samsung s24 fe':        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
  'samsung s24':           'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
  'samsung s23 ultra':     'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
  'samsung s23 fe':        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
  'samsung s23':           'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
  'samsung s22 ultra':     'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
  'samsung s22':           'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
  'samsung s21 ultra':     'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
  'samsung s21 fe':        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
  'samsung s21':           'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
  'samsung s20':           'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80',
  'samsung note 20 ultra': 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80',
  'samsung note 20':       'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80',
  'samsung a71':           'https://api.samsungmobilepress.com/api/v1/file/6046E2654B4E7C6E5ED915A6BA596C93BC66C308CE5A12B12C38592D720FF652235A7EE34FC5799D7DA6CD83B194B3267D1DEDC7F3A8F67F8FAE1DD2F66097E98D1C3596BECB7AE9459EA30DCD19234F783A51400CFD9AA9BD26FFF20049794D',
  'samsung a55':           'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80',
  'samsung a54':           'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80',
  'samsung a53':           'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80',
  'samsung a51':           'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80',
  'samsung a35':           'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80',
  'samsung a34':           'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80',
  'samsung a31':           'https://api.samsungmobilepress.com/api/v1/file/BE3C10D9FA8F80A4D8A1530BC967FA4FC5DA552670B124A1ED2A651DD2C9017EAEFC15A7697B1B268FFB451AF2D9C04F0E81249D1D7300E3F7B1F059C88FE290D91C821CBA03634B989AA072B0669AA1248A0BF1395A5D04345E720A70917137',
  'samsung a36 5g':        'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80',
  'samsung a15':           'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80',
  'samsung m30s':          'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80',

  // ── APPLE IPHONE SERİSİ ──
  'iphone 16 pro max': 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
  'iphone 15 pro max': 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
  'iphone 15':         'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80',
  'iphone 14 pro max': 'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=600&auto=format&fit=crop&q=80',
  'iphone 14 plus':    'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=600&auto=format&fit=crop&q=80',
  'iphone 14':         'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=600&auto=format&fit=crop&q=80',
  'iphone 13 pro max': 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=600&auto=format&fit=crop&q=80',
  'iphone 13 pro':     'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=600&auto=format&fit=crop&q=80',
  'iphone 13':         'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
  'iphone 12 pro max': 'https://images.unsplash.com/photo-1603921326210-6edd2d60ca68?w=600&auto=format&fit=crop&q=80',
  'iphone 12 pro':     'https://images.unsplash.com/photo-1603921326210-6edd2d60ca68?w=600&auto=format&fit=crop&q=80',
  'iphone 12':         'https://images.unsplash.com/photo-1603921326210-6edd2d60ca68?w=600&auto=format&fit=crop&q=80',
  'iphone 12 mini':    'https://images.unsplash.com/photo-1603921326210-6edd2d60ca68?w=600&auto=format&fit=crop&q=80',
  'iphone 11 pro max': 'https://images.unsplash.com/photo-1574944985070-8f30c4397e3c?w=600&auto=format&fit=crop&q=80',
  'iphone 11 pro':     'https://images.unsplash.com/photo-1574944985070-8f30c4397e3c?w=600&auto=format&fit=crop&q=80',
  'iphone 11':         'https://images.unsplash.com/photo-1574944985070-8f30c4397e3c?w=600&auto=format&fit=crop&q=80',
  'iphone se':         'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80',

  // ── DİĞER MARKALAR ──
  'realme gt 5g':      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
  'oppo a55':          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
  'omix x3':           'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
  'tecno 10 pro':      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
};

// Marka varsayılan görselleri
const BRAND_DEFAULT_PHOTOS: Record<string, string> = {
  Apple:   'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
  Samsung: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
  Xiaomi:  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
  Realme:  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
  Oppo:    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
  Vivo:    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
  Honor:   'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
  Poco:    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
  Tecno:   'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
  Omix:    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
};

const FALLBACK_PHOTO = 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80';

export function getProductPhotoUrl(brand: string, model: string, userUploadedPhoto?: string | null): string {
  if (userUploadedPhoto && userUploadedPhoto.trim().length > 0 && !userUploadedPhoto.includes('samsung.com')) {
    return userUploadedPhoto;
  }

  const bKey = (brand || '').toLowerCase().trim();
  const mKey = `${bKey} ${(model || '').toLowerCase().trim()}`;

  // Tam model veya kısmi model eşleşmesi
  for (const [key, url] of Object.entries(MODEL_PHOTOS)) {
    if (mKey.includes(key) || key.includes(mKey)) {
      return url;
    }
  }

  // Marka varsayılan fotoğrafı
  const bNorm = Object.keys(BRAND_DEFAULT_PHOTOS).find(
    (b) => b.toLowerCase() === bKey || bKey.includes(b.toLowerCase())
  );
  if (bNorm && BRAND_DEFAULT_PHOTOS[bNorm]) {
    return BRAND_DEFAULT_PHOTOS[bNorm];
  }

  return FALLBACK_PHOTO;
}
