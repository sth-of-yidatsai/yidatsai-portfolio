import sharp from 'sharp';
import { readdir, stat, writeFile } from 'fs/promises';
import { join, extname, basename, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '..', 'public');
const INPUT_DIR = join(PUBLIC_DIR, 'images');
const OUTPUT_MANIFEST = join(__dirname, '..', 'src', 'data', 'imageWidths.json');
const WIDTHS = [800, 1200, 1600];
const QUALITY = 85;

async function findWebpFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findWebpFiles(fullPath)));
    } else if (extname(entry.name).toLowerCase() === '.webp') {
      // Skip already-generated responsive variants
      const name = basename(entry.name, '.webp');
      if (!WIDTHS.some((w) => name.endsWith(`-${w}`))) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

async function processImage(srcPath) {
  const dir = dirname(srcPath);
  const name = basename(srcPath, '.webp');
  const webPath = '/' + relative(PUBLIC_DIR, srcPath).replace(/\\/g, '/');

  const { width } = await sharp(srcPath).metadata();

  for (const w of WIDTHS) {
    const outPath = join(dir, `${name}-${w}.webp`);

    try {
      await stat(outPath);
      console.log(`  skip  ${outPath.replace(INPUT_DIR, '')}`);
      continue;
    } catch {
      // File doesn't exist, proceed
    }

    await sharp(srcPath)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(outPath);

    console.log(`  wrote ${outPath.replace(INPUT_DIR, '')}`);
  }

  return { webPath, width };
}

async function main() {
  console.log('Scanning', INPUT_DIR);
  const files = await findWebpFiles(INPUT_DIR);
  console.log(`Found ${files.length} source images\n`);

  const manifest = {};

  for (const file of files) {
    console.log(file.replace(INPUT_DIR, ''));
    const { webPath, width } = await processImage(file);
    manifest[webPath] = width;
  }

  await writeFile(OUTPUT_MANIFEST, JSON.stringify(manifest, null, 2));
  console.log(`\nWrote manifest → ${OUTPUT_MANIFEST}`);
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
