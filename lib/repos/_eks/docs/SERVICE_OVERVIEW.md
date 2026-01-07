# EKS Cluster - Service Overview

## Service Mission

The EKS Cluster service provides **managed Kubernetes infrastructure** for the ONDEMANDENV platform. It provisions EKS clusters with IRSA (IAM Roles for Service Accounts) support, integrates with the networking layer for VPC/IPAM, and enables kubectl access through the central account.

- **Core Philosophy**: Shared Kubernetes platform eliminates per-team cluster management overhead
- **Repository**: `__eks` (platform-managed)
- **Build ID**: `OdmdBuildEksSbx`

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      EKS Cluster Service                         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    EKS Control Plane                     │   │
│  │  ┌─────────────────┐  ┌─────────────────┐              │   │
│  │  │  API Server     │  │  OIDC Provider  │              │   │
│  │  │                 │  │    (IRSA)       │              │   │
│  │  └────────┬────────┘  └────────┬────────┘              │   │
│  │           │                    │                        │   │
│  │           ▼                    ▼                        │   │
│  │    clusterEndpoint        oidcProvider                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Node Groups                           │   │
│  │  ┌─────────────────┐  ┌─────────────────┐              │   │
│  │  │  Default Node   │  │  kubectl Role   │              │   │
│  │  │  Group Role     │  │  (Central)      │              │   │
│  │  └────────┬────────┘  └────────┬────────┘              │   │
│  │           │                    │                        │   │
│  │           ▼                    ▼                        │   │
│  │  defaultNodeGroupRoleArn  kubectlRoleArn               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    VPC (from IPAM)                       │   │
│  │  CIDR allocated from networking.ipam_west1_le           │   │
│  │  Private subnets for nodes, public for load balancers   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Producers (What This Service Publishes)

| Producer | Type | Description |
|----------|------|-------------|
| `clusterEndpoint` | `OdmdCrossRefProducer` | EKS API server URL |
| `oidcProvider` | `OdmdCrossRefProducer` | OIDC provider URL for IRSA |
| `kubectlRoleArn` | `OdmdCrossRefProducer` | IAM role ARN for kubectl access |
| `defaultNodeGroupRoleArn` | `OdmdCrossRefProducer` | Default node IAM role for ECR pulls |
| `vpcCidr` | `OdmdCrossRefProducer` | VPC CIDR block |
| `privateDomainName` | `OdmdCrossRefProducer` | Private DNS domain for the cluster |

## Consumers (Dependencies)

| Consumer | Source | Description |
|----------|--------|-------------|
| `centralVpcCidr` | `IPAM_AB.centralVpcCidr` | Central VPC CIDR for peering |
| `ipamPoolName` | `IPAM_AB.ipamPoolName` | IPAM pool for VPC CIDR allocation |
| `transitGatewayShareName` | `IPAM_AB.transitGatewayShareName` | Transit Gateway for connectivity |
| `natPublicIP` | `IPAM_AB.natPublicIP` | NAT Gateway IP |

## Cluster Configuration

| Property | Value |
|----------|-------|
| Cluster Name | `odmd-sbx-eks-cluster-usw10` |
| Account | `workspace0` (975050243618) |
| Region | `us-west-1` |
| Branch | `main` |
| Ephemeral | `false` |

## VPC Configuration

The cluster VPC is created using IPAM pool allocation:

```typescript
const adr = new OdmdIpAddresses(this, ipamWest1Le.ipamPoolName);
this.vpcConfig = new OdmdVpc(adr, 'the-vpc');
```

## kubectl Access Pattern (KubeCtlThruCentral)

Services deploying to EKS implement `KubeCtlThruCentral` interface:

```typescript
interface KubeCtlThruCentral {
    targetNamespace?: string;
    targetEksClusterEndpoint: OdmdCrossRefConsumer<..., OdmdEnverEksCluster>;
}
```

This enables kubectl commands to be routed through the central account's IAM role.

## IRSA (IAM Roles for Service Accounts)

Services can create IAM roles that Kubernetes service accounts can assume:

```typescript
// In service CDK stack
const serviceRole = new iam.Role(this, 'ServiceRole', {
    assumedBy: new iam.FederatedPrincipal(
        oidcProviderArn,
        {
            StringEquals: {
                [`${oidcProviderUrl}:sub`]: `system:serviceaccount:${namespace}:${serviceAccount}`
            }
        },
        'sts:AssumeRoleWithWebIdentity'
    )
});
```

## Integration Example

```typescript
// Service consuming EKS cluster
export class MyServiceEnver extends OdmdEnverCdk implements KubeCtlThruCentral {
    readonly targetEksClusterEndpoint: OdmdCrossRefConsumer<this, OdmdEnverEksCluster>;
    readonly oidcProvider: OdmdCrossRefConsumer<this, OdmdEnverEksCluster>;

    constructor(owner, ...) {
        const eksCluster = owner.contracts.eksCluster.envers[0];
        this.targetEksClusterEndpoint = new OdmdCrossRefConsumer(
            this, 'eksEndpoint', eksCluster.clusterEndpoint,
            { trigger: 'directly', defaultIfAbsent: 'https://placeholder.eks.amazonaws.com' }
        );
    }
}
```

## Node Group ECR Access

The `defaultNodeGroupRoleArn` enables nodes to pull images from ECR:

```typescript
// In container image build, grant ECR pull to node group
this.builtImgNameToRepoGrants = {
    [imageName]: [
        [eksClusterNodeGroupRole,
         "ecr:BatchGetImage",
         "ecr:BatchCheckLayerAvailability",
         "ecr:GetDownloadUrlForLayer"]
    ]
};
```
