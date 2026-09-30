const ALLOWED_URL_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

export function isValidUrl(value: string, options?: {allowHash?: boolean}): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (options?.allowHash && trimmed.startsWith("#")) return true;

  try {
    const parsed = new URL(trimmed);
    return ALLOWED_URL_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

export function isValidHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(trimmed);
}
