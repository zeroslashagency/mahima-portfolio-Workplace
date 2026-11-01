# Sveltia CMS

The site uses [Sveltia CMS](https://sveltiacms.app/en/docs) as a Git-based editor at `/admin/`. It has no database and no paid CMS service.

The CMS saves directly to GitHub `main`. These implementation changes are currently uncommitted local work, so the production CMS will not show them until an owner reviews and merges them to `main`. No push is part of this change.

## How it works

1. Mahima signs in to `/admin/` with GitHub.
2. Sveltia CMS reads the JSON files in `content/` from the `main` branch of `zeroslashagency/mahima-portfolio-Workplace`.
3. Saving an entry commits the changed JSON and any uploaded image to GitHub.
4. Vercel detects the commit, runs `npm run build`, and publishes the new static HTML.
5. `vite-plugin-handlebars` renders the JSON into `index.html` and the shared `partials/program.hbs` template at build time.

The public site has no CMS JavaScript. Sveltia CMS runs only on `/admin/`.

## Content files

- `content/site.json`: phone, email, WhatsApp details, and contact-card copy shared by the homepage and program pages.
- `content/home.json`: homepage SEO plus the hero, experience gallery, catalog, statistics, founder, process, FAQ, and enquiry sections.
- `content/programs/*.json`: SEO, JSON-LD, hero, all program sections, pricing, FAQs, related programs, and closing call to action for each program.

Most values are plain text. Fields named `headingHtml` allow simple inline HTML because the current headings use intentional `<br>` line breaks and HTML entities such as `&amp;`. Keep these fields to text, `<br>`, and entities. Do not add scripts, styles, embeds, or structural HTML.

Program service JSON-LD is editable under **Structured data (JSON-LD)**. FAQ structured data and breadcrumbs are generated from the visible FAQ content and stable page values so there is only one FAQ copy to maintain.

## One-time production setup

A person with access to the GitHub repository and Cloudflare account completes these steps once.

### 1. Deploy the Sveltia CMS authenticator

1. Open [github.com/sveltia/sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth).
2. Use its **Deploy to Cloudflare Workers** button, or deploy the repository with Wrangler.
3. Copy the resulting Worker URL, for example `https://sveltia-cms-auth.example.workers.dev`.

### 2. Create a GitHub OAuth app

1. Open [GitHub OAuth Apps](https://github.com/settings/developers), choose **OAuth Apps**, then **New OAuth App**.
2. Use a clear name such as `HEALWITHMAHIMA Sveltia CMS`.
3. Set **Homepage URL** to the live website URL.
4. Set **Authorization callback URL** to `<WORKER_URL>/callback`.
5. Create the app and generate a client secret.

### 3. Configure the Cloudflare Worker

In the Worker settings, add:

- `GITHUB_CLIENT_ID`: the OAuth app client ID.
- `GITHUB_CLIENT_SECRET`: the OAuth app client secret, stored as an encrypted secret.
- `ALLOWED_DOMAINS`: every production hostname that can open `/admin/`, separated by commas. If both hostnames serve the site, include `healwithmahima.com,www.healwithmahima.com`.

For preview deployments, explicitly allowlist only preview hostnames that need CMS access. Update the value if the preview hostname changes.

Deploy the Worker after saving the variables.

### 4. Connect the CMS to the Worker

Edit `public/admin/config.yml` and uncomment the `base_url` line under `backend`:

```yaml
backend:
  name: github
  repo: zeroslashagency/mahima-portfolio-Workplace
  branch: main
  base_url: https://sveltia-cms-auth.example.workers.dev
```

Use the exact Cloudflare Worker origin without `/callback` or a trailing path.

### 5. Give Mahima repository access

1. In the GitHub repository, open **Settings → Collaborators and teams**.
2. Invite Mahima's GitHub account with permission to write to the repository.
3. Ask her to accept the invitation before signing in to `/admin/`.

If `main` has branch protection, allow Mahima's account to use the required save workflow or configure a review-based editorial workflow before launch. The current config saves directly to `main`.

Without `base_url`, GitHub OAuth login cannot complete because the CMS needs the deployed authenticator callback. A GitHub personal access token can be used with Sveltia's token login option instead, if the account has permission to write to the repository. For regular editorial use, deploy and configure the authenticator above.

## How Mahima edits text

1. Open `https://YOUR-SITE/admin/` in a browser.
2. Choose **Login with GitHub** after the authenticator is configured and approve access if GitHub asks. Before that setup is complete, use **Login with Token**.
3. Open **Homepage**, **Site settings**, or **Programs** in the left navigation.
4. Open the page or settings file to edit.
5. Change the field. Keep headline fields under the displayed 140-character limit.
6. Select **Save** and confirm the change.
7. Wait for the Vercel deployment to finish, then refresh the public page.

A save creates a Git commit. The previous version remains available in GitHub history if an owner needs to restore it.

## How Mahima replaces a photo

1. Open the relevant Homepage or Program entry.
2. Find the image field and choose **Select image** or **Upload**.
3. Choose a clear, high-resolution image. Sveltia converts raster uploads to WebP at quality 85 and limits them to 2048×2048.
4. Update the adjacent **Alternative text** field with a short description of what is visible in the photo.
5. Save the entry and wait for Vercel to rebuild.
6. Check the image on both a phone and a desktop screen after deployment.

Uploads are saved under `public/assets/images` and are published at `/assets/images/...`. This keeps uploads beside the current image library so existing photos remain available in the media picker.

The experience video uses a file field stored under `public/assets/videos` and published at `/assets/videos/...`; its poster uses the image picker.

Existing images ending in `-1080.webp` use a responsive `srcset` when a matching `-800.webp` file exists. A newly uploaded single image uses a plain `src`, which remains valid at every viewport. Creating matching `-800.webp` and `-1080.webp` variants requires the local repository workflow below.

## Local repository workflow

Use local editing for developer-reviewed content changes, template changes, or paired responsive image variants. Run the dev server from the repository root and open `http://localhost:3000/`. Vite watches `content/**/*.json`, reloads the page after changes, and reads fresh JSON on each render. For local CMS access, use `http://localhost:3000/admin/index.html`; `/admin/` redirects there.

```bash
npm install
npm run dev
```

Open `http://localhost:3000/`. Edit files under `content/`; Vite reloads the rendered page.

Before sharing a change:

```bash
npm run build
npm run preview
```

Check the homepage and all five program pages. Confirm headings, links, images, responsive layouts, and JSON-LD still render correctly.

For a responsive image pair:

1. Export WebP files with the same base name, ending in `-800.webp` and `-1080.webp`.
2. Put both files in `public/assets/images/`.
3. Set the JSON image `src` to the `-1080.webp` path.
4. Run `npm run build`. The `responsiveImage` helper detects the `-800.webp` partner and emits the existing 800w/1080w `srcset`.

The CMS targets the GitHub `main` branch. When local development happens on another branch, merge the reviewed work through the repository's normal pull-request process before expecting `/admin/` to show it.

## Troubleshooting

- **Login returns an OAuth error:** confirm the OAuth callback is exactly `<WORKER_URL>/callback`, the Worker secrets match the same OAuth app, and `base_url` contains the Worker origin.
- **Login works but saving fails:** confirm the signed-in GitHub account has write access and branch protection permits the save.
- **A save succeeds but the site stays unchanged:** check the latest Vercel deployment and its build log.
- **An image is missing:** confirm the JSON path starts with `/assets/images/` and the file exists under `public/assets/images/`.
- **A build fails after editing structured data:** check that JSON-LD values remain the expected object, list, string, number, or boolean type.
