import { getCollection, type CollectionEntry } from 'astro:content';
import { projectSlug } from './slugs';

const STATUS_ORDER = { active: 0, paused: 1, done: 2 } as const;

export async function getProjects(): Promise<CollectionEntry<'projects'>[]> {
  const projects = await getCollection('projects');
  return projects.sort(
    (a, b) =>
      STATUS_ORDER[a.data.status] - STATUS_ORDER[b.data.status] ||
      b.data.started.localeCompare(a.data.started),
  );
}

export async function getPostsOf(project: string): Promise<CollectionEntry<'projectPosts'>[]> {
  const posts = await getCollection('projectPosts', (p) => projectSlug(p.id) === project);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getNotes(): Promise<CollectionEntry<'notes'>[]> {
  const notes = await getCollection('notes');
  return notes.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
