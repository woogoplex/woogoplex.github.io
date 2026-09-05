export function joinBase(base: string, path: string): string {
  return (base.endsWith('/') ? base.slice(0, -1) : base) + path;
}

export function href(path: string): string {
  return joinBase(import.meta.env.BASE_URL, path);
}
