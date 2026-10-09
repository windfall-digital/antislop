# Repository guidance

- `src/` is the canonical plugin implementation.
- Keep rules generic and suitable for reuse across repositories. Do not add application-specific names, paths, or exceptions.
- Use Oxlint's ESTree API; do not add another production parser.
- Add focused RuleTester coverage for semantic rule changes.
- Run `pnpm sync:skill-assets` after changing production source.
- Run `pnpm check` before committing.

## Windfall fork

- This is `windfall-digital/antislop`; read `FORK.md` first.
- `src/` mirrors upstream `dmmulroy/anti-slop`: never edit it here; sync with a merge from `upstream/main`.
- `windfall/` holds Windfall-specific rules (plugin `windfall`); the "generic rules" guidance above applies to `src/` only.
- Do not push, tag, publish, or create GitHub repos without explicit owner approval.
