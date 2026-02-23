# CI/CD Pipeline: GitHub Pages Deployment

**Date:** 2026-02-23
**Repo:** ozzzzz/weeks
**Stack:** Vite + React + TypeScript

## Summary

Set up a GitHub Actions workflow to automatically deploy the app to GitHub Pages on every push to `main`.

## Approach

Official GitHub Pages Actions (OIDC-based, no tokens required):
- `actions/configure-pages`
- `actions/upload-pages-artifact`
- `actions/deploy-pages`

## Workflow Design

**File:** `.github/workflows/deploy.yml`

**Trigger:** push to `main`

**Jobs:**

1. **build**
   - Checkout code
   - Setup Node 20 with npm cache
   - `npm ci`
   - `npm run typecheck` (fail fast on TS errors)
   - `npm run build`
   - Upload `dist/` as Pages artifact

2. **deploy** (depends on build)
   - Deploy artifact via `actions/deploy-pages`
   - Exposes deployment URL via `github-pages` environment

**Concurrency:** single `pages` group with cancel-in-progress to avoid overlapping deploys.

## Permissions

Set at workflow level:
- `contents: read`
- `pages: write`
- `id-token: write`

## Vite Config

No changes needed. Current `base: './'` works correctly for `https://ozzzzz.github.io/weeks/`.

## Post-Merge Manual Step

In GitHub repo → Settings → Pages → Source → select **"GitHub Actions"**.

## Out of Scope

- Preview deployments on feature branches
- Environment-specific builds
- Secrets or environment variables
