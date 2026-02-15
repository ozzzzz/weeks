# Weeks

Static life visualization app: your full lifetime shown as week "coins".

## Stack

- Vite + React + TypeScript
- Mantine for UI
- Tailwind CSS for layout/styles
- Redux Toolkit for state
- Three.js for week rendering

## Local-only storage

- App state is stored in `localStorage`
- No backend, no cloud persistence
- Settings can be exported to JSON and imported back from JSON

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## GitHub Pages deploy

```bash
npm run deploy
```

The Vite config uses `base: "./"` so static assets work on GitHub Pages subpaths.

## Project structure

```text
src/
├── app/
│   ├── components/
│   ├── types/
│   ├── utils/
│   ├── hooks.ts
│   └── store.ts
├── App.tsx
└── main.tsx
```
