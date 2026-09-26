import { existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { attachmentHtml, attachmentKind, isRelativeUrl, resolveAttachment, splitUrl } from './attachments';

type Ctx = {
  fileURL: URL | undefined;
  replaceNode: (node: any, replacement: any) => void;
};

/**
 * Sätteri (Astro's Markdown engine) plugin that makes files dragged into a
 * note work on the site:
 * - `![](images/x.pdf)` becomes an inline viewer / player / download card
 * - `[text](images/x.pdf)` keeps working: its path is rewritten to the site url
 * - a file that does not exist shows "Missing file" instead of vanishing
 * Images are untouched so Astro can optimise them as usual.
 */
export function attachmentsPlugin({ contentDir, base = '/' }: { contentDir: string; base?: string }) {
  function resolve(url: string, ctx: Ctx) {
    if (!ctx.fileURL || !isRelativeUrl(url)) return null;
    const { path, suffix } = splitUrl(url);
    const r = resolveAttachment(fileURLToPath(ctx.fileURL), contentDir, path, base);
    if (!r) return null;
    const kind = attachmentKind(r.name);
    if (kind === 'image') return null;
    const exists = existsSync(r.abs) && statSync(r.abs).isFile();
    return { ...r, kind, suffix, exists };
  }

  return {
    name: 'attachments',
    image(node: { url: string }, ctx: Ctx) {
      const r = resolve(node.url, ctx);
      if (!r) return;
      const html = r.exists
        ? attachmentHtml({ kind: r.kind, href: r.href + r.suffix, name: r.name, size: statSync(r.abs).size })
        : attachmentHtml({ kind: 'missing', href: '', name: r.name });
      ctx.replaceNode(node, { type: 'html', value: html });
    },
    link(node: { url: string }, ctx: Ctx) {
      const r = resolve(node.url, ctx);
      if (!r?.exists) return;
      ctx.replaceNode(node, { ...node, url: r.href + r.suffix });
    },
  };
}
