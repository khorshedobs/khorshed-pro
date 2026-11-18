#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const TEMPLATE_VERSION = 'v1';
const WIDTH = 1200;
const HEIGHT = 630;

const rootDir = process.cwd();
const articlesDir = path.join(rootDir, 'src/content/articles');
const seriesDir = path.join(rootDir, 'src/content/series');
const publicOgDir = path.join(rootDir, 'public/og');
const publicArticleOgDir = path.join(publicOgDir, 'articles');
const cacheFile = path.join(rootDir, '.astro/og-cache.json');

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return {};
  const data = {};
  const lines = match[1].split(/\r?\n/);
  let currentArrayKey = null;

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const arrayItem = line.match(/^\s+-\s+(.*)$/);
    if (arrayItem && currentArrayKey) {
      data[currentArrayKey].push(stripQuotes(arrayItem[1].trim()));
      continue;
    }
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!kv) {
      currentArrayKey = null;
      continue;
    }
    const [, key, rawValue] = kv;
    const val = rawValue.trim();
    if (val === '' || val === '[]') {
      data[key] = [];
      currentArrayKey = val === '' ? key : null;
    } else if (val === 'true') {
      data[key] = true;
      currentArrayKey = null;
    } else if (val === 'false') {
      data[key] = false;
      currentArrayKey = null;
    } else {
      data[key] = stripQuotes(val);
      currentArrayKey = null;
    }
  }
  return data;
}

function wrapTitle(title, maxCharsPerLine, maxLines = 3) {
  const words = String(title).trim().split(/\s+/);
  const lines = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharsPerLine) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) break;
    }
  }

  if (lines.length < maxLines && current) {
    const consumedWordCount = lines.join(' ').split(/\s+/).filter(Boolean).length;
    const remainingWords = words.slice(consumedWordCount).join(' ');
    let lastLine = remainingWords || current;
    if (lastLine.length > maxCharsPerLine + 2) {
      lastLine = `${lastLine.slice(0, maxCharsPerLine - 1).trimEnd()}...`;
    }
    lines.push(lastLine);
  }

  return lines;
}

export function buildOgSvg({
  title,
  eyebrow,
  phpVersion,
  subtitle,
}) {
  const isLongTitle = title.length > 52;
  const fontSize = isLongTitle ? 44 : 52;
  const lineHeight = isLongTitle ? 56 : 64;
  const maxChars = isLongTitle ? 36 : 30;
  const lines = wrapTitle(title, maxChars, 3);

  const startY = lines.length === 3 ? 238 : lines.length === 2 ? 258 : 292;
  const titleSvg = lines
    .map(
      (line, index) =>
        `<text x="84" y="${startY + index * lineHeight}" fill="#F8FAFC" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'DejaVu Sans', sans-serif" font-size="${fontSize}" font-weight="700" letter-spacing="-0.02em">${escapeXml(line)}</text>`,
    )
    .join('\n  ');

  const eyebrowText = escapeXml(eyebrow || 'Technical Publication');
  const eyebrowWidth = Math.max(180, eyebrowText.length * 10 + 36);
  const phpBadge = phpVersion
    ? `<rect x="${84 + eyebrowWidth + 14}" y="96" width="112" height="36" rx="8" fill="#192337" stroke="#29364B" stroke-width="1.5"/>
  <text x="${84 + eyebrowWidth + 70}" y="120" text-anchor="middle" fill="#C4B5FD" font-family="'JetBrains Mono', 'SFMono-Regular', 'DejaVu Sans Mono', monospace" font-size="16" font-weight="700">${escapeXml(`PHP ${phpVersion}`)}</text>`
    : '';

  const subtitleSvg = subtitle
    ? `<text x="84" y="${startY + lines.length * lineHeight + 22}" fill="#A3B3C7" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'DejaVu Sans', sans-serif" font-size="22" font-weight="400">${escapeXml(subtitle.length > 78 ? `${subtitle.slice(0, 75).trimEnd()}...` : subtitle)}</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#0B1020"/>
  <rect x="28" y="28" width="${WIDTH - 56}" height="${HEIGHT - 56}" rx="20" fill="#111827" stroke="#29364B" stroke-width="2"/>
  <rect x="28" y="28" width="${WIDTH - 56}" height="6" rx="3" fill="#7C3AED"/>

  <!-- Eyebrow & PHP Version -->
  <rect x="84" y="96" width="${eyebrowWidth}" height="36" rx="8" fill="#1E1B4B" stroke="#7C3AED" stroke-opacity="0.5" stroke-width="1.5"/>
  <text x="${84 + eyebrowWidth / 2}" y="120" text-anchor="middle" fill="#C4B5FD" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'DejaVu Sans', sans-serif" font-size="15" font-weight="600">${eyebrowText}</text>
  ${phpBadge}

  <!-- Title -->
  ${titleSvg}
  ${subtitleSvg}

  <!-- Footer Author Bar -->
  <line x1="84" y1="490" x2="${WIDTH - 84}" y2="490" stroke="#29364B" stroke-width="1.5"/>
  <rect x="84" y="514" width="48" height="48" rx="12" fill="#192337" stroke="#7C3AED" stroke-opacity="0.55" stroke-width="1.5"/>
  <text x="108" y="545" text-anchor="middle" fill="#A78BFA" font-family="'JetBrains Mono', 'SFMono-Regular', 'DejaVu Sans Mono', monospace" font-size="20" font-weight="700">KA</text>
  <text x="150" y="534" fill="#F8FAFC" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'DejaVu Sans', sans-serif" font-size="22" font-weight="600">Khorshed Alam</text>
  <text x="150" y="560" fill="#A3B3C7" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'DejaVu Sans', sans-serif" font-size="16" font-weight="400">Software Engineer &amp; Technical Writer</text>
  <text x="${WIDTH - 84}" y="546" text-anchor="end" fill="#A78BFA" font-family="'JetBrains Mono', 'SFMono-Regular', 'DejaVu Sans Mono', monospace" font-size="22" font-weight="600">khorshed.pro</text>
</svg>`;
}

