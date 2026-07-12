# ONDEMANDENV Contracts Sandbox

Central contract definition layer for the ONDEMANDENV platform sandbox environment.

## Overview

This library defines **service boundaries, producer/consumer relationships, and deployment configurations** for all services in the sandbox ecosystem. It extends `@ondemandenv.dev/contracts-lib-base` to provide concrete implementations.

```
┌─────────────────────────────────────────────────────────────────┐
│              This Library (Contracts Layer)                      │
│                                                                 │
│  Defines:                                                       │
│  - Which services exist                                         │
│  - What each service produces (outputs)                         │
│  - What each service consumes (dependencies)                    │
│  - Where services deploy (accounts/regions)                     │
│  - Which GitHub repos contain implementations                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
              Service repos import this package
              to get their contract definitions
```

## Installation

```bash
npm install @ondemandenv/odmd-contracts-sandbox
```

## Usage

```typescript
import { OndemandContractsSandbox } from '@ondemandenv/odmd-contracts-sandbox';

const contracts = new OndemandContractsSandbox();

// Access service definitions
const foundation = contracts.coffeeShopFoundationCdk.theOne;
const eventBusArn = foundation.eventBusSrc;  // Producer
```

## Services Defined

### Application Services

| Service | Description | Docs |
|---------|-------------|------|
| **Coffee Shop Foundation** | Shared EventBridge + DynamoDB | [SERVICE_OVERVIEW.md](lib/repos/coffee-shop/docs/SERVICE_OVERVIEW.md) |
| **Coffee Shop Order Manager** | Order CRUD and lifecycle | [ORDER_MANAGER_OVERVIEW.md](lib/repos/coffee-shop/docs/ORDER_MANAGER_OVERVIEW.md) |
| **Coffee Shop Order Processor** | Step Functions workflow | [ORDER_PROCESSOR_OVERVIEW.md](lib/repos/coffee-shop/docs/ORDER_PROCESSOR_OVERVIEW.md) |
| **Sample Spring OpenAPI3** | Container → EKS deployment | [SERVICE_OVERVIEW.md](lib/repos/sample-spring-openapi3/docs/SERVICE_OVERVIEW.md) |

### Platform Services

| Service | Description | Docs |
|---------|-------------|------|
| **User Auth** | Cognito User/Identity Pools | [SERVICE_OVERVIEW.md](lib/repos/_user-auth/docs/SERVICE_OVERVIEW.md) |
| **Networking** | IPAM, Transit Gateway, DNS | [SERVICE_OVERVIEW.md](lib/repos/_nt/docs/SERVICE_OVERVIEW.md) |
| **EKS Cluster** | Managed Kubernetes | [SERVICE_OVERVIEW.md](lib/repos/_eks/docs/SERVICE_OVERVIEW.md) |
| **Contracts Library** | This package | [SERVICE_OVERVIEW.md](lib/repos/_contracts/docs/SERVICE_OVERVIEW.md) |

## AWS Accounts

| Account | ID | Purpose |
|---------|-----|---------|
| `central` | 590184031795 | Platform orchestration |
| `networking` | 590183907424 | Shared networking |
| `workspace0` | 975050243618 | Platform services |
| `workspace1` | 590184130740 | Application workloads |

## Development

```bash
# Install dependencies
npm install

# Build (auto-generates exports)
npm run build

# Run tests
npm run test

# Clean
npm run clean
```

## Key Concepts

### Producer/Consumer Pattern

Services declare what they **produce** (outputs) and **consume** (dependencies):

```typescript
// Foundation produces EventBridge bus
class CoffeeShopFoundationEnver extends OdmdEnverCdk {
    readonly eventBusSrc: EvBusSrcRefProducer;  // Output
}

// Order Manager consumes it
class CoffeeShopOrderManagerEnver extends OdmdEnverCdk {
    readonly eventBus: OdmdCrossRefConsumer<..., CoffeeShopFoundationEnver>;

    constructor(...) {
        this.eventBus = new OdmdCrossRefConsumer(this, 'eventBus',
            foundation.eventBusSrc);  // Wire dependency
    }
}
```

### Environment Versions (Envers)

Each service has one or more **Envers** representing deployable environment versions:

| Enver | Purpose |
|-------|---------|
| `mock` | Contract verification with mocked responses |
| `dev` | MVP with real business logic |
| `main` | Production deployment |

### Revision References

```typescript
new SRC_Rev_REF('b', 'main')   // Branch-based (incremental)
new SRC_Rev_REF('t', 'v1.0.0') // Tag-based (immutable)
```

## Project Structure

```
lib/
├── OndemandContractsSandbox.ts    # Main contracts class
├── repos/
│   ├── coffee-shop/               # Coffee shop services
│   │   ├── coffee-shop-foundation-cdk.ts
│   │   ├── coffee-shop-order-manager-cdk.ts
│   │   ├── coffee-shop-order-processor-cdk.ts
│   │   └── docs/                  # Service documentation
│   ├── sample-spring-openapi3/    # Spring Boot example
│   ├── _contracts/                # This library's build
│   ├── _eks/                      # EKS cluster
│   ├── _nt/                       # Networking
│   └── _user-auth/                # Authentication
```

## Related Documentation

- [AGENTS.md](AGENTS.md) - Development guide for AI assistants
- Platform patterns: See `.odmd/` in `@ondemandenv.dev/contracts-lib-base`

## License

MIT
