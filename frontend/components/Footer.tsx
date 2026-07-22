'use client';
import { Smartphone, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
import { FOOTER_DATA } from '@/lib/mock-data';

export default function Footer() {
  return (
    <footer
      className="w-full pt-20 pb-10 mt-10"
      style={{ background: 'linear-gradient(180deg, #0B1120 0%, #0D1627 60%, #0B1120 100%)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">

        {/* Top: Logo + Tagline */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-16 pb-12 border-b border-white/10">
          <div className="flex items-center gap-4 group cursor-pointer selection:bg-transparent">
            <div className="w-12 h-12 bg-white border border-teal-200 rounded-[16px] flex items-center justify-center transition-all group-hover:border-teal-300 group-hover:shadow-[0_0_15px_rgba(15,118,110,0.08)]">
              <Smartphone className="text-[var(--brand)]" size={24} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[24px] font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                Mytt<span className="text-emerald-500">.</span>
              </h2>
              <p className="text-white/90 text-[15px] font-semibold mt-1">Türkiye&apos;nin En Prestijli Doğrulanmış Cihaz Borsası</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 mt-8 md:mt-0 text-zinc-500 text-[12px] font-bold uppercase tracking-widest">
            <div className="flex items-center gap-6 opacity-60 hover:opacity-100 transition-opacity">
              <span className="flex items-center gap-2 text-white/80">
                <ShieldCheck size={20} strokeWidth={2} className="text-[var(--brand-mid)]" /> %100 Orijinal
              </span>
              <span className="flex items-center gap-2 text-white/80">
                <ShieldCheck size={20} strokeWidth={2} className="text-[var(--brand-mid)]" /> Alışveriş Güvencesi
              </span>
              <span className="flex items-center gap-2 text-white/80">
                <ShieldCheck size={20} strokeWidth={2} className="text-[var(--brand-mid)]" /> 256-Bit SSL
              </span>
              <div className="flex items-center gap-3 border-l border-white/10 pl-6 ml-2">
                <div className="w-9 h-6 bg-white/10 border border-white/15 rounded flex items-center justify-center font-black text-[9px] text-white/70 tracking-tighter">VISA</div>
                <div className="w-9 h-6 bg-white/10 border border-white/15 rounded flex items-center justify-center font-black text-[9px] text-white/70 tracking-tighter">MASTER</div>
                <div className="w-9 h-6 bg-white/10 border border-white/15 rounded flex items-center justify-center font-black text-[9px] text-white/70 tracking-tighter">TROY</div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Column Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          {FOOTER_DATA.sections.map((section, idx) => (
            <div key={idx}>
              <h4 className="text-[12px] font-black text-white/70 uppercase tracking-widest mb-6">{section.title}</h4>
              <ul className="space-y-4">
                {section.links.map((link, i) => {
                  const href: Record<string, string> = {
                    'Sipariş Takibi':       '/hesabim',
                    'İade & Değişim':       '/iade',
                    'Garanti Başvurusu':    '/garanti',
                    'Canlı Destek':         'mailto:destek@mytt.com',
                    '6 Ay Garanti Kapsamı': '/garanti#kapsam',
                    'Test Prosedürü':       '/test-proseduru',
                    'Kozmetik Grading':     '/grading',
                    'Alışveriş Güvencesi':  '/guvenli-odeme',
                    'Hakkımızda':           '/hakkimizda',
                    'Kariyer':              '/kariyer',
                    'Basın':                '/basin',
                    'Yatırımcılar':         '/yatirimcilar',
                    'İstanbul Levent':      '/operasyon#istanbul',
                    'Ankara Çankaya':       '/operasyon#ankara',
                    'İzmir Alsancak':       '/operasyon#izmir',
                    'Bursa Nilüfer':        '/operasyon#bursa',
                  };
                  return (
                    <li key={i}>
                      <Link
                        href={href[link] ?? '/'}
                        className="block text-[14px] font-medium text-white/75 hover:text-white hover:translate-x-1 transition-all"
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
        <div className="rounded-[24px] p-6 md:p-8 flex flex-col md:flex-row items-stretch gap-6 mb-12" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Telefon */}
          <div className="flex items-center gap-4 flex-1 min-w-0 group p-2">
            <div className="w-11 h-11 flex-shrink-0 rounded-[14px] flex items-center justify-center group-hover:bg-white/15 transition-colors" style={{ background: 'rgba(110,231,183,0.12)', border: '1px solid rgba(110,231,183,0.2)' }}>
              <Phone size={18} strokeWidth={2} className="text-[var(--brand-mid)]" />
            </div>
            <div className="min-w-0">
              <p className="text-white/65 text-[11px] font-bold uppercase tracking-widest mb-1">Müşteri Hattı (7/24)</p>
              <a href="tel:+908501234567" className="text-white font-extrabold text-[16px] hover:text-[var(--brand-mid)] transition-colors truncate block">0850 123 45 67</a>
            </div>
          </div>

          <div className="hidden md:block w-px self-stretch" style={{ background: 'rgba(255,255,255,0.08)' }} />

          {/* E-posta */}
          <div className="flex items-center gap-4 flex-1 min-w-0 group p-2">
            <div className="w-11 h-11 flex-shrink-0 rounded-[14px] flex items-center justify-center group-hover:bg-white/15 transition-colors" style={{ background: 'rgba(110,231,183,0.12)', border: '1px solid rgba(110,231,183,0.2)' }}>
              <Mail size={18} strokeWidth={2} className="text-[var(--brand-mid)]" />
            </div>
            <div className="min-w-0">
              <p className="text-white/65 text-[11px] font-bold uppercase tracking-widest mb-1">E-posta</p>
              <a href="mailto:destek@mytt.com" className="text-white font-extrabold text-[16px] hover:text-[var(--brand-mid)] transition-colors truncate block">destek@mytt.com</a>
            </div>
          </div>

          <div className="hidden md:block w-px self-stretch" style={{ background: 'rgba(255,255,255,0.08)' }} />

          {/* Adres */}
          <div className="flex items-center gap-4 flex-1 min-w-0 group p-2">
            <div className="w-11 h-11 flex-shrink-0 rounded-[14px] flex items-center justify-center group-hover:bg-white/15 transition-colors" style={{ background: 'rgba(110,231,183,0.12)', border: '1px solid rgba(110,231,183,0.2)' }}>
              <MapPin size={18} strokeWidth={2} className="text-[var(--brand-mid)]" />
            </div>
            <div className="min-w-0">
              <p className="text-white/65 text-[11px] font-bold uppercase tracking-widest mb-1">Genel Merkez</p>
              <p className="text-white font-extrabold text-[16px] truncate">Levent, İstanbul</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-[13px] font-medium" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-white/60">© 2026 Mytt Teknoloji A.Ş. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-6">
            <Link href="/kvkk" className="text-white/65 hover:text-white transition-colors font-semibold">KVKK</Link>
            <Link href="/kullanim-kosullari" className="text-white/65 hover:text-white transition-colors font-semibold">Kullanım Koşulları</Link>
            <Link href="/cerez-politikasi" className="text-white/65 hover:text-white transition-colors font-semibold">Çerez Politikası</Link>
            <Link href="/sozlesmeler" className="text-white/65 hover:text-white transition-colors font-semibold">Sözleşmeler ve Formlar</Link>
            <span className="text-[var(--brand-mid)] px-3 py-1 rounded-[8px] font-bold ml-2" style={{ background: 'rgba(110,231,183,0.1)', border: '1px solid rgba(110,231,183,0.2)' }}>v10.0 Elite</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
