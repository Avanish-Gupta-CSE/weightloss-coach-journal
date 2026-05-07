# gh-pages Sync Instructions

This repo is intentionally split across **two branches / two worktrees**:

- `main` worktree: `C:/Users/agupt1/Projects/Personal/WeightLoss`
- `gh-pages` worktree: `C:/Users/agupt1/Projects/Personal/WeightLoss-ghpages`

## Branch roles

- `main` is the source of truth for `.coach/` logs and protocol state.
- `gh-pages` contains the deployed dashboard app plus a mirrored copy of `.coach/` so the parser can regenerate hosted data.

## Golden rule

If a coaching session changes `.coach/` in `main`, those updated `.coach` files must be mirrored into `gh-pages` before rebuilding and pushing the site.

## Minimal sync workflow

1. Work in `main` first.
2. Update `.coach/BrainState.md` and `.coach/Progress.md` there.
3. Validate the edited markdown files.
4. Mirror the changed `.coach` files from `main` to `gh-pages`.
5. In `gh-pages/dashboard`, run `npm run parse`.
6. Validate the generated data if the session changed daily totals or dashboard-visible state.
7. In `gh-pages/dashboard`, run `npm run build`.
8. Copy the contents of `gh-pages/dashboard/dist/` into the `gh-pages` branch root.
9. Commit and push `main` and `gh-pages` separately.

## Current dashboard publishing shape

- Hosted site is served from the **root of `gh-pages`**.
- Built assets live at the `gh-pages` root as `index.html`, `assets/*`, `favicon.svg`, and `icons.svg`.
- Source dashboard project lives in `gh-pages/dashboard/`.
- Parser entry point is `gh-pages/dashboard/scripts/parse-coach.js`.

## Commands that are typically needed

From `gh-pages/dashboard`:

```bash
npm run parse
npm run build
```

Then copy build output from `gh-pages/dashboard/dist/` to the `gh-pages` root.

## Things that have already caused mistakes

- Forgetting to sync updated `.coach` files from `main` to `gh-pages` before parsing/building.
- Fixing parser logic in `gh-pages/dashboard` but not rebuilding root publish artifacts afterward.
- Reading the first macro subtotal in `Progress.md` instead of the final closeout line for a day.
- Treating `main` and `gh-pages` as if they were interchangeable. They are not.

## Current repo convention

- Coaching logs and protocol memory belong on `main`.
- Dashboard/UI/parser/build/deploy work belongs on `gh-pages`.
- If both are touched in one session, update `main` first, then sync into `gh-pages`, then rebuild and deploy.