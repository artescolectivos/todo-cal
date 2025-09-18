# Todo SSE Client

A React hook that provides real-time Server-Sent Events (SSE) integration for the todo application. Establishes and manages EventSource connections to receive live updates from the server.

## Target

[@generate](../src/useSSEConnection.js)

## Capabilities

### SSE Connection Management

Establishes and maintains EventSource connection to the todo events endpoint with proper authentication.

- Connect to `/api/todos/events` endpoint with credentials
- Include authentication headers in connection requests
- Maintain connection state (connecting, connected, disconnected, error)
- Automatically reconnect on connection loss with exponential backoff
- Clean up connections when component unmounts

### Real-time Event Handling

Process different types of SSE events to keep todo state synchronized.

- Handle 'todo-created' events to add new todos to local state
- Handle 'todo-updated' events to update existing todos in local state
- Handle 'todo-deleted' events to remove todos from local state
- Handle 'heartbeat' events to maintain connection health
- Handle 'connected' events for connection confirmation
- Parse JSON event data safely with error handling

### Error Handling and Reconnection

Robust error handling with automatic reconnection strategy for reliable real-time updates.

- Detect connection errors and network failures
- Implement exponential backoff for reconnection attempts
- Limit maximum reconnection attempts to prevent infinite loops
- Provide connection status updates to consuming components
- Handle authentication errors by triggering re-authentication

### React Integration

Seamless integration with React components and existing authentication context.

- Provide React hook interface for easy component integration
- Automatically start/stop connections based on authentication status
- Return connection status and error information to components
- Clean up resources when components unmount
- Work with existing useAuth context for authentication state

## API

```javascript { .api }
// Main hook for SSE connection
function useSSEConnection(onTodoEvent);

// Connection status types
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// Event types from server
type SSEEventType = 'todo-created' | 'todo-updated' | 'todo-deleted' | 'heartbeat' | 'connected';

// Hook return type
interface SSEConnectionResult {
  status: ConnectionStatus;
  error: string | null;
  lastEvent: SSEEvent | null;
  reconnectCount: number;
}

// SSE event structure
interface SSEEvent {
  type: SSEEventType;
  data: any;
  timestamp: Date;
}

// Todo event callback function type
type TodoEventCallback = (event: SSEEvent) => void;
```

## Dependencies

React hooks for state management and lifecycle handling.
[@use](react)

Authentication context for user state and credentials.
[@use](../src/AuthContext.jsx)