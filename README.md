# WhyLog Web

Local-first web version of WhyLog — record *why* you decided, then compare with what actually happened.

## Architecture

- **No backend, no database.** All data lives in `localStorage` (`whylog.decisions.v1`) as a single JSON array. Multi-tab sync via the `storage` event.
- **URL sharing** — a single decision is LZ-string-compressed into the URL fragment (`#/s/<data>`). The recipient decodes it entirely client-side and can import it into their own log. No server involved.
- **HashRouter** — works on any static host without rewrite rules.
- **Backup** — JSON export/import on the Data page (import merges by id; newer `updatedAt` wins). Since storage is browser-local, export is the only durable backup.

## Stack

Vite + React + TypeScript, `react-router-dom`, `lz-string`. No CSS framework — single `src/index.css` with light/dark via `prefers-color-scheme`. i18n (ko/en) picked from `navigator.language`.

## Development

```sh
npm install
npm run dev     # dev server
npm run build   # production build → dist/ (~83 KB gzip)
```

## Relationship to the Flutter app

`../whylog` is the original Flutter app (Android/iOS). This web app shares its domain model (see `src/types.ts`, mirrors the Drift schema) but intentionally drops: ads, push notifications (review-due decisions surface as an in-app banner instead), and Firebase.
