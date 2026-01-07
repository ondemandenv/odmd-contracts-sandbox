# Networking - Service Overview

## Service Mission

The Networking service provides **cross-account network infrastructure** using AWS IPAM (IP Address Management). It manages CIDR allocation, Transit Gateway sharing, NAT gateways, and private DNS zones for the ONDEMANDENV platform.

- **Core Philosophy**: Centralized IP management prevents CIDR conflicts across accounts and regions
- **Repository**: Platform-managed (internal)
- **Build ID**: `OdmdBuildNtSbx`

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Networking Service                            │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    IPAM (us-west-1)                        │ │
│  │  ┌─────────────────┐  ┌─────────────────┐                 │ │
│  │  │  IPAM Pool      │  │  Transit        │                 │ │
│  │  │  10.0.0.0/12    │  │  Gateway        │                 │ │
│  │  │  10.16.0.0/12   │  │                 │                 │ │
│  │  └────────┬────────┘  └────────┬────────┘                 │ │
│  │           │                    │                          │ │
│  │           ▼                    ▼                          │ │
│  │    ipamPoolName        transitGatewayShareName            │ │
│  │                                                           │ │
│  │  ┌─────────────────┐  ┌─────────────────┐                │ │
│  │  │  Central VPC    │  │  NAT Gateway    │                │ │
│  │  │                 │  │                 │                │ │
│  │  └────────┬────────┘  └────────┬────────┘                │ │
│  │           │                    │                          │ │
│  │           ▼                    ▼                          │ │
│  │    centralVpcCidr         natPublicIP                     │ │
│  │                                                           │ │
│  │  Hosted Zone: odmd-lew1.internal                         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    IPAM (us-west-2)                        │ │
│  │  CIDRs: 10.32.0.0/12, 10.48.0.0/12                        │ │
│  │  Hosted Zone: odmd-lew2.internal                          │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
              Published via OdmdShareOut to SSM
                              │
                              ▼
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
   EKS Clusters                              VPC-based Services
   (consume IPAM pools)                     (consume CIDRs)
```

## Regional IPAM Configurations

### us-west-1 (IPAM_WEST1_LE)

| Property | Value |
|----------|-------|
| CIDRs | `10.0.0.0/12`, `10.16.0.0/12` |
| Hosted Zone | `odmd-lew1.internal` |
| Branch | `ipam_west1_le` |

### us-west-2 (IPAM_WEST2_LE)

| Property | Value |
|----------|-------|
| CIDRs | `10.32.0.0/12`, `10.48.0.0/12` |
| Hosted Zone | `odmd-lew2.internal` |
| Branch | `ipam_west2_le` |

## Producers (What This Service Publishes)

| Producer | Type | Description |
|----------|------|-------------|
| `centralVpcCidr` | `OdmdCrossRefProducer` | CIDR block for central/shared VPC |
| `ipamPoolName` | `OdmdCrossRefProducer` | IPAM pool name for VPC CIDR allocation |
| `transitGatewayShareName` | `OdmdCrossRefProducer` | RAM share name for Transit Gateway attachment |
| `natPublicIP` | `OdmdCrossRefProducer` | NAT Gateway public IP for allowlisting |

## Consumers (Dependencies)

| Consumer | Type | Description |
|----------|------|-------------|
| `subdomainNameservers` | `Map<string, OdmdCrossRefConsumer>` | NS records for DNS delegation |

## DNS Delegation

The networking service manages private DNS delegation:

1. Each IPAM region has a root hosted zone (e.g., `odmd-lew1.internal`)
2. Services can register subdomains by providing NS server references
3. A Lambda function triggered by cross-ref changes creates NS records

```typescript
// Example: EKS cluster registering its subdomain
networking.ipam_west1_le.addSubdomainServer(
    'eks-cluster',
    eksCluster.privateDomainName
);
```

## CIDR Allocation Strategy

```
10.0.0.0/8 (Private Class A)
├── 10.0.0.0/12  ─── us-west-1 Pool 1
├── 10.16.0.0/12 ─── us-west-1 Pool 2
├── 10.32.0.0/12 ─── us-west-2 Pool 1
├── 10.48.0.0/12 ─── us-west-2 Pool 2
└── 10.64.0.0/10 ─── Reserved for future regions
```

## Integration Pattern

Services consume networking for VPC creation:

```typescript
// EKS cluster consuming IPAM pool
const ipamPool = new OdmdCrossRefConsumer(this, 'ipamPool',
    contracts.networking.ipam_west1_le.ipamPoolName);

const vpcConfig = new OdmdVpc(
    new OdmdIpAddresses(this, ipamPool),
    'my-vpc'
);
```

## Transit Gateway Connectivity

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Workspace0  │────▶│   Transit    │◀────│  Workspace1  │
│     VPC      │     │   Gateway    │     │     VPC      │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   Central    │
                    │     VPC      │
                    └──────────────┘
```
