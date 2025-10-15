# Dashboard Demo

This is a minimal Vite + React + TypeScript demo containing the `Dashboard` component.

Prerequisites
- Node.js (includes npm). Download and install from https://nodejs.org/ (LTS recommended).

Run locally (PowerShell)
```powershell
cd /d d:\VSCODE\REACT
npm install
npm run dev
```

Open the URL printed by Vite (usually http://localhost:5173) to preview the app.

Troubleshooting
- "'npm' is not recognized...": Install Node.js and re-open PowerShell.
- If port 5173 is in use, Vite will pick another port; check the console output.
- If TypeScript complains about missing types, run `npm install` (it installs @types packages declared in package.json).

CSV/Excel expected format
- Column `Fecha de venta` in format `DD-MM-YY` or `DD-MM-YYYY`.
- Relevant columns referenced by the Dashboard: `Estado`, `Estado.1` (region), `Comuna`, `Total (CLP)`, `SKU`, `Título de la publicación`, `Unidades`.

If you want, I can:
- Convert the project to JavaScript to avoid TypeScript setup.
- Add a sample CSV so you can immediately preview charts.
