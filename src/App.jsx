// GENERATED FROM SPEC - DO NOT EDIT
// @generated with Tessl v0.21.2 from ../todo-calendar-app.spec.md
// (spec:df4b6e5a) (code:ec6d3c22)

import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameDay, isToday as dateIsToday, parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { fetchTodos, createTodo, updateTodo, deleteTodo } from './api.js';
import { useAuth } from './AuthContext.jsx';
import useSSEConnection from './useSSEConnection.js';
import Auth from './Auth.jsx';
import './App.css';

// API integration utilities
async function loadTodos() {
  try {
    return await fetchTodos();
  } catch (error) {
    console.error('Failed to load todos:', error);
    return [];
  }
}

function filterTodosByStatus(todos, filter) {
  switch (filter) {
    case 'active':
      return todos.filter(todo => !todo.completed);
    case 'completed':
      return todos.filter(todo => todo.completed);
    case 'all':
    default:
      return todos;
  }
}

function filterTodosByDate(todos, date) {
  return todos.filter(todo => {
    if (!todo.dueDate || !date) return false;
    return isSameDay(todo.dueDate, date);
  });
}

function getTodosForDate(todos, date) {
  return filterTodosByDate(todos, date);
}

// Todo Item Component
function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="todo-checkbox"
      />
      <span className="todo-text">{todo.text}</span>
      {todo.dueDate && (
        <span className="todo-due-date">
          Due: {format(todo.dueDate, 'MMM dd, yyyy')}
        </span>
      )}
      <button
        onClick={() => onDelete(todo.id)}
        className="todo-delete-btn"
        aria-label="Delete todo"
      >
        ×
      </button>
    </div>
  );
}

// Add Todo Component
function AddTodo({ onAdd, selectedDate }) {
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Update form date when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      setDueDate(formattedDate);
    }
  }, [selectedDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd({
        id: uuidv4(),
        text: text.trim(),
        completed: false,
        dueDate: dueDate ? new Date(dueDate + 'T12:00:00') : null,
        createdAt: new Date()
      });
      setText('');
      setDueDate('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-todo-form">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a new todo..."
        className="add-todo-input"
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="add-todo-date"
      />
      <button type="submit" className="add-todo-btn">
        Add
      </button>
    </form>
  );
}

// Todo Filters Component
function TodoFilters({ filter, onFilterChange, activeCount }) {
  return (
    <div className="todo-filters">
      <span className="todo-count">
        {activeCount} {activeCount === 1 ? 'item' : 'items'} left
      </span>
      <div className="filter-buttons">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => onFilterChange('all')}
        >
          All
        </button>
        <button
          className={filter === 'active' ? 'active' : ''}
          onClick={() => onFilterChange('active')}
        >
          Active
        </button>
        <button
          className={filter === 'completed' ? 'active' : ''}
          onClick={() => onFilterChange('completed')}
        >
          Completed
        </button>
      </div>
    </div>
  );
}

