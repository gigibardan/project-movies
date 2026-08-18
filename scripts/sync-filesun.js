// scripts/sync-filesun.js
const fs = require('fs');
const path = require('path');

const BASE = 'https://filesun.sbs/available';
const OUT_DIR = path.join(__dirname, '..', 'public', 'data');

async function fetchPage(type, page) {
  const res = await fetch(`${BASE}/${type}?page=${page}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${type} page ${page}`);
  return res.json();
}

async function syncType(type) {
  console.log(`[${type}] Fetching page 1...`);
  const first = await fetchPage(type, 1);
  const allIds = [...first.ids];
  console.log(`[${type}] Page 1: ${first.ids.length} ids, ${first.pages} total pages`);

  for (let i = 2; i <= first.pages; i++) {
    const data = await fetchPage(type, i);
    allIds.push(...data.ids);
    console.log(`[${type}] Page ${i}: ${data.ids.length} ids`);
  }

  console.log(`[${type}] Total: ${allIds.length} ids`);
  return allIds;
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const movies = await syncType('movies');
  const tv = await syncType('tv');

  const data = {
    updated: new Date().toISOString(),
    movies,
    tv,
  };

  const outPath = path.join(OUT_DIR, 'filesun-ids.json');
  fs.writeFileSync(outPath, JSON.stringify(data));
  
  const sizeMB = (Buffer.byteLength(JSON.stringify(data)) / 1024 / 1024).toFixed(2);
  console.log(`\nSaved to ${outPath} (${sizeMB} MB)`);
  console.log(`Movies: ${movies.length} | TV: ${tv.length}`);
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});