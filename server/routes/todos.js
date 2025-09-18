import express from 'express';
import pool from '../database.js';

const router = express.Router();

// GET /api/todos - Get all todos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, text, completed, due_date, created_at, updated_at FROM todos ORDER BY created_at DESC'
    );

    // Convert database format to frontend format
    const todos = result.rows.map(row => ({
      id: row.id,
      text: row.text,
      completed: row.completed,
      dueDate: row.due_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// POST /api/todos - Create a new todo
router.post('/', async (req, res) => {
  try {
    const { id, text, completed = false, dueDate } = req.body;

    if (!id || !text) {
      return res.status(400).json({ error: 'ID and text are required' });
    }

    const result = await pool.query(
      'INSERT INTO todos (id, text, completed, due_date) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, text, completed, dueDate || null]
    );

    const newTodo = {
      id: result.rows[0].id,
      text: result.rows[0].text,
      completed: result.rows[0].completed,
      dueDate: result.rows[0].due_date,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };

    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// PUT /api/todos/:id - Update a todo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, completed, dueDate } = req.body;

    const result = await pool.query(
      'UPDATE todos SET text = $1, completed = $2, due_date = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [text, completed, dueDate || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const updatedTodo = {
      id: result.rows[0].id,
      text: result.rows[0].text,
      completed: result.rows[0].completed,
      dueDate: result.rows[0].due_date,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };

    res.json(updatedTodo);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// DELETE /api/todos/:id - Delete a todo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json({ message: 'Todo deleted successfully', id: result.rows[0].id });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

export default router;