// API client for todo backend
const API_BASE_URL = 'http://localhost:3001/api';

// Auth API functions
export async function registerUser(userData) {
  try {
    console.log('Making registration request to:', `${API_BASE_URL}/auth/register`);
    console.log('With data:', userData);

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    console.log('Registration response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.log('Registration error:', error);
      throw new Error(error.error || 'Registration failed');
    }

    const result = await response.json();
    console.log('Registration successful:', result);
    return result;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

export async function loginUser(credentials) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        return null; // Not authenticated
      }
      throw new Error('Failed to get current user');
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Transform todo from backend format to frontend format
function transformTodoFromBackend(backendTodo) {
  return {
    id: backendTodo.id,
    text: backendTodo.text,
    completed: backendTodo.completed,
    dueDate: backendTodo.due_date ? new Date(backendTodo.due_date) : null,
    createdAt: new Date(backendTodo.created_at),
    updatedAt: new Date(backendTodo.updated_at)
  };
}

// Transform todo from frontend format to backend format
function transformTodoToBackend(frontendTodo) {
  return {
    id: frontendTodo.id,
    text: frontendTodo.text,
    completed: frontendTodo.completed,
    due_date: frontendTodo.dueDate ? frontendTodo.dueDate.toISOString() : null
  };
}

export async function fetchTodos() {
  try {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch todos: ${response.statusText}`);
    }
    const backendTodos = await response.json();
    return backendTodos.map(transformTodoFromBackend);
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw error;
  }
}

export async function createTodo(todo) {
  try {
    const backendTodo = transformTodoToBackend(todo);
    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(backendTodo),
    });

    if (!response.ok) {
      throw new Error(`Failed to create todo: ${response.statusText}`);
    }

    const createdTodo = await response.json();
    return transformTodoFromBackend(createdTodo);
  } catch (error) {
    console.error('Error creating todo:', error);
    throw error;
  }
}

export async function updateTodo(id, updates) {
  try {
    const backendUpdates = transformTodoToBackend(updates);
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(backendUpdates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update todo: ${response.statusText}`);
    }

    const updatedTodo = await response.json();
    return transformTodoFromBackend(updatedTodo);
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  }
}

export async function deleteTodo(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete todo: ${response.statusText}`);
    }

    return id;
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
}