# ONDEMANDENV Full SDLC Guide: Coffee Shop Microservices Example

This guide demonstrates the complete Software Development Lifecycle (SDLC) using ONDEMANDENV through a practical microservices example. You'll learn how contracts, dependencies, deployments, and developer workflows come together to create a robust, scalable platform.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Contract Definition Phase](#contract-definition-phase)
3. [Service Implementation Phase](#service-implementation-phase)
4. [Platform Integration Phase](#platform-integration-phase)
5. [Development Workflow](#development-workflow)
6. [Production Deployment](#production-deployment)
7. [Operations and Monitoring](#operations-and-monitoring)
8. [Advanced Patterns](#advanced-patterns)

---

## Architecture Overview

### System Components

Our coffee shop system demonstrates a typical microservices architecture:

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│                     │    │                     │    │                     │
│  Coffee Shop        │    │  Order Manager      │    │  Order Processor    │
│  Foundation         │◄───┤  Service            │    │  Service            │
│                     │    │                     │    │                     │
│  • Event Bus        │    │  • Order Workflows  │    │  • Order Processing │
│  • Config Tables    │◄───┤  • State Machines   │    │  • Business Logic   │
│  • Counter Tables   │    │  • Event Handling   │    │  • Event Handling   │
│                     │    │                     │    │                     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
         │                            │                            │
         │                            │                            │
         └────────────────────────────┼────────────────────────────┘
                                      │
                              ┌───────▼────────┐
                              │                │
                              │ ONDEMANDENV    │
                              │ Platform       │
                              │                │
                              │ • Dependency   │
                              │   Resolution   │
                              │ • Cross-Account│
                              │   Deployment   │
                              │ • Environment  │
                              │   Cloning      │
                              │                │
                              └────────────────┘
```

### Key Principles

- **Application-Centric**: Each service owns its complete vertical slice (infrastructure + application)
- **Contract-Driven**: All dependencies explicitly defined in code
- **Environment-as-Code**: Every environment version is reproducible and versioned
- **On-Demand Isolation**: Developers get full-stack environments instantly

---

## Contract Definition Phase

### Step 1: Define Service Contracts

In the ContractsLib (`contracts-sandbox`), teams define their service boundaries and dependencies.

#### Foundation Service Contract

```typescript
// lib/repos/coffee-shop/coffee-shop-foundation-cdk.ts
export class CoffeeShopFoundationEnver extends OdmdEnverCdk {
    constructor(owner: OdmdBuild<OdmdEnverCdk>, targetAWSAccountID: string,
                targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
        super(owner, targetAWSAccountID, targetAWSRegion, targetRevision);
        
        // PRODUCTS this service will publish
        this.eventBusSrc = new EvBusSrcRefProducer(this, 'bus-src')
        this.configTableName = new EvBusSrcRefProducer(this, 'config-table')
        this.countTableName = new EvBusSrcRefProducer(this, 'count-table')
    }

    readonly eventBusSrc: EvBusSrcRefProducer;
    readonly configTableName: OdmdCrossRefProducer<CoffeeShopFoundationEnver>;
    readonly countTableName: OdmdCrossRefProducer<CoffeeShopFoundationEnver>;
}

export class CoffeeShopFoundationCdk extends OdmdBuild<OdmdEnverCdk> {
    constructor(scope: OndemandContractsSandbox) {
        super(scope, 'coffee-shop-foundation', scope.githubRepos.CoffeeShopFoundationCdk);
    }

    protected initializeEnvers(): void {
        this._theOne = new CoffeeShopFoundationEnver(
            this, 
            this.contracts.accounts.workspace1, 
            'us-west-1',
            new SRC_Rev_REF('b', 'master')  // Branch-based Enver
        );
        this._envers = [this._theOne];
    }
}
```

#### Order Manager Service Contract

```typescript
// lib/repos/coffee-shop/coffee-shop-order-manager-cdk.ts
export class CoffeeShopOrderManagerEnver extends OdmdEnverCdk {
    constructor(owner: CoffeeShopOrderManagerCdk, targetAWSAccountID: string,
                targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
        super(owner, targetAWSAccountID, targetAWSRegion, targetRevision);

        // CONSUME foundation services - explicit dependency declaration
        const foundationCdk = owner.contracts.coffeeShopFoundationCdk.theOne;
        this.eventBus = new OdmdCrossRefConsumer(this, 'eventBus', foundationCdk.eventBusSrc);
        this.eventSrc = new OdmdCrossRefConsumer(this, 'eventSrc', foundationCdk.eventBusSrc.source);
        this.configTableName = new OdmdCrossRefConsumer(this, 'configTableName', foundationCdk.configTableName);
        this.countTableName = new OdmdCrossRefConsumer(this, 'countTableName', foundationCdk.countTableName);
    }

    readonly eventBus: OdmdCrossRefConsumer<CoffeeShopOrderManagerEnver, CoffeeShopFoundationEnver>;
    readonly eventSrc: OdmdCrossRefConsumer<CoffeeShopOrderManagerEnver, CoffeeShopFoundationEnver>;
    readonly configTableName: OdmdCrossRefConsumer<CoffeeShopOrderManagerEnver, CoffeeShopFoundationEnver>;
    readonly countTableName: OdmdCrossRefConsumer<CoffeeShopOrderManagerEnver, CoffeeShopFoundationEnver>;
}
```

### Step 2: Organizational Mapping

The ContractsLib defines the organizational structure:

```typescript
// lib/OndemandContractsSandbox.ts
export class OndemandContractsSandbox extends OndemandContracts {
    get accounts(): AccountsSbx {
        return {
            central: '590184031795',        // Platform orchestration
            networking: '590183907424',    // Shared networking
            workspace0: "975050243618",    // Platform services
            workspace1: '590184130740',    // Application workloads
        }
    }

    get githubRepos(): GithubReposSbx {
        return {
            CoffeeShopFoundationCdk: {
                owner: 'ondemandenv',
                name: 'coffee-shop--foundation',
                ghAppInstallID: 41561130
            },
            CoffeeShopOrderManagerCdk: {
                owner: 'ondemandenv',
                name: 'coffee-shop--order-manager', 
                ghAppInstallID: 41561130
            },
            // ... other repos
        }
    }
}
```

### Contract Review Process

1. **Pull Request Creation**: Teams propose contract changes via PR
2. **Cross-Team Review**: Affected teams review dependency changes
3. **Type Safety**: TypeScript ensures contract compliance
4. **Approval & Merge**: Changes become the new architecture truth

---

## Service Implementation Phase

### Step 3: Foundation Service Implementation

The foundation service implements its contract by creating actual AWS resources:

```typescript
// coffee-shop--foundation/lib/coffee-shop--foundation-stack.ts
export class CoffeeShopFoundationStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        // Create actual AWS resources
        const eventBus = new EventBus(this, 'coffee-shop-event-bus')
        new Rule(this, 'log-all', {
            eventBus,
            eventPattern: {source: [eventBus.eventBusName]},
            targets: [new CloudWatchLogGroup(
                new LogGroup(this, 'logAll-log-group', {
                    retention: RetentionDays.TWO_WEEKS
                })
            )]
        })

        const configTable = new Table(this, 'configTable', {
            partitionKey: {name: 'PK', type: AttributeType.STRING},
            billingMode: BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY
        });

        // Initialize with menu data
        new InitDynamoDb(this, 'init-configTable', {
            table: configTable, 
            data: [
                JSON.parse(fs.readFileSync(__dirname + `/menu.json`).toString()),
                marshall({
                    "PK": "config",
                    "maxOrdersInQueue": 10,
                    "maxOrdersPerUser": 1,
                    "storeOpen": true
                })
            ],
            partitionKey: configTableProps.partitionKey
        })

        const countingTable = new Table(this, 'countingTable-tmp', {
            partitionKey: {name: 'PK', type: AttributeType.STRING},
            billingMode: BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY
        })

        // PUBLISH products to the platform
        const myEnver = OndemandContractsSandbox.inst.getTargetEnver() as CoffeeShopFoundationEnver
        new OdmdShareOut(
            this, new Map<OdmdCrossRefProducer<CoffeeShopFoundationEnver>, any>([
                [myEnver.configTableName, configTable.tableName],
                [myEnver.countTableName, countingTable.tableName],
                [myEnver.eventBusSrc, eventBus.eventBusName],
                [myEnver.eventBusSrc.source, eventBus.eventBusName],
            ])
        )
    }
}
```

### Step 4: Order Manager Service Implementation

The Order Manager consumes foundation services:

```typescript
// coffee-shop--order-manager/lib/coffee-shop--order-manager-stack.ts
export class CoffeeShopOrderManagerStack extends cdk.Stack {
    constructor(scope: Construct, enver: OdmdEnverCdk, props?: cdk.StackProps) {
        const id = enver.getRevStackNames()[0];
        super(scope, id, props);

        const myEnver = enver as CoffeeShopOrderProcessorEnver
        
        // CONSUME products from foundation service
        const eventBus: IEventBus = EventBus.fromEventBusName(
            this, 'eventBus', 
            myEnver.eventBus.getSharedValue(this)  // Platform resolves dependency!
        )
        const source = myEnver.eventSrc.getSharedValue(this) as string
        const configTable: ITable = dynamodb.Table.fromTableName(
            this, 'ConfigTable', 
            myEnver.configTableName.getSharedValue(this)  // Platform resolves dependency!
        );

        // Create service-specific resources
        const orderTable = new Table(this, 'orderTable', {
            partitionKey: {name: 'PK', type: AttributeType.STRING},
            sortKey: {name: 'SK', type: AttributeType.STRING},
            billingMode: BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY
        });

        // Event-driven integration with foundation
        const onWorkflowStartedFunc = new NodejsFunction(this, 'onWorkflowStarted-func', {
            entry: __dirname + '/onWorkflowStarted/index.ts',
            environment: {
                orderTableName: orderTable.tableName
            }
        });
        
        new Rule(this, 'onWorkflowStarted-rule', {
            eventBus,  // Using shared event bus from foundation
            eventPattern: {
                source: [source],
                detailType: [OndemandContractsSandbox.inst.coffeeShopOrderProcessorCdk.WORKFLOW_STARTED]
            },
            targets: [new aws_events_targets.LambdaFunction(onWorkflowStartedFunc)]
        })
        
        orderTable.grantFullAccess(onWorkflowStartedFunc)

        // Step Functions for order processing
        const stateMachine = new sfn.StateMachine(this, 'ServerlesspressoStateMachine', {
            definitionBody: sfn.DefinitionBody.fromChainable(
                decideAction
                    .when(sfn.Condition.stringEquals('$.action', 'complete'), cc.completeOrder)
                    .when(sfn.Condition.stringEquals('$.action', 'cancel'), cc.cancelOrder)
                    .when(sfn.Condition.stringEquals('$.action', 'make'), sm.claimOrder)
                    .otherwise(po.customerPutOrder)
            ),
        });
    }
}
```

---

## Platform Integration Phase

### Step 5: CDK App Integration

Each service integrates with the ONDEMANDENV platform:

```typescript
// coffee-shop--foundation/bin/coffee-shop--foundation.ts
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {CoffeeShopFoundationStack} from "../lib/coffee-shop--foundation-stack";
import {OndemandContractsSandbox} from "@ondemandenv/odmd-contracts-sandbox";
import {OdmdEnverCdk} from "@ondemandenv/contracts-lib-base";

const app = new cdk.App();

async function main() {
    const buildRegion = process.env.CDK_DEFAULT_REGION;
    const buildAccount = process.env.CDK_DEFAULT_ACCOUNT;
    
    const props = {
        env: { account: buildAccount, region: buildRegion }
    };

    // Initialize the contracts system
    new OndemandContractsSandbox(app)
    
    // Platform determines which Enver to deploy based on:
    // - Git branch/tag (from CI/CD context)
    // - Target account/region (from contracts)
    const targetEnver = OndemandContractsSandbox.inst.getTargetEnver() as OdmdEnverCdk
    
    // Deploy with platform-generated unique stack name
    new CoffeeShopFoundationStack(app, targetEnver.getRevStackNames()[0], props)
}

main().catch(e => {
    console.error(e)
    throw e
})
```

### Step 6: Platform Dependency Resolution

When a service deploys, the platform:

1. **Reads Contracts**: Analyzes dependency graph from ContractsLib
2. **Resolves Dependencies**: Fetches published values from config store (SSM Parameter Store)
3. **Injects Values**: Provides concrete values via `getSharedValue()` calls
4. **Ensures Isolation**: Uses unique naming based on Enver identity

```typescript
// Platform resolution process (conceptual)
const dependencies = {
    'eventBus': 'coffee-shop-event-bus-master-abc123',
    'configTableName': 'configTable-master-abc123',
    'countTableName': 'countingTable-master-abc123'
}

// Injected at runtime into consuming services
myEnver.eventBus.getSharedValue(this) // Returns: 'coffee-shop-event-bus-master-abc123'
```

---

## Development Workflow

### Developer Daily Workflow

#### 1. Feature Development

```bash
# Developer starts new feature
git checkout -b feature/payment-validation
# Make code changes...
git add .
git commit -m "Add payment validation logic

odmd: create@master"
git push origin feature/payment-validation
```

#### 2. Platform Automatic Response

The platform detects the `odmd: create@master` command and:

```
┌─────────────────────────────────────────────────────────────┐
│ ONDEMANDENV Platform Actions                                │
├─────────────────────────────────────────────────────────────┤
│ 1. Create new Enver: feature-payment-validation            │
│ 2. Copy dependency versions from master Enver              │
│ 3. Deploy Foundation clone:                                 │
│    • coffee-shop-event-bus-feature-payment-validation      │
│    • configTable-feature-payment-validation                │
│    • countingTable-feature-payment-validation              │
│ 4. Deploy Order Manager clone:                             │
│    • Automatically connects to cloned Foundation           │
│    • orderTable-feature-payment-validation                 │
│ 5. Deploy Order Processor clone:                           │
│    • Automatically connects to cloned Foundation           │
│ 6. Provide developer with endpoints and access info        │
└─────────────────────────────────────────────────────────────┘
```

#### 3. Isolated Testing

Developer now has a complete, isolated environment:

```bash
# Environment URLs provided by platform
export ORDER_API_URL="https://api-feature-payment-validation.coffee-shop.dev"
export ORDER_PROCESSOR_URL="https://processor-feature-payment-validation.coffee-shop.dev"

# Run integration tests
npm run test:integration

# Manual testing
curl -X POST $ORDER_API_URL/orders -d '{"item": "latte", "size": "large"}'
```

#### 4. Cleanup

```bash
# When feature is complete
git commit -m "Feature complete, ready for merge

odmd: delete"
git push origin feature/payment-validation

# Platform automatically destroys all cloned resources
# Merge to master via Pull Request
```

### Team Collaboration

#### Multiple Developers Working Simultaneously

```
master branch (stable)
├── Foundation Enver (shared dependencies)
├── Order Manager Enver
└── Order Processor Enver

feature/payment-validation (Developer A)
├── Foundation Clone A
├── Order Manager Clone A  
└── Order Processor Clone A

feature/mobile-app (Developer B)  
├── Foundation Clone B
├── Order Manager Clone B
└── Order Processor Clone B

feature/inventory-mgmt (Developer C)
├── Foundation Clone C
├── Order Manager Clone C
└── Order Processor Clone C
```

Each developer works in complete isolation with zero conflicts.

---

## Production Deployment

### Immutable Production Releases

#### 1. Create Production Release

```bash
# Create release tag
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0
```

#### 2. Update Contracts for Production

```typescript
// In contracts-sandbox, create immutable Enver
const coffeeShopFoundationProd = new CoffeeShopFoundationEnver(
    this, 
    this.contracts.accounts.workspace1, 
    'us-west-1',
    new SRC_Rev_REF('t', 'v1.0.0')  // Tag-based (immutable) Enver
);

// Tag Envers can only consume from other Tag Envers
// This ensures complete immutability and reproducibility
```

#### 3. Deployment Pipeline

```yaml
# .github/workflows/production-deploy.yml
name: Production Deploy
on:
  push:
    tags: ['v*']

jobs:
  deploy-foundation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy Foundation
        run: |
          # Platform automatically:
          # 1. Recognizes tag-based deployment
          # 2. Ensures all dependencies are immutable
          # 3. Deploys to production account
          # 4. Publishes versioned products
          npx cdk deploy --require-approval never
          
  deploy-services:
    needs: deploy-foundation
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [order-manager, order-processor]
    steps:
      - name: Deploy {{ matrix.service }}
        run: |
          # Platform automatically resolves production dependencies
          # Services consume exact versioned products from foundation
          npx cdk deploy --require-approval never
```

### Blue/Green Deployments

```typescript
// Define multiple production Envers
const coffeeShopFoundationBlue = new CoffeeShopFoundationEnver(/*blue config*/);
const coffeeShopFoundationGreen = new CoffeeShopFoundationEnver(/*green config*/);

// Traffic routing Enver controls which version receives traffic
const routingEnver = new TrafficRoutingEnver(this, 'ProductionRouting', {
    blueEndpoint: coffeeShopFoundationBlue.apiEndpoint,
    greenEndpoint: coffeeShopFoundationGreen.apiEndpoint,
    trafficSplit: { blue: 90, green: 10 }  // Canary deployment
});
```

---

## Operations and Monitoring

### Environment Visibility

The platform provides comprehensive visibility:

```bash
# List all environments
odmd env list

OUTPUT:
┌──────────────────────────┬─────────────┬──────────────┬────────────┐
│ Environment              │ Type        │ Status       │ Resources  │
├──────────────────────────┼─────────────┼──────────────┼────────────┤
│ coffee-shop-master       │ Branch      │ Healthy      │ 12         │
│ coffee-shop-v1.0.0       │ Tag         │ Healthy      │ 12         │
│ coffee-shop-feature-pay  │ Clone       │ Healthy      │ 12         │
│ coffee-shop-feature-mob  │ Clone       │ Deploying    │ 8          │
└──────────────────────────┴─────────────┴──────────────┴────────────┘

# Check specific environment
odmd env describe coffee-shop-feature-pay

OUTPUT:
Environment: coffee-shop-feature-pay
Type: Clone (from master)
Created: 2024-01-15 10:30:00
Dependencies:
  ├── Foundation: coffee-shop-foundation-feature-pay
  ├── Order Manager: coffee-shop-order-mgr-feature-pay  
  └── Order Processor: coffee-shop-order-proc-feature-pay

Resources:
  ├── EventBridge: coffee-shop-event-bus-feature-pay
  ├── DynamoDB: configTable-feature-pay
  ├── DynamoDB: countingTable-feature-pay
  ├── DynamoDB: orderTable-feature-pay
  └── Step Functions: ServerlesspressoStateMachine-feature-pay

Endpoints:
  ├── Order API: https://api-feature-pay.coffee-shop.dev
  └── Processor: https://processor-feature-pay.coffee-shop.dev
```

### Cost Management

```bash
# Cost breakdown by environment
odmd cost breakdown --timeframe 7d

OUTPUT:
┌──────────────────────────┬──────────────┬─────────────┬────────────┐
│ Environment              │ Daily Avg    │ 7-Day Total │ Trend      │
├──────────────────────────┼──────────────┼─────────────┼────────────┤
│ coffee-shop-master       │ $12.50       │ $87.50      │ ↗ +5%      │
│ coffee-shop-v1.0.0       │ $15.20       │ $106.40     │ → stable   │
│ coffee-shop-feature-*    │ $3.20        │ $22.40      │ ↘ -10%     │
└──────────────────────────┴──────────────┴─────────────┴────────────┘

# Automatic cleanup recommendations
odmd cleanup recommendations

OUTPUT:
Cleanup Recommendations:
├── coffee-shop-feature-old-ui (idle 14 days) - Save $22/day
├── coffee-shop-feature-archived (idle 30 days) - Save $18/day
└── coffee-shop-test-branch (failed deploy) - Save $8/day

Total potential savings: $48/day
```

### Health Monitoring

```typescript
// Built-in health checks per Enver
const healthCheck = new HealthCheck(this, 'EnverHealth', {
    enver: myEnver,
    checks: [
        new ResourceHealthCheck('DynamoDB', configTable),
        new ResourceHealthCheck('EventBridge', eventBus),
        new EndpointHealthCheck('API', orderApiUrl),
        new DependencyHealthCheck('Foundation', foundationEnver)
    ]
});

// Platform-wide dependency monitoring
const dependencyMonitor = new DependencyMonitor(this, 'DepMonitor', {
    alertOnCircularDeps: true,
    alertOnMissingDeps: true,
    alertOnVersionSkew: true
});
```

---

## Advanced Patterns

### Cross-Account Service Mesh

```typescript
// Services across different accounts
const networkingEnver = new NetworkingEnver(this, accounts.networking, 'us-west-1');
const eksEnver = new EksEnver(this, accounts.workspace0, 'us-west-1', {
    consumes: [networkingEnver.vpcConfig]
});
const appEnver = new AppEnver(this, accounts.workspace1, 'us-west-1', {
    consumes: [eksEnver.clusterConfig, networkingEnver.subnetConfig]
});

// Platform handles all cross-account IAM complexity
```

### Multi-Region Deployments

```typescript
// Same contracts, multiple regions
const usWestEnver = new CoffeeShopFoundationEnver(this, accounts.workspace1, 'us-west-1');
const usEastEnver = new CoffeeShopFoundationEnver(this, accounts.workspace1, 'us-east-1');
const euWestEnver = new CoffeeShopFoundationEnver(this, accounts.workspace1, 'eu-west-1');

// Global routing Enver coordinates traffic
const globalRouter = new GlobalRoutingEnver(this, {
    regions: [
        { enver: usWestEnver, weight: 40 },
        { enver: usEastEnver, weight: 40 },
        { enver: euWestEnver, weight: 20 }
    ]
});
```

### Integration Testing Environments

```typescript
// Create test environments with specific configurations
const loadTestEnver = new CoffeeShopFoundationEnver(this, accounts.workspace1, 'us-west-1', {
    scalingConfig: { minCapacity: 10, maxCapacity: 100 },
    testData: TestDataSet.LOAD_TEST
});

const e2eTestEnver = new CoffeeShopFoundationEnver(this, accounts.workspace1, 'us-west-1', {
    scalingConfig: { minCapacity: 1, maxCapacity: 5 },
    testData: TestDataSet.E2E_TEST
});
```

---

## Summary

ONDEMANDENV transforms the development lifecycle by:

1. **Codifying Architecture**: All service relationships defined in TypeScript
2. **Automating Dependencies**: Platform handles complex resolution and injection
3. **Enabling Isolation**: Developers get full-stack environments instantly
4. **Simplifying Operations**: Unified visibility and management across environments
5. **Scaling Teams**: Zero coordination needed for parallel development

The coffee shop example demonstrates how microservices can be developed, deployed, and operated with minimal complexity while maintaining full control and visibility across the entire system lifecycle.

### Next Steps

1. **Explore the Code**: Check out the actual implementation in each service repository
2. **Try On-Demand Cloning**: Create your own feature branch and add `odmd: create@master`
3. **Extend the System**: Add new services following the same contract patterns
4. **Monitor and Optimize**: Use the platform tools to understand costs and performance

For more details, visit the [ONDEMANDENV documentation](https://ondemandenv.dev) or explore the [GitHub organization](https://github.com/ondemandenv). 