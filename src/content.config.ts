import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Obsidian's properties editor leaves `tags:` with nothing after it when the
// last tag is removed. YAML reads that as null, so accept null and treat it as
// "no tags" instead of failing the whole build.
const tags = z
  .array(z.string())
  .nullable()
  .optional()
  .transform((v) => v ?? []);

const projects = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    started: z.string(),
    status: z.enum(['active', 'paused', 'done']),
  }),
});

const projectPosts = defineCollection({
  loader: glob({ pattern: ['*/*.md', '!*/index.md'], base: './content/projects' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: tags,
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/notes' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: tags,
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './content' }),
  schema: z.object({ title: z.string() }),
});

export const collections = { projects, projectPosts, notes, pages };
