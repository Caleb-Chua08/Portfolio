# Caleb Chua Yang Yang — Portfolio

Engineering-drawing themed portfolio for a software & system engineer working on
manufacturing software, machine integration, and data tracking. The whole site
is styled like a set of engineering drawings — paper grid, hairline rules,
title blocks, and numbered sheets.

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS v4**, and **Zustand**.

## Features

- **Live sorting station** — a closed-loop PLC simulation running a real scan
  cycle in the browser: sensors feed the ladder, the ladder decides, and the
  machine obeys. Inject a defect and watch the reject pusher catch it.
- **Control Room** (`/control-room`) — edit the ladder logic rung by rung,
  step the scan, and inspect the generated C++ listing of the same logic.
- **Drawing-sheet design language** — every section is a numbered sheet
  (General Notes, As-Built Record, Foundation, Prototype Builds, Schedule,
  Legend) with title-block headers and DWG numbering.
- **Certifications gallery** — schedule table with document thumbnails; click
  a thumbnail to open the certificate in a lightbox viewer with its verify link.
- **Personal projects** — write-ups for SmartCopy (folder comparison & safe-copy
  desktop app) and a Selenium automated testing framework, linked to GitHub.

## Tech Stack

| Layer     | Tool                                    |
| --------- | --------------------------------------- |
| Framework | [Next.js](https://nextjs.org) 16 (App Router) |
| UI        | [React](https://react.dev) 19           |
| Language  | [TypeScript](https://www.typescriptlang.org) |
| Styling   | [Tailwind CSS](https://tailwindcss.com) v4 |
| State     | [Zustand](https://zustand.docs.pmnd.rs) v5 (simulation store) |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.
The simulation and control room run entirely client-side — no backend required.

## Project Structure

```
app/                  # App Router pages (/, /control-room) and global styles
components/
  layout/             # Header, Footer
  sections/           # Hero, About, Experience, Education, Projects,
                      # Certifications, Skills
  machine/            # Live PLC sorting station simulation
  control-room/       # Ladder editor, factory view, generated code view
  scanrail/           # Shared scan-cycle rail visuals
lib/
  data/               # All page content (profile, experience, projects, certs, skills)
  simulation/         # PLC engine: presets, scan evaluation, C++ codegen, store
public/certificates/  # Certificate documents shown in the gallery
```

## Scripts

| Command         | Description                      |
| --------------- | -------------------------------- |
| `npm run dev`   | Start the dev server (Turbopack) |
| `npm run build` | Production build (static export) |
| `npm run lint`  | Run ESLint                       |

## Deployment

The site is configured for **static export** (`output: "export"` in
`next.config.ts`) — `npm run build` emits plain HTML/CSS/JS into `./out`,
which any static host can serve.

On [Render](https://render.com) (Static Site):

- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `out`
