# Maintenance

This site doesn't break if you leave it alone. It builds on a pinned
environment (Node 22) in GitHub Actions, so it keeps working no matter what's
installed on your computer — you just need to push posts.

## Once a year (recommended, not required)

Update dependencies and check that everything still works:

```
npm update
npm run test
npm run build
```

If all three pass, commit and push. If something breaks, `git checkout
package-lock.json package.json` undoes it — the site keeps working either way.

## Every few years (major version bumps)

No rush when a new Astro major version (7 → 8, etc.) comes out — the site
keeps running fine on the current one. If you want to upgrade:

```
npx @astrojs/upgrade
npm run test && npm run build
```

## The escape hatch (most important part)

**Every post is just a plain Markdown file inside `content/`.**

If Astro disappears, or GitHub changes its policies, that folder is all you
need to rebuild the site with any other tool. When moving to something new,
`content/` is the only thing worth keeping — everything else can be rebuilt.
