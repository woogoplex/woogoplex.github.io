import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { postSlug, projectSlug } from '../lib/slugs';
import { href } from '../lib/url';

export async function GET(context) {
  const posts = await getCollection('projectPosts');
  const notes = await getCollection('notes');
  const items = [
    ...posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      link: href(`/projects/${projectSlug(p.id)}/${postSlug(p.id)}/`),
    })),
    ...notes.map((n) => ({
      title: n.data.title,
      pubDate: n.data.date,
      link: href(`/notes/${postSlug(n.id)}/`),
    })),
  ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: 'Woojin — projects and notes',
    description: 'Projects and notes on society, economics, and the environment.',
    site: context.site,
    items,
  });
}
