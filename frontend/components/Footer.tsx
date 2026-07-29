'use client';
import { Smartphone, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
import { FOOTER_DATA } from '@/lib/mock-data';

export default function Footer() {
  return (
    <footer
      className="k-on-dark w-full pt-12 pb-8 mt-10"
      style={{ background: 'var(--k-anchor)', borderTop: '1px solid var(--k-line)' }}
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">

        {/* Top: Logo + Tagline */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 pb-8 border-b border-[var(--k-line)]">
          <Link href="/" className="flex items-center gap-4 group selection:bg-transparent">
            <span className="font-black text-3xl sm:text-4xl tracking-tighter text-white flex items-center select-none">
              m<span className="text-orange-500 drop-shadow-[0_0_12px_rgba(255,96,0,0.75)]">y</span>tt
            </span>
          </Link>

          <div className="flex flex-col md:flex-row items-center gap-6 mt-8 md:mt-0 text-[var(--k-ink-3)] text-[12px] font-bold uppercase tracking-widest">
            <div className="flex items-center gap-6 opacity-60 hover:opacity-100 transition-opacity">
              <span className="flex items-center gap-2 text-[var(--k-ink-2)]">
                <ShieldCheck size={20} strokeWidth={2} className="text-orange-500" /> %100 Orijinal
              </span>
              <span className="flex items-center gap-2 text-[var(--k-ink-2)]">
                <ShieldCheck size={20} strokeWidth={2} className="text-orange-500" /> Alışveriş Güvencesi
              </span>
              <span className="flex items-center gap-2 text-[var(--k-ink-2)]">
                <ShieldCheck size={20} strokeWidth={2} className="text-orange-500" /> 256-Bit SSL
              </span>
              <div className="flex items-center gap-3 border-l border-[var(--k-line)] pl-6 ml-2">
                <div className="k-mono w-10 h-6 rounded-[4px] flex items-center justify-center text-[8px] tracking-tighter" style={{ background: 'var(--k-surface-2)', border: '1px solid var(--k-line-2)', color: 'var(--k-ink-3)' }}>VISA</div>
                <div className="k-mono w-10 h-6 rounded-[4px] flex items-center justify-center text-[8px] tracking-tighter" style={{ background: 'var(--k-surface-2)', border: '1px solid var(--k-line-2)', color: 'var(--k-ink-3)' }}>MASTER</div>
                <div className="k-mono w-10 h-6 rounded-[4px] flex items-center justify-center text-[8px] tracking-tighter" style={{ background: 'var(--k-surface-2)', border: '1px solid var(--k-line-2)', color: 'var(--k-ink-3)' }}>TROY</div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Column Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {FOOTER_DATA.sections.map((section, idx) => (
            <div key={idx}>
              <h4 className="k-label mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, i) => {
                  const hrefMap: Record<string, string> = {
                    'Sipariş Takibi':       '/login',
                    'İade & Değişim':       '/sss',
                    'Garanti Başvurusu':    '/garanti',
                    'Canlı Destek':         '/iletisim',
                    '6 Ay Garanti Kapsamı': '/garanti',
                    'Test Prosedürü':       '/garanti',
                    'Kozmetik Grading':     '/garanti',
                    'Alışveriş Güvencesi':  '/garanti',
                    'Hakkımızda':           '/hakkimizda',
                    'Kariyer':              '/hakkimizda',
                    'Basın':                '/hakkimizda',
                    'Yatırımcılar':         '/hakkimizda',
                    'İstanbul Levent':      '/magazalar',
                    'Ankara Çankaya':       '/magazalar',
                    'İzmir Alsancak':       '/magazalar',
                    'Bursa Nilüfer':        '/magazalar',
                  };
                  return (
                    <li key={i}>
                      <Link
                        href={hrefMap[link] ?? '/sss'}
                        className="block text-[14px] font-medium text-[var(--k-ink-2)] hover:text-orange-500 hover:translate-x-1 transition-all"
                      >
                        {link}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact bar */}
        <div className="rounded-[12px] p-5 md:p-6 flex flex-col md:flex-row items-stretch gap-4 mb-8" style={{ background: 'var(--k-surface)', border: '1px solid var(--k-line)' }}>
          {/* Telefon */}
          <div className="flex items-center gap-4 flex-1 min-w-0 group p-2">
            <div className="w-11 h-11 flex-shrink-0 rounded-[9px] flex items-center justify-center bg-orange-50 border border-orange-200">
              <Phone size={18} strokeWidth={2} className="text-orange-600" />
            </div>
            <div className="min-w-0">
              <p className="k-label mb-1.5">Müşteri Hattı (7/24)</p>
              <a href="tel:+908503080000" className="text-[var(--k-ink)] font-extrabold text-[16px] hover:text-orange-500 transition-colors truncate block">0850 308 00 00</a>
            </div>
          </div>

          <div className="hidden md:block w-px self-stretch" style={{ background: 'var(--k-line)' }} />

          {/* E-posta */}
          <div className="flex items-center gap-4 flex-1 min-w-0 group p-2">
            <div className="w-11 h-11 flex-shrink-0 rounded-[9px] flex items-center justify-center bg-orange-50 border border-orange-200">
              <Mail size={18} strokeWidth={2} className="text-orange-600" />
            </div>
            <div className="min-w-0">
              <p className="k-label mb-1.5">E-posta</p>
              <a href="mailto:destek@mytt.com.tr" className="text-[var(--k-ink)] font-extrabold text-[16px] hover:text-orange-500 transition-colors truncate block">destek@mytt.com.tr</a>
            </div>
          </div>

          <div className="hidden md:block w-px self-stretch" style={{ background: 'var(--k-line)' }} />

          {/* Adres */}
          <div className="flex items-center gap-4 flex-1 min-w-0 group p-2">
            <div className="w-11 h-11 flex-shrink-0 rounded-[9px] flex items-center justify-center bg-orange-50 border border-orange-200">
              <MapPin size={18} strokeWidth={2} className="text-orange-600" />
            </div>
            <div className="min-w-0">
              <p className="k-label mb-1.5">Genel Merkez</p>
              <p className="text-[var(--k-ink)] font-extrabold text-[16px] truncate">Sarıyer, İstanbul</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] font-medium" style={{ borderTop: '1px solid var(--k-line)' }}>
          <p className="text-[var(--k-ink-3)]">© 2026 Mytt Teknoloji A.Ş. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-6 flex-wrap justify-center">
            <Link href="/kvkk" className="text-[var(--k-ink-3)] hover:text-orange-500 transition-colors font-semibold">KVKK</Link>
            <Link href="/kullanim-kosullari" className="text-[var(--k-ink-3)] hover:text-orange-500 transition-colors font-semibold">Kullanım Koşulları</Link>
            <Link href="/cerez-politikasi" className="text-[var(--k-ink-3)] hover:text-orange-500 transition-colors font-semibold">Çerez Politikası</Link>
            <Link href="/gizlilik" className="text-[var(--k-ink-3)] hover:text-orange-500 transition-colors font-semibold">Gizlilik Politikası</Link>
            <Link href="/sozlesmeler" className="text-[var(--k-ink-3)] hover:text-orange-500 transition-colors font-semibold">Sözleşmeler ve Formlar</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
