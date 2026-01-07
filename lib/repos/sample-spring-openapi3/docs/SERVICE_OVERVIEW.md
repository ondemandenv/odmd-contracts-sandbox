# Sample Spring OpenAPI3 - Service Overview

## Service Mission

This is a **demo Spring Boot application** showcasing how to deploy a containerized Java service with OpenAPI 3 (Swagger) documentation to EKS using the ONDEMANDENV platform. It demonstrates the container image build → EKS deployment pattern.

- **Core Philosophy**: Example of container-based service deployment with API documentation
- **Repository**: `sample-spring-api-ecs` (shared repo, different build IDs)
- **Build IDs**:
  - `SampleSpringOpenApi3Img` - Container image build
  - `SampleSpringOpenApi3Cdk` - EKS deployment

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Two-Phase Deployment                          │
│                                                                 │
│  Phase 1: Image Build (SampleSpringOpenApi3Img)                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  GitHub Actions                                          │   │
│  │       │                                                  │   │
│  │       ▼                                                  │   │
│  │  [Build JAR] -> [Docker Build] -> [Push to ECR]         │   │
│  │                                          │               │   │
│  │                                          ▼               │   │
│  │                              ctnImgRefProducer           │   │
│  │                              (ECR repo + latest SHA)     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  Phase 2: EKS Deploy (SampleSpringOpenApi3Cdk)                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  Consumes:                                               │   │
│  │  - appImgRepoRef (ECR repository)                       │   │
│  │  - appImgLatestRef (latest image SHA)                   │   │
│  │  - targetEksClusterEndpoint                             │   │
│  │  - oidcProvider                                         │   │
│  │  - defaultNodeGroupRoleArn                              │   │
│  │                                                          │   │
│  │       │                                                  │   │
│  │       ▼                                                  │   │
│  │  [K8s Deployment] -> [K8s Service] -> [Ingress/ALB]     │   │
│  │                                              │           │   │
│  │                                              ▼           │   │
│  │                                        apiEndpoint       │   │
│  │                                        (Producer)        │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Build 1: Container Image (`SampleSpringOpenApi3Img`)

### Producers

| Producer | Type | Description |
|----------|------|-------------|
| `ctnImgRefProducer` | `CtnImgRefProducer` | ECR repository URI |
| `ctnImgRefProducer.latestSha` | Child | Latest pushed image SHA tag |

### Image Details

| Property | Value |
|----------|-------|
| Image Name | `spring-boot-swagger-3-example:0.0.1-SNAPSHOT` |
| ECR Repo | Auto-generated with `open3` suffix |

## Build 2: EKS Deployment (`SampleSpringOpenApi3Cdk`)

### Producers

| Producer | Type | Description |
|----------|------|-------------|
| `apiEndpoint` | `OdmdCrossRefProducer` | Base URL of deployed service |
| `apiEndpoint/api-doc` | Child | OpenAPI spec endpoint |
| `apiEndpoint/swagger-ui` | Child | Swagger UI endpoint |

### Consumers

| Consumer | Source | Description |
|----------|--------|-------------|
| `appImgRepoRef` | `SampleSpringOpenApi3Img.ctnImgRefProducer` | ECR repository for image pull |
| `appImgLatestRef` | `SampleSpringOpenApi3Img.ctnImgRefProducer.latestSha` | Image tag to deploy |
| `targetEksClusterEndpoint` | `EksClusterEnver.clusterEndpoint` | EKS API server URL |
| `oidcProvider` | `EksClusterEnver.oidcProvider` | IRSA OIDC provider |
| `defaultNodeGroupRoleArn` | `EksClusterEnver.defaultNodeGroupRoleArn` | Node IAM role |

### Implements

- `KubeCtlThruCentral` - Enables kubectl commands routed through central account

## API Endpoints (When Deployed)

| Path | Description |
|------|-------------|
| `/` | Application root |
| `/api-docs` | OpenAPI 3.0 JSON spec |
| `/swagger-ui.html` | Interactive API documentation |
| `/actuator/health` | Health check endpoint |

## Deployment

| Property | Value |
|----------|-------|
| Account | `workspace1` (590184130740) |
| Region | `us-west-1` |
| Branch | `master` |
| Work Dirs | `['cdk']` |

## Dependency Graph

```
EKS Cluster (Platform)
       │
       ├── clusterEndpoint
       ├── oidcProvider
       └── defaultNodeGroupRoleArn
               │
               ▼
SampleSpringOpenApi3Img ──────────────> SampleSpringOpenApi3Cdk
    (ctnImgRefProducer)                      (apiEndpoint)
```

## Spring Boot Application

This is a standard Spring Boot 3.x application with:
- Spring Web for REST endpoints
- SpringDoc OpenAPI 3 for API documentation
- Spring Boot Actuator for health/metrics
- Containerized with multi-stage Dockerfile
