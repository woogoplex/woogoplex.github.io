import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

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
    tags: z.array(z.string()).default([]),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/notes' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './content' }),
  schema: z.object({ title: z.string() }),
});

export const collections = { projects, projectPosts, notes, pages };
