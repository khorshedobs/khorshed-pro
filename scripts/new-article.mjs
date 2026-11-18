#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const rootDir = process.cwd();
const articlesDir = path.join(rootDir, 'src/content/articles');
const seriesDir = path.join(rootDir, 'src/content/series');
const roadmapPath = path.join(rootDir, 'src/data/editorial-roadmap.json');

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const eqIndex = token.indexOf('=');
    if (eqIndex !== -1) {
      const k = token.slice(2, eqIndex);
      args[k] = token.slice(eqIndex + 1);
    } else {
      const k = token.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[k] = next;
        i++;
      } else {
        args[k] = true;
      }
    }
  }
  return args;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function promptMissing(args) {
  const availableSeries = fs
    .readdirSync(seriesDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''));

  let rl;
  const ask = async (question, fallback) => {
    if (!input.isTTY && fallback !== undefined) return fallback;
    if (!rl) rl = readline.createInterface({ input, output });
    const suffix = fallback ? ` [${fallback}]` : '';
    const answer = (await rl.question(`${question}${suffix}: `)).trim();
    return answer || fallback;
  };

  try {
    const title = args.title || (await ask('Article title'));
    if (!title) {
      throw new Error('Article title is required.');
    }

    const phpVersion = args.php || (await ask('PHP version (e.g. 8.4, 8.5, 8.6)', '8.4'));
    const series =
      args.series ||
      (await ask(`Series ID (${availableSeries.join(', ')})`, 'modern-php-mastery'));
    if (!availableSeries.includes(series)) {
      throw new Error(`Unknown series "${series}". Valid series: ${availableSeries.join(', ')}`);
    }

    const defaultSlug = slugify(
      title.toLowerCase().startsWith('php') ? title : `php-${phpVersion.replace('.', '')}-${title}`,
    );
    const slug = slugify(args.slug || (await ask('Article slug', defaultSlug)));
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      throw new Error(`Invalid slug "${slug}".`);
    }

    const sectionCategory =
      args.section ||
      (await ask(
        'Section category (Language Features | Object-Oriented Design | Functional Programming | Performance | Architecture | Security | Compatibility)',
        'Language Features',
      ));

    const difficulty =
      args.difficulty || (await ask('Difficulty (Beginner | Intermediate | Advanced)', 'Intermediate'));

    const orderRaw = args.order || (await ask('Series order (integer)', ''));
    const seriesOrder = orderRaw ? Number.parseInt(String(orderRaw), 10) : undefined;

    let addToRoadmap = Boolean(args['add-to-roadmap']);
    if (args['add-to-roadmap'] === undefined && process.stdin.isTTY && !args.title) {
      const resp = await ask('Register in editorial-roadmap.json if absent? (y/N)', 'N');
      addToRoadmap = resp.toLowerCase() === 'y' || resp.toLowerCase() === 'yes';
    }

    return {
      title,
      phpVersion,
      series,
      slug,
      sectionCategory,
      difficulty,
      seriesOrder,
      addToRoadmap,
    };
  } finally {
    if (rl) rl.close();
  }
}

const args = parseArgs(process.argv.slice(2));
const config = await promptMissing(args);

