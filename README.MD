# ONDEMANDENV Contracts Sandbox

**The Central Architecture Definition for the ONDEMANDENV Demo Ecosystem**

This repository serves as the **ContractsLib** for the ONDEMANDENV platform demonstration, defining the complete architecture and service contracts for a multi-service coffee shop application and supporting platform services.

## What is ContractsLib?

In ONDEMANDENV, the **ContractsLib** is the central, code-defined hub where teams establish architectural agreements. Think of it as the "Congress" of your distributed system - where service boundaries, dependencies, and interactions are explicitly defined and managed through code.

## Repository Structure

```
├── lib/
│   ├── OndemandContractsSandbox.ts    # Main contracts definition
│   └── repos/                          # Service-specific contracts
│       ├── coffee-shop/               # Coffee shop microservices contracts
│       │   ├── coffee-shop-foundation-cdk.ts
│       │   ├── coffee-shop-order-manager-cdk.ts
│       │   └── coffee-shop-order-processor-cdk.ts
│       ├── _user-auth/                # Platform authentication service
│       ├── _eks/                      # Platform EKS cluster service
│       └── _contracts/                # ContractsLib self-management
```

## Coffee Shop Demo Architecture

This ContractsLib defines a complete microservices architecture demonstrating ONDEMANDENV concepts:

### Foundation Service (`coffee-shop-foundation`)
**Role**: Shared infrastructure provider
**Publishes**: 
- Event bus for inter-service communication
- DynamoDB tables for configuration and counters
- Shared infrastructure primitives

### Order Manager Service (`coffee-shop-order-manager`)  
**Role**: Order lifecycle management
**Consumes**: Foundation event bus and database tables
**Responsibilities**: Order creation, validation, state management

### Order Processor Service (`coffee-shop-order-processor`)
**Role**: Order fulfillment processing  
**Consumes**: Foundation event bus and database tables
**Responsibilities**: Payment processing, inventory management, fulfillment

## Key ONDEMANDENV Concepts Demonstrated

### 1. **Explicit Service Contracts**
```typescript
// Order Manager consumes from Foundation
const foundationCdk = owner.contracts.coffeeShopFoundationCdk.theOne;
this.eventBus = new OdmdCrossRefConsumer(this, 'eventBus', foundationCdk.eventBusSrc);
```

### 2. **Account & Region Targeting**
```typescript
// Services deploy to designated workspace account
new CoffeeShopFoundationEnver(this, this.contracts.accounts.workspace1, 'us-west-1', 
    new SRC_Rev_REF('b', 'master'));
```

### 3. **Product/Consumer Architecture**
- **Products**: What services provide (APIs, databases, message queues)
- **Consumers**: What services require from other services
- **Platform Resolution**: ONDEMANDENV handles dependency injection automatically

## Platform Services Integration

This ContractsLib also demonstrates platform service integration:

- **User Authentication** (`OdmdBuildUserAuthSbx`): Platform-provided auth service
- **EKS Clusters** (`OdmdBuildEksSbx`): Platform-managed Kubernetes clusters  
- **Networking**: Cross-account VPC and connectivity management

## Account Structure

```typescript
accounts: {
    central: '590184031795',      // Platform management
    networking: '590183907424',   // Shared networking
    workspace0: "975050243618",   // Platform services
    workspace1: '590184130740',   // Coffee shop services
}
```

## GitHub Repository Integration

All services are linked to their implementation repositories:

```typescript
githubRepos: {
    CoffeeShopFoundationCdk: 'coffee-shop--foundation',
    CoffeeShopOrderManagerCdk: 'coffee-shop--order-manager', 
    CoffeeShopOrderProcessorCdk: 'coffee-shop--order-processor',
    // ... platform repos
}
```

## Development Workflow

### 1. **Architecture Changes**
Modify contracts in this repository → Platform updates CI/CD for affected services

### 2. **Service Dependencies** 
Add/modify `Consumer` declarations → Platform resolves and injects dependencies

### 3. **New Services**
Define new `Build` and `Enver` classes → Platform provisions infrastructure and pipelines

### 4. **Environment Cloning**
Platform uses these contracts to create on-demand environment clones for development

## Relationship to Implementation

This ContractsLib works in conjunction with:

- **[`contracts-base`](../contracts-base)**: Core ONDEMANDENV platform interfaces
- **[Coffee Shop Services](../coffee-shop--foundation)**: CDK implementations of defined contracts
- **ONDEMANDENV Platform**: Orchestration engine that reads these contracts

## Getting Started

1. **Explore the Contracts**: Start with `OndemandContractsSandbox.ts` to see the overall architecture
2. **Study Service Definitions**: Review the coffee shop service contracts to understand dependencies
3. **Examine Implementation**: Look at the corresponding CDK implementations in the coffee shop repositories
4. **Learn Platform Concepts**: Visit [ondemandenv.github.io](../ondemandenv.github.io) for comprehensive documentation

## Key Benefits Demonstrated

- **Explicit Dependencies**: No hidden coupling between services
- **Version Management**: Clear branching and tagging strategies for environments
- **Cross-Account Deployment**: Services deployed across multiple AWS accounts seamlessly
- **On-Demand Environments**: Spin up complete environments for any Git branch
- **Platform Abstraction**: Complex AWS/Kubernetes management hidden from application teams

This repository showcases how ONDEMANDENV transforms distributed system architecture from implicit, hard-to-manage configurations into explicit, code-driven contracts that enable true microservice agility.