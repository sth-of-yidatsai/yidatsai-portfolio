import { spawnSync } from 'child_process';
import { readFile, readdir, writeFile } from 'fs/promises';
import { join, extname, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PROJECTS_JSON = join(ROOT, 'src', 'data', 'projects.json');
const ALTS_JSON = join(ROOT, 'src', 'data', 'image-alts.json');
const PUBLIC_PROJECTS = join(ROOT, 'public', 'images', 'projects');

const WIDTHS = [800, 1200, 1600, 2400, 3200];
const SKIP_FILES = new Set(['og.jpg', 'title.svg', 'og.png', 'og.webp']);

function isVariant(name) {
  return WIDTHS.some((w) => name.endsWith(`-${w}`));
}

async function loadJson(path) {
  try {
    const text = await readFile(path, 'utf-8');
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function getProjectImages(projectId) {
  const dir = join(PUBLIC_PROJECTS, projectId);
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    console.warn(`  [warn] Directory not found: ${dir}`);
    return [];
  }
  return entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((name) => {
      const ext = extname(name).toLowerCase();
      if (!['.webp', '.jpg', '.jpeg', '.png'].includes(ext)) return false;
      if (SKIP_FILES.has(name)) return false;
      const stem = basename(name, ext);
      if (isVariant(stem)) return false;
      return true;
    });
}

function callClaude(prompt) {
  const result = spawnSync('claude', ['-p', prompt], {
    encoding: 'utf-8',
    timeout: 60000,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr?.trim() || 'claude CLI exited with error');
  return result.stdout.trim();
}

function generateAltEn(imagePath, project) {
  const prompt =
    `Read the image file at "${imagePath}" and write concise alt text for it (1–2 sentences). ` +
    `Focus on what is visually depicted — materials, colors, composition, typography style, or technique. ` +
    `Project context: "${project.title}". ` +
    `Output only the alt text in English, no explanation or preamble.`;
  return callClaude(prompt);
}

function generateAltZh(imagePath, project, enAlt) {
  const context = enAlt
    ? `English reference alt: "${enAlt}". `
    : '';
  const prompt =
    `Read the image file at "${imagePath}" and write concise Traditional Chinese (繁體中文) alt text for it (1–2 sentences). ` +
    `Focus on what is visually depicted — materials, colors, composition, typography style, or technique. ` +
    `${context}` +
    `Project context: "${project.title_zh ?? project.title}". ` +
    `Output only the alt text in Traditional Chinese, no explanation or preamble.`;
  return callClaude(prompt);
}

/**
 * Migrate an existing entry (string or object) to { en, zh } shape.
 * Returns { en, zh } — fields may be empty string if not yet generated.
 */
function normalizeEntry(value) {
  if (!value) return { en: '', zh: '' };
  if (typeof value === 'string') return { en: value, zh: '' };
  return { en: value.en ?? '', zh: value.zh ?? '' };
}

async function main() {
  const projects = await loadJson(PROJECTS_JSON);
  if (!projects) {
    console.error('Error: Could not read projects.json');
    process.exit(1);
  }

  const rawAlts = (await loadJson(ALTS_JSON)) ?? {};

  // Migrate all entries to { en, zh } shape
  const alts = {};
  for (const [key, val] of Object.entries(rawAlts)) {
    alts[key] = normalizeEntry(val);
  }

  let skipped = 0;
  let generated = 0;
  let errors = 0;

  const realProjects = projects.filter((p) => !p.id.startsWith('test-project-'));
  console.log(`Processing ${realProjects.length} projects...\n`);

  for (const project of realProjects) {
    const images = await getProjectImages(project.id);
    if (images.length === 0) {
      console.log(`[${project.id}] No images found, skipping.`);
      continue;
    }

    console.log(`[${project.id}] ${images.length} image(s) found`);

    for (const filename of images) {
      const key = `${project.id}/${filename}`;
      const entry = alts[key] ?? { en: '', zh: '' };
      const needEn = !entry.en;
      const needZh = !entry.zh;

      if (!needEn && !needZh) {
        console.log(`  ✓ ${filename} (cached)`);
        skipped++;
        alts[key] = entry;
        continue;
      }

      const imagePath = join(PUBLIC_PROJECTS, project.id, filename);

      // Generate EN if missing
      if (needEn) {
        process.stdout.write(`  → ${filename} [en] ... `);
        try {
          entry.en = generateAltEn(imagePath, project);
          generated++;
          console.log('done');
        } catch (err) {
          errors++;
          console.log(`ERROR: ${err.message}`);
        }
      }

      // Generate ZH if missing
      if (needZh) {
        process.stdout.write(`  → ${filename} [zh] ... `);
        try {
          entry.zh = generateAltZh(imagePath, project, entry.en);
          generated++;
          console.log('done');
        } catch (err) {
          errors++;
          console.log(`ERROR: ${err.message}`);
        }
      }

      alts[key] = entry;
    }
  }

  const sorted = Object.fromEntries(Object.entries(alts).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(ALTS_JSON, JSON.stringify(sorted, null, 2) + '\n', 'utf-8');

  console.log(`\nDone. Generated: ${generated}, Skipped (cached): ${skipped}, Errors: ${errors}`);
  console.log(`Saved to src/data/image-alts.json`);
}

main();
