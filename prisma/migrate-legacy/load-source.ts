import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Client } from 'pg';
import { legacyMapping } from './mapping';

export type LegacyRow = Record<string, unknown>;

const DATA_DIR = join(__dirname, 'data');

/** Parse CSV text into row cell arrays, respecting quotes and embedded newlines. */
function parseCsv(raw: string): string[][] {
  const rows: string[][] = [];
  let cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i]!;
    const next = raw[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      cells.push(current);
      current = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      // Treat \r\n as a single row break
      if (char === '\r' && next === '\n') i += 1;

      cells.push(current);
      // Skip blank lines outside quotes
      if (cells.some((cell) => cell.trim().length > 0)) {
        rows.push(cells);
      }
      cells = [];
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current);
  if (cells.some((cell) => cell.trim().length > 0)) {
    rows.push(cells);
  }

  return rows;
}

function coerceValue(raw: string): unknown {
  const value = raw.trim();

  if (value === '' || value.toLowerCase() === 'null') return null;
  if (value.toLowerCase() === 'true' || value === 't') return true;
  if (value.toLowerCase() === 'false' || value === 'f') return false;

  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }

  return value;
}

function loadFromCsv(filePath: string): LegacyRow[] {
  const raw = readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  const table = parseCsv(raw);

  if (table.length < 2) return [];

  const headers = (table[0] ?? []).map((header) => header.trim());
  const rows: LegacyRow[] = [];

  for (const cells of table.slice(1)) {
    const row: LegacyRow = {};

    headers.forEach((header, index) => {
      row[header] = coerceValue(cells[index] ?? '');
    });

    rows.push(row);
  }

  return rows;
}

function loadFromJson(filePath: string): LegacyRow[] {
  const raw = readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw) as LegacyRow[] | { rows: LegacyRow[] };

  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.rows)) return parsed.rows;

  throw new Error(`Invalid JSON format in ${filePath}. Expected an array or { rows: [] }`);
}

/**
 * Resolve a data file for a logical dataset key.
 * Accepts: categories.json, categories.csv, categories_rows.csv, etc.
 */
function resolveDataFile(key: string): string | null {
  if (!existsSync(DATA_DIR)) return null;

  const candidates = [
    `${key}.json`,
    `${key}.csv`,
    `${key}_rows.csv`,
    `${key}_rows.json`,
  ];

  for (const candidate of candidates) {
    const fullPath = join(DATA_DIR, candidate);
    if (existsSync(fullPath)) return fullPath;
  }

  // Fuzzy: any file starting with the key
  const match = readdirSync(DATA_DIR).find(
    (name) =>
      name.toLowerCase().startsWith(key.toLowerCase()) &&
      (name.endsWith('.csv') || name.endsWith('.json')),
  );

  return match ? join(DATA_DIR, match) : null;
}

function loadFileDataset(key: string, optional = false): LegacyRow[] {
  const filePath = resolveDataFile(key);

  if (!filePath) {
    if (optional) {
      console.warn(`  [skip] ${key}: no file found in prisma/migrate-legacy/data/`);
      return [];
    }

    console.warn(
      `  [skip] ${key}: expected one of ${key}.csv / ${key}_rows.csv / ${key}.json`,
    );
    return [];
  }

  const rows = filePath.endsWith('.csv') ? loadFromCsv(filePath) : loadFromJson(filePath);
  console.log(`  [ok] ${filePath.split(/[/\\]/).pop()}: ${rows.length} rows`);
  return rows;
}

async function loadTablesFromDatabase(
  tableNames: { key: string; table: string; optional?: boolean }[],
): Promise<Record<string, LegacyRow[]>> {
  const connectionString = process.env.SOURCE_DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'SOURCE_DATABASE_URL is not set. Use LEGACY_SOURCE_MODE=json and drop CSV/JSON files into prisma/migrate-legacy/data/ instead.',
    );
  }

  const client = new Client({
    connectionString,
    ssl: connectionString.includes('supabase.co') ? { rejectUnauthorized: false } : undefined,
  });

  await client.connect();

  const result: Record<string, LegacyRow[]> = {};

  try {
    for (const entry of tableNames) {
      if (!entry.table) {
        result[entry.key] = [];
        console.log(`  [skip] ${entry.key}: no table configured`);
        continue;
      }

      try {
        const query = await client.query(`SELECT * FROM public."${entry.table}"`);
        result[entry.key] = query.rows as LegacyRow[];
        console.log(`  [ok] ${entry.table}: ${query.rows.length} rows`);
      } catch (error) {
        if (entry.optional) {
          console.warn(`  [skip] ${entry.table}: ${error instanceof Error ? error.message : error}`);
          result[entry.key] = [];
        } else {
          throw error;
        }
      }
    }
  } finally {
    await client.end();
  }

  return result;
}

export async function loadLegacyDataset() {
  const { tables, source } = legacyMapping;
  const mode = source.mode === 'database' ? 'database' : 'json';

  if (mode === 'json') {
    console.log('Loading legacy data from files in prisma/migrate-legacy/data/ ...');
    return {
      categories: loadFileDataset('categories'),
      products: loadFileDataset('products'),
      images: loadFileDataset('images'),
      descriptions: loadFileDataset('descriptions', true),
      variants: loadFileDataset('variants', true),
    };
  }

  console.log('Loading legacy data from SOURCE_DATABASE_URL ...');

  const loaded = await loadTablesFromDatabase([
    { key: 'categories', table: tables.categories },
    { key: 'products', table: tables.products },
    { key: 'images', table: tables.images },
    { key: 'descriptions', table: tables.descriptions, optional: true },
    { key: 'variants', table: tables.variants, optional: true },
  ]);

  return {
    categories: loaded.categories ?? [],
    products: loaded.products ?? [],
    images: loaded.images ?? [],
    descriptions: loaded.descriptions ?? [],
    variants: loaded.variants ?? [],
  };
}
