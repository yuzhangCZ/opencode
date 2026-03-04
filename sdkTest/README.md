# OpenCode SDK Test Demo

This demo tests the OpenCode SDK communication with an OpenCode server, demonstrating event subscription capabilities via Server-Sent Events (SSE).

## Prerequisites

1. **OpenCode server running** at `http://localhost:4096`
2. **Provider configured** in your project's `opencode.json`

## Quick Start

```bash
# Start OpenCode in another terminal (TUI mode starts server automatically)
# Or ensure server is running:
#   curl http://localhost:4096/global/health

# Run the test
bun run start
```

## Environment Variables

```bash
# Custom server URL (default: http://localhost:4096)
OPENCODE_SERVER_URL=http://localhost:4096

# Project directory (default: current directory)
OPENCODE_PROJECT_DIR=/path/to/your/project
```

## What the Test Does

1. **Connection Test** - Verifies server is reachable
2. **Session Creation** - Creates a test session
3. **Event Subscription** - Subscribes to SSE events via `/event`
4. **Message Sending** - Sends async prompt (triggers message events)
5. **Event Monitoring** - Logs all received events
6. **Cleanup** - Deletes test session
## Event Types

The SDK can subscribe to these events:

| Event Type             | Description                |
| ---------------------- | -------------------------- |
| `session.created`      | New session created        |
| `session.updated`      | Session properties changed |
| `session.deleted`      | Session removed            |
| `session.status`       | Session processing status  |
| `message.updated`      | Message added/modified     |
| `message.removed`      | Message deleted            |
| `message.part.updated` | Message part changed       |
| `permission.asked`     | Permission request         |
| `todo.updated`         | Todo list changed          |

## Architecture

```
┌─────────────────┐         SSE          ┌─────────────────┐
│   SDK Client    │ ◄─────────────────►  │  OpenCode       │
│   (this test)   │    HTTP + SSE        │  Server         │
└─────────────────┘                      └─────────────────┘
        │                                        │
        │ client.event.subscribe()               │ Bus.publish()
        │ client.session.create()                │ Session.create()
        │ client.session.promptAsync()           │ SessionPrompt.prompt()
        └────────────────────────────────────────┘
```

## Troubleshooting

### Server not responding

```bash
# Check if server is running
curl http://localhost:4096/global/health

# Start opencode (server starts automatically)
opencode
```

### Message fails

```bash
# Check provider configuration
cat opencode.json

# Should have at least one provider configured
# {
#   "provider": {
#     "anthropic": { "name": "claude-3-5-sonnet" }
#   }
# }
```

### TypeScript errors

```bash
# The SDK is linked locally, ensure it's built
cd ../packages/sdk/js && bun run build
```
