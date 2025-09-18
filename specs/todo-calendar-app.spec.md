# Todo Calendar App

A React web application for managing a todo list with integrated calendar functionality. Combines task management with calendar visualization for better organization and planning.

## Target

[@generate](./src/App.jsx)

## Capabilities

### Todo Management

Add, edit, and manage todo items with text descriptions and optional due dates.

- Add new todos with text input
- Add optional due dates to todos using date picker
- Mark todos as complete/incomplete with checkboxes
- Delete individual todos
- Display count of remaining active todos

### Todo Filtering and Organization

Filter and organize todos by various criteria for better task management.

- Filter todos by status (all, active, completed)
- Filter todos by date
- Show todos organized by their due dates

### Calendar View

Monthly calendar interface for visualizing todos and navigating dates.

- Display monthly calendar view showing current month
- Navigate between months with previous/next buttons
- Highlight today's date
- Highlight dates that have todos assigned
- Display todo indicators or badges on calendar dates with tasks

### Calendar-Todo Integration

Seamless integration between calendar and todo functionality.

- Click on calendar dates to view todos for specific day
- Calendar and todo list stay synchronized
- Due date selection updates both todo list and calendar display
- Clicking on a calendar date automatically populates the date picker in the Add Todo form with the selected date

### Data Persistence

Local storage integration to maintain todos between browser sessions.

- Save todos to local storage automatically
- Load saved todos on application start
- Persist todo states (completed/active) and due dates

### Responsive Design

Clean, modern UI that works across different devices and screen sizes.

- Responsive layout for desktop and mobile devices
- Modern, intuitive user interface
- Accessible design with proper form controls

## API

```javascript { .api }
// Main App component
function App();

// Todo management components
function TodoList({ todos, onToggle, onDelete, filter, dateFilter });
function TodoItem({ todo, onToggle, onDelete });
function AddTodo({ onAdd, selectedDate });
function TodoFilters({ filter, onFilterChange, activeCount });

// Calendar components
function Calendar({ todos, selectedDate, onDateSelect, currentMonth, onMonthChange });
function CalendarDay({ date, todos, isToday, hasEvents, isSelected, onClick });
function CalendarHeader({ currentMonth, onPrevMonth, onNextMonth });

// Utility functions
function saveTodosToStorage(todos);
function loadTodosFromStorage();
function filterTodosByStatus(todos, filter);
function filterTodosByDate(todos, date);
function getTodosForDate(todos, date);

// Types
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: Date;
  createdAt: Date;
}

type FilterType = 'all' | 'active' | 'completed';
```

## Dependencies

Modern React for component-based UI development with hooks for state management.
[@use](react)

Date manipulation and formatting utilities for calendar functionality.
[@use](date-fns)

UUID generation for unique todo item identifiers.
[@use](uuid)