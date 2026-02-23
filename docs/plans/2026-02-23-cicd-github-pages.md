# CI/CD GitHub Pages Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a GitHub Actions workflow that automatically deploys the app to GitHub Pages on every push to `main`.

**Architecture:** Single workflow file with two jobs — `build` (typecheck + build + upload artifact) and `deploy` (release artifact to GitHub Pages). Uses official GitHub Pages actions with OIDC, no tokens required.

**Tech Stack:** GitHub Actions, Vite, Node 20, `actions/configure-pages`, `actions/upload-pages-artifact`, `actions/deploy-pages`

---

### Task 1: Create the GitHub Actions workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

**Step 1: Create the workflows directory and file**

Create `.github/workflows/deploy.yml` with this exact content:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run typecheck
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

**Step 2: Verify the file is valid YAML**

Run:
```bash
cat .github/workflows/deploy.yml
```
Expected: file prints cleanly with no syntax issues.

**Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Pages deployment workflow"
```

---

### Task 2: Enable GitHub Pages (manual step — not automated)

This step is done in the browser, not in code.

1. Go to `https://github.com/ozzzzz/weeks/settings/pages`
2. Under **Source**, select **"GitHub Actions"**
3. Save

> After this is set, every push to `main` will trigger the deploy workflow and publish to `https://ozzzzz.github.io/weeks/`.

---

### Verification

After merging to `main`:
1. Go to `https://github.com/ozzzzz/weeks/actions` — the workflow should appear and succeed
2. Go to `https://github.com/ozzzzz/weeks/deployments` — a `github-pages` environment entry should appear
3. Visit `https://ozzzzz.github.io/weeks/` — the app should load
