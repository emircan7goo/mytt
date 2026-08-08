const fs = require('fs');

const jsonPath = 'C:\\Users\\emirc\\Downloads\\semih_iletisim_auto_backup.json';
const raw = fs.readFileSync(jsonPath, 'utf8');
const data = JSON.parse(raw);

console.log('--- JSON GENEL ÖZETİ ---');
console.log('Keys in JSON:', Object.keys(data));

if (data.devices) {
  console.log('Total devices count:', data.devices.length);
  
  const statusCounts = {};
  data.devices.forEach(d => {
    const s = d.status || 'BELİRSİZ';
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  });

  console.log('\n--- STATUS (DURUM) DAĞILIMI ---');
  console.log(JSON.stringify(statusCounts, null, 2));

  console.log('\n--- MARKA DAĞILIMI (TÜM CİHAZLAR) ---');
  const brandCounts = {};
  data.devices.forEach(d => {
    const b = d.brand || 'BİLİNMEYEN';
    brandCounts[b] = (brandCounts[b] || 0) + 1;
  });
  console.log(JSON.stringify(brandCounts, null, 2));

  console.log('\n--- MARKA DAĞILIMI (SADECE STOKTAKİLER - status: "stock") ---');
  const stockBrandCounts = {};
  data.devices.filter(d => d.status === 'stock').forEach(d => {
    const b = d.brand || 'BİLİNMEYEN';
    stockBrandCounts[b] = (stockBrandCounts[b] || 0) + 1;
  });
  console.log(JSON.stringify(stockBrandCounts, null, 2));
}

if (data.customers) console.log('Customers count:', data.customers.length);
if (data.sales) console.log('Sales count:', data.sales.length);
if (data.expenses) console.log('Expenses count:', data.expenses.length);