const targetFile = path.join(articlesDir, `${config.slug}.mdx`);
if (fs.existsSync(targetFile)) {
  console.error(`[article:new] Refusing to overwrite existing file: ${targetFile}`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const phpFolder = `php-${config.phpVersion.replace('.', '-')}`;
const topicPart = config.slug.replace(/^php-\d+-/, '');

const orderLine = config.seriesOrder ? `seriesOrder: ${config.seriesOrder}\n` : '';
const content = `---
title: "${config.title.replace(/"/g, '\\"')}"
description: "Draft technical guide covering ${config.title.replace(/"/g, '\\"')} in PHP ${config.phpVersion}."
publishedAt: ${today}
draft: true
status: "drafting"
featured: false
category: "PHP"
sectionCategory: "${config.sectionCategory}"
tags:
  - "php"
  - "php-${config.phpVersion}"
  - "modern-php"
series: "${config.series}"
${orderLine}phpVersion: "${config.phpVersion}"
minimumPhpVersion: "${config.phpVersion}"
testedPhpVersions: []
technicalVerificationStatus: "${config.phpVersion === '8.6' ? 'awaiting-php-release' : 'unverified'}"
requiredExtensions: []
difficulty: "${config.difficulty}"
author: "Khorshed Alam"
repositoryURL: "https://github.com/khorshedobs/khorshed-pro"
# examplePath: "examples/${phpFolder}/${topicPart}/"
# testsPath: "examples/${phpFolder}/${topicPart}/tests/"
researchReferences:
  - title: "PHP Manual"
    url: "https://www.php.net/manual/en/"
    status: "Released Documentation"
relatedArticles: []
isSampleContent: false
---
import CodeComparison from '@/components/article/CodeComparison.astro';
import Callout from '@/components/article/Callout.astro';

## Introduction

Introduce the engineering problem addressed in **${config.title}**.

<Callout type="compatibility" title="PHP ${config.phpVersion} Compatibility">
  Target runtime: PHP ${config.phpVersion}+. Verification status: pending local runtime execution.
</Callout>

## The Engineering Problem

Explain why earlier patterns fell short.

## Traditional Implementation

\`\`\`php title="src/Before.php" showLineNumbers
<?php

declare(strict_types=1);
\`\`\`

## New PHP ${config.phpVersion} Approach

\`\`\`php title="src/After.php" php="${config.phpVersion}" showLineNumbers
<?php

declare(strict_types=1);
\`\`\`

## When to Use — and When Not to Use

- **Use it when:** ...
- **Avoid it when:** ...

## Official References

- [PHP Documentation](https://www.php.net/)
`;

fs.writeFileSync(targetFile, content, 'utf8');
console.log(`[article:new] Created draft article: src/content/articles/${config.slug}.mdx`);

if (config.addToRoadmap && fs.existsSync(roadmapPath)) {
  const roadmap = JSON.parse(fs.readFileSync(roadmapPath, 'utf8'));
  const exists = roadmap.articles.some((entry) => entry.slug === config.slug);
  if (exists) {
    console.log(`[article:new] Slug "${config.slug}" is already tracked in src/data/editorial-roadmap.json.`);
  } else {
    const nextOrder =
      config.seriesOrder ??
      Math.max(0, ...roadmap.articles.map((a) => a.seriesOrder ?? 0)) + 1;
    const nextIdNum = roadmap.articles.length + 1;
    roadmap.articles.push({
      id: `mpm-${String(nextIdNum).padStart(2, '0')}`,
      title: config.title,
      slug: config.slug,
      phpVersion: config.phpVersion,
      seriesId: config.series,
      seriesOrder: nextOrder,
      difficulty: config.difficulty,
      category: config.sectionCategory,
      targetAudience: 'PHP developers',
      learningObjective: `Understand and apply ${config.title} reliably.`,
      primaryProblem: 'Draft roadmap entry.',
      technicalConcepts: [],
      proposedExamples: [`examples/${phpFolder}/${topicPart}/`],
      researchReferences: ['https://www.php.net/manual/en/'],
      relatedArticles: [],
      primarySearchIntent: config.title.toLowerCase(),
      editorialStatus: 'Drafting',
      technicalVerificationStatus:
        config.phpVersion === '8.6' ? 'awaiting-php-release' : 'unverified',
      editorialApprovalStatus: 'pending',
      socialDistributionStatus: 'not-generated',
    });
    fs.writeFileSync(roadmapPath, JSON.stringify(roadmap, null, 2) + '\n', 'utf8');
    console.log(`[article:new] Added "${config.slug}" to src/data/editorial-roadmap.json.`);
  }
}
