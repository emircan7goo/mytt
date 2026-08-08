/**
 * productImageMapper.ts
 * Samsung, Apple ve diğer markaların resmi lansman ve stüdyo render
 * şeffaf (transparent PNG) ürün görsellerini eşleştirir.
 */

// Model bazlı özel yüksek çözünürlüklü ve şeffaf/temiz stüdyo renders
const MODEL_PHOTOS: Record<string, string> = {
  // ── SAMSUNG GALAXY S SERİSİ ──
  'samsung s24 ultra':     'https://images.samsung.com/is/image/samsung/p6pim/tr/2401/gallery/tr-galaxy-s24-s928-sm-s928bztqtur-thumb-539572620?$264_264_PNG$',
  'samsung s24 fe':        'https://images.samsung.com/is/image/samsung/p6pim/tr/2401/gallery/tr-galaxy-s24-s921-sm-s921bzkdtur-thumb-539572111?$264_264_PNG$',
  'samsung s24':           'https://images.samsung.com/is/image/samsung/p6pim/tr/2401/gallery/tr-galaxy-s24-s921-sm-s921bzkdtur-thumb-539572111?$264_264_PNG$',
  'samsung s23 ultra':     'https://images.samsung.com/is/image/samsung/p6pim/tr/sm-s918bzkatur/gallery/tr-galaxy-s23-s918-446755-sm-s918bzkatur-thumb-534861877?$264_264_PNG$',
  'samsung s23 fe':        'https://images.samsung.com/is/image/samsung/p6pim/tr/sm-s711bzkatur/gallery/tr-galaxy-s23-fe-s711-sm-s711bzkatur-thumb-538445100?$264_264_PNG$',
  'samsung s23':           'https://images.samsung.com/is/image/samsung/p6pim/tr/sm-s911bzkatur/gallery/tr-galaxy-s23-s911-446547-sm-s911bzkatur-thumb-534860645?$264_264_PNG$',
  'samsung s22 ultra':     'https://images.samsung.com/is/image/samsung/p6pim/tr/sm-s908bzkdtur/gallery/tr-galaxy-s22-ultra-s908-sm-s908bzkdtur-thumb-530965004?$264_264_PNG$',
  'samsung s22':           'https://images.samsung.com/is/image/samsung/p6pim/tr/sm-s901bzkdtur/gallery/tr-galaxy-s22-s901-sm-s901bzkdtur-thumb-530962808?$264_264_PNG$',
  'samsung s21 ultra':     'https://images.samsung.com/is/image/samsung/p6pim/tr/sm-g998bzkdtur/gallery/tr-galaxy-s21-ultra-5g-g998-sm-g998bzkdtur-thumb-368341624?$264_264_PNG$',
  'samsung s21 fe':        'https://images.samsung.com/is/image/samsung/p6pim/tr/sm-g990bzkwtur/gallery/tr-galaxy-s21-fe-5g-g990-sm-g990bzkwtur-thumb-530606990?$264_264_PNG$',
  'samsung s21':           'https://images.samsung.com/is/image/samsung/p6pim/tr/sm-g991bzkdtur/gallery/tr-galaxy-s21-5g-g991-sm-g991bzkdtur-thumb-368326265?$264_264_PNG$',
  'samsung s20':           'https://images.samsung.com/is/image/samsung/tr-galaxy-s20-sm-g980fzkttur-thumb-213904576?$264_264_PNG$',

  // ── SAMSUNG GALAXY NOTE SERİSİ ──
  'samsung note 20 ultra': 'https://images.samsung.com/is/image/samsung/tr-galaxy-note20-ultra-5g-sm-n986-sm-n986bznatur-thumb-278072124?$264_264_PNG$',
  'samsung note 20':       'https://images.samsung.com/is/image/samsung/tr-galaxy-note20-sm-n980-sm-n980fzgwtur-thumb-278072149?$264_264_PNG$',

  // ── SAMSUNG GALAXY A SERİSİ ──
  'samsung a71':           'https://images.samsung.com/is/image/samsung/tr-galaxy-a71-sm-a715fzkatur-thumb-208945899?$264_264_PNG$',
  'samsung a55':           'https://images.samsung.com/is/image/samsung/p6pim/tr/sm-a556bzkatur/gallery/tr-galaxy-a55-5g-sm-a556-sm-a556bzkatur-thumb-540207399?$264_264_PNG$',
  'samsung a54':           'https://images.samsung.com/is/image/samsung/p6pim/tr/sm-a546bzkatur/gallery/tr-galaxy-a54-5g-sm-a546-sm-a546bzkatur-thumb-535687799?$264_264_PNG$',
  'samsung a53':           'https://images.samsung.com/is/image/samsung/p6pim/tr/sm-a536bzkdtur/gallery/tr-galaxy-a53-5g-a536-sm-a536bzkdtur-thumb-531548842?$264_264_PNG$',
  'samsung a51':           'https://images.samsung.com/is/image/samsung/tr-galaxy-a51-sm-a515fzkatur-thumb-208945875?$264_264_PNG$',
  'samsung a35':           'https://images.samsung.com/is/image/samsung/p6pim/tr/sm-a356bzkatur/gallery/tr-galaxy-a35-5g-sm-a356-sm-a356bzkatur-thumb-540206899?$264_264_PNG$',
  'samsung a34':           'https://images.samsung.com/is/image/samsung/p6pim/tr/sm-a346bzkatur/gallery/tr-galaxy-a34-5g-sm-a346-sm-a346bzkatur-thumb-535687299?$264_264_PNG$',
  'samsung a31':           'https://images.samsung.com/is/image/samsung/tr-galaxy-a31-sm-a315fzkatur-thumb-245367809?$264_264_PNG$',
  'samsung a36 5g':        'https://images.samsung.com/is/image/samsung/p6pim/tr/sm-a356bzkatur/gallery/tr-galaxy-a35-5g-sm-a356-sm-a356bzkatur-thumb-540206899?$264_264_PNG$',
  'samsung a15':           'https://images.samsung.com/is/image/samsung/p6pim/tr/sm-a155fzkatur/gallery/tr-galaxy-a15-sm-a155-sm-a155fzkatur-thumb-539571000?$264_264_PNG$',
  'samsung m30s':          'https://images.samsung.com/is/image/samsung/tr-galaxy-m30s-sm-m307fzbutur-thumb-194165500?$264_264_PNG$',

  // ── SAMSUNG GALAXY Z SERİSİ ──
  'samsung z fold 5':      'https://images.samsung.com/is/image/samsung/p6pim/tr/sm-f946bzkatur/gallery/tr-galaxy-z-fold5-f946-sm-f946bzkatur-thumb-537233800?$264_264_PNG$',
  'samsung z flip 5':      'https://images.samsung.com/is/image/samsung/p6pim/tr/sm-f731bzkatur/gallery/tr-galaxy-z-flip5-f731-sm-f731bzkatur-thumb-537233300?$264_264_PNG$',

  // ── APPLE IPHONE SERİSİ ──
  'iphone 16 pro max': 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=80',
  'iphone 15 pro max': 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=80',
  'iphone 15':         'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=80',
  'iphone 14 pro max': 'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=500&auto=format&fit=crop&q=80',
  'iphone 14 plus':    'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=500&auto=format&fit=crop&q=80',
  'iphone 14':         'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=500&auto=format&fit=crop&q=80',
  'iphone 13 pro max': 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=500&auto=format&fit=crop&q=80',
  'iphone 13 pro':     'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=500&auto=format&fit=crop&q=80',
  'iphone 13':         'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&auto=format&fit=crop&q=80',
  'iphone 12 pro max': 'https://images.unsplash.com/photo-1603921326210-6edd2d60ca68?w=500&auto=format&fit=crop&q=80',
  'iphone 12 pro':     'https://images.unsplash.com/photo-1603921326210-6edd2d60ca68?w=500&auto=format&fit=crop&q=80',
  'iphone 12':         'https://images.unsplash.com/photo-1603921326210-6edd2d60ca68?w=500&auto=format&fit=crop&q=80',
  'iphone 12 mini':    'https://images.unsplash.com/photo-1603921326210-6edd2d60ca68?w=500&auto=format&fit=crop&q=80',
  'iphone 11 pro max': 'https://images.unsplash.com/photo-1574944985070-8f30c4397e3c?w=500&auto=format&fit=crop&q=80',
  'iphone 11 pro':     'https://images.unsplash.com/photo-1574944985070-8f30c4397e3c?w=500&auto=format&fit=crop&q=80',
  'iphone 11':         'https://images.unsplash.com/photo-1574944985070-8f30c4397e3c?w=500&auto=format&fit=crop&q=80',
  'iphone se':         'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=500&auto=format&fit=crop&q=80',

  // ── DİĞER MARKALAR ──
  'honor magic v2':  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80',
  'nothing nothins os': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80',
};

// Marka bazlı varsayılan kaliteli fotoğraflar
const BRAND_DEFAULT_PHOTOS: Record<string, string> = {
  Apple:   'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&auto=format&fit=crop&q=80',
  Samsung: 'https://images.samsung.com/is/image/samsung/p6pim/tr/2401/gallery/tr-galaxy-s24-s921-sm-s921bzkdtur-thumb-539572111?$264_264_PNG$',
  Xiaomi:  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80',
  Realme:  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80',
  Oppo:    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80',
  Vivo:    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80',
  Honor:   'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80',
  Poco:    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80',
};

export function getProductPhotoUrl(brand: string, model: string, userUploadedPhoto?: string | null): string {
  if (userUploadedPhoto && userUploadedPhoto.trim().length > 0) {
    return userUploadedPhoto;
  }

  const bKey = (brand || '').toLowerCase().trim();
  const mKey = `${bKey} ${(model || '').toLowerCase().trim()}`;

  // Tam model eşleşmesi
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

  return 'https://images.samsung.com/is/image/samsung/p6pim/tr/2401/gallery/tr-galaxy-s24-s921-sm-s921bzkdtur-thumb-539572111?$264_264_PNG$';
}
