#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const examplesDir = path.join(rootDir, 'examples');

function parseVersionTuple(versionStr) {
  const m = String(versionStr).match(/(\d+)\.(\d+)(?:\.(\d+))?/);
  if (!m) return null;
  return [
    Number.parseInt(m[1], 10),
    Number.parseInt(m[2], 10),
    Number.parseInt(m[3] ?? '0', 10),
  ];
}

function compareVersions(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

function discoverPhpBinaries() {
  const candidates = [
    process.env.PHP86_BIN,
    process.env.PHP85_BIN,
    process.env.PHP84_BIN,
    process.env.PHP_BIN,
    'php8.6',
    'php8.5',
    'php8.4',
    'php',
  ].filter(Boolean);

  const found = [];
  const seenVersions = new Set();

  for (const bin of candidates) {
    try {
      const versionOut = execFileSync(bin, ['-r', 'echo PHP_VERSION;'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();
      const tuple = parseVersionTuple(versionOut);
      if (tuple && !seenVersions.has(versionOut)) {
        seenVersions.add(versionOut);
        found.push({ bin, version: versionOut, tuple });
      }
    } catch {
      // Binary not available on this host
    }
  }

  return found.sort((a, b) => compareVersions(b.tuple, a.tuple));
}

function findExampleDirs(baseDir) {
  const results = [];
  for (const versionDir of fs.readdirSync(baseDir, { withFileTypes: true })) {
    if (!versionDir.isDirectory() || !versionDir.name.startsWith('php-')) continue;
    const fullVersionDir = path.join(baseDir, versionDir.name);

    for (const sub of fs.readdirSync(fullVersionDir, { withFileTypes: true })) {
      if (!sub.isDirectory()) continue;
      const examplePath = path.join(fullVersionDir, sub.name);
      const composerFile = path.join(examplePath, 'composer.json');
      if (fs.existsSync(composerFile)) {
        results.push({
          name: `${versionDir.name}/${sub.name}`,
          dir: examplePath,
          composerFile,
        });
      }
    }
  }
  return results.sort((a, b) => a.name.localeCompare(b.name));
}

function collectPhpFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectPhpFiles(full));
    } else if (entry.name.endsWith('.php')) {
      files.push(full);
    }
  }
  return files;
}

const availablePhps = discoverPhpBinaries();
console.log(
  '[validate:examples] Available PHP binaries:',
  availablePhps.length > 0
    ? availablePhps.map((p) => `${p.bin} (${p.version})`).join(', ')
    : 'none',
);

const examples = findExampleDirs(examplesDir);
let executedCount = 0;
let skippedCount = 0;
let failures = 0;

for (const example of examples) {
  const composer = JSON.parse(fs.readFileSync(example.composerFile, 'utf8'));
  const constraint = composer?.require?.php ?? '>=8.0';
  const minTuple = parseVersionTuple(constraint);

  const compatibleBin = minTuple
    ? availablePhps.find((p) => compareVersions(p.tuple, minTuple) >= 0)
    : availablePhps[0];

  if (!compatibleBin) {
    skippedCount++;
    console.log(
      `[validate:examples] UNVERIFIED / SKIPPED ${example.name} (requires ${constraint}; compatible PHP binary not installed on host)`,
    );
    continue;
  }

  const srcFiles = collectPhpFiles(path.join(example.dir, 'src'));
  const testFiles = collectPhpFiles(path.join(example.dir, 'tests'));

  try {
    for (const file of [...srcFiles, ...testFiles]) {
      execFileSync(compatibleBin.bin, ['-l', file], { stdio: 'pipe' });
    }

    for (const testFile of testFiles) {
      const out = execFileSync(compatibleBin.bin, [testFile], {
        encoding: 'utf8',
      }).trim();
      console.log(
        `[validate:examples] PASS ${example.name} via ${compatibleBin.bin} (${compatibleBin.version}): ${out}`,
      );
    }
    executedCount++;
  } catch (err) {
    failures++;
    console.error(`[validate:examples] FAIL ${example.name}:`, err.message);
  }
}

console.log(
  `[validate:examples] Summary: ${executedCount} verified, ${skippedCount} unverified/skipped, ${failures} failed.`,
);

if (failures > 0) {
  process.exit(1);
}
