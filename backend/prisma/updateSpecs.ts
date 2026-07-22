import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

type Specs = { ram: string; chipset: string; display: string; camera: string; battery: string; charging: string; connectivity: string };
type Entry = { brand: string; model: string; specs: Specs };

const SPECS: Entry[] = [
  // ── Apple ───────────────────────────────────────────────────────────────────
  { brand:'Apple', model:'iPhone X',          specs:{ ram:'3GB', chipset:'Apple A11 Bionic', display:'5.8" OLED 60Hz', camera:'12+12MP arka / 7MP ön', battery:'2716mAh', charging:'15W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Apple', model:'iPhone XR',         specs:{ ram:'3GB', chipset:'Apple A12 Bionic', display:'6.1" LCD 60Hz', camera:'12MP arka / 7MP ön', battery:'2942mAh', charging:'18W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Apple', model:'iPhone XS',         specs:{ ram:'4GB', chipset:'Apple A12 Bionic', display:'5.8" OLED 60Hz', camera:'12+12MP arka / 7MP ön', battery:'2658mAh', charging:'18W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Apple', model:'iPhone XS Max',     specs:{ ram:'4GB', chipset:'Apple A12 Bionic', display:'6.5" OLED 60Hz', camera:'12+12MP arka / 7MP ön', battery:'3174mAh', charging:'18W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Apple', model:'iPhone 11',         specs:{ ram:'4GB', chipset:'Apple A13 Bionic', display:'6.1" LCD 60Hz', camera:'12+12MP arka / 12MP ön', battery:'3110mAh', charging:'18W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Apple', model:'iPhone 11 Pro',     specs:{ ram:'4GB', chipset:'Apple A13 Bionic', display:'5.8" OLED 60Hz', camera:'12+12+12MP arka / 12MP ön', battery:'3046mAh', charging:'18W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Apple', model:'iPhone 11 Pro Max', specs:{ ram:'4GB', chipset:'Apple A13 Bionic', display:'6.5" OLED 60Hz', camera:'12+12+12MP arka / 12MP ön', battery:'3969mAh', charging:'18W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Apple', model:'iPhone 12 mini',    specs:{ ram:'4GB', chipset:'Apple A14 Bionic', display:'5.4" OLED 60Hz', camera:'12+12MP arka / 12MP ön', battery:'2227mAh', charging:'20W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Apple', model:'iPhone 12',         specs:{ ram:'4GB', chipset:'Apple A14 Bionic', display:'6.1" OLED 60Hz', camera:'12+12MP arka / 12MP ön', battery:'2815mAh', charging:'20W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Apple', model:'iPhone 12 Pro',     specs:{ ram:'6GB', chipset:'Apple A14 Bionic', display:'6.1" OLED 60Hz', camera:'12+12+12MP arka / 12MP ön', battery:'2815mAh', charging:'20W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Apple', model:'iPhone 12 Pro Max', specs:{ ram:'6GB', chipset:'Apple A14 Bionic', display:'6.7" OLED 60Hz', camera:'12+12+12MP arka / 12MP ön', battery:'3687mAh', charging:'20W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Apple', model:'iPhone 13 mini',    specs:{ ram:'4GB', chipset:'Apple A15 Bionic', display:'5.4" OLED 60Hz', camera:'12+12MP arka / 12MP ön', battery:'2438mAh', charging:'20W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Apple', model:'iPhone 13',         specs:{ ram:'4GB', chipset:'Apple A15 Bionic', display:'6.1" OLED 60Hz', camera:'12+12MP arka / 12MP ön', battery:'3227mAh', charging:'20W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Apple', model:'iPhone 13 Pro',     specs:{ ram:'6GB', chipset:'Apple A15 Bionic', display:'6.1" OLED 120Hz ProMotion', camera:'12+12+12MP arka / 12MP ön', battery:'3095mAh', charging:'27W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Apple', model:'iPhone 13 Pro Max', specs:{ ram:'6GB', chipset:'Apple A15 Bionic', display:'6.7" OLED 120Hz ProMotion', camera:'12+12+12MP arka / 12MP ön', battery:'4352mAh', charging:'27W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Apple', model:'iPhone 14',         specs:{ ram:'6GB', chipset:'Apple A15 Bionic', display:'6.1" OLED 60Hz', camera:'12+12MP arka / 12MP ön', battery:'3279mAh', charging:'20W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Apple', model:'iPhone 14 Plus',    specs:{ ram:'6GB', chipset:'Apple A15 Bionic', display:'6.7" OLED 60Hz', camera:'12+12MP arka / 12MP ön', battery:'4323mAh', charging:'20W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Apple', model:'iPhone 14 Pro',     specs:{ ram:'6GB', chipset:'Apple A16 Bionic', display:'6.1" OLED 120Hz ProMotion', camera:'48+12+12MP arka / 12MP ön', battery:'3200mAh', charging:'27W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Apple', model:'iPhone 14 Pro Max', specs:{ ram:'6GB', chipset:'Apple A16 Bionic', display:'6.7" OLED 120Hz ProMotion', camera:'48+12+12MP arka / 12MP ön', battery:'4323mAh', charging:'27W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Apple', model:'iPhone 15',         specs:{ ram:'6GB', chipset:'Apple A16 Bionic', display:'6.1" OLED 60Hz', camera:'48+12MP arka / 12MP ön', battery:'3349mAh', charging:'20W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Apple', model:'iPhone 15 Plus',    specs:{ ram:'6GB', chipset:'Apple A16 Bionic', display:'6.7" OLED 60Hz', camera:'48+12MP arka / 12MP ön', battery:'4383mAh', charging:'20W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Apple', model:'iPhone 15 Pro',     specs:{ ram:'8GB', chipset:'Apple A17 Pro', display:'6.1" OLED 120Hz ProMotion', camera:'48+12+12MP arka / 12MP ön', battery:'3274mAh', charging:'27W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Apple', model:'iPhone 15 Pro Max', specs:{ ram:'8GB', chipset:'Apple A17 Pro', display:'6.7" OLED 120Hz ProMotion', camera:'48+12+12MP arka / 12MP ön', battery:'4422mAh', charging:'27W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Apple', model:'iPhone 16',         specs:{ ram:'8GB', chipset:'Apple A18', display:'6.1" OLED 60Hz', camera:'48+12MP arka / 12MP ön', battery:'3561mAh', charging:'25W', connectivity:'5G WiFi6E BT NFC' }},
  { brand:'Apple', model:'iPhone 16 Plus',    specs:{ ram:'8GB', chipset:'Apple A18', display:'6.7" OLED 60Hz', camera:'48+12MP arka / 12MP ön', battery:'4674mAh', charging:'25W', connectivity:'5G WiFi6E BT NFC' }},
  { brand:'Apple', model:'iPhone 16 Pro',     specs:{ ram:'8GB', chipset:'Apple A18 Pro', display:'6.3" OLED 120Hz ProMotion', camera:'48+48+12MP arka / 12MP ön', battery:'3582mAh', charging:'27W', connectivity:'5G WiFi6E BT NFC' }},
  { brand:'Apple', model:'iPhone 16 Pro Max', specs:{ ram:'8GB', chipset:'Apple A18 Pro', display:'6.9" OLED 120Hz ProMotion', camera:'48+48+12MP arka / 12MP ön', battery:'4685mAh', charging:'27W', connectivity:'5G WiFi6E BT NFC' }},
  { brand:'Apple', model:'iPhone 16e',        specs:{ ram:'8GB', chipset:'Apple A16 Bionic', display:'6.1" OLED 60Hz', camera:'48MP arka / 12MP ön', battery:'3279mAh', charging:'20W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Apple', model:'iPhone 17',         specs:{ ram:'8GB', chipset:'Apple A19', display:'6.3" OLED 120Hz', camera:'48+48MP arka / 18MP ön', battery:'3692mAh', charging:'40W MagSafe 30W', connectivity:'5G WiFi7 BT6 NFC' }},
  { brand:'Apple', model:'iPhone 17 Plus',    specs:{ ram:'8GB', chipset:'Apple A19', display:'6.7" OLED 120Hz', camera:'48+48MP arka / 18MP ön', battery:'4850mAh', charging:'40W MagSafe 30W', connectivity:'5G WiFi7 BT6 NFC' }},
  { brand:'Apple', model:'iPhone 17 Pro',     specs:{ ram:'12GB', chipset:'Apple A19 Pro', display:'6.3" OLED 120Hz ProMotion', camera:'48+48+48MP arka / 18MP ön', battery:'3988mAh', charging:'40W MagSafe 30W', connectivity:'5G WiFi7 BT6 NFC' }},
  { brand:'Apple', model:'iPhone 17 Pro Max', specs:{ ram:'12GB', chipset:'Apple A19 Pro', display:'6.9" OLED 120Hz ProMotion', camera:'48+48+48MP arka / 18MP ön', battery:'4832mAh', charging:'40W MagSafe 30W', connectivity:'5G WiFi7 BT6 NFC' }},

  // ── Samsung S Serisi ─────────────────────────────────────────────────────────
  { brand:'Samsung', model:'Galaxy S21',       specs:{ ram:'8GB', chipset:'Exynos 2100 / Snapdragon 888', display:'6.2" Dynamic AMOLED 120Hz', camera:'12+12+64MP arka / 10MP ön', battery:'4000mAh', charging:'25W', connectivity:'5G WiFi6 BT NFC' }},
  { brand:'Samsung', model:'Galaxy S21+',      specs:{ ram:'8GB', chipset:'Exynos 2100 / Snapdragon 888', display:'6.7" Dynamic AMOLED 120Hz', camera:'12+12+64MP arka / 10MP ön', battery:'4800mAh', charging:'25W', connectivity:'5G WiFi6 BT NFC' }},
  { brand:'Samsung', model:'Galaxy S21 Ultra', specs:{ ram:'12GB', chipset:'Exynos 2100 / Snapdragon 888', display:'6.8" Dynamic AMOLED 120Hz', camera:'108+12+10+10MP arka / 40MP ön', battery:'5000mAh', charging:'25W', connectivity:'5G WiFi6 BT NFC' }},
  { brand:'Samsung', model:'Galaxy S21 FE',    specs:{ ram:'8GB', chipset:'Exynos 2100 / Snapdragon 888', display:'6.4" Dynamic AMOLED 120Hz', camera:'12+12+8MP arka / 32MP ön', battery:'4500mAh', charging:'25W', connectivity:'5G WiFi6 BT NFC' }},
  { brand:'Samsung', model:'Galaxy S22',       specs:{ ram:'8GB', chipset:'Exynos 2200 / Snapdragon 8 Gen 1', display:'6.1" Dynamic AMOLED 120Hz', camera:'50+12+10MP arka / 10MP ön', battery:'3700mAh', charging:'25W', connectivity:'5G WiFi6E BT NFC' }},
  { brand:'Samsung', model:'Galaxy S22+',      specs:{ ram:'8GB', chipset:'Exynos 2200 / Snapdragon 8 Gen 1', display:'6.6" Dynamic AMOLED 120Hz', camera:'50+12+10MP arka / 10MP ön', battery:'4500mAh', charging:'45W', connectivity:'5G WiFi6E BT NFC' }},
  { brand:'Samsung', model:'Galaxy S22 Ultra', specs:{ ram:'12GB', chipset:'Exynos 2200 / Snapdragon 8 Gen 1', display:'6.8" Dynamic AMOLED 120Hz', camera:'108+12+10+10MP arka / 40MP ön', battery:'5000mAh', charging:'45W', connectivity:'5G WiFi6E BT NFC' }},
  { brand:'Samsung', model:'Galaxy S23',       specs:{ ram:'8GB', chipset:'Snapdragon 8 Gen 2', display:'6.1" Dynamic AMOLED 120Hz', camera:'50+12+10MP arka / 12MP ön', battery:'3900mAh', charging:'25W', connectivity:'5G WiFi6E BT NFC' }},
  { brand:'Samsung', model:'Galaxy S23+',      specs:{ ram:'8GB', chipset:'Snapdragon 8 Gen 2', display:'6.6" Dynamic AMOLED 120Hz', camera:'50+12+10MP arka / 12MP ön', battery:'4700mAh', charging:'45W', connectivity:'5G WiFi6E BT NFC' }},
  { brand:'Samsung', model:'Galaxy S23 Ultra', specs:{ ram:'12GB', chipset:'Snapdragon 8 Gen 2', display:'6.8" Dynamic AMOLED 120Hz', camera:'200+12+10+10MP arka / 12MP ön', battery:'5000mAh', charging:'45W', connectivity:'5G WiFi6E BT NFC' }},
  { brand:'Samsung', model:'Galaxy S23 FE',    specs:{ ram:'8GB', chipset:'Exynos 2200 / Snapdragon 8 Gen 1', display:'6.4" Dynamic AMOLED 120Hz', camera:'50+12+8MP arka / 10MP ön', battery:'4500mAh', charging:'25W', connectivity:'5G WiFi6 BT NFC' }},
  { brand:'Samsung', model:'Galaxy S24',       specs:{ ram:'8GB', chipset:'Exynos 2400 / Snapdragon 8 Gen 3', display:'6.2" Dynamic AMOLED 120Hz', camera:'50+12+10MP arka / 12MP ön', battery:'4000mAh', charging:'25W', connectivity:'5G WiFi7 BT NFC' }},
  { brand:'Samsung', model:'Galaxy S24+',      specs:{ ram:'12GB', chipset:'Snapdragon 8 Gen 3', display:'6.7" Dynamic AMOLED 120Hz', camera:'50+12+10MP arka / 12MP ön', battery:'4900mAh', charging:'45W', connectivity:'5G WiFi7 BT NFC' }},
  { brand:'Samsung', model:'Galaxy S24 Ultra', specs:{ ram:'12GB', chipset:'Snapdragon 8 Gen 3', display:'6.8" Dynamic AMOLED 120Hz', camera:'200+50+10+12MP arka / 12MP ön', battery:'5000mAh', charging:'45W', connectivity:'5G WiFi7 BT NFC' }},
  { brand:'Samsung', model:'Galaxy S24 FE',    specs:{ ram:'8GB', chipset:'Exynos 2500', display:'6.7" Dynamic AMOLED 120Hz', camera:'50+8+10MP arka / 10MP ön', battery:'4700mAh', charging:'25W', connectivity:'5G WiFi6 BT NFC' }},
  { brand:'Samsung', model:'Galaxy S25',       specs:{ ram:'12GB', chipset:'Snapdragon 8 Elite', display:'6.2" Dynamic AMOLED 120Hz', camera:'50+12+10MP arka / 12MP ön', battery:'4000mAh', charging:'25W', connectivity:'5G WiFi7 BT5.4 NFC' }},
  { brand:'Samsung', model:'Galaxy S25+',      specs:{ ram:'12GB', chipset:'Snapdragon 8 Elite', display:'6.7" Dynamic AMOLED QHD+ 120Hz', camera:'50+12+10MP arka / 12MP ön', battery:'4900mAh', charging:'45W', connectivity:'5G WiFi7 BT5.4 NFC' }},
  { brand:'Samsung', model:'Galaxy S25 Ultra', specs:{ ram:'12GB', chipset:'Snapdragon 8 Elite', display:'6.9" Dynamic AMOLED QHD+ 120Hz', camera:'200+50+10MP arka / 12MP ön', battery:'5000mAh', charging:'45W', connectivity:'5G WiFi7 BT5.4 NFC' }},
  { brand:'Samsung', model:'Galaxy S25 Edge',  specs:{ ram:'12GB', chipset:'Snapdragon 8 Elite', display:'6.7" Dynamic AMOLED QHD+ 120Hz', camera:'200+12MP arka / 12MP ön', battery:'3900mAh', charging:'25W', connectivity:'5G WiFi7 BT5.4 NFC' }},

  // ── Samsung A Serisi ─────────────────────────────────────────────────────────
  { brand:'Samsung', model:'Galaxy A03s',    specs:{ ram:'3-4GB', chipset:'Helio P35', display:'6.5" PLS LCD 60Hz', camera:'13+2+2MP arka / 5MP ön', battery:'5000mAh', charging:'15W', connectivity:'4G WiFi BT' }},
  { brand:'Samsung', model:'Galaxy A04s',    specs:{ ram:'3-4GB', chipset:'Exynos 850', display:'6.5" PLS LCD 90Hz', camera:'50+2+2MP arka / 5MP ön', battery:'5000mAh', charging:'15W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Samsung', model:'Galaxy A05s',    specs:{ ram:'4GB', chipset:'Snapdragon 680', display:'6.7" PLS LCD 90Hz', camera:'50+2+2MP arka / 13MP ön', battery:'5000mAh', charging:'25W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Samsung', model:'Galaxy A06',     specs:{ ram:'4GB', chipset:'Helio G85', display:'6.7" PLS LCD 90Hz', camera:'50+2MP arka / 8MP ön', battery:'5000mAh', charging:'15W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Samsung', model:'Galaxy A07',     specs:{ ram:'3-4GB', chipset:'Exynos 850', display:'6.6" PLS LCD 90Hz', camera:'50+2+2MP arka / 13MP ön', battery:'5000mAh', charging:'15W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Samsung', model:'Galaxy A12',     specs:{ ram:'3-4GB', chipset:'Exynos 850', display:'6.5" PLS LCD 60Hz', camera:'48+5+2+2MP arka / 8MP ön', battery:'5000mAh', charging:'15W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Samsung', model:'Galaxy A13',     specs:{ ram:'4GB', chipset:'Exynos 850', display:'6.6" PLS LCD 60Hz', camera:'50+5+2+2MP arka / 8MP ön', battery:'5000mAh', charging:'15W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Samsung', model:'Galaxy A13 5G',  specs:{ ram:'4GB', chipset:'Dimensity 700', display:'6.5" PLS LCD 90Hz', camera:'50+5+2MP arka / 5MP ön', battery:'5000mAh', charging:'15W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Samsung', model:'Galaxy A14',     specs:{ ram:'4GB', chipset:'Exynos 850', display:'6.6" PLS LCD 90Hz', camera:'50+5+2MP arka / 13MP ön', battery:'5000mAh', charging:'15W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Samsung', model:'Galaxy A15',     specs:{ ram:'4GB', chipset:'Dimensity 6100+', display:'6.5" Super AMOLED 90Hz', camera:'50+5+2MP arka / 13MP ön', battery:'5000mAh', charging:'25W', connectivity:'4G/5G WiFi BT NFC' }},
  { brand:'Samsung', model:'Galaxy A16',     specs:{ ram:'4GB', chipset:'Exynos 1330', display:'6.7" Super AMOLED 90Hz', camera:'50+5+2MP arka / 13MP ön', battery:'5000mAh', charging:'25W', connectivity:'4G/5G WiFi BT NFC' }},
  { brand:'Samsung', model:'Galaxy A17',     specs:{ ram:'4GB', chipset:'Helio P35', display:'6.6" PLS LCD 90Hz', camera:'50+5+2MP arka / 13MP ön', battery:'5000mAh', charging:'25W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Samsung', model:'Galaxy A23',     specs:{ ram:'4GB', chipset:'Snapdragon 680', display:'6.6" PLS LCD 90Hz', camera:'50+5+2+2MP arka / 8MP ön', battery:'5000mAh', charging:'25W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Samsung', model:'Galaxy A23 5G',  specs:{ ram:'4GB', chipset:'Snapdragon 695', display:'6.6" PLS LCD 120Hz', camera:'50+5+2MP arka / 8MP ön', battery:'5000mAh', charging:'25W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Samsung', model:'Galaxy A24',     specs:{ ram:'6GB', chipset:'Helio G99', display:'6.5" Super AMOLED 90Hz', camera:'50+5+2MP arka / 13MP ön', battery:'5000mAh', charging:'25W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Samsung', model:'Galaxy A25',     specs:{ ram:'8GB', chipset:'Exynos 1280', display:'6.5" Super AMOLED 120Hz', camera:'50+8+2MP arka / 13MP ön', battery:'5000mAh', charging:'25W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Samsung', model:'Galaxy A33 5G',  specs:{ ram:'6GB', chipset:'Exynos 1280', display:'6.4" Super AMOLED 90Hz', camera:'48+8+5+5MP arka / 13MP ön', battery:'5000mAh', charging:'25W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Samsung', model:'Galaxy A34',     specs:{ ram:'8GB', chipset:'Dimensity 1080', display:'6.6" Super AMOLED 120Hz', camera:'48+8+5MP arka / 13MP ön', battery:'5000mAh', charging:'25W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Samsung', model:'Galaxy A35',     specs:{ ram:'6GB', chipset:'Exynos 1380', display:'6.6" Super AMOLED 120Hz', camera:'50+8+5MP arka / 13MP ön', battery:'5000mAh', charging:'25W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Samsung', model:'Galaxy A52s 5G', specs:{ ram:'6GB', chipset:'Snapdragon 778G', display:'6.5" Super AMOLED 120Hz', camera:'64+12+5+5MP arka / 32MP ön', battery:'4500mAh', charging:'25W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Samsung', model:'Galaxy A53 5G',  specs:{ ram:'6GB', chipset:'Exynos 1280', display:'6.5" Super AMOLED 120Hz', camera:'64+12+5+5MP arka / 32MP ön', battery:'5000mAh', charging:'25W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Samsung', model:'Galaxy A54',     specs:{ ram:'8GB', chipset:'Exynos 1380', display:'6.4" Super AMOLED 120Hz', camera:'50+12+5MP arka / 32MP ön', battery:'5000mAh', charging:'25W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Samsung', model:'Galaxy A55',     specs:{ ram:'8GB', chipset:'Exynos 1480', display:'6.6" Super AMOLED 120Hz', camera:'50+12+5MP arka / 32MP ön', battery:'5000mAh', charging:'45W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Samsung', model:'Galaxy A56',     specs:{ ram:'8GB', chipset:'Exynos 1580', display:'6.7" Super AMOLED 120Hz', camera:'50+12+5MP arka / 12MP ön', battery:'5000mAh', charging:'45W', connectivity:'5G WiFi6 BT NFC' }},
  { brand:'Samsung', model:'Galaxy A73 5G',  specs:{ ram:'8GB', chipset:'Snapdragon 778G', display:'6.7" Super AMOLED 120Hz', camera:'108+12+5+5MP arka / 32MP ön', battery:'5000mAh', charging:'25W', connectivity:'5G WiFi BT NFC' }},

  // ── Samsung Z Serisi ─────────────────────────────────────────────────────────
  { brand:'Samsung', model:'Galaxy Z Fold 4',  specs:{ ram:'12GB', chipset:'Snapdragon 8+ Gen 1', display:'6.2"(dış)+7.6"(iç) AMOLED 120Hz', camera:'50+12+10MP arka / 10MP ön', battery:'4400mAh', charging:'25W', connectivity:'5G WiFi6E BT NFC' }},
  { brand:'Samsung', model:'Galaxy Z Fold 5',  specs:{ ram:'12GB', chipset:'Snapdragon 8 Gen 2', display:'6.2"(dış)+7.6"(iç) Dynamic AMOLED 120Hz', camera:'50+12+10MP arka / 10MP ön', battery:'4400mAh', charging:'25W', connectivity:'5G WiFi6E BT NFC' }},
  { brand:'Samsung', model:'Galaxy Z Fold 6',  specs:{ ram:'12GB', chipset:'Snapdragon 8 Gen 3', display:'6.3"(dış)+7.6"(iç) Dynamic AMOLED 120Hz', camera:'50+12+10MP arka / 10MP ön', battery:'4400mAh', charging:'25W', connectivity:'5G WiFi7 BT NFC' }},
  { brand:'Samsung', model:'Galaxy Z Fold 7',  specs:{ ram:'12GB', chipset:'Snapdragon 8 Elite', display:'6.5"(dış)+8.0"(iç) Dynamic AMOLED 120Hz', camera:'200+12+10MP arka / 10MP ön', battery:'4400mAh', charging:'25W', connectivity:'5G WiFi7 BT NFC' }},
  { brand:'Samsung', model:'Galaxy Z Flip 4',  specs:{ ram:'8GB', chipset:'Snapdragon 8+ Gen 1', display:'6.7" Dynamic AMOLED 120Hz', camera:'12+12MP arka / 10MP ön', battery:'3700mAh', charging:'25W', connectivity:'5G WiFi6E BT NFC' }},
  { brand:'Samsung', model:'Galaxy Z Flip 5',  specs:{ ram:'8GB', chipset:'Snapdragon 8 Gen 2', display:'6.7" Dynamic AMOLED 120Hz', camera:'12+12MP arka / 10MP ön', battery:'3700mAh', charging:'25W', connectivity:'5G WiFi6E BT NFC' }},
  { brand:'Samsung', model:'Galaxy Z Flip 6',  specs:{ ram:'12GB', chipset:'Snapdragon 8 Gen 3', display:'6.7" Dynamic AMOLED 120Hz', camera:'50+12MP arka / 10MP ön', battery:'4000mAh', charging:'25W', connectivity:'5G WiFi7 BT NFC' }},
  { brand:'Samsung', model:'Galaxy Z Flip 7',  specs:{ ram:'12GB', chipset:'Exynos 2500', display:'6.9" Dynamic AMOLED 120Hz', camera:'50+12MP arka / 10MP ön', battery:'4300mAh', charging:'25W', connectivity:'5G WiFi7 BT NFC' }},

  // ── Samsung M Serisi ─────────────────────────────────────────────────────────
  { brand:'Samsung', model:'Galaxy M14',  specs:{ ram:'4GB', chipset:'Exynos 1330', display:'6.6" IPS LCD 90Hz', camera:'50+2+2MP arka / 13MP ön', battery:'6000mAh', charging:'25W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Samsung', model:'Galaxy M15',  specs:{ ram:'4GB', chipset:'Dimensity 6100+', display:'6.5" Super AMOLED 90Hz', camera:'50+5+2MP arka / 13MP ön', battery:'6000mAh', charging:'25W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Samsung', model:'Galaxy M34',  specs:{ ram:'8GB', chipset:'Exynos 1280', display:'6.5" Super AMOLED 120Hz', camera:'50+8+2MP arka / 13MP ön', battery:'6000mAh', charging:'25W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Samsung', model:'Galaxy M35',  specs:{ ram:'6GB', chipset:'Exynos 1380', display:'6.6" Super AMOLED 120Hz', camera:'50+8+5MP arka / 13MP ön', battery:'6000mAh', charging:'25W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Samsung', model:'Galaxy M55',  specs:{ ram:'8GB', chipset:'Snapdragon 7 Gen 1', display:'6.7" Super AMOLED 120Hz', camera:'50+8+2MP arka / 50MP ön', battery:'5000mAh', charging:'45W', connectivity:'5G WiFi BT NFC' }},

  // ── Xiaomi 12-15 Serisi ──────────────────────────────────────────────────────
  { brand:'Xiaomi', model:'Xiaomi 12',       specs:{ ram:'8GB', chipset:'Snapdragon 8 Gen 1', display:'6.28" AMOLED 120Hz', camera:'50+13+5MP arka / 32MP ön', battery:'4500mAh', charging:'67W', connectivity:'5G WiFi6E BT NFC' }},
  { brand:'Xiaomi', model:'Xiaomi 12 Pro',   specs:{ ram:'12GB', chipset:'Snapdragon 8 Gen 1', display:'6.73" AMOLED 120Hz', camera:'50+50+50MP arka / 32MP ön', battery:'4600mAh', charging:'120W', connectivity:'5G WiFi6E BT NFC' }},
  { brand:'Xiaomi', model:'Xiaomi 12T',      specs:{ ram:'8GB', chipset:'Dimensity 8100-Ultra', display:'6.67" AMOLED 144Hz', camera:'108+8+2MP arka / 20MP ön', battery:'5000mAh', charging:'120W', connectivity:'5G WiFi6 BT NFC' }},
  { brand:'Xiaomi', model:'Xiaomi 12T Pro',  specs:{ ram:'12GB', chipset:'Snapdragon 8+ Gen 1', display:'6.67" AMOLED 144Hz', camera:'200+8+2MP arka / 20MP ön', battery:'5000mAh', charging:'120W', connectivity:'5G WiFi6 BT NFC' }},
  { brand:'Xiaomi', model:'Xiaomi 13',       specs:{ ram:'8GB', chipset:'Snapdragon 8 Gen 2', display:'6.36" AMOLED 120Hz', camera:'54+12+10MP arka / 32MP ön', battery:'4500mAh', charging:'67W', connectivity:'5G WiFi6E BT NFC' }},
  { brand:'Xiaomi', model:'Xiaomi 13 Pro',   specs:{ ram:'12GB', chipset:'Snapdragon 8 Gen 2', display:'6.73" AMOLED 120Hz', camera:'50+50+50MP arka / 32MP ön', battery:'4820mAh', charging:'120W', connectivity:'5G WiFi6E BT NFC' }},
  { brand:'Xiaomi', model:'Xiaomi 13T',      specs:{ ram:'12GB', chipset:'Dimensity 8200-Ultra', display:'6.67" AMOLED 144Hz', camera:'50+12+50MP arka / 20MP ön', battery:'5000mAh', charging:'67W', connectivity:'5G WiFi6 BT NFC' }},
  { brand:'Xiaomi', model:'Xiaomi 13T Pro',  specs:{ ram:'12GB', chipset:'Dimensity 9200+', display:'6.67" AMOLED 144Hz', camera:'50+12+50MP arka / 20MP ön', battery:'5000mAh', charging:'120W', connectivity:'5G WiFi6E BT NFC' }},
  { brand:'Xiaomi', model:'Xiaomi 14',       specs:{ ram:'12GB', chipset:'Snapdragon 8 Gen 3', display:'6.36" AMOLED 120Hz', camera:'50+50+50MP arka / 32MP ön', battery:'4610mAh', charging:'90W', connectivity:'5G WiFi7 BT NFC' }},
  { brand:'Xiaomi', model:'Xiaomi 14 Pro',   specs:{ ram:'16GB', chipset:'Snapdragon 8 Gen 3', display:'6.73" AMOLED 120Hz', camera:'50+50+50MP arka / 32MP ön', battery:'4880mAh', charging:'120W', connectivity:'5G WiFi7 BT NFC' }},
  { brand:'Xiaomi', model:'Xiaomi 14T',      specs:{ ram:'12GB', chipset:'Dimensity 9300+', display:'6.67" AMOLED 144Hz', camera:'50+12+50MP arka / 32MP ön', battery:'5000mAh', charging:'67W', connectivity:'5G WiFi7 BT NFC' }},
  { brand:'Xiaomi', model:'Xiaomi 14T Pro',  specs:{ ram:'12GB', chipset:'Dimensity 9300+', display:'6.67" AMOLED 144Hz', camera:'50+12+50MP arka / 32MP ön', battery:'5000mAh', charging:'120W', connectivity:'5G WiFi7 BT NFC' }},
  { brand:'Xiaomi', model:'Xiaomi 14 Ultra', specs:{ ram:'16GB', chipset:'Snapdragon 8 Gen 3', display:'6.73" AMOLED 120Hz', camera:'50+50+50+50MP arka / 32MP ön', battery:'5000mAh', charging:'90W', connectivity:'5G WiFi7 BT NFC' }},
  { brand:'Xiaomi', model:'Xiaomi 15',       specs:{ ram:'12GB', chipset:'Snapdragon 8 Elite', display:'6.36" AMOLED 120Hz', camera:'50+50+50MP arka / 32MP ön', battery:'5240mAh', charging:'90W', connectivity:'5G WiFi7 BT NFC' }},
  { brand:'Xiaomi', model:'Xiaomi 15 Pro',   specs:{ ram:'12GB', chipset:'Snapdragon 8 Elite', display:'6.73" AMOLED 120Hz', camera:'50+50+50MP arka / 32MP ön', battery:'6100mAh', charging:'90W', connectivity:'5G WiFi7 BT NFC' }},
  { brand:'Xiaomi', model:'Xiaomi 15 Ultra', specs:{ ram:'16GB', chipset:'Snapdragon 8 Elite', display:'6.73" AMOLED QHD+ 120Hz', camera:'50+50+200+50MP arka / 50MP ön', battery:'5410mAh', charging:'90W', connectivity:'5G WiFi7 BT NFC' }},

  // ── Redmi ────────────────────────────────────────────────────────────────────
  { brand:'Xiaomi', model:'Redmi Note 12',       specs:{ ram:'4-6GB', chipset:'Snapdragon 685', display:'6.67" AMOLED 120Hz', camera:'50+8+2MP arka / 13MP ön', battery:'5000mAh', charging:'33W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Xiaomi', model:'Redmi Note 12 Pro',   specs:{ ram:'8GB', chipset:'Dimensity 1080', display:'6.67" AMOLED 120Hz', camera:'50+8+2MP arka / 16MP ön', battery:'5000mAh', charging:'67W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Xiaomi', model:'Redmi Note 12 Pro+',  specs:{ ram:'8GB', chipset:'Dimensity 1080', display:'6.67" AMOLED 120Hz', camera:'200+8+2MP arka / 16MP ön', battery:'5000mAh', charging:'120W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Xiaomi', model:'Redmi Note 13',       specs:{ ram:'6GB', chipset:'Snapdragon 685', display:'6.67" AMOLED 120Hz', camera:'108+8+2MP arka / 16MP ön', battery:'5000mAh', charging:'33W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Xiaomi', model:'Redmi Note 13 Pro',   specs:{ ram:'8GB', chipset:'Dimensity 7200-Ultra', display:'6.67" AMOLED 120Hz', camera:'200+8+2MP arka / 16MP ön', battery:'5000mAh', charging:'67W', connectivity:'4G/5G WiFi BT NFC' }},
  { brand:'Xiaomi', model:'Redmi Note 13 Pro+',  specs:{ ram:'12GB', chipset:'Dimensity 7200-Ultra', display:'6.67" AMOLED 120Hz', camera:'200+8+2MP arka / 16MP ön', battery:'5000mAh', charging:'120W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Xiaomi', model:'Redmi Note 14',       specs:{ ram:'8GB', chipset:'Snapdragon 7s Gen 2', display:'6.67" AMOLED 120Hz', camera:'50+8+2MP arka / 20MP ön', battery:'5110mAh', charging:'45W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Xiaomi', model:'Redmi Note 14 Pro',   specs:{ ram:'8GB', chipset:'Dimensity 7300-Ultra', display:'6.67" AMOLED 120Hz', camera:'200+8+2MP arka / 20MP ön', battery:'5500mAh', charging:'45W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Xiaomi', model:'Redmi Note 14 Pro+',  specs:{ ram:'12GB', chipset:'Snapdragon 7s Gen 3', display:'6.67" AMOLED 120Hz', camera:'200+8+2MP arka / 20MP ön', battery:'6200mAh', charging:'90W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Xiaomi', model:'Redmi 13C',  specs:{ ram:'4GB', chipset:'Helio G85', display:'6.74" IPS LCD 90Hz', camera:'50+2+2MP arka / 8MP ön', battery:'5000mAh', charging:'18W', connectivity:'4G WiFi BT' }},
  { brand:'Xiaomi', model:'Redmi 14C',  specs:{ ram:'8GB', chipset:'Helio G81 Ultra', display:'6.88" IPS LCD 90Hz', camera:'50+2MP arka / 13MP ön', battery:'5160mAh', charging:'18W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Xiaomi', model:'Redmi 13',   specs:{ ram:'8GB', chipset:'Snapdragon 685', display:'6.79" IPS LCD 90Hz', camera:'108+8+2MP arka / 13MP ön', battery:'5000mAh', charging:'33W', connectivity:'4G WiFi BT NFC' }},

  // ── POCO ─────────────────────────────────────────────────────────────────────
  { brand:'POCO', model:'POCO C40',       specs:{ ram:'3-4GB', chipset:'JLQ JR510', display:'6.71" IPS LCD 60Hz', camera:'13+2MP arka / 5MP ön', battery:'6000mAh', charging:'18W', connectivity:'4G WiFi BT NFC' }},
  { brand:'POCO', model:'POCO C55',       specs:{ ram:'6GB', chipset:'Helio G85', display:'6.71" IPS LCD 90Hz', camera:'50+2MP arka / 5MP ön', battery:'5000mAh', charging:'18W', connectivity:'4G WiFi BT NFC' }},
  { brand:'POCO', model:'POCO C65',       specs:{ ram:'8GB', chipset:'Helio G85', display:'6.74" IPS LCD 90Hz', camera:'50+2+2MP arka / 8MP ön', battery:'5000mAh', charging:'18W', connectivity:'4G WiFi BT' }},
  { brand:'POCO', model:'POCO C75',       specs:{ ram:'8GB', chipset:'Helio G81 Ultra', display:'6.88" IPS LCD 90Hz', camera:'50+2MP arka / 13MP ön', battery:'5160mAh', charging:'18W', connectivity:'4G WiFi BT' }},
  { brand:'POCO', model:'POCO M3 Pro 5G', specs:{ ram:'6GB', chipset:'Dimensity 700', display:'6.5" AMOLED 90Hz', camera:'48+2+2MP arka / 8MP ön', battery:'5000mAh', charging:'18W', connectivity:'5G WiFi BT NFC' }},
  { brand:'POCO', model:'POCO M4 5G',     specs:{ ram:'4GB', chipset:'Dimensity 700', display:'6.58" IPS LCD 90Hz', camera:'50+2MP arka / 8MP ön', battery:'5000mAh', charging:'18W', connectivity:'5G WiFi BT NFC' }},
  { brand:'POCO', model:'POCO M4 Pro',    specs:{ ram:'6GB', chipset:'Helio G96', display:'6.43" AMOLED 90Hz', camera:'64+8+2MP arka / 16MP ön', battery:'5000mAh', charging:'33W', connectivity:'4G WiFi BT NFC' }},
  { brand:'POCO', model:'POCO M4 Pro 5G', specs:{ ram:'6GB', chipset:'Dimensity 810', display:'6.6" IPS LCD 90Hz', camera:'50+8+2MP arka / 16MP ön', battery:'5000mAh', charging:'33W', connectivity:'5G WiFi BT NFC' }},
  { brand:'POCO', model:'POCO M5',        specs:{ ram:'4GB', chipset:'Helio G99', display:'6.58" IPS LCD 90Hz', camera:'50+2+2MP arka / 5MP ön', battery:'5000mAh', charging:'18W', connectivity:'4G WiFi BT NFC' }},
  { brand:'POCO', model:'POCO M5s',       specs:{ ram:'4-6GB', chipset:'Helio G95', display:'6.43" AMOLED 90Hz', camera:'64+8+2+2MP arka / 13MP ön', battery:'5000mAh', charging:'33W', connectivity:'4G WiFi BT NFC' }},
  { brand:'POCO', model:'POCO M6',        specs:{ ram:'8GB', chipset:'Helio G85', display:'6.79" IPS LCD 90Hz', camera:'50+2+2MP arka / 13MP ön', battery:'5030mAh', charging:'18W', connectivity:'4G WiFi BT NFC' }},
  { brand:'POCO', model:'POCO M6 Pro',    specs:{ ram:'8GB', chipset:'Dimensity 6080', display:'6.67" AMOLED 120Hz', camera:'64+8+2MP arka / 16MP ön', battery:'5000mAh', charging:'67W', connectivity:'4G WiFi BT NFC' }},
  { brand:'POCO', model:'POCO X4 GT',     specs:{ ram:'8GB', chipset:'Dimensity 8100', display:'6.6" IPS LCD 144Hz', camera:'64+8+2MP arka / 20MP ön', battery:'5080mAh', charging:'67W', connectivity:'5G WiFi BT NFC' }},
  { brand:'POCO', model:'POCO X4 Pro 5G', specs:{ ram:'8GB', chipset:'Snapdragon 695', display:'6.67" AMOLED 120Hz', camera:'108+8+2MP arka / 16MP ön', battery:'5000mAh', charging:'67W', connectivity:'5G WiFi BT NFC' }},
  { brand:'POCO', model:'POCO X5',        specs:{ ram:'6GB', chipset:'Snapdragon 695', display:'6.67" AMOLED 120Hz', camera:'48+8+2MP arka / 13MP ön', battery:'5000mAh', charging:'33W', connectivity:'5G WiFi BT NFC' }},
  { brand:'POCO', model:'POCO X5 Pro',    specs:{ ram:'8GB', chipset:'Snapdragon 778G', display:'6.67" AMOLED 120Hz', camera:'108+8+2MP arka / 16MP ön', battery:'5000mAh', charging:'67W', connectivity:'5G WiFi BT NFC' }},
  { brand:'POCO', model:'POCO X6',        specs:{ ram:'12GB', chipset:'Dimensity 6080', display:'6.67" AMOLED 120Hz', camera:'64+8+2MP arka / 16MP ön', battery:'5100mAh', charging:'67W', connectivity:'5G WiFi BT NFC' }},
  { brand:'POCO', model:'POCO X6 Pro',    specs:{ ram:'8GB', chipset:'Dimensity 8300-Ultra', display:'6.67" AMOLED 120Hz', camera:'64+8+2MP arka / 16MP ön', battery:'5000mAh', charging:'67W', connectivity:'5G WiFi BT NFC' }},
  { brand:'POCO', model:'POCO X7',        specs:{ ram:'8GB', chipset:'Dimensity 7300', display:'6.67" AMOLED 120Hz', camera:'50+8+2MP arka / 20MP ön', battery:'5110mAh', charging:'45W', connectivity:'5G WiFi BT NFC' }},
  { brand:'POCO', model:'POCO X7 Pro',    specs:{ ram:'12GB', chipset:'Dimensity 8400-Ultra', display:'6.67" AMOLED 120Hz', camera:'50+8+2MP arka / 20MP ön', battery:'6000mAh', charging:'90W', connectivity:'5G WiFi BT NFC' }},
  { brand:'POCO', model:'POCO F5',        specs:{ ram:'12GB', chipset:'Snapdragon 7+ Gen 2', display:'6.67" AMOLED 120Hz', camera:'64+8+2MP arka / 16MP ön', battery:'5000mAh', charging:'67W', connectivity:'5G WiFi BT NFC' }},
  { brand:'POCO', model:'POCO F5 Pro',    specs:{ ram:'12GB', chipset:'Snapdragon 8 Gen 2', display:'6.67" AMOLED 120Hz', camera:'64+8+2MP arka / 16MP ön', battery:'5000mAh', charging:'67W', connectivity:'5G WiFi BT NFC' }},
  { brand:'POCO', model:'POCO F6',        specs:{ ram:'12GB', chipset:'Snapdragon 8s Gen 3', display:'6.67" AMOLED 120Hz', camera:'50+8+2MP arka / 20MP ön', battery:'5000mAh', charging:'90W', connectivity:'5G WiFi BT NFC' }},
  { brand:'POCO', model:'POCO F6 Pro',    specs:{ ram:'12GB', chipset:'Snapdragon 8 Gen 3', display:'6.67" AMOLED 120Hz', camera:'50+8+2MP arka / 20MP ön', battery:'5000mAh', charging:'120W', connectivity:'5G WiFi BT NFC' }},

  // ── Huawei ───────────────────────────────────────────────────────────────────
  { brand:'Huawei', model:'P50',          specs:{ ram:'8GB', chipset:'Kirin 9000 / Snapdragon 888', display:'6.5" OLED 90Hz', camera:'50+13+12MP arka / 13MP ön', battery:'4100mAh', charging:'66W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Huawei', model:'P50 Pro',      specs:{ ram:'8GB', chipset:'Kirin 9000 / Snapdragon 888', display:'6.6" OLED 120Hz', camera:'50+13+64MP arka / 13MP ön', battery:'4360mAh', charging:'66W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Huawei', model:'P60',          specs:{ ram:'8GB', chipset:'Snapdragon 8+ Gen 1', display:'6.67" OLED 120Hz', camera:'48+13+12MP arka / 13MP ön', battery:'4815mAh', charging:'88W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Huawei', model:'P60 Pro',      specs:{ ram:'12GB', chipset:'Kirin 9200+', display:'6.67" OLED 120Hz', camera:'48+13+48MP arka / 13MP ön', battery:'4815mAh', charging:'88W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Huawei', model:'P60 Art',      specs:{ ram:'12GB', chipset:'Kirin 9200+', display:'6.67" OLED 120Hz', camera:'48+13+48MP arka / 13MP ön', battery:'4815mAh', charging:'88W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Huawei', model:'Pura 70',      specs:{ ram:'12GB', chipset:'Kirin 9010', display:'6.6" OLED 120Hz', camera:'50+12+40MP arka / 13MP ön', battery:'4900mAh', charging:'88W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Huawei', model:'Pura 70 Pro',  specs:{ ram:'16GB', chipset:'Kirin 9010E', display:'6.8" OLED 120Hz', camera:'50+12+48MP arka / 13MP ön', battery:'5000mAh', charging:'88W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Huawei', model:'Pura 70 Pro+', specs:{ ram:'16GB', chipset:'Kirin 9010E', display:'6.8" OLED 120Hz', camera:'50+12+200MP arka / 13MP ön', battery:'5000mAh', charging:'100W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Huawei', model:'Pura 70 Ultra',specs:{ ram:'16GB', chipset:'Kirin 9010E', display:'6.8" OLED 120Hz', camera:'50+12+200MP arka / 13MP ön', battery:'5000mAh', charging:'100W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Huawei', model:'Mate 50',      specs:{ ram:'8GB', chipset:'Snapdragon 8+ Gen 1', display:'6.7" OLED 60Hz', camera:'50+13+12MP arka / 13MP ön', battery:'4460mAh', charging:'66W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Huawei', model:'Mate 50 Pro',  specs:{ ram:'8GB', chipset:'Snapdragon 8+ Gen 1', display:'6.74" OLED 120Hz', camera:'50+13+64MP arka / 13MP ön', battery:'4700mAh', charging:'66W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Huawei', model:'Mate 60',      specs:{ ram:'12GB', chipset:'Kirin 9000S', display:'6.69" OLED 120Hz', camera:'50+12+12MP arka / 13MP ön', battery:'5000mAh', charging:'66W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Huawei', model:'Mate 60 Pro',  specs:{ ram:'12GB', chipset:'Kirin 9000S', display:'6.82" OLED 120Hz', camera:'50+12+48MP arka / 13MP ön', battery:'5000mAh', charging:'88W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Huawei', model:'Mate 60 RS',   specs:{ ram:'16GB', chipset:'Kirin 9000S', display:'6.82" OLED 120Hz', camera:'50+12+48MP arka / 13MP ön', battery:'5000mAh', charging:'88W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Huawei', model:'Mate 70',      specs:{ ram:'12GB', chipset:'Kirin 9020', display:'6.7" OLED 120Hz', camera:'50+12+12MP arka / 13MP ön', battery:'5900mAh', charging:'66W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Huawei', model:'Mate 70 Pro',  specs:{ ram:'16GB', chipset:'Kirin 9020E', display:'6.96" OLED 120Hz', camera:'50+12+48MP arka / 13MP ön', battery:'5600mAh', charging:'100W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Huawei', model:'nova 11',      specs:{ ram:'8GB', chipset:'Snapdragon 778G', display:'6.7" OLED 120Hz', camera:'50+8MP arka / 60MP ön', battery:'4500mAh', charging:'66W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Huawei', model:'nova 11 Pro',  specs:{ ram:'8GB', chipset:'Snapdragon 778G', display:'6.78" OLED 120Hz', camera:'50+8MP arka / 60MP ön', battery:'4500mAh', charging:'100W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Huawei', model:'nova 12',      specs:{ ram:'12GB', chipset:'Kirin 9000SL', display:'6.88" OLED 120Hz', camera:'50+8MP arka / 60MP ön', battery:'4500mAh', charging:'100W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Huawei', model:'nova 12 Pro',  specs:{ ram:'12GB', chipset:'Kirin 9000SL', display:'6.88" OLED 120Hz', camera:'50+8MP arka / 60MP ön', battery:'4600mAh', charging:'100W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Huawei', model:'nova 13',      specs:{ ram:'12GB', chipset:'Kirin 9010', display:'6.7" OLED 120Hz', camera:'50+8MP arka / 50MP ön', battery:'4800mAh', charging:'66W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Huawei', model:'nova 13 Pro',  specs:{ ram:'12GB', chipset:'Kirin 9010', display:'6.7" OLED 120Hz', camera:'50+8MP arka / 60MP ön', battery:'4800mAh', charging:'100W', connectivity:'4G WiFi BT NFC' }},

  // ── Vivo ─────────────────────────────────────────────────────────────────────
  { brand:'Vivo', model:'X90',        specs:{ ram:'12GB', chipset:'Dimensity 9200', display:'6.78" AMOLED 120Hz', camera:'50+12+12MP arka / 32MP ön', battery:'4870mAh', charging:'120W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Vivo', model:'X90 Pro',    specs:{ ram:'12GB', chipset:'Snapdragon 8 Gen 2', display:'6.78" AMOLED 120Hz', camera:'50+12+12MP arka / 32MP ön', battery:'4870mAh', charging:'120W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Vivo', model:'X90 Pro+',   specs:{ ram:'12GB', chipset:'Snapdragon 8 Gen 2', display:'6.78" AMOLED 120Hz', camera:'50+48+12MP arka / 32MP ön', battery:'4700mAh', charging:'80W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Vivo', model:'X100',       specs:{ ram:'16GB', chipset:'Dimensity 9300', display:'6.78" AMOLED 120Hz', camera:'50+50+64MP arka / 32MP ön', battery:'5000mAh', charging:'120W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Vivo', model:'X100 Pro',   specs:{ ram:'16GB', chipset:'Dimensity 9300', display:'6.78" AMOLED 120Hz', camera:'50+50+200MP arka / 32MP ön', battery:'5400mAh', charging:'100W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Vivo', model:'X200',       specs:{ ram:'16GB', chipset:'Dimensity 9400', display:'6.67" AMOLED 120Hz', camera:'50+50+50MP arka / 32MP ön', battery:'5800mAh', charging:'90W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Vivo', model:'X200 Pro',   specs:{ ram:'16GB', chipset:'Dimensity 9400', display:'6.78" AMOLED FHD+ 120Hz', camera:'50+50+200MP arka / 32MP ön', battery:'6000mAh', charging:'90W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Vivo', model:'X200 Ultra', specs:{ ram:'12GB', chipset:'Snapdragon 8 Elite', display:'6.82" AMOLED QHD+ 120Hz', camera:'50+50+200MP arka / 50MP ön', battery:'6000mAh', charging:'90W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Vivo', model:'V29',        specs:{ ram:'12GB', chipset:'Snapdragon 778G', display:'6.78" AMOLED 120Hz', camera:'50+8+2MP arka / 50MP ön', battery:'4600mAh', charging:'80W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Vivo', model:'V29 Pro',    specs:{ ram:'8GB', chipset:'Dimensity 8200', display:'6.78" AMOLED 120Hz', camera:'50+8+2MP arka / 50MP ön', battery:'4600mAh', charging:'80W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Vivo', model:'V29e',       specs:{ ram:'8GB', chipset:'Snapdragon 695', display:'6.78" AMOLED 120Hz', camera:'64+2+2MP arka / 32MP ön', battery:'4600mAh', charging:'44W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Vivo', model:'V30',        specs:{ ram:'12GB', chipset:'Snapdragon 7 Gen 3', display:'6.78" AMOLED 120Hz', camera:'50+50+12MP arka / 50MP ön', battery:'5000mAh', charging:'80W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Vivo', model:'V30 Pro',    specs:{ ram:'12GB', chipset:'Dimensity 8200', display:'6.78" AMOLED 120Hz', camera:'50+50+12MP arka / 50MP ön', battery:'5000mAh', charging:'80W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Vivo', model:'V30e',       specs:{ ram:'8GB', chipset:'Snapdragon 695', display:'6.78" AMOLED 120Hz', camera:'50+8+2MP arka / 50MP ön', battery:'5000mAh', charging:'44W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Vivo', model:'V40',        specs:{ ram:'12GB', chipset:'Snapdragon 7 Gen 3', display:'6.78" AMOLED 120Hz', camera:'50+50+12MP arka / 50MP ön', battery:'5500mAh', charging:'90W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Vivo', model:'V40 Pro',    specs:{ ram:'12GB', chipset:'Dimensity 9300+', display:'6.78" AMOLED 120Hz', camera:'50+50+50MP arka / 50MP ön', battery:'5500mAh', charging:'90W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Vivo', model:'V40e',       specs:{ ram:'8GB', chipset:'Snapdragon 695', display:'6.78" AMOLED 120Hz', camera:'50+8+2MP arka / 50MP ön', battery:'5500mAh', charging:'44W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Vivo', model:'Y36',        specs:{ ram:'8GB', chipset:'Snapdragon 480', display:'6.64" IPS LCD 90Hz', camera:'50+2+2MP arka / 16MP ön', battery:'5000mAh', charging:'44W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Vivo', model:'Y38',        specs:{ ram:'8GB', chipset:'Snapdragon 4 Gen 2', display:'6.78" IPS LCD 90Hz', camera:'50+2MP arka / 8MP ön', battery:'5000mAh', charging:'44W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Vivo', model:'Y58',        specs:{ ram:'8GB', chipset:'Snapdragon 6 Gen 1', display:'6.78" AMOLED 120Hz', camera:'64+2+2MP arka / 16MP ön', battery:'5000mAh', charging:'44W', connectivity:'5G WiFi BT NFC' }},

  // ── Tecno ────────────────────────────────────────────────────────────────────
  { brand:'Tecno', model:'Camon 20',          specs:{ ram:'8GB', chipset:'Helio G85', display:'6.67" AMOLED 60Hz', camera:'64+2+2MP arka / 32MP ön', battery:'5000mAh', charging:'33W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Tecno', model:'Camon 20 Pro',      specs:{ ram:'8GB', chipset:'Dimensity 8050', display:'6.67" AMOLED 120Hz', camera:'64+2+2MP arka / 32MP ön', battery:'5000mAh', charging:'33W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Tecno', model:'Camon 20 Premier',  specs:{ ram:'8GB', chipset:'Dimensity 8050', display:'6.67" AMOLED 120Hz', camera:'108+2+2MP arka / 50MP ön', battery:'5000mAh', charging:'33W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Tecno', model:'Camon 30',          specs:{ ram:'8GB', chipset:'Dimensity 7020', display:'6.78" AMOLED 120Hz', camera:'50+2+2MP arka / 50MP ön', battery:'5000mAh', charging:'33W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Tecno', model:'Camon 30 Pro',      specs:{ ram:'12GB', chipset:'Dimensity 8200', display:'6.78" AMOLED 120Hz', camera:'50+50+50MP arka / 50MP ön', battery:'5000mAh', charging:'45W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Tecno', model:'Camon 30 Premier',  specs:{ ram:'16GB', chipset:'Dimensity 9300', display:'6.78" AMOLED 144Hz', camera:'50+50+50MP arka / 50MP ön', battery:'5000mAh', charging:'100W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Tecno', model:'Phantom X2',        specs:{ ram:'12GB', chipset:'Dimensity 9000', display:'6.67" AMOLED 120Hz', camera:'50+13+10MP arka / 32MP ön', battery:'5160mAh', charging:'45W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Tecno', model:'Phantom X2 Pro',    specs:{ ram:'12GB', chipset:'Dimensity 9000', display:'6.67" AMOLED 120Hz', camera:'50+13+10MP arka / 50MP ön', battery:'5160mAh', charging:'45W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Tecno', model:'Phantom V Fold',    specs:{ ram:'12GB', chipset:'Dimensity 9000', display:'6.4"(dış)+7.9"(iç) AMOLED 120Hz', camera:'50+13+10MP arka / 32MP ön', battery:'5000mAh', charging:'45W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Tecno', model:'Phantom V Flip',    specs:{ ram:'8GB', chipset:'Dimensity 8050', display:'6.9" AMOLED 120Hz', camera:'64+13MP arka / 32MP ön', battery:'4000mAh', charging:'33W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Tecno', model:'Spark 20',          specs:{ ram:'8GB', chipset:'Helio G88', display:'6.56" IPS LCD 90Hz', camera:'64+2+2MP arka / 32MP ön', battery:'5000mAh', charging:'18W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Tecno', model:'Spark 20 Pro',      specs:{ ram:'8GB', chipset:'Helio G88', display:'6.78" AMOLED 120Hz', camera:'64+2+2MP arka / 32MP ön', battery:'5000mAh', charging:'18W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Tecno', model:'Spark 30',          specs:{ ram:'8GB', chipset:'Helio G81 Ultra', display:'6.67" IPS LCD 90Hz', camera:'50+2+2MP arka / 32MP ön', battery:'5000mAh', charging:'18W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Tecno', model:'Spark 30 Pro',      specs:{ ram:'8GB', chipset:'Dimensity 6300', display:'6.78" AMOLED 120Hz', camera:'50+2+2MP arka / 32MP ön', battery:'5000mAh', charging:'18W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Tecno', model:'Pova 5',            specs:{ ram:'8GB', chipset:'Helio G96', display:'6.78" IPS LCD 90Hz', camera:'50+2+2MP arka / 8MP ön', battery:'6000mAh', charging:'33W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Tecno', model:'Pova 5 Pro',        specs:{ ram:'8GB', chipset:'Dimensity 6080', display:'6.78" IPS LCD 90Hz', camera:'50+2+2MP arka / 8MP ön', battery:'6000mAh', charging:'68W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Tecno', model:'Pova 6',            specs:{ ram:'8GB', chipset:'Helio G88', display:'6.78" IPS LCD 90Hz', camera:'50+2+2MP arka / 8MP ön', battery:'7000mAh', charging:'33W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Tecno', model:'Pova 6 Pro',        specs:{ ram:'8GB', chipset:'Dimensity 6080', display:'6.78" AMOLED 120Hz', camera:'108+2+2MP arka / 32MP ön', battery:'7000mAh', charging:'68W', connectivity:'5G WiFi BT NFC' }},

  // ── Infinix ──────────────────────────────────────────────────────────────────
  { brand:'Infinix', model:'Note 30',      specs:{ ram:'8GB', chipset:'Helio G99', display:'6.78" AMOLED 120Hz', camera:'108+2+2MP arka / 16MP ön', battery:'5000mAh', charging:'33W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Infinix', model:'Note 30 Pro',  specs:{ ram:'8GB', chipset:'Helio G99', display:'6.78" AMOLED 120Hz', camera:'108+2+2MP arka / 16MP ön', battery:'5000mAh', charging:'68W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Infinix', model:'Note 30 VIP',  specs:{ ram:'8GB', chipset:'Helio G99', display:'6.78" AMOLED 144Hz', camera:'108+2+2MP arka / 16MP ön', battery:'5000mAh', charging:'68W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Infinix', model:'Note 40',      specs:{ ram:'12GB', chipset:'Helio G99 Ultra', display:'6.78" AMOLED 120Hz', camera:'108+2+2MP arka / 16MP ön', battery:'5000mAh', charging:'45W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Infinix', model:'Note 40 Pro',  specs:{ ram:'12GB', chipset:'Dimensity 7020', display:'6.78" AMOLED 120Hz', camera:'108+2+2MP arka / 16MP ön', battery:'5000mAh', charging:'65W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Infinix', model:'Note 40 Pro+', specs:{ ram:'12GB', chipset:'Dimensity 7020', display:'6.78" AMOLED 144Hz', camera:'108+2+2MP arka / 16MP ön', battery:'5000mAh', charging:'100W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Infinix', model:'Note 50',      specs:{ ram:'8GB', chipset:'Helio G100', display:'6.78" AMOLED 120Hz', camera:'50+2+2MP arka / 13MP ön', battery:'5000mAh', charging:'45W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Infinix', model:'Note 50 Pro',  specs:{ ram:'12GB', chipset:'Dimensity 7025 Ultra', display:'6.78" AMOLED 120Hz', camera:'108+2+2MP arka / 13MP ön', battery:'5500mAh', charging:'68W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Infinix', model:'Zero 30',      specs:{ ram:'12GB', chipset:'Dimensity 8020', display:'6.78" AMOLED 144Hz', camera:'108+2+2MP arka / 50MP ön', battery:'5000mAh', charging:'45W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Infinix', model:'Zero 30 5G',   specs:{ ram:'12GB', chipset:'Dimensity 8020', display:'6.78" AMOLED 144Hz', camera:'108+2+2MP arka / 50MP ön', battery:'5000mAh', charging:'68W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Infinix', model:'Hot 40',       specs:{ ram:'8GB', chipset:'Helio G88', display:'6.78" IPS LCD 90Hz', camera:'50+2+2MP arka / 8MP ön', battery:'5000mAh', charging:'18W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Infinix', model:'Hot 40 Pro',   specs:{ ram:'8GB', chipset:'Helio G88', display:'6.78" IPS LCD 90Hz', camera:'108+2+2MP arka / 32MP ön', battery:'5000mAh', charging:'33W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Infinix', model:'Hot 40i',      specs:{ ram:'4GB', chipset:'Unisoc T606', display:'6.56" IPS LCD 90Hz', camera:'50+2MP arka / 8MP ön', battery:'5000mAh', charging:'10W', connectivity:'4G WiFi BT' }},
  { brand:'Infinix', model:'Hot 50',       specs:{ ram:'8GB', chipset:'Helio G81 Ultra', display:'6.78" IPS LCD 90Hz', camera:'50+2+2MP arka / 13MP ön', battery:'5000mAh', charging:'18W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Infinix', model:'Hot 50 Pro',   specs:{ ram:'8GB', chipset:'Dimensity 6300', display:'6.78" AMOLED 120Hz', camera:'50+2+2MP arka / 32MP ön', battery:'5000mAh', charging:'33W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Infinix', model:'Smart 8',      specs:{ ram:'4GB', chipset:'Helio G36', display:'6.6" IPS LCD 90Hz', camera:'13+2MP arka / 8MP ön', battery:'5000mAh', charging:'10W', connectivity:'4G WiFi BT' }},
  { brand:'Infinix', model:'Smart 8 Pro',  specs:{ ram:'4GB', chipset:'Helio G85', display:'6.78" IPS LCD 90Hz', camera:'50+2+2MP arka / 8MP ön', battery:'5000mAh', charging:'18W', connectivity:'4G WiFi BT' }},

  // ── Realme ───────────────────────────────────────────────────────────────────
  { brand:'Realme', model:'Realme 11',       specs:{ ram:'8GB', chipset:'Helio G99', display:'6.4" AMOLED 90Hz', camera:'108+2+2MP arka / 16MP ön', battery:'5000mAh', charging:'67W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Realme', model:'Realme 11 Pro',   specs:{ ram:'8GB', chipset:'Dimensity 7050', display:'6.7" AMOLED 120Hz', camera:'100+2+2MP arka / 16MP ön', battery:'5000mAh', charging:'67W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Realme', model:'Realme 11 Pro+',  specs:{ ram:'12GB', chipset:'Dimensity 7050', display:'6.7" AMOLED 120Hz', camera:'200+8+2MP arka / 32MP ön', battery:'5000mAh', charging:'100W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Realme', model:'Realme 12',       specs:{ ram:'8GB', chipset:'Snapdragon 685', display:'6.67" IPS LCD 90Hz', camera:'108+2+2MP arka / 13MP ön', battery:'5000mAh', charging:'33W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Realme', model:'Realme 12 Pro',   specs:{ ram:'8GB', chipset:'Snapdragon 6 Gen 1', display:'6.7" AMOLED 120Hz', camera:'50+8+2MP arka / 16MP ön', battery:'5000mAh', charging:'67W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Realme', model:'Realme 12 Pro+',  specs:{ ram:'12GB', chipset:'Snapdragon 7s Gen 2', display:'6.7" AMOLED 120Hz', camera:'50+8+2MP arka / 32MP ön', battery:'5000mAh', charging:'67W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Realme', model:'Realme 13',       specs:{ ram:'8GB', chipset:'Snapdragon 7s Gen 3', display:'6.67" AMOLED 120Hz', camera:'50+2+2MP arka / 16MP ön', battery:'5000mAh', charging:'45W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Realme', model:'Realme 13 Pro',   specs:{ ram:'8GB', chipset:'Snapdragon 7s Gen 3', display:'6.7" AMOLED 120Hz', camera:'50+8+2MP arka / 16MP ön', battery:'5000mAh', charging:'67W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Realme', model:'Realme 13 Pro+',  specs:{ ram:'12GB', chipset:'Dimensity 7300-Energy', display:'6.7" AMOLED 120Hz', camera:'50+8+2MP arka / 32MP ön', battery:'5200mAh', charging:'80W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Realme', model:'Realme GT6',      specs:{ ram:'16GB', chipset:'Snapdragon 8s Gen 3', display:'6.78" AMOLED 120Hz', camera:'50+8+2MP arka / 32MP ön', battery:'5500mAh', charging:'120W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Realme', model:'Realme GT6T',     specs:{ ram:'8GB', chipset:'Snapdragon 7+ Gen 3', display:'6.78" AMOLED 120Hz', camera:'50+8+2MP arka / 16MP ön', battery:'5500mAh', charging:'120W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Realme', model:'Realme GT7',      specs:{ ram:'12GB', chipset:'Snapdragon 7 Gen 3', display:'6.78" AMOLED 120Hz', camera:'50+8+2MP arka / 16MP ön', battery:'6500mAh', charging:'120W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Realme', model:'Realme GT7 Pro',  specs:{ ram:'12GB', chipset:'Snapdragon 8 Elite', display:'6.78" OLED 120Hz', camera:'50+8+50MP arka / 16MP ön', battery:'6500mAh', charging:'120W', connectivity:'5G WiFi BT NFC' }},
  { brand:'Realme', model:'Realme C65',      specs:{ ram:'8GB', chipset:'Helio G85', display:'6.67" IPS LCD 90Hz', camera:'50+2+2MP arka / 8MP ön', battery:'5000mAh', charging:'33W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Realme', model:'Realme C75',      specs:{ ram:'8GB', chipset:'Helio G81 Ultra', display:'6.72" IPS LCD 90Hz', camera:'50+2+2MP arka / 8MP ön', battery:'6000mAh', charging:'45W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Realme', model:'Narzo 70',        specs:{ ram:'8GB', chipset:'Helio G85', display:'6.67" AMOLED 90Hz', camera:'50+2+2MP arka / 16MP ön', battery:'5000mAh', charging:'33W', connectivity:'4G WiFi BT NFC' }},
  { brand:'Realme', model:'Narzo 70 Pro',    specs:{ ram:'8GB', chipset:'Dimensity 7050', display:'6.67" AMOLED 120Hz', camera:'64+2+2MP arka / 16MP ön', battery:'5000mAh', charging:'68W', connectivity:'5G WiFi BT NFC' }},
];

async function main() {
  console.log(`🔧 Specs güncelleniyor... (${SPECS.length} model)`);
  let updated = 0;
  let notFound = 0;

  for (const { brand, model, specs } of SPECS) {
    const result = await (prisma as any).globalProduct.updateMany({
      where: { brand, model },
      data: { specsJson: specs },
    });
    if (result.count > 0) {
      updated += result.count;
    } else {
      notFound++;
      console.warn(`  ⚠️  Bulunamadı: ${brand} ${model}`);
    }
  }

  console.log(`✅ ${updated} kayıt güncellendi, ${notFound} model DB'de yok.`);

  // Mevcut kayıtlardan 'os' alanını temizle
  const all = await (prisma as any).globalProduct.findMany({ select: { id: true, specsJson: true } });
  let stripped = 0;
  for (const p of all) {
    const s = p.specsJson as any;
    if (s && 'os' in s) {
      const { os: _os, ...rest } = s;
      await (prisma as any).globalProduct.update({ where: { id: p.id }, data: { specsJson: rest } });
      stripped++;
    }
  }
  if (stripped > 0) console.log(`🧹 ${stripped} kayıttan 'os' alanı silindi.`);
}

main()
  .catch(e => { console.error('❌ Hata:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
