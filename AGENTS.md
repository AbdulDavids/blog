# AGENTS.md

Instructions for AI agents working on this blog: a Hugo site using the PaperMod theme, served at https://abduldavids.co.za.

## Build and deploy

Cloudflare Pages serves the committed `public/` folder as is. It doesn't run a build. Whatever is in `public/` when you push is what goes live.

1. Make sure `hugo server` isn't running (`pgrep -fl "hugo server"`). The dev server rewrites `public/` with `http://localhost:1313` URLs every time a file changes, and those URLs break the live site.
2. Build: `hugo --cleanDestinationDir`
3. Check: `python3 scripts/seo-check.py` must report 0 errors. It also fails on any `localhost` URL in `public/`.
4. Commit the source changes and `public/` together. Don't commit `.DS_Store` files or `resources/_gen/`.
5. After pushing, wait for the "Cloudflare Pages" check run to pass:
   `gh api repos/AbdulDavids/blog/commits/<sha>/check-runs --jq '.check_runs[] | "\(.name): \(.status) \(.conclusion)"'`
6. Fetch the live page with `curl` and confirm the change is there.

If you edit any file after step 2, run steps 2 and 3 again before committing.

## Post front matter for search

Every published post in `content/posts/` should set these fields:

| Field | Used for | Rules |
| --- | --- | --- |
| `title` | The heading on the page and the post lists | Keep it short. |
| `seoTitle` | `<title>`, `og:title`, `twitter:title` and the JSON-LD `headline` | Optional. Use it when the search title should be longer than the page heading. Put the main search phrase in it. Google shows about 60 characters. |
| `description` | Meta description, social cards, `llms.txt` and the AI catalog | 120 to 155 characters. Full sentences with correct capitalisation. Include the main search phrase once, naturally. |
| `keywords` | `<meta name="keywords">` and the JSON-LD `keywords` | A list of the phrases the post should rank for. Google mostly ignores this tag, so it doesn't replace the title, description and body text. |
| `schemaImages` | The JSON-LD `image` list | Optional. Paths to real photos from the post, at least 1200px wide. Google prefers real photos to the generated text card, which is always appended last. |
| `date` | `datePublished`, the post list and the sitemap | Include the timezone, for example `2026-11-15T12:00:00+02:00`. |
| `draft` / `searchHidden` | Publishing | Set both to `false` to publish. |

Example:

```yaml
title: 'Becoming an Entelectual'
seoTitle: 'Becoming an Entelectual: The Entelect Graduate Programme Experience'
description: "What the Entelect graduate programme bootcamp is like: eight weeks in Joburg as a junior software engineer in South Africa, from onboarding to client-ready."
keywords: ["Entelect", "Entelect graduate programme", "software engineer South Africa"]
schemaImages: ["/entelect-bootcamp/the-gang.webp"]
```

### Search phrases in the body

- Work search phrases into sentences the post already has. Don't add new sentences or paragraphs only to fit keywords in.
- Write descriptive alt text for photos that show something specific, such as "Entelect Johannesburg office sign" instead of "office sign board".
- Don't change a published post's URL (its file name or `slug`). Links people have already shared would break.

## What the templates generate

You don't need to edit these to publish a post. They build from front matter on every run.

- **Page titles and social cards:** `layouts/partials/head.html`, `layouts/partials/templates/opengraph.html` and `layouts/partials/templates/twitter_cards.html` use `seoTitle` when it's set, and `title` when it isn't.
- **Social card images:** `layouts/partials/og_image.html` renders a 1200×630 card into `public/og/` for each page. Commit the new files in `public/og/`, or social previews on the live site will 404.
- **Structured data:** `layouts/partials/templates/schema_json.html` outputs:
  - `BlogPosting` on posts, with `headline`, `image`, `datePublished`, `dateModified`, an `author` that has `url` (the About page) and `sameAs` (the `socialIcons` in `hugo.yaml`), and the author as a `Person` publisher.
  - `WebSite` and `Person` on the home page. The `WebSite` name is what Google shows as the site name in results.
  - `ProfilePage` on any page with `profilePage: true` in its front matter (the About page). Those pages don't get `BlogPosting`.
  - All three use the Person from `layouts/partials/schema-person.html` (name, job title, employer, photo, location and social links). Update that file if any of those change.
  - `BreadcrumbList` on posts and sections, always starting at Home, for example Home › Posts › Post title. Google ignores breadcrumbs with fewer than 2 items.
- **`/llms.txt`:** `layouts/_default/index.llms.txt` lists every published post with its link and description. To change the one-line bio at the top, edit that file.
- **AI catalog:** `/.well-known/ai-catalog.json` and `/.well-known/ard.json` are both built from `layouts/partials/ard-manifest.html`. They follow the ARD spec (https://agenticresourcediscovery.org/spec/) and keep `specVersion`, which the Lighthouse agent audit requires. The home page links to them with `<link rel="ard">` and `<link rel="ai-catalog">`.
- **`robots.txt`:** `layouts/robots.txt`. Use only the standard directives (`User-agent`, `Disallow`, `Allow` and `Sitemap`). Lighthouse marks any other directive, such as `Agentmap:`, as an error.
- **Cache headers:** `static/_headers` caches `/assets/*` for a year, because those file names are fingerprinted, and photos and `/og/*` for 30 days. If you replace a photo, give the new file a new name.

## After publishing

1. Run the post URL through the Rich Results Test (https://search.google.com/test/rich-results). It should find `BlogPosting` and `BreadcrumbList` with no errors.
2. Ask the site owner to request indexing for the URL in Google Search Console. Agents can't do this step.
3. Run Lighthouse or PageSpeed Insights against the live URL, not `localhost:1313`. The dev server sends no cache headers and injects `livereload.js`, so a local run reports problems that don't exist in production.
