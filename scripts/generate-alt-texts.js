import Anthropic from '@anthropic-ai/sdk';
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

function isSkipped(filename) {
  return SKIP_FILES.has(filename);
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
      if (ext !== '.webp' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') return false;
      if (isSkipped(name)) return false;
      const stem = basename(name, ext);
      if (isVariant(stem)) return false;
      return true;
    });
}

async function generateAltText(client, imagePath, project) {
  const buffer = await readFile(imagePath);
  const base64 = buffer.toString('base64');
  const ext = extname(imagePath).toLowerCase().replace('.', '');
  const mediaType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 150,
    system:
      'You are an accessibility specialist writing image alt text for a graphic design portfolio. ' +
      'Be descriptive and specific about what is visually depicted — materials, colors, composition, typography style, or technique. ' +
      'Write 1–2 concise sentences. Do not start with "This image shows" or "An image of".',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          },
          {
            type: 'text',
            text: `Project: "${project.title}"${project.description ? ` — ${project.description}` : ''}. Write alt text for this image.`,
          },
        ],
      },
    ],
  });

  return response.content[0].text.trim();
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Error: ANTHROPIC_API_KEY environment variable is not set.');
    process.exit(1);
  }

  const client = new Anthropic();
  const projects = await loadJson(PROJECTS_JSON);
  if (!projects) {
    console.error('Error: Could not read projects.json');
    process.exit(1);
  }

  const alts = (await loadJson(ALTS_JSON)) ?? {};

  let skipped = 0;
  let generated = 0;
  let errors = 0;

  // Only process real projects (skip test placeholders)
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
      if (alts[key] !== undefined) {
        console.log(`  ✓ ${filename} (cached)`);
        skipped++;
        continue;
      }

      const imagePath = join(PUBLIC_PROJECTS, project.id, filename);
      process.stdout.write(`  → ${filename} ... `);

      try {
        const altText = await generateAltText(client, imagePath, project);
        alts[key] = altText;
        generated++;
        console.log('done');
      } catch (err) {
        errors++;
        console.log(`ERROR: ${err.message}`);
      }
    }
  }

  // Sort keys alphabetically for stable diffs
  const sorted = Object.fromEntries(Object.entries(alts).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(ALTS_JSON, JSON.stringify(sorted, null, 2) + '\n', 'utf-8');

  console.log(`\nDone. Generated: ${generated}, Skipped (cached): ${skipped}, Errors: ${errors}`);
  console.log(`Saved to src/data/image-alts.json`);
}

main();
