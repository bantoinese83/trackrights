# Quality status

All checks in `npm run quality-gate` are **passing** (TypeScript, ESLint with zero warnings, Prettier, Knip, production build).

| Check            | Command                |
| ---------------- | ---------------------- |
| TypeScript       | `npm run type-check`   |
| ESLint           | `npm run lint`         |
| Prettier         | `npm run format:check` |
| Dead code / deps | `npm run knip`         |
| Production       | `npm run build`        |

Run the full gate before opening a PR:

```bash
npm run quality-gate
```

**Git hooks (Husky):** After `npm install`, `prepare` registers Husky.

- **pre-commit:** `lint-staged` — ESLint (`--max-warnings 0`) and Prettier on staged `*.{js,mjs,cjs,jsx,ts,tsx}` and selected formatted files.
- **pre-push:** `npm run quality-gate` (type-check, lint, Prettier check, Knip, production build).

**Knip:** `src/components/ui/**` is ignored because it is the shadcn/Radix component catalog; not every primitive is used in the app yet. Dependencies for those components are listed under `ignoreDependencies` in `knip.json` for the same reason.

**Performance:** `next.config.mjs` enables `experimental.optimizePackageImports` for `lucide-react`, `framer-motion`, and `motion` to improve tree-shaking and client bundle size.
