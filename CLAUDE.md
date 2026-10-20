# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

Daybook: notes, daily plan, weekly plan and projects in one app. The source of truth for requirements is [docs/product/PRD.md](docs/product/PRD.md). Where the PRD and the design canvas disagree, the PRD wins.

## Layout

- `docs/` — all planning and documentation (see [docs/README.md](docs/README.md))
- `design/` — design system tokens, components and canvas screens
- `src/` — application code (not started)

## Conventions

- Put every new planning or documentation file under `docs/`, not the repo root.
- Record significant technical choices as ADRs in `docs/decisions/` using the template there.
- Keep the docs index in `docs/README.md` up to date when adding files.
- Use design tokens from `design/system/tokens.json`; do not hard-code colours.
- Commit author: nuwankarunarathna504@gmail.com.

## Commands

None yet. Add build, test and lint commands here once the stack is chosen.
