export function stripDatePrefix(name: string): string {
  return name.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

export function postSlug(id: string): string {
  const parts = id.split('/');
  return stripDatePrefix(parts[parts.length - 1]);
}

export function projectSlug(id: string): string {
  return id.split('/')[0];
}
