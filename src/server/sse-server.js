// GENERATED FROM SPEC - DO NOT EDIT
// @generated with Tessl v0.21.2 from ../../specs/todo-sse-server.spec.md
// (spec:81e93aba) (code:f069f18f)

import express from 'express';
import { authenticateToken } from '../auth-system.js';

/**
 * SSE connection manager class
 */
class SSEManager {
  constructor() {
    this.connections = new Map(); // userId -> Set of response objects
    this.heartbeatInterval = null;
  }
  
  /**
   * Add a new client connection for a user
   * @param {string} userId - User ID
   * @param {Response} res - Express response object
   */
  addConnection(userId, res) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    
    this.connections.get(userId).add(res);
    
    // Handle client disconnect
    res.on('close', () => {
      this.removeConnection(userId, res);
    });
    
    res.on('error', () => {
      this.removeConnection(userId, res);
    });
    
    // Reduced logging - only log when it's the first connection
    if (this.getConnectionCount(userId) === 1) {
      console.log(`SSE connection established for user ${userId}`);
    }
  }
  
  /**
   * Remove a client connection
   * @param {string} userId - User ID
   * @param {Response} res - Express response object
   */
  removeConnection(userId, res) {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      userConnections.delete(res);
      
      // Clean up empty user connection sets
      if (userConnections.size === 0) {
        this.connections.delete(userId);
      }
    }
    
    // Reduced logging - only log when last connection is removed
    if (this.getConnectionCount(userId) === 0) {
      console.log(`All SSE connections closed for user ${userId}`);
    }
  }
  
  /**
   * Send event to all connections for a specific user
   * @param {string} userId - User ID
   * @param {string} event - Event type
   * @param {Object} data - Event data
   */
  sendToUser(userId, event, data) {
    const userConnections = this.connections.get(userId);
    if (!userConnections) return;
    
    const eventData = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    
    // Send to all connections for this user
    for (const res of userConnections) {
      try {
        res.write(eventData);
      } catch (error) {
        console.error('Error sending SSE event:', error);
        this.removeConnection(userId, res);
      }
    }
  }
  
  /**
   * Send heartbeat to all active connections
   */
  sendHeartbeat() {
    for (const [userId, userConnections] of this.connections) {
      for (const res of userConnections) {
        try {
          res.write('event: heartbeat\ndata: {"timestamp":"' + new Date().toISOString() + '"}\n\n');
        } catch (error) {
          console.error('Error sending heartbeat:', error);
          this.removeConnection(userId, res);
        }
      }
    }
  }
  
  /**
   * Get connection count for a user
   * @param {string} userId - User ID
   * @returns {number} Number of active connections
   */
  getConnectionCount(userId) {
    const userConnections = this.connections.get(userId);
    return userConnections ? userConnections.size : 0;
  }
}

// Global SSE manager instance
const sseManager = new SSEManager();

/**
 * Express middleware for handling SSE connections
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 */
function handleSSEConnection(req, res) {
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': req.headers.origin || 'http://localhost:5174',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });
  
  // Add connection to manager
  sseManager.addConnection(req.user.id, res);
  
  // Send initial connection success event
  res.write('event: connected\ndata: {"message":"SSE connection established"}\n\n');
}

/**
 * Broadcast todo created event
 * @param {string} userId - User ID
 * @param {Object} todo - Todo object
 */
function broadcastTodoCreated(userId, todo) {
  sseManager.sendToUser(userId, 'todo-created', todo);
}

/**
 * Broadcast todo updated event
 * @param {string} userId - User ID
 * @param {Object} todo - Todo object
 */
function broadcastTodoUpdated(userId, todo) {
  sseManager.sendToUser(userId, 'todo-updated', todo);
}

/**
 * Broadcast todo deleted event
 * @param {string} userId - User ID
 * @param {string} todoId - Todo ID
 */
function broadcastTodoDeleted(userId, todoId) {
  sseManager.sendToUser(userId, 'todo-deleted', { id: todoId });
}

/**
 * Initialize SSE manager and heartbeat
 */
function initializeSSE() {
  // Start heartbeat interval (every 30 seconds)
  sseManager.heartbeatInterval = setInterval(() => {
    sseManager.sendHeartbeat();
  }, 30000);
  
  console.log('SSE manager initialized with heartbeat');
}

/**
 * Cleanup SSE connections
 */
function cleanupSSE() {
  if (sseManager.heartbeatInterval) {
    clearInterval(sseManager.heartbeatInterval);
    sseManager.heartbeatInterval = null;
  }
  
  // Close all connections
  for (const [userId, userConnections] of sseManager.connections) {
    for (const res of userConnections) {
      try {
        res.end();
      } catch (error) {
        console.error('Error closing SSE connection:', error);
      }
    }
  }
  
  sseManager.connections.clear();
  console.log('SSE connections cleaned up');
}

// Setup route function for integration with main server
function setupSSERoutes(app) {
  app.get('/api/todos/events', authenticateToken, handleSSEConnection);
}

export {
  SSEManager,
  handleSSEConnection,
  broadcastTodoCreated,
  broadcastTodoUpdated,
  broadcastTodoDeleted,
  initializeSSE,
  cleanupSSE,
  setupSSERoutes,
  sseManager
};
