# About Page & GitHub Icon — Design

## Summary

Add an About page and a GitHub icon link to the navigation. Use `react-router-dom` with `HashRouter` for static hosting on GitHub Pages.

## Dependencies

- Install `react-router-dom`
- Use `HashRouter` (URLs like `/#/about`) — compatible with GitHub Pages out of the box

## Routing

Wrap the app in `HashRouter` inside `App.tsx`. Two routes:

- `/` — existing Home page (unchanged)
- `/about` — new About page

## Navigation changes

`Navigation.tsx` currently shows "Weeks" text + status counts left-aligned. Extend with:

- "Weeks" text becomes a link to `/`
- "About" link to `/about`
- `IconBrandGithub` (from `@tabler/icons-react`, already installed) linking to `https://github.com/ozzzzz/weeks`

Layout: status counts stay left; About link + GitHub icon go right via a second `Group` with `ml="auto"`.

## About page (`src/app/about.tsx`)

Three paragraphs using Mantine `Container`, `Title`, `Text`, `Anchor`:

1. **What this is** — "Weeks is a tool to visualize your entire life at once — every week, laid out in a single grid. Lived weeks, remaining weeks, and potential extra time are all visible together, giving you a clear picture of your life as a whole."

2. **Lifespan data** — "Average lifespan by country and sex can be found on the [WHO website](https://www.who.int/data/gho/data/indicators/indicator-details/GHO/life-expectancy-at-birth-(years))."

3. **Support** — "If you find this useful, you can [buy me a coffee](https://buymeacoffee.com/ozzzzz)."
