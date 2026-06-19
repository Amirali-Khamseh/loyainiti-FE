/**
 * Shared dangerous-content guard.
 *
 * Pattern-based detection of XSS / HTML / JS injection vectors in user input.
 * The frontends call this before sending any request body (so dangerous input
 * is never even sent); the backend calls it in a global preValidation hook as
 * the authoritative gate.
 *
 * IMPORTANT: this file is duplicated byte-for-byte in three places — there is no
 * shared package between the projects. Keep all copies in sync:
 *   - web/src/lib/contentGuard.ts
 *   - mobile/src/lib/contentGuard.ts
 *   - loyainiti-BE  src/lib/contentGuard.ts
 */

export type DangerousPattern = { name: string; regex: RegExp };

/**
 * Dictionary of dangerous patterns. Pattern-based and tuned for low false
 * positives: tag rules require a real `<tag` boundary and the event-handler
 * rule is anchored inside a tag, so plain text like "comparison = 3" or the
 * word "manuscript" is never flagged.
 */
export const DANGEROUS_PATTERNS: DangerousPattern[] = [
  // <script>, </iframe>, <svg ...>, <style>, etc.
  {
    name: 'dangerous-tag',
    regex: /<\s*\/?\s*(script|iframe|object|embed|svg|math|link|style|meta|base|form)\b/i,
  },
  // onerror=, onload=, onclick=, ... but only inside a tag (avoids "comparison=")
  { name: 'event-handler', regex: /<[^>]*\son\w+\s*=/i },
  // javascript: protocol URLs
  { name: 'javascript-uri', regex: /javascript\s*:/i },
  // data:text/html payloads
  { name: 'html-data-uri', regex: /data\s*:\s*text\/html/i },
  // eval( / Function( sinks — essentially never legitimate in human text
  { name: 'js-sink', regex: /\b(eval|Function)\s*\(/ },
];

export type UnsafeMatch = { rule: string; sample: string };

/**
 * Recursively scan `value` (strings, arrays, plain objects) for dangerous
 * content. Returns the first match found, or null when the value is clean.
 * `sample` is a short, truncated excerpt for logging — never echo it back to
 * end users.
 */
export function findUnsafeContent(value: unknown): UnsafeMatch | null {
  if (typeof value === 'string') {
    for (const { name, regex } of DANGEROUS_PATTERNS) {
      if (regex.test(value)) return { rule: name, sample: value.slice(0, 120) };
    }
    return null;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const hit = findUnsafeContent(item);
      if (hit) return hit;
    }
    return null;
  }
  if (value && typeof value === 'object') {
    for (const v of Object.values(value as Record<string, unknown>)) {
      const hit = findUnsafeContent(v);
      if (hit) return hit;
    }
    return null;
  }
  return null;
}

/** User-facing message shown when input is rejected. */
export const UNSAFE_INPUT_MESSAGE =
  "This contains content that isn't allowed (for example HTML tags or scripts).";

/**
 * react-hook-form `validate` rule (and handy for manual checks): returns `true`
 * when the value is clean, otherwise the error message to display.
 */
export function safeText(value: unknown): true | string {
  return findUnsafeContent(value) ? UNSAFE_INPUT_MESSAGE : true;
}
