# Todo SSE Server

Server-Sent Events module for real-time todo updates with user authentication and connection management.

## Target

[@generate](../src/server/sse-server.js)

## Capabilities

### SSE Endpoint Management

- GET `/api/todos/events` establishes SSE connection for authenticated users
- Sets appropriate SSE headers (`text/event-stream`, `Cache-Control: no-cache`)
- Enables CORS for cross-origin SSE connections
- Requires authentication middleware before establishing connection

### Client Connection Management

- Maintains map of active connections per user ID
- Supports multiple concurrent connections per user
- Handles client disconnection events gracefully
- Cleans up connection references on disconnect
- Tracks connection state and health

### Real-time Event Broadcasting

- Emits `todo-created` events when new todos are added
- Emits `todo-updated` events when todos are modified
- Emits `todo-deleted` events when todos are removed
- Includes full todo data in event payload
- Only sends events to authenticated user who owns the todo

### Connection Health Management

- Sends periodic `heartbeat` events every 30 seconds
- Maintains connection alive status
- Detects and handles broken connections
- Implements connection timeout handling

### Event Integration

- Provides functions to trigger events from todo API endpoints
- Integrates with existing todo CRUD operations
- Maintains event payload consistency with REST API responses
- Handles database transaction events

## API

```javascript { .api }
/**
 * SSE connection manager class
 */
class SSEManager {
  constructor();
  
  /**
   * Add a new client connection for a user
   * @param {string} userId - User ID
   * @param {Response} res - Express response object
   */
  addConnection(userId, res);
  
  /**
   * Remove a client connection
   * @param {string} userId - User ID
   * @param {Response} res - Express response object
   */
  removeConnection(userId, res);
  
  /**
   * Send event to all connections for a specific user
   * @param {string} userId - User ID
   * @param {string} event - Event type
   * @param {Object} data - Event data
   */
  sendToUser(userId, event, data);
  
  /**
   * Send heartbeat to all active connections
   */
  sendHeartbeat();
  
  /**
   * Get connection count for a user
   * @param {string} userId - User ID
   * @returns {number} Number of active connections
   */
  getConnectionCount(userId);
}

/**
 * Express middleware for handling SSE connections
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 */
function handleSSEConnection(req, res);

/**
 * Broadcast todo created event
 * @param {string} userId - User ID
 * @param {Object} todo - Todo object
 */
function broadcastTodoCreated(userId, todo);

/**
 * Broadcast todo updated event
 * @param {string} userId - User ID
 * @param {Object} todo - Todo object
 */
function broadcastTodoUpdated(userId, todo);

/**
 * Broadcast todo deleted event
 * @param {string} userId - User ID
 * @param {string} todoId - Todo ID
 */
function broadcastTodoDeleted(userId, todoId);

/**
 * Initialize SSE manager and heartbeat
 */
function initializeSSE();

/**
 * Cleanup SSE connections
 */
function cleanupSSE();
```

## Dependencies

### Express Framework

Web framework for handling SSE endpoints and middleware integration.
[@use](express)

### Authentication System

JWT authentication middleware for securing SSE connections.
[@use](../auth-system.js)