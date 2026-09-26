import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import { attachmentsPlugin } from './satteri-attachments';

function vault() {
  const contentDir = mkdtempSync(join(tmpdir(), 'content-'));
  mkdirSync(join(contentDir, 'notes', 'images'), { recursive: true });
  writeFileSync(join(contentDir, 'notes', 'images', 'slides.pdf'), 'pdf');
  return { contentDir, mdFile: join(contentDir, 'notes', '2026-01-01-a.md') };
}

/** The slice of Sätteri's visitor ctx the plugin uses. */
function fakeCtx(mdFile: string) {
  const calls: { replaced?: any } = {};
  return {
    ctx: { fileURL: pathToFileURL(mdFile), replaceNode: (_n: any, r: any) => { calls.replaced = r; } } as any,
    calls,
  };
}

describe('attachmentsPlugin', () => {
  it('turns an embedded pdf into an inline viewer', () => {
    const { contentDir, mdFile } = vault();
    const plugin = attachmentsPlugin({ contentDir });
    const { ctx, calls } = fakeCtx(mdFile);
    plugin.image({ type: 'image', url: 'images/slides.pdf', alt: '' } as any, ctx);
    expect(calls.replaced?.type).toBe('html');
    expect(calls.replaced?.value).toContain('/notes/images/slides.pdf');
    expect(calls.replaced?.value).toContain('application/pdf');
  });

  it('keeps a plain link but fixes its path', () => {
    const { contentDir, mdFile } = vault();
    const plugin = attachmentsPlugin({ contentDir });
    const { ctx, calls } = fakeCtx(mdFile);
    const link = { type: 'link', url: 'images/slides.pdf#page=2', children: [] } as any;
    plugin.link(link, ctx);
    expect(calls.replaced?.type).toBe('link');
    expect(calls.replaced?.url).toBe('/notes/images/slides.pdf#page=2');
  });

  it('leaves real images to Astro', () => {
    const { contentDir, mdFile } = vault();
    const plugin = attachmentsPlugin({ contentDir });
    const { ctx, calls } = fakeCtx(mdFile);
    plugin.image({ type: 'image', url: 'images/photo.png', alt: '' } as any, ctx);
    expect(calls.replaced).toBeUndefined();
  });

  it('shows a notice when the embedded file does not exist', () => {
    const { contentDir, mdFile } = vault();
    const plugin = attachmentsPlugin({ contentDir });
    const { ctx, calls } = fakeCtx(mdFile);
    plugin.image({ type: 'image', url: 'images/nope.pdf', alt: '' } as any, ctx);
    expect(calls.replaced?.type).toBe('html');
    expect(calls.replaced?.value).toContain('Missing file');
    expect(calls.replaced?.value).toContain('nope.pdf');
  });

  it('does nothing when the document has no file url', () => {
    const { contentDir } = vault();
    const plugin = attachmentsPlugin({ contentDir });
    const calls: any = {};
    plugin.image({ type: 'image', url: 'images/slides.pdf', alt: '' } as any, { fileURL: undefined, replaceNode: (_n: any, r: any) => { calls.replaced = r; } } as any);
    expect(calls.replaced).toBeUndefined();
  });
});
