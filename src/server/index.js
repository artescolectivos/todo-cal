// GENERATED FROM SPEC - DO NOT EDIT
// @generated with Tessl v0.21.2 from ../../specs/todo-api-backend.spec.md
// (spec:43636eaf) (code:f3591b19)

import express from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from 'uuid';
import {
  authenticateToken,
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword,
  createUsersTable,
  addUserIdToTodos,
  createIndexes
} from '../auth-system.js';

// Load environment variables
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * Creates and configures the Express application without starting the listener.
 * @returns {express.Application} Configured Express app.
 */
function createApp() {
  const app = express();

  // Enable CORS for all origins (with credentials for cookies)
  app.use(cors({
    origin: 'http://localhost:5174',
    credentials: true
  }));

  // Parse JSON request bodies
  app.use(express.json());

  // Parse cookies
  app.use(cookieParser());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Test POST endpoint
  app.post('/api/test', (req, res) => {
    res.json({ message: 'POST test successful', body: req.body });
  });

  // Authentication routes
  console.log('Setting up auth routes...');
  console.log('register function:', typeof register);
  app.post('/api/auth/register', register);
  app.post('/api/auth/login', login);
  app.post('/api/auth/logout', logout);
  app.get('/api/auth/me', authenticateToken, getCurrentUser);
  app.put('/api/auth/profile', authenticateToken, updateProfile);
  app.post('/api/auth/change-password', authenticateToken, changePassword);
  console.log('Auth routes set up complete');

  // Get all todos (user-scoped)
  app.get('/api/todos', authenticateToken, async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at ASC',
        [req.user.id]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching todos:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create a new todo (user-scoped)
  app.post('/api/todos', authenticateToken, async (req, res) => {
    try {
      const { text, due_date } = req.body;
      const id = uuidv4();
      const completed = false;
      const now = new Date();
      const userId = req.user.id;

      const result = await pool.query(
        'INSERT INTO todos (id, text, completed, due_date, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [id, text, completed, due_date, userId, now, now]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating todo:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update a todo (user-scoped)
  app.put('/api/todos/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { text, completed, due_date } = req.body;
      const updated_at = new Date();
      const userId = req.user.id;

      const result = await pool.query(
        'UPDATE todos SET text = $1, completed = $2, due_date = $3, updated_at = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
        [text, completed, due_date, updated_at, id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Todo not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating todo:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Delete a todo (user-scoped)
  app.delete('/api/todos/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await pool.query('DELETE FROM todos WHERE id = $1 AND user_id = $2', [id, userId]);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Todo not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting todo:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return app;
}

/**
 * Starts the Express HTTP server.
 * @param {express.Application} app - Configured Express application.
 * @param {number} [port] - Port number to listen on.
 * @returns {import('http').Server} HTTP server instance.
 */
function startServer(app, port) {
  const serverPort = port || process.env.PORT || 3001;
  return app.listen(serverPort, () => {
    console.log(`Server running on port ${serverPort}`);
  });
}

// Initialize database with authentication
async function initializeDatabase() {
  try {
    // Create users table
    await createUsersTable();

    // Create todos table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id UUID PRIMARY KEY,
        text TEXT NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT FALSE,
        due_date TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Add user_id column to todos table
    await addUserIdToTodos();

    // Create all indexes
    await createIndexes();
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos (due_date)
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    await initializeDatabase();
    const app = createApp();
    startServer(app);
  })();
}

export { createApp, startServer };
