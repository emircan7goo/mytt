const fs = require('fs');

async function run() {
  const jsonPath = 'C:\\Users\\emirc\\Downloads\\semih_iletisim_auto_backup.json';
  if (!fs.existsSync(jsonPath)) {
    console.error('JSON file not found at:', jsonPath);
    return;
  }

  const raw = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(raw);
  const devices = data.devices || [];
  const stockDevices = devices.filter(d => d.status === 'stock');

  console.log(`Found ${stockDevices.length} stock devices to import.`);

  const url = 'https://mytt.com.tr/api/semih-import';
  console.log('Posting to live production API endpoint:', url);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-import-secret': 'semih-mytt-2026-import-xK9mP3'
      },
      body: JSON.stringify({ devices: stockDevices })
    });

    const text = await res.text();
    console.log('HTTP Status:', res.status);
    console.log('Response:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

run();
