import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Guards against reintroducing the exact class of vendor-identity leak fixed in the
// white-label rename (sauparnasarkar/design-system#1): a hardcoded "Syena"/"syena"
// string in a component or stylesheet that ships to consumers. *.stories.tsx files are
// intentionally excluded — they're design-system's own internal Storybook docs, never
// imported by any consumer, and are expected to demonstrate usage with Syena's own
// branding passed explicitly as example props.

const dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(dirname, '..');
const VENDOR_STRING_PATTERN = /syena/i;

function collectFiles(dir: string, predicate: (filePath: string) => boolean): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      results.push(...collectFiles(fullPath, predicate));
    } else if (predicate(fullPath)) {
      results.push(fullPath);
    }
  }
  return results;
}

function findViolations(filePaths: string[]): Array<{ file: string; line: number; text: string }> {
  const violations: Array<{ file: string; line: number; text: string }> = [];
  for (const filePath of filePaths) {
    const lines = readFileSync(filePath, 'utf-8').split('\n');
    lines.forEach((line, index) => {
      if (VENDOR_STRING_PATTERN.test(line)) {
        violations.push({ file: path.relative(SRC_DIR, filePath), line: index + 1, text: line.trim() });
      }
    });
  }
  return violations;
}

describe('no hardcoded vendor-identity strings', () => {
  it('component source (.tsx, excluding .stories.tsx) contains no "Syena"/"syena"', () => {
    const files = collectFiles(path.join(SRC_DIR, 'components'), (f) =>
      f.endsWith('.tsx') && !f.endsWith('.stories.tsx'),
    );
    const violations = findViolations(files);
    expect(violations, formatViolations(violations)).toHaveLength(0);
  });

  it('stylesheets (.css) contain no "Syena"/"syena"', () => {
    const files = collectFiles(path.join(SRC_DIR, 'styles'), (f) => f.endsWith('.css'));
    const violations = findViolations(files);
    expect(violations, formatViolations(violations)).toHaveLength(0);
  });
});

function formatViolations(violations: Array<{ file: string; line: number; text: string }>): string {
  if (violations.length === 0) return '';
  return (
    'Found hardcoded vendor-identity string(s):\n' +
    violations.map((v) => `  ${v.file}:${v.line}: ${v.text}`).join('\n')
  );
}
