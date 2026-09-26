import { copyFileSync, createReadStream, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { satteri } from '@astrojs/markdown-satteri';
import type { AstroIntegration } from 'astro';
import { sitePath } from './attachments';
import { attachmentsPlugin } from './satteri-attachments';

const MIME: Record<string, string> = {
  pdf: 'application/pdf',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  zip: 'application/zip',
  txt: 'text/plain; charset=utf-8',
  csv: 'text/csv; charset=utf-8',
};

/** Every file under content/ that is not a note and not a dotfile, with where it goes on the site. */
function listAttachments(contentDir: string): { abs: string; site: string }[] {
  const out: { abs: string; site: string }[] = [];
  const walk = (dir: string, rel: string[]) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(abs, [...rel, entry.name]);
      else if (!entry.name.endsWith('.md')) out.push({ abs, site: sitePath([...rel, entry.name].join('/')) });
    }
  };
  walk(contentDir, []);
  return out;
}

/**
 * Makes files dragged into a note part of the site:
 * - in Markdown, `![](images/x.pdf)` and `[text](x.pdf)` are rewritten (see satteri-attachments)
 * - on build, every non-note file under content/ is copied to its site path in the output
 * - in `astro dev`, those files are served straight from content/
 */
export default function attachments({ contentDir, base = '/' }: { contentDir: string; base?: string }): AstroIntegration {
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return {
    name: 'attachments',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        updateConfig({
          markdown: { processor: satteri({ mdastPlugins: [attachmentsPlugin({ contentDir, base })] }) },
          vite: {
            plugins: [
              {
                name: 'attachments-dev',
                configureServer(server) {
                  server.middlewares.use((req, res, next) => {
                    const url = decodeURIComponent((req.url ?? '').split(/[?#]/)[0]);
                    if (!url.startsWith(prefix)) return next();
                    const wanted = url.slice(prefix.length);
                    const file = listAttachments(contentDir).find((f) => f.site === wanted);
                    if (!file) return next();
                    res.setHeader('Content-Type', MIME[path.extname(file.abs).slice(1).toLowerCase()] ?? 'application/octet-stream');
                    createReadStream(file.abs).pipe(res);
                  });
                },
              },
            ],
          },
        });
      },
      'astro:build:done': ({ dir }) => {
        const outDir = fileURLToPath(dir);
        for (const { abs, site } of listAttachments(contentDir)) {
          const dest = path.join(outDir, ...site.split('/'));
          mkdirSync(path.dirname(dest), { recursive: true });
          copyFileSync(abs, dest);
        }
      },
    },
  };
}
