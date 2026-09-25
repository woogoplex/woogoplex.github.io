// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';
import attachments from './src/lib/attachments-integration';

const contentDir = fileURLToPath(new URL('./content', import.meta.url));

export default defineConfig({
  site: 'https://woojingo.com',
  base: '/',
  trailingSlash: 'always',
  integrations: [sitemap(), pagefind(), attachments({ contentDir })],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
