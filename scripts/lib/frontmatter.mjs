function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function parseScalar(raw) {
  const val = raw.trim();
  if (val === 'true') return true;
  if (val === 'false') return false;
  if (/^\d+$/.test(val)) return Number.parseInt(val, 10);
  if (val.startsWith('[') && val.endsWith(']')) {
    const inner = val.slice(1, -1).trim();
    return inner
      ? inner.split(',').map((item) => stripQuotes(item.trim()))
      : [];
  }
  return stripQuotes(val);
}

/**
 * Parses YAML-style MDX frontmatter including scalar fields, string lists,
 * and nested object lists such as researchReferences.
 */
export function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return null;

  const yamlText = match[1];
  const body = match[2];
  const data = {};
  const lines = yamlText.split(/\r?\n/);

  let currentArrayKey = null;
  let currentArrayObject = null;

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const arrayItem = line.match(/^\s+-\s+(.*)$/);
    if (arrayItem && currentArrayKey) {
      const itemRaw = arrayItem[1].trim();
      const isQuoted =
        (itemRaw.startsWith('"') && itemRaw.endsWith('"')) ||
        (itemRaw.startsWith("'") && itemRaw.endsWith("'"));
      const subKv = !isQuoted ? itemRaw.match(/^([A-Za-z0-9_]+):\s*(.*)$/) : null;

      if (subKv) {
        const obj = { [subKv[1]]: parseScalar(subKv[2]) };
        data[currentArrayKey].push(obj);
        currentArrayObject = obj;
      } else {
        data[currentArrayKey].push(stripQuotes(itemRaw));
        currentArrayObject = null;
      }
      continue;
    }

    const nestedKv = line.match(/^\s{2,}([A-Za-z0-9_]+):\s*(.*)$/);
    if (nestedKv && currentArrayObject) {
      currentArrayObject[nestedKv[1]] = parseScalar(nestedKv[2]);
      continue;
    }

    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!kv) {
      currentArrayKey = null;
      currentArrayObject = null;
      continue;
    }

    const [, key, rawValue] = kv;
    const val = rawValue.trim();

    if (val === '' || val === '[]') {
      data[key] = [];
      currentArrayKey = val === '' ? key : null;
      currentArrayObject = null;
    } else {
      data[key] = parseScalar(val);
      currentArrayKey = null;
      currentArrayObject = null;
    }
  }

  return { data, body };
}

export function isPublicArticleData(data) {
  const status = data.status ?? 'published';
  return data.draft !== true && status === 'published';
}

export function extractBodyHeadings(body) {
  const stripped = body.replace(/```[\s\S]*?```/g, '');
  const headings = [];
  for (const line of stripped.split(/\r?\n/)) {
    const match = line.match(/^#{2,3}\s+(.+)$/);
    if (match) {
      headings.push(match[1].replace(/[`*_]/g, '').trim());
    }
  }
  return headings;
}
