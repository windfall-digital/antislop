# windfall-digital/antislop

A public fork of [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop) (MIT). It ships the upstream `anti-slop/*` rules unchanged, plus Windfall's own `windfall/*` rules. The consumer is `windfall-digital/windfall-template`. That repo currently vendors both plugins under `tools/oxlint/anti-slop/` and `tools/oxlint/windfall/`, and the fork will replace them.

## State

- Based on upstream `main` at `c44ef22`, the same commit the template vendored, so `src/` is identical.
- Remotes:
  - `upstream`: `dmmulroy/anti-slop`.
  - `origin`: `windfall-digital/antislop`. This repo **does not exist on GitHub yet**; create it as a public fork (`gh repo fork dmmulroy/anti-slop --org windfall-digital --fork-name antislop`), then push.
- Packaging, tests, workflows and docs (TODO 1–6) are done locally. Nothing is pushed or tagged.

## Layout decision

- `src/` stays byte-identical to upstream, so syncing is a plain merge. Never edit it here. Send generic fixes upstream as PRs instead.
- `windfall/` is ours. It lives outside `src/` so that upstream's `scripts/sync-skill-assets.mjs` (which copies `src/` into `skills/`) and upstream's `AGENTS.md` rule "no application-specific names" don't apply to it.
- It's published as two oxlint plugins from one package: `anti-slop` and `windfall`. Rule names in consumer configs stay `anti-slop/*` and `windfall/*`.

## Constraint: ship JavaScript

oxlint can't load a TypeScript plugin from `node_modules`. On oxlint 1.87 and Node 24 it fails with `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`. Consumers therefore need compiled `.js` files:
- Build `src/` and `windfall/` to `dist/`.
- Provide `exports` entries: `"."` points to `dist/src/index.js` (anti-slop), and `"./windfall"` points to `dist/windfall/index.js`.

## Distribution decision

Use a git tag, not npm, for now. The `windfall-digital` org doesn't exist on npm.
- The consumer pins `"@windfall-digital/antislop": "github:windfall-digital/antislop#vX.Y.Z"`.
- A tag-triggered release workflow builds `dist/` and commits it only on the tag commit; `main` stays source-only.
- Moving to npm later only changes the consumer's version string, plus adding a publish step here.

## Decisions

- **oxlint 1.87.0.** `oxlint` and `@oxlint/plugins` are both pinned to 1.87.0, the template's version. Upstream's `src/` passes its tests on it. Expect `package.json`/`pnpm-lock.yaml` conflicts in upstream syncs whenever upstream bumps them.
- **Build:** `pnpm build` runs `tsc -p tsconfig.build.json` (`rewriteRelativeImportExtensions`, tests excluded) into `dist/`, and copies the vendored eslint-stylistic `LICENSE`/`UPSTREAM.md` alongside. No `.d.ts`: consumers load the plugins by specifier from `jsPlugins`. `pnpm check` ends with `pnpm build`, so CI catches build breaks.
- **Windfall tests run in `posttest`.** Upstream's single-line `test` script stays byte-identical so that upstream adding a rule test doesn't conflict. pnpm runs `posttest` after `test` by default.
- **`no-interpolated-class-name`** keeps its `classNames()` wording; it's our fork.
- **Release** (`.github/workflows/release.yml`): a `v*` tag push checks that the tag equals `v` + `package.json` `version`, runs `pnpm check` (which builds), commits `dist/` on top of the tagged commit, force-moves the tag to that commit, and creates a GitHub Release. Re-runs skip the build if the tag already carries `dist/`. Tag rulesets that block force-pushes would break it.
- **Upstream sync** (`.github/workflows/upstream-sync.yml`): daily at 05:17 UTC and on `workflow_dispatch`. A clean merge force-pushes `sync/upstream` (rebuilt from `main` each run) and opens or updates a PR; a conflict opens, or comments on, an issue titled "Upstream sync: merge conflict with dmmulroy/anti-slop". It never pushes to `main`. Known `GITHUB_TOKEN` limits: the PR it opens doesn't trigger CI (close and reopen it, or switch to an App/PAT token), and the push fails if upstream changes `.github/workflows/` (merge that one by hand).

## Release procedure

1. Bump `version` in `package.json` on `main`.
2. Tag `vX.Y.Z` on that commit and push the tag; the release workflow does the rest.

First release: `v0.2.0` (`package.json` is already at 0.2.0). Tag only after owner approval.

## After the first release, in windfall-template

- Add the dependency.
- Change the `jsPlugins` specifiers in `oxlint.config.ts` to `@windfall-digital/antislop` and `@windfall-digital/antislop/windfall`.
- Delete `tools/oxlint/anti-slop/`, `tools/oxlint/windfall/` and the `test:lint-rules` script.
- Add an update check for new tags, using Renovate or a scheduled workflow.
- Write ADR 0008, which supersedes ADR 0007 ("vendored, not an npm dependency"). This needs owner sign-off.
