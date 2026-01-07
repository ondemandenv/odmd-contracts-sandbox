# User Auth - Service Overview

## Service Mission

The User Auth service provides **centralized authentication and identity management** for the ONDEMANDENV platform using AWS Cognito. It manages user pools, identity pools, and AppSync GraphQL APIs for user management operations.

- **Core Philosophy**: Single source of truth for user identity across all platform services
- **Repository**: Platform-managed (internal)
- **Build ID**: `OdmdBuildUserAuthSbx`

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      User Auth Service                           │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Cognito User   │  │ Cognito Identity│  │    AppSync      │ │
│  │     Pool        │  │     Pool        │  │   GraphQL API   │ │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘ │
│           │                    │                    │          │
│           ▼                    ▼                    ▼          │
│    idProviderName       identityPoolId      appsyncGraphqlUrl  │
│    idProviderClientId                                          │
│     (Producers)              (Producer)          (Producer)    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Web Hosting                           │   │
│  │  S3 + CloudFront for authentication UI                  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
              Published via OdmdShareOut to SSM
                              │
                              ▼
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
 Application Services                        Web Clients
 (validate tokens)                      (login/logout flows)
```

## Producers (What This Service Publishes)

| Producer | Type | Description |
|----------|------|-------------|
| `idProviderName` | `OdmdCrossRefProducer` | Cognito User Pool name for token validation |
| `idProviderClientId` | `OdmdCrossRefProducer` | Cognito App Client ID for authentication |
| `appsyncGraphqlUrl` | `OdmdCrossRefProducer` | AppSync GraphQL endpoint for user operations |
| `identityPoolId` | `OdmdCrossRefProducer` | Cognito Identity Pool ID for AWS credentials |

## Consumers (Dependencies)

| Consumer | Type | Description |
|----------|------|-------------|
| `callbackUrls` | `OdmdCrossRefConsumer[]` | OAuth callback URLs from consuming applications |
| `logoutUrls` | `OdmdCrossRefConsumer[]` | OAuth logout URLs from consuming applications |

## Stack Structure

The service deploys three stacks (returned by `getRevStackNames()`):
1. **Main stack** - Cognito User Pool, Identity Pool, AppSync API
2. **Web Hosting stack** (`-web-hosting`) - S3 bucket + CloudFront distribution
3. **Web UI stack** (`-web-ui`) - Authentication UI components

## Deployment

| Property | Value |
|----------|-------|
| Account | `workspace0` (975050243618) |
| Region | `us-east-1` |
| Branch | `odmd-sbx` |

## Authentication Flow

```
┌──────────┐    ┌──────────────┐    ┌─────────────────┐
│  Client  │───▶│ Cognito User │───▶│ Identity Pool   │
│   App    │    │    Pool      │    │ (AWS Creds)     │
└──────────┘    └──────────────┘    └─────────────────┘
     │                │                     │
     │                ▼                     ▼
     │         JWT ID Token          AWS STS Credentials
     │                │                     │
     └────────────────┴─────────────────────┘
                      │
                      ▼
              Access Platform Services
```

## Integration Pattern

Applications integrate with User Auth by:

1. **Consuming producers** to get Cognito configuration:
```typescript
const userPoolId = new OdmdCrossRefConsumer(this, 'userPoolId',
    contracts.userAuth.envers[0].idProviderName);
```

2. **Providing callback URLs** for OAuth flows:
```typescript
// User Auth consumes these to configure allowed redirects
contracts.userAuth.envers[0].callbackUrls.push(
    new OdmdCrossRefConsumer(this, 'callback', myApp.callbackUrl)
);
```

## Cognito Configuration

| Setting | Value |
|---------|-------|
| MFA | Optional (TOTP) |
| Password Policy | Min 8 chars, requires mixed case + numbers |
| Token Validity | Access: 1 hour, Refresh: 30 days |
| OAuth Flows | Authorization Code, Implicit |