export async function generateAllOgImages() {
  fs.mkdirSync(publicOgDir, { recursive: true });
  fs.mkdirSync(publicArticleOgDir, { recursive: true });
  fs.mkdirSync(path.dirname(cacheFile), { recursive: true });

  let cache = {};
  if (fs.existsSync(cacheFile)) {
    try {
      cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    } catch {
      cache = {};
    }
  }

  const seriesTitles = new Map();
  if (fs.existsSync(seriesDir)) {
    for (const f of fs.readdirSync(seriesDir).filter((x) => x.endsWith('.json'))) {
      const sData = JSON.parse(fs.readFileSync(path.join(seriesDir, f), 'utf8'));
      seriesTitles.set(f.replace(/\.json$/, ''), sData.title);
    }
  }

  const nextCache = {};
  let generated = 0;
  let cached = 0;

  const renderIfChanged = async (key, outPath, spec) => {
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify({ TEMPLATE_VERSION, ...spec }))
      .digest('hex');

    nextCache[key] = hash;
    if (cache[key] === hash && fs.existsSync(outPath)) {
      cached++;
      return;
    }

    const svg = buildOgSvg(spec);
    await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(outPath);
    generated++;
  };

  // Fallback default preview
  await renderIfChanged('__default__', path.join(publicOgDir, 'default.png'), {
    title: 'Building software. Sharing knowledge.',
    eyebrow: 'khorshed.pro',
    subtitle: 'Modern PHP, Laravel, WordPress, and reliable backend engineering.',
  });

  // Public articles only — drafts and unpublished articles are strictly excluded
  const activePublicSlugs = new Set();
  const articleFiles = fs
    .readdirSync(articlesDir)
    .filter((f) => f.endsWith('.mdx') && !f.startsWith('_'));

  for (const file of articleFiles) {
    const slug = file.replace(/\.mdx$/, '');
    const raw = fs.readFileSync(path.join(articlesDir, file), 'utf8');
    const data = parseFrontmatter(raw);
    const status = data.status ?? 'published';
    const isPublic = data.draft !== true && status === 'published';

    if (!isPublic) continue;
    activePublicSlugs.add(slug);

    const seriesName = data.series
      ? seriesTitles.get(data.series) ?? data.category ?? 'Technical Article'
      : data.category ?? 'Technical Article';

    await renderIfChanged(slug, path.join(publicArticleOgDir, `${slug}.png`), {
      title: data.title ?? slug,
      eyebrow: seriesName,
      phpVersion: data.phpVersion,
      subtitle: data.description,
    });
  }

  // Remove any stale or draft PNG files
  for (const existing of fs.readdirSync(publicArticleOgDir)) {
    if (!existing.endsWith('.png')) continue;
    const slug = existing.replace(/\.png$/, '');
    if (!activePublicSlugs.has(slug)) {
      fs.unlinkSync(path.join(publicArticleOgDir, existing));
    }
  }

  fs.writeFileSync(cacheFile, JSON.stringify(nextCache, null, 2) + '\n', 'utf8');
  return { generated, cached, publicCount: activePublicSlugs.size };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await generateAllOgImages();
  console.log(
    `[og:generate] Ready (${result.publicCount} public article OG previews + 1 fallback; ${result.generated} rendered, ${result.cached} cached).`,
  );
}
