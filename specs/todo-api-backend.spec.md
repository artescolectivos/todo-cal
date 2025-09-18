# Todo API Backend

RESTful API backend server for the todo calendar application.

## Target

[@generate](../src/server/index.js)

## Capabilities

### Server Initialization

- Loads environment variables from a `.env` file into `process.env`.  
- Creates an Express application instance.  
- Enables CORS for all origins.  
- Parses JSON request bodies with built-in middleware.  
- Starts an HTTP server listening on `process.env.PORT` or port `3001`.  

### Health Check Endpoint

- GET `/api/health` responds with `{ status: 'ok' }` and HTTP status `200`.  

### Todo CRUD Endpoints

- GET `/api/todos` returns an array of todos ordered by `created_at` ascending.  
- POST `/api/todos` creates a new todo with:
  - `id` (UUID)
  - `text` (string)
  - `completed` (boolean, defaults to `false`)
  - `due_date` (timestamp)
  - `created_at` and `updated_at` set to current time  
  Responds with HTTP status `201` and the created todo.  
- PUT `/api/todos/:id` updates an existing todo's `text`, `completed`, and `due_date`, sets `updated_at` to current time. Responds with the updated todo or HTTP `404` if not found.  
- DELETE `/api/todos/:id` deletes the todo by `id`. Responds with HTTP status `204` or HTTP `404` if not found.  

### Database Integration

- Uses a PostgreSQL connection pool for efficient database connections.  
- Initializes the database on startup:
  - Creates a `todos` table if it does not exist with columns:
    - `id UUID PRIMARY KEY`
    - `text TEXT NOT NULL`
    - `completed BOOLEAN NOT NULL DEFAULT FALSE`
    - `due_date TIMESTAMP`
    - `created_at TIMESTAMP NOT NULL DEFAULT NOW()`
    - `updated_at TIMESTAMP NOT NULL DEFAULT NOW()`
  - Creates an index on `due_date` for efficient calendar queries.  
- Handles database errors with logging and returns HTTP `500` on failures.  
- Gracefully shuts down the HTTP server and connection pool on process termination.  

## API

```javascript { .api }
import express from 'express';

/**
 * Creates and configures the Express application without starting the listener.
 * @returns {express.Application} Configured Express app.
 */
function createApp(): express.Application;

/**
 * Starts the Express HTTP server.
 * @param {express.Application} app - Configured Express application.
 * @param {number} [port] - Port number to listen on.
 * @returns {import('http').Server} HTTP server instance.
 */
function startServer(app: express.Application, port?: number): import('http').Server;
```

## Dependencies

- Express web framework. [@use](express)  
- PostgreSQL client. [@use](pg)  
- CORS middleware. [@use](cors)  
- Environment variable loader. [@use](dotenv)  
- UUID generation. [@use](uuid)