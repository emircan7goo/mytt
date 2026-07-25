'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '@/providers/AppProvider';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import {
  ShieldCheck, Lock, ArrowLeft, MapPin, User, Loader2,
  CreditCard, ChevronRight, AlertCircle,
} from 'lucide-react';

// ── PayTR iframe wrapper ──────────────────────────────────────────────────────
function PaytrIframe({ token }: { token: string }) {
  return (
    <div className="w-full">
      <iframe
        src={`https://www.paytr.com/odeme/guvenli/${token}`}
        id="paytriframe"
        frameBorder="0"
        scrolling="no"
        style={{ width: '100%', minHeight: 480 }}
        onLoad={(e) => {
          // PayTR iframe yüksekliğini otomatik ayarla
          const frame = e.currentTarget as HTMLIFrameElement;
          const resize = () => {
            try {
              const h = frame.contentWindow?.document.body.scrollHeight;
              if (h) frame.style.height = h + 'px';
            } catch {}
          };
          resize();
        }}
      />
      {/* PayTR'ın iframe resize mesajını dinle */}
      <PaytrResizeListener />
    </div>
  );
}

function PaytrResizeListener() {
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data && typeof e.data === 'object' && e.data.paytr_iframe_height) {
        const frame = document.getElementById('paytriframe') as HTMLIFrameElement;
        if (frame) frame.style.height = e.data.paytr_iframe_height + 'px';
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);
  return null;
}

