---
name: netlify
description: How to deploy to Netlify — provision a new site under the "cofe-pre-sales" team and configure environment variables.
---

# Deploy to Netlify

How to provision a new Netlify site under the **cofe-pre-sales** team and configure it for this storefront.

## Prerequisites

Before running the setup script, have the following ready:

1. **Netlify personal access token** — generate one at [app.netlify.com/user/applications](https://app.netlify.com/user/applications) → Personal access tokens
2. **Storefront CT API credentials** — these are the `site/.env` values (the **Frontend B2C** API client with limited scope). **Never use the `tools/.env` admin credentials here.**
3. **A unique site name** — will become `https://<name>.netlify.app`
4. **`netlify.toml`** — already present in the repo root; no changes needed

## Step 1 — Run the setup script

```bash
node tools/netlify-setup.mjs
```

The script will prompt you for:

| Prompt | Notes |
|--------|-------|
| Netlify personal access token | Or set `NETLIFY_AUTH_TOKEN` in your shell to skip this prompt |
| Site name | Must be unique across Netlify (e.g. `acme-store`, `clientname-b2c`) |
| `CTP_PROJECT_KEY` | commercetools project key |
| `CTP_CLIENT_ID` | Storefront API client ID (Frontend B2C client) |
| `CTP_CLIENT_SECRET` | Storefront API client secret |
| `CTP_AUTH_URL` | e.g. `https://auth.europe-west1.gcp.commercetools.com` |
| `CTP_API_URL` | e.g. `https://api.europe-west1.gcp.commercetools.com` |
| `CTP_SCOPES` | e.g. `manage_project:<project-key>` |
| `SESSION_SECRET` | A long random string used to sign JWT session cookies |

Press Enter to skip any env var — you can set them later in the Netlify UI.

What the script does:
1. Finds the **cofe-pre-sales** Netlify account
2. Creates a new site under that account
3. Sets all provided environment variables on the site via the Netlify API

## Step 2 — Connect the GitHub repo

After the script completes, open the Admin URL it prints and connect the GitHub repository:

1. Go to **Site settings → Build & deploy → Continuous deployment**
2. Click **Link to Git**
3. Select the GitHub repo
4. Netlify will pick up `netlify.toml` automatically (build base: `site/`, command: `npm run build`)

The first deploy will start automatically once the repo is linked.

## Step 3 — Verify the deploy

1. Watch the deploy log in the Netlify UI
2. Once live, open the site URL and verify:
   - Home page loads
   - Country selector works
   - Adding a product to cart works
   - Checkout flow reaches payment step

## Notes

- The `netlify.toml` at the repo root already has the correct build config — do not modify it
- **Environment variable scope**: only `site/.env` vars go into Netlify. The `tools/.env` admin credentials are for local scripts only and must never be exposed on the deployed site
- If you need to update env vars later, use the Netlify UI (Site settings → Environment variables) or re-run the script with a new site name is not needed — the Netlify API supports updating env vars on existing sites via `PATCH /api/v1/sites/{site_id}`
- Node version is pinned to 22 in `netlify.toml` via `NODE_VERSION = "22"`

## Checklist

- [ ] Netlify personal access token obtained
- [ ] Storefront CT API client credentials ready (Frontend B2C client, limited scope)
- [ ] `SESSION_SECRET` generated (e.g. `openssl rand -base64 48`)
- [ ] Run `node tools/netlify-setup.mjs` and confirm site created
- [ ] GitHub repo linked in Netlify UI
- [ ] First deploy succeeded
- [ ] Smoke-test: home page, cart, and checkout work on the deployed URL
