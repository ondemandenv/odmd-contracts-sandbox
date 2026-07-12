# @ondemandenv/odmd-contracts-sandbox — Agent Rules (Customer Owner)

The **sandbox** ecosystem's contractsLib. Working here = the **Customer Owner** role: take platform grammar + sandbox domain knowledge, output the contract graph (code) and the docs-in-code that flow to every service owner.

## Context supply chain

- **Platform grammar** — `./node_modules/@ondemandenv.dev/contracts-lib-base/.odmd/*.md` (wired into `opencode.json`). How to define contracts + write docs. Key: `ONDEMANDENV_PLATFORM.md`, `ENVER_BASED_SERVICE_CONTEXT_PATTERN.md`, `SYSTEM_OVERVIEW_PATTERN.md`, `ContractsLib_PROJECT_SETUP_PATTERN.md`, `WHY_BRANCH_AS_ENVER_*`.
- **System-level docs** (this repo's `__contracts` build) — `./lib/repos/_contracts/docs/*.md`: the per-customer big picture, delivered to every service owner. Per `SYSTEM_OVERVIEW_PATTERN.md`, the system overview belongs in the `__contracts` build's `docs/` (NOT a top-level `.odmd-<cust>/` dir).

## What you produce here (ships to each service owner via npm dependency descent)

- **Contract graph** (code): builds/envers/producers/consumers in `lib/repos/<service>/*.ts`, wired in the main `OndemandContracts*` class.
- **Per-service docs-in-code** (`lib/repos/<service>/docs/`): overview/context/enver — read a specific service's docs on demand when editing it (outputs, not always-on).
- **System overview** (`lib/repos/_contracts/docs/`): whole-system big picture.

## Build & delivery

```bash
npm run build   # tsc + cpx copies lib/repos/**/docs/** → dist/lib/repos/ (docs-in-code ships via dist)
```

`odmdValidate()` fails if any docs-in-code path doesn't resolve. Every meaningful contracts change MUST bump `package.json` version (else consumers keyed on the `contractsLibLatest` ver triplet won't see it).

## Rules

- `OdmdBuild`/`OdmdEnver` live HERE; service repos hold only stacks/handlers.
- Cross-build wiring after all builds exist. No same-build/cross-region/ContractsLib consumers.
- System overview → `_contracts/docs/`, not a top-level dir (see `SYSTEM_OVERVIEW_PATTERN.md`).
- Do not edit `node_modules/` — delivered platform context, read-only.
