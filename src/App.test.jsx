import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { format, isSameDay } from 'date-fns'
import App from './App.jsx'

// Mock API functions
vi.mock('./api.js', () => ({
  fetchTodos: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
}))

import { fetchTodos, createTodo, updateTodo, deleteTodo } from './api.js'

describe('Todo Calendar App with Backend', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks()

    // Default mock implementations
    fetchTodos.mockResolvedValue([])
    createTodo.mockImplementation(async (todo) => ({
      ...todo,
      id: todo.id || 'mock-id',
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
    updateTodo.mockImplementation(async (id, updates) => ({
      ...updates,
      id,
      updatedAt: new Date(),
    }))
    deleteTodo.mockResolvedValue('mock-id')
  })

  describe('Todo Management with API', () => {
    it('should load todos from API on mount', async () => {
      const mockTodos = [{
        id: 'test-id',
        text: 'Loaded todo',
        completed: false,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }]

      fetchTodos.mockResolvedValue(mockTodos)

      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Loaded todo')).toBeInTheDocument()
      })

      expect(fetchTodos).toHaveBeenCalledOnce()
    })

    it('should add a new todo via API', async () => {
      // Mock createTodo to return a proper todo object
      createTodo.mockResolvedValue({
        id: 'mock-id',
        text: 'New API todo',
        completed: false,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      render(<App />)

      const input = screen.getByPlaceholderText('Add a new todo...')
      const addButton = screen.getByText('Add')

      fireEvent.change(input, { target: { value: 'New API todo' } })
      fireEvent.click(addButton)

      await waitFor(() => {
        expect(createTodo).toHaveBeenCalledWith(
          expect.objectContaining({
            text: 'New API todo',
            completed: false
          })
        )
      })

      await waitFor(() => {
        expect(screen.getByText('New API todo')).toBeInTheDocument()
      })
    })

    it('should add todo with due date via API', async () => {
      render(<App />)

      const textInput = screen.getByPlaceholderText('Add a new todo...')
      const inputs = screen.getAllByDisplayValue('')
      const dateInput = inputs.find(input => input.type === 'date')
      const addButton = screen.getByText('Add')

      fireEvent.change(textInput, { target: { value: 'Todo with date' } })
      fireEvent.change(dateInput, { target: { value: '2024-01-15' } })
      fireEvent.click(addButton)

      await waitFor(() => {
        expect(createTodo).toHaveBeenCalledWith(
          expect.objectContaining({
            text: 'Todo with date',
            dueDate: expect.any(Date)
          })
        )
      })
    })

    it('should toggle todo completion via API', async () => {
      const mockTodo = {
        id: 'test-id',
        text: 'Toggle me',
        completed: false,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      fetchTodos.mockResolvedValue([mockTodo])

      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Toggle me')).toBeInTheDocument()
      })

      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)

      await waitFor(() => {
        expect(updateTodo).toHaveBeenCalledWith('test-id',
          expect.objectContaining({
            completed: true
          })
        )
      })
    })

    it('should delete todo via API', async () => {
      const mockTodo = {
        id: 'test-id',
        text: 'Delete me',
        completed: false,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      fetchTodos.mockResolvedValue([mockTodo])

      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Delete me')).toBeInTheDocument()
      })

      const deleteButton = screen.getByLabelText('Delete todo')
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(deleteTodo).toHaveBeenCalledWith('test-id')
      })

      expect(screen.queryByText('Delete me')).not.toBeInTheDocument()
    })
  })

  describe('Date Handling with API', () => {
    it('should create due date in local timezone to avoid day offset bug', async () => {
      render(<App />)

      const textInput = screen.getByPlaceholderText('Add a new todo...')
      const inputs = screen.getAllByDisplayValue('')
      const dateInput = inputs.find(input => input.type === 'date')
      const addButton = screen.getByText('Add')

      const testDate = '2024-01-15'

      fireEvent.change(textInput, { target: { value: 'Timezone test todo' } })
      fireEvent.change(dateInput, { target: { value: testDate } })
      fireEvent.click(addButton)

      await waitFor(() => {
        expect(createTodo).toHaveBeenCalledWith(
          expect.objectContaining({
            dueDate: expect.any(Date)
          })
        )
      })

      // Check that the date created is on the correct day
      const createCall = createTodo.mock.calls[0][0]
      expect(format(createCall.dueDate, 'yyyy-MM-dd')).toBe(testDate)
    })

    it('should preserve date when loading from API', async () => {
      const mockTodo = {
        id: 'test-id',
        text: 'Test todo',
        completed: false,
        dueDate: new Date('2024-01-15T12:00:00'),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      fetchTodos.mockResolvedValue([mockTodo])

      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Due: Jan 15, 2024')).toBeInTheDocument()
      })
    })
  })

  describe('Calendar Integration with API', () => {
    it('should populate date picker when calendar date is clicked', async () => {
      render(<App />)

      // Wait for component to mount
      await waitFor(() => {
        expect(screen.getByText('Todo Calendar')).toBeInTheDocument()
      })

      // Find a calendar day to click (let's use day 15 for consistency)
      const calendarDay = screen.getByText('15')
      fireEvent.click(calendarDay)

      // Check that the date input is populated
      await waitFor(() => {
        const dateInput = screen.container.querySelector('input[type="date"]')
        const currentDate = new Date()
        const expectedDate = format(new Date(currentDate.getFullYear(), currentDate.getMonth(), 15), 'yyyy-MM-dd')
        expect(dateInput?.value).toBe(expectedDate)
      })
    })

    it('should display current month and year', async () => {
      render(<App />)

      const currentDate = new Date()
      const expectedMonthYear = format(currentDate, 'MMMM yyyy')

      await waitFor(() => {
        expect(screen.getByText(expectedMonthYear)).toBeInTheDocument()
      })
    })

    it('should show todo count badge on calendar dates with todos', async () => {
      const today = new Date()
      const mockTodo = {
        id: 'test-id',
        text: 'Today todo',
        completed: false,
        dueDate: today,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      fetchTodos.mockResolvedValue([mockTodo])

      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Today todo')).toBeInTheDocument()
      })

      // Should show badge with count "1" on today's date
      const todayBadge = screen.getByText('1', { selector: '.todo-badge' })
      expect(todayBadge).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully when loading todos', async () => {
      fetchTodos.mockRejectedValue(new Error('API Error'))

      // Mock console.error to avoid error output in tests
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(<App />)

      await waitFor(() => {
        expect(fetchTodos).toHaveBeenCalled()
      })

      // Should still render the app even with API error
      expect(screen.getByText('Todo Calendar')).toBeInTheDocument()
      expect(screen.getByText('No todos found')).toBeInTheDocument()

      consoleSpy.mockRestore()
    })

    it('should handle create todo API errors', async () => {
      createTodo.mockRejectedValue(new Error('Create failed'))

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(<App />)

      const input = screen.getByPlaceholderText('Add a new todo...')
      const addButton = screen.getByText('Add')

      fireEvent.change(input, { target: { value: 'Failed todo' } })
      fireEvent.click(addButton)

      await waitFor(() => {
        expect(createTodo).toHaveBeenCalled()
      })

      // Todo should not appear in UI due to error
      expect(screen.queryByText('Failed todo')).not.toBeInTheDocument()

      consoleSpy.mockRestore()
    })
  })
})