import type { ShikiTransformer } from 'shiki';

export interface CodeFenceMeta {
  title?: string;
  phpVersion?: string;
  caption?: string;
  showLineNumbers: boolean;
  highlightLines: Set<number>;
}

export interface ShikiTransformerOverrides {
  title?: string;
  phpVersion?: string;
  caption?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
}

interface HastText {
  type: 'text';
  value: string;
}

interface HastElement {
  type: 'element';
  tagName: string;
  properties: Record<string, unknown>;
  children: Array<HastElement | HastText | { type: string; value?: string; children?: unknown[] }>;
}

export function parseLineRangeMeta(rawMeta: string): Set<number> {
  const lines = new Set<number>();
  if (!rawMeta) return lines;

  // Match either `highlight={2,4-7}` or bare `{2,4-7}`
  const match = rawMeta.match(/(?:highlight\s*=\s*)?\{([0-9,\s-]+)\}/);
  if (!match?.[1]) return lines;

  const parts = match[1].split(',');
  for (const rawPart of parts) {
    const part = rawPart.trim();
    if (!part) continue;

    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = Number.parseInt(startStr.trim(), 10);
      const end = Number.parseInt(endStr.trim(), 10);
      if (Number.isInteger(start) && Number.isInteger(end) && start > 0 && end >= start) {
        const boundedEnd = Math.min(end, start + 500);
        for (let i = start; i <= boundedEnd; i++) {
          lines.add(i);
        }
      }
    } else {
      const num = Number.parseInt(part, 10);
      if (Number.isInteger(num) && num > 0) {
        lines.add(num);
      }
    }
  }

  return lines;
}

export function parseCodeFenceMeta(rawMeta: string | undefined): CodeFenceMeta {
  const raw = typeof rawMeta === 'string' ? rawMeta : '';
  const titleMatch = raw.match(/(?:title|filename)=["']([^"']+)["']/);
  const phpMatch = raw.match(/(?:php|version)=["']([^"']+)["']/);
  const captionMatch = raw.match(/caption=["']([^"']+)["']/);
  const showLineNumbers = /\b(?:showLineNumbers|lineNumbers)\b/.test(raw);
  const highlightLines = parseLineRangeMeta(raw);

  return {
    title: titleMatch?.[1],
    phpVersion: phpMatch?.[1],
    caption: captionMatch?.[1],
    showLineNumbers,
    highlightLines,
  };
}

function collectTextNodes(node: HastElement): HastText[] {
  const nodes: HastText[] = [];
  for (const child of node.children) {
    if (child.type === 'text' && typeof (child as HastText).value === 'string') {
      nodes.push(child as HastText);
    } else if (child.type === 'element') {
      nodes.push(...collectTextNodes(child as HastElement));
    }
  }
  return nodes;
}

function stripTrailingMarker(node: HastElement): 'diff-add' | 'diff-remove' | 'highlight' | null {
  const textNodes = collectTextNodes(node);
  const fullText = textNodes.map((n) => n.value).join('');
  const markerMatch = fullText.match(/\s*(?:\/\/|#)\s*\[!code\s+(\+\+|--|highlight)\]\s*$/);
  if (!markerMatch) return null;

  const kind =
    markerMatch[1] === '++'
      ? 'diff-add'
      : markerMatch[1] === '--'
        ? 'diff-remove'
        : 'highlight';

  let charsToTrim = markerMatch[0].length;
  for (let i = textNodes.length - 1; i >= 0 && charsToTrim > 0; i--) {
    const tn = textNodes[i];
    if (tn.value.length <= charsToTrim) {
      charsToTrim -= tn.value.length;
      tn.value = '';
    } else {
      tn.value = tn.value.slice(0, tn.value.length - charsToTrim);
      charsToTrim = 0;
    }
  }

  return kind;
}

export function createKhorshedShikiTransformer(
  overrides?: ShikiTransformerOverrides,
): ShikiTransformer {
  return {
    name: 'khorshed-advanced-code',
    pre(node) {
      if (this.options.lang) {
        node.properties['data-language'] = this.options.lang;
      }

      const parsed = parseCodeFenceMeta(this.options.meta?.__raw);
      const title = overrides?.title ?? parsed.title;
      const phpVersion = overrides?.phpVersion ?? parsed.phpVersion;
      const caption = overrides?.caption ?? parsed.caption;
      const showLineNumbers = overrides?.showLineNumbers ?? parsed.showLineNumbers;

      if (title) node.properties['data-title'] = title;
      if (phpVersion) node.properties['data-php-version'] = phpVersion;
      if (caption) node.properties['data-caption'] = caption;
      if (showLineNumbers) node.properties['data-line-numbers'] = 'true';
    },
    line(node, line) {
      node.properties['data-line'] = String(line);

      const parsed = parseCodeFenceMeta(this.options.meta?.__raw);
      const highlightSet = new Set(parsed.highlightLines);
      if (overrides?.highlightLines) {
        for (const n of overrides.highlightLines) highlightSet.add(n);
      }

      if (highlightSet.has(line)) {
        this.addClassToHast(node, 'highlighted');
        node.properties['data-highlighted'] = 'true';
      }

      const marker = stripTrailingMarker(node as unknown as HastElement);
      if (marker === 'diff-add') {
        this.addClassToHast(node, 'diff-add');
        node.properties['data-diff'] = '+';
      } else if (marker === 'diff-remove') {
        this.addClassToHast(node, 'diff-remove');
        node.properties['data-diff'] = '-';
      } else if (marker === 'highlight') {
        this.addClassToHast(node, 'highlighted');
        node.properties['data-highlighted'] = 'true';
      }
    },
  };
}
