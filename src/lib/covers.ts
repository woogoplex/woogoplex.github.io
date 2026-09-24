export type Cover = {
  title: string;
  description: string;
  started: string;
  status: 'active' | 'paused' | 'done';
};

/**
 * A project folder with posts but no index.md still gets a page: the folder
 * name becomes the title and the earliest post sets the start month. Writing
 * index.md later replaces this with the real cover.
 */
export function coverFromPosts(folder: string, postDates: Date[]): Cover {
  const earliest = postDates.length
    ? new Date(Math.min(...postDates.map((d) => d.valueOf())))
    : new Date();
  const started = `${earliest.getUTCFullYear()}-${String(earliest.getUTCMonth() + 1).padStart(2, '0')}`;
  return { title: folder, description: '', started, status: 'active' };
}
