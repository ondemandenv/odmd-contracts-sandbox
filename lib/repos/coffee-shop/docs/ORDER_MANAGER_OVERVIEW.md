# Coffee Shop Order Manager - Service Overview

## Service Mission

The Order Manager handles the **order lifecycle** for the Coffee Shop system. It receives customer orders, validates them against shop configuration, persists order state, and emits events for downstream processing.

- **Core Philosophy**: Single responsibility for order CRUD operations and lifecycle state management
- **Repository**: `coffee-shop--order-manager`
- **Build ID**: `CoffeeShopOrderManagerCdk`

## Architecture

```
                         ┌─────────────────┐
                         │    Customer     │
                         │    (API GW)     │
                         └────────┬────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Coffee Shop Order Manager                     │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Order Lambda   │  │   Order Table   │  │  Event Emitter  │ │
│  │   (Handler)     │  │   (DynamoDB)    │  │   (EventBridge) │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│           │                                         │          │
│           │         Consumes from Foundation:       │          │
│           │         - eventBus                      │          │
│           │         - eventSrc                      │          │
│           │         - configTableName               │          │
│           │         - countTableName                │          │
└───────────┼─────────────────────────────────────────┼──────────┘
            │                                         │
            │                                         ▼
            │                               ┌─────────────────┐
            │                               │ Order Processor │
            │                               │   (Subscriber)  │
            │                               └─────────────────┘
            ▼
    Reads shop config,
    Updates order counts
```

## Producers (What This Service Publishes)

None - this service consumes foundation resources and emits events to the shared bus.

## Consumers (Dependencies)

| Consumer | Source | Description |
|----------|--------|-------------|
| `eventBus` | `CoffeeShopFoundationEnver.eventBusSrc` | EventBridge bus ARN for publishing events |
| `eventSrc` | `CoffeeShopFoundationEnver.eventBusSrc.source` | Event source name for rules |
| `configTableName` | `CoffeeShopFoundationEnver.configTableName` | Shop configuration lookup |
| `countTableName` | `CoffeeShopFoundationEnver.countTableName` | Order metrics updates |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/orders` | Create a new order |
| `GET` | `/orders/{orderId}` | Retrieve order by ID |
| `PUT` | `/orders/{orderId}` | Update order status |
| `DELETE` | `/orders/{orderId}` | Cancel an order |
| `GET` | `/orders?shopId={shopId}` | List orders for a shop |

## Events Emitted

| Event Type | Description |
|------------|-------------|
| `OrderCreated` | New order submitted |
| `OrderUpdated` | Order status changed |
| `OrderCancelled` | Order was cancelled |

## Order State Machine

```
[PENDING] --> [CONFIRMED] --> [PREPARING] --> [READY] --> [COMPLETED]
    │              │              │             │
    └──────────────┴──────────────┴─────────────┴──> [CANCELLED]
```

## Deployment

| Property | Value |
|----------|-------|
| Account | Same as Foundation (`workspace1`) |
| Region | Same as Foundation (`us-west-1`) |
| Branch | `master` |

## Order Schema

```json
{
  "orderId": "uuid (partition key)",
  "shopId": "string",
  "customerId": "string",
  "status": "PENDING | CONFIRMED | PREPARING | READY | COMPLETED | CANCELLED",
  "items": [
    {
      "itemId": "string",
      "name": "string",
      "quantity": "number",
      "price": "number"
    }
  ],
  "totalAmount": "number",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```
