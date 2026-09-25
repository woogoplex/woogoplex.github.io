import { describe, expect, it } from 'vitest';
import {
  attachmentHtml,
  attachmentKind,
  formatBytes,
  isRelativeUrl,
  resolveAttachment,
  sitePath,
  splitUrl,
} from './attachments';

describe('sitePath', () => {
  it('slugifies folders the way Astro names project pages, and keeps the file name', () => {
    expect(sitePath('projects/Pokemon go investment/images/My Deck (1).pdf')).toBe('projects/pokemon-go-investment/images/My Deck (1).pdf');
    expect(sitePath('notes/images/x.pdf')).toBe('notes/images/x.pdf');
  });
});

describe('attachmentKind', () => {
  it('leaves image formats to Astro', () => {
    expect(attachmentKind('photo.png')).toBe('image');
    expect(attachmentKind('Photo.JPG')).toBe('image');
    expect(attachmentKind('icon.svg')).toBe('image');
  });
  it('recognises pdf, video and audio', () => {
    expect(attachmentKind('slides.pdf')).toBe('pdf');
    expect(attachmentKind('clip.mp4')).toBe('video');
    expect(attachmentKind('voice.m4a')).toBe('audio');
  });
  it('treats everything else as a downloadable file', () => {
    expect(attachmentKind('deck.pptx')).toBe('file');
    expect(attachmentKind('archive.zip')).toBe('file');
    expect(attachmentKind('noextension')).toBe('file');
  });
});

describe('isRelativeUrl', () => {
  it('accepts vault-relative paths', () => {
    expect(isRelativeUrl('images/slides.pdf')).toBe(true);
    expect(isRelativeUrl('../shared/a.pdf')).toBe(true);
  });
  it('rejects absolute, external, anchor and protocol urls', () => {
    expect(isRelativeUrl('/images/slides.pdf')).toBe(false);
    expect(isRelativeUrl('https://example.com/a.pdf')).toBe(false);
    expect(isRelativeUrl('#page-2')).toBe(false);
    expect(isRelativeUrl('mailto:someone@example.com')).toBe(false);
    expect(isRelativeUrl('data:application/pdf;base64,AAA')).toBe(false);
  });
});

describe('splitUrl', () => {
  it('separates the path from a fragment or query', () => {
    expect(splitUrl('images/a.pdf#page=3')).toEqual({ path: 'images/a.pdf', suffix: '#page=3' });
    expect(splitUrl('images/a.pdf?x=1#p')).toEqual({ path: 'images/a.pdf', suffix: '?x=1#p' });
    expect(splitUrl('images/a.pdf')).toEqual({ path: 'images/a.pdf', suffix: '' });
  });
});

describe('resolveAttachment', () => {
  const contentDir = '/site/content';
  const mdFile = '/site/content/projects/Pokemon go investment/2026-09-24-first-ppt.md';

  it('maps a note-relative url to the site path: folders slugified like Astro, file name kept', () => {
    const r = resolveAttachment(mdFile, contentDir, 'images/Pokemon%20Card%20presentation.pptx');
    expect(r).toEqual({
      abs: '/site/content/projects/Pokemon go investment/images/Pokemon Card presentation.pptx',
      site: 'projects/pokemon-go-investment/images/Pokemon Card presentation.pptx',
      href: '/projects/pokemon-go-investment/images/Pokemon%20Card%20presentation.pptx',
      name: 'Pokemon Card presentation.pptx',
    });
  });

  it('slugifies every folder segment, including upper case and unicode', () => {
    const r = resolveAttachment('/site/content/projects/AQT/2026-09-19-aqt.md', contentDir, 'images/한글 파일.pdf');
    expect(r?.site).toBe('projects/aqt/images/한글 파일.pdf');
    expect(r?.href).toBe('/projects/aqt/images/%ED%95%9C%EA%B8%80%20%ED%8C%8C%EC%9D%BC.pdf');
  });

  it('honours a base path', () => {
    const r = resolveAttachment('/site/content/notes/a.md', contentDir, 'images/x.pdf', '/demo');
    expect(r?.href).toBe('/demo/notes/images/x.pdf');
  });

  it('refuses paths that escape the content folder', () => {
    expect(resolveAttachment(mdFile, contentDir, '../../../etc/passwd')).toBeNull();
  });
});

describe('formatBytes', () => {
  it('picks a readable unit', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(907879)).toBe('887 KB');
    expect(formatBytes(1500000)).toBe('1.4 MB');
  });
});

describe('attachmentHtml', () => {
  it('renders a pdf as an inline viewer with an open link', () => {
    const html = attachmentHtml({ kind: 'pdf', href: '/a/b.pdf', name: 'b.pdf', size: 1024 });
    expect(html).toContain('<object data="/a/b.pdf" type="application/pdf"');
    expect(html).toContain('href="/a/b.pdf"');
    expect(html).toContain('1 KB');
  });
  it('renders other files as a download card and escapes the name', () => {
    const html = attachmentHtml({ kind: 'file', href: '/a/x.pptx', name: 'A & B <deck>.pptx', size: 907879 });
    expect(html).toContain('download');
    expect(html).toContain('A &amp; B &lt;deck&gt;.pptx');
    expect(html).toContain('PPTX');
    expect(html).toContain('887 KB');
  });
  it('shows a visible notice for a missing file', () => {
    const html = attachmentHtml({ kind: 'missing', href: '', name: 'gone.pdf' });
    expect(html).toContain('Missing file');
    expect(html).toContain('gone.pdf');
  });
});
