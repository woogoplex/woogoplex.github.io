import path from 'node:path';
import { slug } from 'github-slugger';

/**
 * Files dragged into a note (PDF, slides, video, ...). Images are left to
 * Astro's own image pipeline; everything else is handled here.
 */
export type AttachmentKind = 'image' | 'pdf' | 'video' | 'audio' | 'file';

const IMAGE = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'tif', 'tiff']);
const VIDEO = new Set(['mp4', 'webm', 'mov', 'm4v']);
const AUDIO = new Set(['mp3', 'm4a', 'wav', 'ogg', 'aac', 'flac']);

export function attachmentKind(name: string): AttachmentKind {
  const ext = path.extname(name).slice(1).toLowerCase();
  if (IMAGE.has(ext)) return 'image';
  if (ext === 'pdf') return 'pdf';
  if (VIDEO.has(ext)) return 'video';
  if (AUDIO.has(ext)) return 'audio';
  return 'file';
}

/** True for a path relative to the note, as Obsidian writes them. */
export function isRelativeUrl(url: string): boolean {
  if (url.startsWith('/') || url.startsWith('#')) return false;
  return !/^[a-z][a-z0-9+.-]*:/i.test(url);
}

/** Splits `images/a.pdf#page=3` into the file path and the `?query#hash` tail. */
export function splitUrl(url: string): { path: string; suffix: string } {
  const at = url.search(/[?#]/);
  return at === -1 ? { path: url, suffix: '' } : { path: url.slice(0, at), suffix: url.slice(at) };
}

export type Resolved = { abs: string; site: string; href: string; name: string };

/**
 * Where a file under content/ lives on the site. Folders are slugified with
 * the same function Astro uses for page paths (so a project folder named
 * "Pokemon go investment" and its pages both end up under
 * /projects/pokemon-go-investment/); the file name itself is kept.
 */
export function sitePath(relativeToContent: string): string {
  const segments = relativeToContent.split('/');
  const name = segments.pop()!;
  // slug(value, maintainCase): call it explicitly so map's index isn't taken as maintainCase
  return [...segments.map((segment) => slug(segment)), name].join('/');
}

/**
 * Resolves a note-relative url to the file on disk (`abs`), its path on the
 * site (`site`, relative to the site root) and the url to link to (`href`).
 * Returns null when the path points outside the content folder.
 */
export function resolveAttachment(
  mdFile: string,
  contentDir: string,
  url: string,
  base = '/',
): Resolved | null {
  const abs = path.resolve(path.dirname(mdFile), decodeURIComponent(url));
  const rel = path.relative(contentDir, abs);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return null;
  const site = sitePath(rel.split(path.sep).join('/'));
  const prefix = base.endsWith('/') ? base.slice(0, -1) : base;
  return {
    abs,
    site,
    href: `${prefix}/${site.split('/').map(encodeURIComponent).join('/')}`,
    name: path.basename(abs),
  };
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export type AttachmentInfo = {
  kind: AttachmentKind | 'missing';
  href: string;
  name: string;
  size?: number;
};

export function attachmentHtml({ kind, href, name, size }: AttachmentInfo): string {
  const n = escapeHtml(name);
  const meta = [path.extname(name).slice(1).toUpperCase(), size !== undefined && formatBytes(size)]
    .filter(Boolean)
    .join(' · ');
  switch (kind) {
    case 'pdf':
      return (
        `<figure class="attachment attachment-pdf">` +
        `<object data="${href}" type="application/pdf" aria-label="${n}"><a href="${href}">${n}</a></object>` +
        `<figcaption><a href="${href}" target="_blank" rel="noopener">Open ${n} ↗</a> · ${meta}</figcaption>` +
        `</figure>`
      );
    case 'video':
      return `<figure class="attachment attachment-video"><video controls preload="metadata" src="${href}"></video></figure>`;
    case 'audio':
      return `<figure class="attachment attachment-audio"><audio controls preload="metadata" src="${href}"></audio></figure>`;
    case 'missing':
      return `<p class="attachment attachment-missing">Missing file: ${n}</p>`;
    default:
      return (
        `<a class="attachment attachment-file" href="${href}" download>` +
        `<span class="attachment-name">${n}</span><span class="attachment-meta">${meta}</span>` +
        `</a>`
      );
  }
}
