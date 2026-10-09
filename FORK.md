# windfall-digital/antislop

A public fork of [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop) (MIT). It ships the upstream `anti-slop/*` rules unchanged, plus Windfall's own `windfall/*` rules. The consumer is `windfall-digital/windfall-template`. That repo currently vendors both plugins under `tools/oxlint/anti-slop/` and `tools/oxlint/windfall/`, and the fork will replace them.

## State of this stub

- The repo is cloned from upstream `main` at `c44ef22`, which is the same commit the template vendored, so `src/` is identical.
- Remotes:
  - `upstream`: `dmmulroy/anti-slop`.
  - `origin`: `windfall-digital/antislop`. This repo **does not exist on GitHub yet**; create it as a public fork (`gh repo fork dmmulroy/anti-slop --org windfall-digital --fork-name antislop`), then push.
- `windfall/` is a copy of the template's `tools/oxlint/windfall/`: 3 rules, their tests, and a shared helper. It isn't wired into `package.json`, the tests or CI yet.
- Nothing has been installed (`pnpm install` hasn't run).

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

## TODO

1. **Package**
   - Rename to `@windfall-digital/antislop` and remove `private`.
   - Add a `build` script (`tsc` with emit to `dist/`).
   - Add the `exports` map, and keep `@oxlint/plugins` as a runtime dependency.
   - Keep oxlint and `@oxlint/plugins` on one version. Upstream uses 1.78.0 and the template uses 1.87.0; decide whether to bump.
2. **Tests:** add `tsx windfall/rules/*.test.ts` to the `test` script. Our tests already use upstream's module-level `RuleTester` style. Make sure `pnpm check` lints and typechecks `windfall/` too.
3. **`windfall/index.ts`:** keep the plugin name `windfall`. The `no-interpolated-class-name` message names a consumer helper, `classNames()`; decide whether that wording stays (it's our fork).
4. **Release workflow** (`.github/workflows/release.yml`):
   - Triggers on a `v*` tag push.
   - Runs install, check and build.
   - Commits `dist/` to the tag (force-moving the tag) or to a `release` branch.
   - Creates a GitHub Release.
5. **Upstream sync workflow** (`.github/workflows/upstream-sync.yml`):
   - Runs on a daily `schedule` and on `workflow_dispatch`.
   - Fetches `upstream/main`. If it isn't an ancestor of `main`, it merges it on a `sync/upstream` branch and opens or updates a PR.
   - On a merge conflict, it opens or updates an issue instead.
   - It must not push to `main` directly.
6. **Docs:** a short note in README.md about the fork and the windfall rules. Keep upstream's `LICENSE` and copyright, and add ours alongside it.
7. **First release:** `v0.2.0`.

## After the first release, in windfall-template

- Add the dependency.
- Change the `jsPlugins` specifiers in `oxlint.config.ts` to `@windfall-digital/antislop` and `@windfall-digital/antislop/windfall`.
- Delete `tools/oxlint/anti-slop/`, `tools/oxlint/windfall/` and the `test:lint-rules` script.
- Add an update check for new tags, using Renovate or a scheduled workflow.
- Write ADR 0008, which supersedes ADR 0007 ("vendored, not an npm dependency"). This needs owner sign-off.
