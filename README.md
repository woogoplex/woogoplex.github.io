# Woojin's Site

A place to keep track of my projects and notes. Everything is written in plain
Markdown files under `content/`; the rest is just code that turns those files
into a website.

## Structure

```
woogoplex.github.io/   ← open this whole folder as the Obsidian vault (not just content/ — see below)
  content/             ← the only folder that actually matters
    projects/
      <project-name>/
        index.md        ← project cover (title, description, start date, status)
        2026-06-07-why-i-started.md   ← a post. the date in the filename is just for sorting
        images/         ← images (pasting one in Obsidian saves it here automatically)
    notes/              ← short thoughts, reading notes
    about.md
  src/                  ← site code (you shouldn't need to touch this)
```

> **Why open the whole repo as the vault?** The Obsidian Git plugin can't find
> a repository if `.git` sits above the vault folder. Since `.git` lives at
> the repo root, the vault has to be opened there too. A CSS snippet
> (`.obsidian/snippets/hide-code-folders.css`, enabled automatically) hides
> code folders like `src/` and `node_modules/` from the file explorer, so in
> practice you'll only ever see `content/`.

## Writing a post

1. Open **the whole repo folder** as the Obsidian vault (not `content/` — the repo root!)
2. Create a new file inside `content/notes/` or a project folder. Templater will ask for a title and rename the file to `YYYY-MM-DD-slug.md` automatically, filling in the frontmatter:

   ```
   ---
   title: My post title
   date: 2026-06-07
   tags: [economics]
   ---
   ```

3. Drag files into the note if you want: a PDF shows up as an inline viewer, a video or audio file as a player, and anything else (slides, docs, zips) as a download card. Keep files under about 5 MB; put big videos on YouTube and link to them instead.
4. Commit & push with the Obsidian Git plugin (Command Palette → "Git: Commit-and-sync")
5. The site updates in 2–3 minutes

## Starting a new project

Make a **folder** under `content/projects/`, with an `index.md` inside it:

```
content/projects/my-project-name/index.md
```

```
---
title: Project name
description: One-line description
started: 2026-09
status: active        # active | paused | done
---
(a short intro)
```

> **Forgot `index.md`?** No problem. A folder that only has posts still gets a
> project page: the folder name is used as the title and the first post sets
> the start month. Add `index.md` whenever you want a real title, description
> and intro.
>
> **Common mistake:** a file placed directly inside `content/projects/`
> (like `content/projects/my-project.md`, with no folder around it) will not
> show up anywhere on the site. It is silently skipped. Posts always live
> inside a project folder.
>
> **If the site stops updating:** open the repo on GitHub and look at the
> Actions tab. A red run usually means a note's front matter is broken (for
> example a `tags:` line with nothing after it). Fix the file and push again.

The list of posts is generated automatically — no index to maintain by hand.

## Preview locally (optional)

```
npm install
npm run dev
```

## First-time setup on a new Mac

1. Clone this repo
2. Install Obsidian (`brew install --cask obsidian`), then open the cloned folder as the vault
3. Community plugins → turn off restricted mode → install and enable **"Git"** (by Vinzent03) and **"Templater"** (by SilentVoid13)
4. Configure Templater: Template folder location = `templates`, turn on "Trigger Templater on new file creation", and add Folder Templates: `content/notes → templates/note.md`, `content/projects → templates/project-post.md`
5. Write a post → commit & push with the Git plugin. That's it.

See `MAINTENANCE.md` for upkeep, and `GUIDELINES.md` for what to keep in mind while writing.
