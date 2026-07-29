import * as fs from 'fs';
import * as path from 'path';

function main() {
  const mapPath = path.join(__dirname, '../unique_235_supabase_map.json');
  if (!fs.existsSync(mapPath)) {
    console.error('unique_235_supabase_map.json not found!');
    return;
  }
  const data = JSON.parse(fs.readFileSync(mapPath, 'utf-8'));
  const entries = Object.entries(data);

  console.log(`Map has ${entries.length} entries.`);
  
  // Let's print the first 20 entries
  console.log('First 20 entries:');
  for (const [id, val] of entries.slice(0, 20)) {
    console.log(`- ID: ${id}`);
    console.log(`  Val:`, val);
  }
}

main();
