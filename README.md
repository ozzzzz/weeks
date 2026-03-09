# Weeks

Static life visualization app: your full lifetime shown as week or month "coins".

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

## Docker

```bash
docker build -t weeks .
docker run -p 8080:80 weeks
```

Then open [http://localhost:8080](http://localhost:8080).

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

## TODO

Critical:

Nice to have:

- add educational setup for the new user
- when i hide/show settings tab, threehs scene should be reset (looks not good)

Minor:

- make animation on hover cooler
