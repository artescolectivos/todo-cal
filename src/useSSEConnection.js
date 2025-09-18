// GENERATED FROM SPEC - DO NOT EDIT
// @generated with Tessl v0.21.2 from ../specs/todo-sse-client.spec.md
// (spec:062cc79e) (code:3a85be99)

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';

// Main hook for SSE connection
function useSSEConnection(onTodoEvent) {
  const { isAuthenticated, user, logout } = useAuth();
  const [status, setStatus] = useState('disconnected');
  const [error, setError] = useState(null);
  const [lastEvent, setLastEvent] = useState(null);
  const [reconnectCount, setReconnectCount] = useState(0);
  
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;

  // Calculate exponential backoff delay
  const getReconnectDelay = useCallback(() => {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const delay = Math.min(baseDelay * Math.pow(2, reconnectAttempts.current), maxDelay);
    return delay + Math.random() * 1000; // Add jitter
  }, []);

  // Clean up existing connection
  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Handle SSE events
  const handleEvent = useCallback((event) => {
    try {
      const eventData = {
        type: event.type,
        data: event.data ? JSON.parse(event.data) : null,
        timestamp: new Date()
      };
      
      setLastEvent(eventData);
      
      // Handle specific event types
      switch (event.type) {
        case 'todo-created':
        case 'todo-updated':
        case 'todo-deleted':
          if (onTodoEvent) {
            onTodoEvent(eventData);
          }
          break;
        case 'heartbeat':
          // Heartbeat received, connection is healthy
          break;
        case 'connected':
          console.log('SSE connection confirmed');
          break;
        default:
          console.log('Unknown SSE event type:', event.type);
      }
    } catch (parseError) {
      console.error('Error parsing SSE event data:', parseError);
      setError(`Failed to parse event data: ${parseError.message}`);
    }
  }, [onTodoEvent]);

  // Establish SSE connection
  const connect = useCallback(() => {
    if (!isAuthenticated || eventSourceRef.current) {
      return;
    }

    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setStatus('connecting');
    setError(null);

    try {
      // Create EventSource with credentials for authentication
      const eventSource = new EventSource('http://localhost:3001/api/todos/events', {
        withCredentials: true
      });

      eventSourceRef.current = eventSource;

      // Handle connection open
      eventSource.onopen = () => {
        console.log('SSE connection opened');
        setStatus('connected');
        setError(null);
        reconnectAttempts.current = 0;
        setReconnectCount(0);
      };

      // Handle connection error
      eventSource.onerror = (event) => {
        console.error('SSE connection error:', event);
        setStatus('error');
        
        // Check if this is an authentication error
        if (eventSource.readyState === EventSource.CLOSED) {
          setError('Connection closed by server - possible authentication error');
          
          // If we get repeated auth errors, logout the user
          if (reconnectAttempts.current > 3) {
            console.error('Multiple SSE connection failures, logging out user');
            logout();
            return;
          }
        } else {
          setError('Connection error occurred');
        }

        // Attempt to reconnect if we haven't exceeded max attempts
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          setReconnectCount(reconnectAttempts.current);
          
          const delay = getReconnectDelay();
          console.log(`SSE reconnect attempt ${reconnectAttempts.current} in ${delay}ms`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            cleanup();
            connect();
          }, delay);
        } else {
          setError('Maximum reconnection attempts exceeded');
          setStatus('disconnected');
        }
      };

      // Handle specific event types
      eventSource.addEventListener('todo-created', handleEvent);
      eventSource.addEventListener('todo-updated', handleEvent);
      eventSource.addEventListener('todo-deleted', handleEvent);
      eventSource.addEventListener('heartbeat', handleEvent);
      eventSource.addEventListener('connected', handleEvent);

      // Handle generic messages (fallback)
      eventSource.onmessage = handleEvent;

    } catch (connectionError) {
      console.error('Failed to create SSE connection:', connectionError);
      setError(`Failed to establish connection: ${connectionError.message}`);
      setStatus('error');
    }
  }, [isAuthenticated, handleEvent, getReconnectDelay, cleanup, logout]);

  // Effect to manage connection lifecycle
  useEffect(() => {
    if (isAuthenticated && user && !eventSourceRef.current) {
      connect();
    } else if (!isAuthenticated || !user) {
      cleanup();
      setStatus('disconnected');
      setError(null);
      setLastEvent(null);
      reconnectAttempts.current = 0;
      setReconnectCount(0);
    }

    // Cleanup on unmount
    return cleanup;
  }, [isAuthenticated, user]);

  // Return connection state and methods
  return {
    status,
    error,
    lastEvent,
    reconnectCount
  };
}

export default useSSEConnection;