// Todo List Component
function TodoList({ todos, onToggle, onDelete, filter, dateFilter }) {
  let filteredTodos = filterTodosByStatus(todos, filter);
  
  if (dateFilter) {
    filteredTodos = filterTodosByDate(filteredTodos, dateFilter);
  }

  return (
    <div className="todo-list">
      {filteredTodos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
      {filteredTodos.length === 0 && (
        <div className="no-todos">
          {dateFilter 
            ? `No todos for ${format(dateFilter, 'MMM dd, yyyy')}`
            : 'No todos found'
          }
        </div>
      )}
    </div>
  );
}

// Calendar Header Component
function CalendarHeader({ currentMonth, onPrevMonth, onNextMonth }) {
  return (
    <div className="calendar-header">
      <button onClick={onPrevMonth} className="nav-btn">
        ‹
      </button>
      <h2 className="month-year">
        {format(currentMonth, 'MMMM yyyy')}
      </h2>
      <button onClick={onNextMonth} className="nav-btn">
        ›
      </button>
    </div>
  );
}

// Calendar Day Component
function CalendarDay({ date, todos, isToday, hasEvents, isSelected, onClick }) {
  const dayTodos = getTodosForDate(todos, date);
  
  return (
    <div
      className={`calendar-day ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''} ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(date)}
    >
      <span className="day-number">{format(date, 'd')}</span>
      {dayTodos.length > 0 && (
        <div className="todo-indicators">
          <span className="todo-badge">{dayTodos.length}</span>
        </div>
      )}
    </div>
  );
}

// Calendar Component
function Calendar({ todos, selectedDate, onDateSelect, currentMonth, onMonthChange }) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = day;
      const dayTodos = getTodosForDate(todos, day);
      
      days.push(
        <CalendarDay
          key={day.toString()}
          date={cloneDay}
          todos={todos}
          isToday={dateIsToday(cloneDay)}
          hasEvents={dayTodos.length > 0}
          isSelected={selectedDate && isSameDay(cloneDay, selectedDate)}
          onClick={onDateSelect}
        />
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div key={day.toString()} className="calendar-week">
        {days}
      </div>
    );
    days = [];
  }

  const onPrevMonth = () => {
    onMonthChange(subMonths(currentMonth, 1));
  };

  const onNextMonth = () => {
    onMonthChange(addMonths(currentMonth, 1));
  };

  return (
    <div className="calendar">
      <CalendarHeader
        currentMonth={currentMonth}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
      />
      <div className="calendar-days-header">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="calendar-day-header">
            {day}
          </div>
        ))}
      </div>
      <div className="calendar-body">
        {rows}
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Transform todo from backend format to frontend format (same as api.js)
  const transformTodoFromBackend = (backendTodo) => {
    return {
      id: backendTodo.id,
      text: backendTodo.text,
      completed: backendTodo.completed,
      dueDate: backendTodo.due_date ? new Date(backendTodo.due_date) : null,
      createdAt: new Date(backendTodo.created_at),
      updatedAt: new Date(backendTodo.updated_at)
    };
  };

  // SSE event handler for real-time todo updates
  const handleSSEEvent = (eventData) => {
    // Only log important events, not heartbeats
    if (eventData.type !== 'heartbeat') {
      console.log('Received SSE event:', eventData);
    }

    switch (eventData.type) {
      case 'todo-created':
        // Add new todo to state if not already present
        setTodos(prevTodos => {
          const exists = prevTodos.some(todo => todo.id === eventData.data.id);
          if (!exists) {
            const newTodo = transformTodoFromBackend(eventData.data);
            return [...prevTodos, newTodo];
          }
          return prevTodos;
        });
        break;

      case 'todo-updated':
        // Update existing todo in state
        setTodos(prevTodos =>
          prevTodos.map(todo =>
            todo.id === eventData.data.id
              ? transformTodoFromBackend(eventData.data)
              : todo
          )
        );
        break;

      case 'todo-deleted':
        // Remove todo from state
        setTodos(prevTodos =>
          prevTodos.filter(todo => todo.id !== eventData.data.id)
        );
        break;

      default:
        console.log('Unhandled SSE event type:', eventData.type);
    }
  };

  // Initialize SSE connection
  const { status: sseStatus, error: sseError } = useSSEConnection(handleSSEEvent);

  // Load todos from API when user is authenticated
  useEffect(() => {
    async function initializeTodos() {
      if (isAuthenticated) {
        try {
          const apiTodos = await loadTodos();
          setTodos(apiTodos);
        } catch (error) {
          console.error('Failed to load todos:', error);
          // If unauthorized, might need to clear user state
          if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            logout();
          }
        }
      }
    }
    initializeTodos();
  }, [isAuthenticated, logout]);

  const handleAddTodo = async (newTodo) => {
    try {
      const createdTodo = await createTodo(newTodo);
      setTodos(prevTodos => [...prevTodos, createdTodo]);
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  };

  const handleToggleTodo = async (id) => {
    try {
      const todoToUpdate = todos.find(todo => todo.id === id);
      if (!todoToUpdate) return;

      const updatedTodo = await updateTodo(id, {
        ...todoToUpdate,
        completed: !todoToUpdate.completed
      });

      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === id ? updatedTodo : todo
        )
      );
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await deleteTodo(id);
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(prevDate => 
      prevDate && isSameDay(prevDate, date) ? null : date
    );
  };

  const activeCount = todos.filter(todo => !todo.completed).length;

  const handleLogout = async () => {
    try {
      await logout();
      setTodos([]); // Clear todos on logout
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  // Show auth UI if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="app">
        <Auth />
      </div>
    );
  }

  return (
    <div className="app">
      <div className="app-container">
        <header className="app-header">
          <div className="header-content">
            <h1>Todo Calendar</h1>
            <div className="user-info">
              <div className="connection-status">
                <span className={`sse-status ${sseStatus}`}>
                  {sseStatus === 'connected' && '🟢 Live'}
                  {sseStatus === 'connecting' && '🟡 Connecting...'}
                  {sseStatus === 'disconnected' && '🔴 Offline'}
                  {sseStatus === 'error' && '🔴 Error'}
                </span>
                {sseError && (
                  <span className="sse-error" title={sseError}>
                    ⚠️
                  </span>
                )}
              </div>
              <span className="welcome-text">
                Welcome, {user?.first_name || user?.email}!
              </span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        </header>
        
        <div className="app-content">
          <div className="todo-section">
            <AddTodo onAdd={handleAddTodo} selectedDate={selectedDate} />
            
            <TodoFilters
              filter={filter}
              onFilterChange={setFilter}
              activeCount={activeCount}
            />
            
            {selectedDate && (
              <div className="date-filter-info">
                <h3>Todos for {format(selectedDate, 'MMM dd, yyyy')}</h3>
                <button 
                  onClick={() => setSelectedDate(null)}
                  className="clear-date-filter"
                >
                  Show All Todos
                </button>
              </div>
            )}
            
            <TodoList
              todos={todos}
              onToggle={handleToggleTodo}
              onDelete={handleDeleteTodo}
              filter={filter}
              dateFilter={selectedDate}
            />
          </div>
          
          <div className="calendar-section">
            <Calendar
              todos={todos}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
