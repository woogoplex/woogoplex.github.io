import { getCollection, type CollectionEntry } from 'astro:content';
import { coverFromPosts, type Cover } from './covers';
import { projectSlug } from './slugs';

const STATUS_ORDER = { active: 0, paused: 1, done: 2 } as const;

/** A project as the pages see it: a real index.md entry, or a cover made up from its posts. */
export type Project = {
  id: string;
  data: Cover;
  /** Present only when the folder has an index.md to render as the intro. */
  entry?: CollectionEntry<'projects'>;
};

export async function getProjects(): Promise<Project[]> {
  const covers = await getCollection('projects');
  const posts = await getCollection('projectPosts');

  const projects: Project[] = covers.map((entry) => ({ id: entry.id, data: entry.data, entry }));
  const covered = new Set(projects.map((p) => projectSlug(p.id)));

  const folders = new Map<string, Date[]>();
  for (const post of posts) {
    const folder = projectSlug(post.id);
    if (covered.has(folder)) continue;
    folders.set(folder, [...(folders.get(folder) ?? []), post.data.date]);
  }
  for (const [folder, dates] of folders) {
    projects.push({ id: `${folder}/index`, data: coverFromPosts(folder, dates) });
  }

  return projects.sort(
    (a, b) =>
      STATUS_ORDER[a.data.status] - STATUS_ORDER[b.data.status] ||
      b.data.started.localeCompare(a.data.started),
  );
}

export async function getProject(slug: string): Promise<Project | undefined> {
  return (await getProjects()).find((p) => projectSlug(p.id) === slug);
}

export async function getPostsOf(project: string): Promise<CollectionEntry<'projectPosts'>[]> {
  const posts = await getCollection('projectPosts', (p) => projectSlug(p.id) === project);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getNotes(): Promise<CollectionEntry<'notes'>[]> {
  const notes = await getCollection('notes');
  return notes.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
