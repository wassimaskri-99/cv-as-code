/** Every string in a parsed YAML value, with its path (e.g. "experience[0].bullets[2]"). */
export function collectStrings(value: unknown, path = ''): { path: string; value: string }[] {
  if (typeof value === 'string') return [{ path, value }];
  if (Array.isArray(value))
    return value.flatMap((item, i) => collectStrings(item, `${path}[${String(i)}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) =>
      collectStrings(item, path ? `${path}.${key}` : key),
    );
  }
  return [];
}