// ── Ana checkout bileşeni ─────────────────────────────────────────────────────
function CheckoutContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const { user }     = useApp();

  // URL parametreleri: ?productId=xxx&price=xxx&name=xxx&qty=1
  const productId   = searchParams.get('productId')  ?? '';
  const priceParam  = parseFloat(searchParams.get('price') ?? '0');
  const nameParam   = searchParams.get('name')  ?? 'Ürün';
  const qtyParam    = parseInt(searchParams.get('qty') ?? '1', 10);

  const [address,    setAddress]    = useState('');
  const [city,       setCity]       = useState('');
  const [district,   setDistrict]   = useState('');
  const [phone,      setPhone]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [iframeToken,setIframeToken]= useState<string | null>(null);
  const [testMode,   setTestMode]   = useState(false);
  const [orderId,    setOrderId]    = useState<string | null>(null);

  // Giriş yapmamışsa login'e yönlendir
  useEffect(() => {
    if (!productId) { router.replace('/'); return; }
    if (user === null) router.push(`/login?redirect=/checkout?productId=${productId}`);
  }, [user, productId, router]);

  if (!productId) return null;

  const fullAddress = `${address}, ${district}/${city}`.trim().replace(/^,\s*/, '');
  const isFormValid = address.trim().length > 5 && city.trim().length > 1;

  const handleStartPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) { toast.error('Lütfen teslimat adresinizi eksiksiz girin'); return; }
    if (!user)        { toast.error('Lütfen giriş yapın'); return; }

    setLoading(true);
    try {
      const { data } = await apiClient.post('/payment/start-checkout', {
        productId,
        quantity:        qtyParam,
        shippingAddress: fullAddress,
        productName:     nameParam,
        amount:          priceParam * qtyParam,
      });

      setOrderId(data.orderId);
      setTestMode(data.testMode ?? false);

      if (data.testMode) {
        // Test modu — gerçek PayTR yok, başarı sayfasına yönlendir
        toast.success('Test modu: Ödeme simüle edildi');
        setTimeout(() => router.push(`/payment/basarili?orderId=${data.orderId}&testMode=1`), 1500);
      } else {
        setIframeToken(data.iframeToken);
        // iframe'e scroll et
        setTimeout(() => {
          document.getElementById('paytr-frame-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    } catch (err: any) {
      const d     = err?.response?.data;
      const inner = d?.error;
      const msg   = d?.message ?? (typeof inner === 'string' ? inner : inner?.message);
      const final = Array.isArray(msg) ? msg[0] : (typeof msg === 'string' ? msg : null);
      toast.error(final ?? 'Ödeme başlatılamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-[100px] pb-20 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Başlık */}
        <div className="mb-10">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors mb-6 text-sm"
          >
            <ArrowLeft size={16} /> Geri Dön
          </button>
          <h1 className="text-4xl font-light tracking-tight text-zinc-900 mb-1">Güvenli Ödeme</h1>
          <p className="text-zinc-500 text-sm flex items-center gap-1.5">
            <Lock size={13} /> 256-bit SSL şifreleme ile korunuyorsunuz
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">

          {/* Sol: Adres Formu */}
          {!iframeToken && (
            <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-8">
              <h2 className="text-lg font-semibold text-zinc-900 mb-6 flex items-center gap-2">
                <MapPin size={18} className="text-blue-600" /> Teslimat Bilgileri
              </h2>

              <form onSubmit={handleStartPayment} className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Şehir *</label>
                    <input
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="İstanbul"
                      required
                      className="border border-zinc-200 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">İlçe</label>
                    <input
                      type="text"
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      placeholder="Kadıköy"
                      className="border border-zinc-200 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Açık Adres *</label>
                  <textarea
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Mahalle, sokak, kapı no, daire..."
                    required
                    rows={3}
                    className="border border-zinc-200 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Telefon (opsiyonel)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="05XX XXX XX XX"
                    className="border border-zinc-200 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                  />
                </div>

                {/* Alıcı bilgisi (giriş yapan kullanıcı) */}
                {user && (
                  <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <User size={16} className="text-blue-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-blue-800">{user.name ?? user.email}</p>
                      <p className="text-xs text-blue-600">{user.email}</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className="mt-2 bg-zinc-900 hover:bg-black text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Hazırlanıyor...</>
                  ) : (
                    <><CreditCard size={18} /> Ödemeye Geç <ChevronRight size={16} /></>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* PayTR iframe — form gönderildikten sonra açılır */}
          {iframeToken && (
            <div
              id="paytr-frame-section"
              className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={18} className="text-violet-500" />
                <span className="font-semibold text-zinc-800 text-sm">Güvenli Ödeme Formu</span>
                <span className="ml-auto text-xs text-zinc-400">PayTR ile korunuyor</span>
              </div>
              <PaytrIframe token={iframeToken} />
            </div>
          )}

          {/* Sağ: Sipariş özeti */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-6 sticky top-[120px]">
              <h3 className="font-semibold text-zinc-900 mb-5 flex items-center gap-2">
                <ShieldCheck size={16} className="text-violet-500" /> Sipariş Özeti
              </h3>

              <div className="bg-zinc-50 rounded-2xl p-4 mb-5">
                <p className="font-semibold text-zinc-900 text-sm">{nameParam}</p>
                <p className="text-xs text-zinc-500 mt-1">Adet: {qtyParam}</p>
              </div>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between text-zinc-500">
                  <span>Ürün</span>
                  <span className="font-semibold text-zinc-900">
                    {(priceParam * qtyParam).toLocaleString('tr-TR')} ₺
                  </span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Kargo</span>
                  <span className="text-violet-600 font-semibold">Ücretsiz</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>KDV</span>
                  <span>Dahil</span>
                </div>
              </div>

              <div className="border-t border-zinc-100 mt-5 pt-5 flex justify-between items-center">
                <span className="font-bold text-zinc-700">Toplam</span>
                <span className="text-2xl font-light text-zinc-900">
                  {(priceParam * qtyParam).toLocaleString('tr-TR')}
                  <span className="text-base text-zinc-500 ml-1">₺</span>
                </span>
              </div>

              {/* Güvenlik rozetleri */}
              <div className="mt-5 pt-4 border-t border-zinc-100 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <ShieldCheck size={13} className="text-violet-500" />
                  <span>Alışveriş güvencesi — ödeme teslimata kadar tutulur</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Lock size={13} className="text-blue-500" />
                  <span>Kart bilgileriniz sunucularımıza iletilmez</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <AlertCircle size={13} className="text-amber-500" />
                  <span>Sorun olursa 14 gün içinde tam iade</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
