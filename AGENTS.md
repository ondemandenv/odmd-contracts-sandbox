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

---

## Project guide (migrated from CLAUDE.md)


This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is the **ONDEMANDENV Contracts Sandbox** (`@ondemandenv/odmd-contracts-sandbox`) - a concrete implementation of the contracts library for the coffee shop demo ecosystem. It defines service contracts, cross-account deployment configurations, and inter-service dependencies using TypeScript and AWS CDK.

The library extends `@ondemandenv.dev/contracts-lib-base` to define explicit service boundaries and dependency declarations for all services in the sandbox environment.

## Development Commands

```bash
# Build (auto-generates exports first via prebuild)
npm run build

# Run tests (clean + build + jest with required env vars)
npm run test

# Run single test file
npm run test -- tests/aaa-test.ts

# Clean build artifacts
npm run clean

# Generate index.ts exports from lib/**/*.ts
npm run gen-exports

# CDK list stacks (requires AWS profile)
npm run cdk-ls

# Watch mode
npm run watch

# Package for publishing
npm run pack-tgz
```

## Platform primer

PHASES=ENVERS pattern, `OdmdBuild` / `OdmdEnverCdk` / `OdmdCrossRefProducer` / `OdmdCrossRefConsumer` abstractions, and `SRC_Rev_REF` semantics are documented once at `../../odmd-seed/__odmd-contracts-base/.odmd/` (and `~/_odmd/AGENTS.md` § "Shared ODMD concepts"). This file only covers sandbox-specific contracts.

## Architecture

### Type Hierarchy

```
OndemandContracts (base)
    └── OndemandContractsSandbox (this repo)
            ├── accounts: AccountsSbx (AWS account IDs)
            ├── githubRepos: GithubReposSbx (repo configs)
            └── service builds initialized in initializeBuilds()
```

### Contract File Structure

```
lib/
├── OndemandContractsSandbox.ts    # Main orchestrator, accounts, repos
├── repos/
│   ├── coffee-shop/               # Coffee shop service contracts
│   │   ├── coffee-shop-foundation-cdk.ts   # Foundation: EventBridge, DynamoDB
│   │   ├── coffee-shop-order-manager-cdk.ts
│   │   └── coffee-shop-order-processor-cdk.ts
│   ├── sample-spring-openapi3/    # Spring Boot example contracts
│   ├── _contracts/                # This contracts lib build definition
│   ├── _eks/                      # EKS platform service
│   ├── _nt/                       # Networking platform service
│   └── _user-auth/                # Auth platform service
```

### AWS Account Structure

| Account | ID | Purpose |
|---------|-----|---------|
| `central` | 590184031795 | Platform orchestration |
| `networking` | 590183907424 | Shared networking |
| `workspace0` | 975050243618 | Platform services |
| `workspace1` | 590184130740 | Application workloads |

## Producer/Consumer Pattern

```typescript
// Foundation service exposes products (Producers)
export class CoffeeShopFoundationEnver extends OdmdEnverCdk {
    readonly eventBusSrc: EvBusSrcRefProducer;      // Product
    readonly configTableName: OdmdCrossRefProducer;  // Product

    constructor(owner, account, region, revision) {
        super(owner, account, region, revision);
        // Producers created in constructor
        this.eventBusSrc = new EvBusSrcRefProducer(this, 'bus-src');
    }
}

// Order Manager consumes foundation products (Consumers)
export class CoffeeShopOrderManagerEnver extends OdmdEnverCdk {
    readonly eventBus: OdmdCrossRefConsumer<..., CoffeeShopFoundationEnver>;

    constructor(owner, account, region, revision) {
        super(owner, account, region, revision);
        // Get upstream enver and declare consumer
        const foundationCdk = owner.contracts.coffeeShopFoundationCdk.theOne;
        this.eventBus = new OdmdCrossRefConsumer(this, 'eventBus', foundationCdk.eventBusSrc);
    }
}
```

## Build initialization & docs-in-code

Wiring rules (instantiate builds → populate envers → `wireBuildCouplings`) and the `serviceOverviewMD` / `serviceContextMD` / `enverContextMD` pattern are platform-wide — see `../../odmd-seed/__odmd-contracts-base/.odmd/`. Sandbox follows the same pattern; concrete builds wired in `lib/OndemandContractsSandbox.ts → initializeBuilds()`.

## Adding a New Service

1. Create contract file in `lib/repos/<service-name>/<service-name>-cdk.ts`
2. Define `Enver` class extending `OdmdEnverCdk` with producers/consumers
3. Define `Build` class extending `OdmdBuild<T>` with `initializeEnvers()`
4. Add GitHub repo config to `githubRepos` in `OndemandContractsSandbox.ts`
5. Instantiate build in `initializeBuilds()` method
6. Run `npm run build` to regenerate exports

## Schema Artifacts (for service implementations)

Services publish schema artifacts as children of base URL producers:

```typescript
// Producer declares schema child
this.serviceApiBaseUrl = new OdmdCrossRefProducer(this, 'serviceApiBaseUrl', {
    children: [{ pathPart: 'schema-url', s3artifact: true }]
});
```

Supported artifact types:
- **OpenAPI 3.1** for HTTP endpoints
- **AsyncAPI 2.x** for messaging/events
- **ODMD Bundle** referencing both

## Key Files

- `lib/OndemandContractsSandbox.ts:32` - Main contract class, accounts, repos
- `lib/repos/coffee-shop/coffee-shop-foundation-cdk.ts:23` - Foundation Enver with producers
- `lib/repos/coffee-shop/coffee-shop-order-manager-cdk.ts:11` - Order Manager with consumers
- `.scripts/generate-exports.ts` - Auto-generates `index.ts` from lib/**/*.ts
- `tests/aaa-test.ts` - Contract validation test

## Dependencies

- `@ondemandenv.dev/contracts-lib-base`: 0.1.14 - Core contract types
- `aws-cdk-lib`: 2.250.0 - CDK constructs (must match across all service repos)
- `constructs`: ^10.0.0 - CDK construct base

## Platform docs

See `__contractsLib_base/.odmd/` (canonical platform docs) (`ONDEMANDENV_PLATFORM.md`, `ENVER_BASED_SERVICE_CONTEXT_PATTERN.md`, `SERVICE_PHASE_DEVELOPMENT_PATTERN.md`, `ContractsLib_PROJECT_SETUP_PATTERN.md`).
