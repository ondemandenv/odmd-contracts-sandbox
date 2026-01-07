# Contracts Library - Service Overview

## Service Mission

The Contracts Library is the **central contract definition layer** for the ONDEMANDENV platform. It defines all service boundaries, producer/consumer relationships, and deployment configurations. This "build" publishes the NPM package that all other services import.

- **Core Philosophy**: Single source of truth for ecosystem topology and service interfaces
- **Repository**: `_contractsLib-sbx` (this repository)
- **Build ID**: `OdmdBuildContractsSbx`
- **Package Name**: `@ondemandenv/odmd-contracts-sandbox`

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  Contracts Library Build                         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 NPM Package Build                        │   │
│  │                                                          │   │
│  │  lib/OndemandContractsSandbox.ts                        │   │
│  │  lib/repos/**/*-cdk.ts                                  │   │
│  │           │                                              │   │
│  │           ▼                                              │   │
│  │      tsc --build                                        │   │
│  │           │                                              │   │
│  │           ▼                                              │   │
│  │   npm publish → NPM Registry                            │   │
│  │           │                                              │   │
│  │           ▼                                              │   │
│  │  contractsLibLatest (version string)                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Multi-Region Deployment:                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  us-west-1  │  │  us-west-2  │  │  us-east-1  │            │
│  │   (main)    │  │  (usWest2)  │  │  (usEast1)  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                              │
              Published via OdmdShareOut to SSM
              /odmd-share/odmd-contracts-npm/b..main/contractsLibLatest
                              │
                              ▼
                    Platform Central Stack
                    (reads latest version to
                     trigger service rebuilds)
```

## Producers (What This Service Publishes)

| Producer | Type | Description |
|----------|------|-------------|
| `contractsLibLatest` | `OdmdCrossRefProducer` | Latest published NPM package version |

## Multi-Region Envers

The contracts library deploys to multiple regions for redundancy:

| Enver | Account | Region | Branch | SSM Path |
|-------|---------|--------|--------|----------|
| Main | `workspace0` | `us-west-1` | `main` | `/odmd-share/odmd-contracts-npm/b..main/contractsLibLatest` |
| West2 | `workspace0` | `us-west-2` | `usWest2` | `/odmd-share/odmd-contracts-npm/b..usWest2/contractsLibLatest` |
| East1 | `workspace0` | `us-east-1` | `usEast1` | `/odmd-share/odmd-contracts-npm/b..usEast1/contractsLibLatest` |

## What This Repository Defines

### Accounts (`AccountsSbx`)
```typescript
accounts = {
    central: '590184031795',      // Platform orchestration
    networking: '590183907424',   // Shared networking
    workspace0: '975050243618',   // Platform services
    workspace1: '590184130740',   // Application workloads
}
```

### GitHub Repositories (`GithubReposSbx`)
```typescript
githubRepos = {
    CoffeeShopFoundationCdk: { owner: 'ondemandenv', name: 'coffee-shop--foundation' },
    CoffeeShopOrderManagerCdk: { owner: 'ondemandenv', name: 'coffee-shop--order-manager' },
    // ... all service repos
}
```

### Service Builds
- `coffeeShopFoundationCdk` - Shared coffee shop infrastructure
- `coffeeShopOrderManagerCdk` - Order management service
- `coffeeShopOrderProcessorCdk` - Order processing workflows
- `springOpen3Img` / `springOpen3Cdk` - Spring Boot container example
- `networking` - IPAM and Transit Gateway
- `eksCluster` - Kubernetes platform
- `userAuth` - Cognito authentication

## Build Process

```bash
# 1. Generate exports from lib/**/*.ts
npm run gen-exports

# 2. Compile TypeScript
npm run build

# 3. Package for publishing
npm run pack-tgz

# 4. Publish triggers platform update
# (version published to SSM as contractsLibLatest)
```

## Platform Integration

When the contracts library publishes a new version:

1. **Version published** to SSM Parameter Store
2. **Platform Central** detects change via EventBridge
3. **Dependency graph** is rebuilt from new contracts
4. **Affected services** are scheduled for rebuild/redeploy

## Version Key

The platform uses `LATEST_CONTRACTS_LIB_VER_KEY` to track versions:

```typescript
static readonly LATEST_CONTRACTS_LIB_VER_KEY = "LATEST_CONTRACTS_LIB_VER_KEY";
```

## Consuming the Package

Service repositories import this package:

```typescript
import {
    OndemandContractsSandbox,
    CoffeeShopFoundationCdk,
    // ...
} from '@ondemandenv/odmd-contracts-sandbox';

const contracts = new OndemandContractsSandbox();
const foundationEnver = contracts.coffeeShopFoundationCdk.theOne;
```

## Package Organization

```
@ondemandenv/odmd-contracts-sandbox
├── index.ts                    # Auto-generated exports
├── OndemandContractsSandbox.ts # Main contracts class
└── repos/
    ├── coffee-shop/            # Coffee shop service contracts
    ├── sample-spring-openapi3/ # Spring example contracts
    ├── _contracts/             # This build definition
    ├── _eks/                   # EKS cluster contracts
    ├── _nt/                    # Networking contracts
    └── _user-auth/             # Auth service contracts
```
