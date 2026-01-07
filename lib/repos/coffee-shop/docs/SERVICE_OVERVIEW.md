# Coffee Shop Foundation - Service Overview

## Service Mission

The Coffee Shop Foundation is the **shared infrastructure layer** for the Coffee Shop demo ecosystem. It owns the core resources that multiple downstream services depend on: the event bus for inter-service communication and DynamoDB tables for shared state.

- **Core Philosophy**: Centralize shared infrastructure to avoid duplication and ensure consistent event-driven communication
- **Repository**: `coffee-shop--foundation`
- **Build ID**: `CoffeeShopFoundationCdk`

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Coffee Shop Foundation                        │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   EventBridge   │  │  Config Table   │  │  Count Table    │ │
│  │      Bus        │  │   (DynamoDB)    │  │   (DynamoDB)    │ │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘ │
│           │                    │                    │          │
│           ▼                    ▼                    ▼          │
│     eventBusSrc          configTableName      countTableName   │
│     (Producer)            (Producer)           (Producer)      │
└─────────────────────────────────────────────────────────────────┘
                              │
              Published via OdmdShareOut to SSM
                              │
                              ▼
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
 Order Manager                               Order Processor
 (Consumer)                                  (Consumer)
```

## Producers (What This Service Publishes)

| Producer | Type | Description |
|----------|------|-------------|
| `eventBusSrc` | `EvBusSrcRefProducer` | EventBridge bus ARN + event source name |
| `eventBusSrc.source` | Child of above | The event source identifier for rules |
| `configTableName` | `OdmdCrossRefProducer` | DynamoDB table name for shop configuration |
| `countTableName` | `OdmdCrossRefProducer` | DynamoDB table name for order counting/metrics |

## Consumers (Dependencies)

None - this is the foundation layer with no upstream dependencies.

## Downstream Services

- **Coffee Shop Order Manager** - Consumes all producers
- **Coffee Shop Order Processor** - Consumes all producers

## Deployment

| Property | Value |
|----------|-------|
| Account | `workspace1` (590184130740) |
| Region | `us-west-1` |
| Branch | `master` |

## Data Schemas

### Config Table
```json
{
  "shopId": "string (partition key)",
  "configKey": "string (sort key)",
  "configValue": "any",
  "updatedAt": "ISO8601 timestamp"
}
```

### Count Table
```json
{
  "shopId": "string (partition key)",
  "date": "string (sort key, YYYY-MM-DD)",
  "orderCount": "number",
  "totalRevenue": "number"
}
```

## Event Schema

Events published to EventBridge follow this envelope:
```json
{
  "source": "coffee-shop.foundation",
  "detail-type": "OrderCreated | OrderUpdated | ConfigChanged",
  "detail": {
    "shopId": "string",
    "timestamp": "ISO8601",
    "payload": {}
  }
}
```
