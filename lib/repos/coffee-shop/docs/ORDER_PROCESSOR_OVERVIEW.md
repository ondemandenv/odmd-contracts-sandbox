# Coffee Shop Order Processor - Service Overview

## Service Mission

The Order Processor handles **order fulfillment workflows**. It subscribes to order events from the shared EventBridge bus and orchestrates the preparation and completion of orders using Step Functions.

- **Core Philosophy**: Event-driven workflow orchestration for order fulfillment
- **Repository**: `coffee-shop--order-processor`
- **Build ID**: `CoffeeShopOrderProcessorCdk`

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  Coffee Shop Order Processor                     │
│                                                                 │
│  EventBridge Rule                                               │
│  (source: coffee-shop, detail-type: OrderCreated)               │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │  Trigger Lambda │                                           │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Step Functions Workflow                     │   │
│  │                                                          │   │
│  │  [WorkflowStarted] -> [ValidateOrder] -> [PrepareItems] │   │
│  │         │                                      │        │   │
│  │         │                                      ▼        │   │
│  │         │                            [NotifyReady]      │   │
│  │         │                                      │        │   │
│  │         ▼                                      ▼        │   │
│  │   Emit: OrderProcessor.WorkflowStarted    [Complete]    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│         Consumes from Foundation:                               │
│         - eventBus (subscribe to events)                        │
│         - eventSrc (filter rules)                               │
│         - configTableName (preparation config)                  │
│         - countTableName (metrics)                              │
└─────────────────────────────────────────────────────────────────┘
```

## Producers (What This Service Publishes)

None - emits events to the shared EventBridge bus.

## Event Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `WORKFLOW_STARTED` | `OrderProcessor.WorkflowStarted` | Emitted when processing begins |

## Consumers (Dependencies)

| Consumer | Source | Description |
|----------|--------|-------------|
| `eventBus` | `CoffeeShopFoundationEnver.eventBusSrc` | EventBridge bus for subscribing |
| `eventSrc` | `CoffeeShopFoundationEnver.eventBusSrc.source` | Event source for rule filtering |
| `configTableName` | `CoffeeShopFoundationEnver.configTableName` | Preparation time configs |
| `countTableName` | `CoffeeShopFoundationEnver.countTableName` | Processing metrics |

## Workflow Steps

| Step | Description | Next |
|------|-------------|------|
| `WorkflowStarted` | Log start, emit event | ValidateOrder |
| `ValidateOrder` | Check order integrity, shop status | PrepareItems |
| `PrepareItems` | Simulate/track item preparation | NotifyReady |
| `NotifyReady` | Emit OrderReady event | Complete |
| `Complete` | Update metrics, mark done | - |

## Events Consumed

| Event Type | Action |
|------------|--------|
| `OrderCreated` | Start processing workflow |
| `OrderCancelled` | Abort workflow if in progress |

## Events Emitted

| Event Type | Description |
|------------|-------------|
| `OrderProcessor.WorkflowStarted` | Processing has begun |
| `OrderReady` | Order is ready for pickup |
| `OrderCompleted` | Order fully processed |

## Deployment

| Property | Value |
|----------|-------|
| Account | Same as Foundation (`workspace1`) |
| Region | Same as Foundation (`us-west-1`) |
| Branch | `master` |

## Workflow State Schema

```json
{
  "executionId": "string",
  "orderId": "string",
  "shopId": "string",
  "status": "STARTED | VALIDATING | PREPARING | READY | COMPLETED | FAILED",
  "startedAt": "ISO8601",
  "completedAt": "ISO8601 | null",
  "failureReason": "string | null"
}
```
