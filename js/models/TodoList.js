import { Todo } from './Todo.js';

/**
 * TodoList class
 * Manages a collection of todos with CRUD operations and filtering
 */
export class TodoList {
  constructor(storageService) {
    this.storageService = storageService;
    this.todos = [];
    this.listeners = [];
  }

  /**
   * Load todos from storage
   */
  load() {
    const data = this.storageService.load();
    this.todos = data.map(item => new Todo(item));
    this.notify();
  }

  /**
   * Save todos to storage
   */
  save() {
    this.storageService.save(this.todos.map(todo => todo.toJSON()));
    this.notify();
  }

  /**
   * Add a new todo
   * @param {Object} todoData - Data for the new todo
   * @returns {Todo} The created todo
   */
  add(todoData) {
    const todo = new Todo(todoData);
    const validation = todo.validate();

    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    this.todos.push(todo);
    this.save();
    return todo;
  }

  /**
   * Update an existing todo
   * @param {string} id - ID of the todo to update
   * @param {Object} data - New data
   * @returns {Todo|null} Updated todo or null if not found
   */
  update(id, data) {
    const todo = this.findById(id);
    if (todo) {
      todo.update(data);
      const validation = todo.validate();

      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      this.save();
    }
    return todo;
  }

  /**
   * Delete a todo
   * @param {string} id - ID of the todo to delete
   * @returns {boolean} True if deleted
   */
  delete(id) {
    const initialLength = this.todos.length;
    this.todos = this.todos.filter(todo => todo.id !== id);

    if (this.todos.length !== initialLength) {
      this.save();
      return true;
    }
    return false;
  }

  /**
   * Toggle the completed status of a todo
   * @param {string} id - ID of the todo
   * @returns {Todo|null} The toggled todo or null
   */
  toggle(id) {
    const todo = this.findById(id);
    if (todo) {
      todo.toggleComplete();
      this.save();
    }
    return todo;
  }

  /**
   * Find a todo by ID
   * @param {string} id - ID to search for
   * @returns {Todo|null} Found todo or null
   */
  findById(id) {
    return this.todos.find(todo => todo.id === id) || null;
  }

  /**
   * Filter todos based on criteria
   * @param {Object} criteria - Filter criteria
   * @returns {Array<Todo>} Filtered todos
   */
  filter(criteria = {}) {
    return this.todos.filter(todo => {
      // Status filter
      if (criteria.status === 'active' && todo.completed) return false;
      if (criteria.status === 'completed' && !todo.completed) return false;

      // Priority filter
      if (criteria.priority && todo.priority !== criteria.priority) return false;

      // Category filter
      if (criteria.category && !todo.categories.includes(criteria.category)) return false;

      // Tag filter
      if (criteria.tag && !todo.tags.includes(criteria.tag)) return false;

      // Search filter (title and description)
      if (criteria.search) {
        const searchLower = criteria.search.toLowerCase();
        const titleMatch = todo.title.toLowerCase().includes(searchLower);
        const descMatch = todo.description.toLowerCase().includes(searchLower);
        if (!titleMatch && !descMatch) return false;
      }

      return true;
    });
  }

  /**
   * Sort todos by a given field
   * @param {string} field - Field to sort by
   * @param {string} order - 'asc' or 'desc'
   * @returns {Array<Todo>} Sorted todos
   */
  sort(field = 'createdAt', order = 'desc') {
    const sorted = [...this.todos].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];

      // Handle date strings
      if (field.includes('At') || field === 'dueDate') {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }

      // Handle priority
      if (field === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        aVal = priorityOrder[aVal] || 0;
        bVal = priorityOrder[bVal] || 0;
      }

      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }

  /**
   * Get statistics about the todos
   * @returns {Object} Statistics
   */
  getStats() {
    const total = this.todos.length;
    const completed = this.todos.filter(t => t.completed).length;
    const active = total - completed;
    const overdue = this.todos.filter(t => t.isOverdue()).length;
    const dueToday = this.todos.filter(t => t.isDueToday()).length;

    return {
      total,
      completed,
      active,
      overdue,
      dueToday
    };
  }

  /**
   * Get all unique categories
   * @returns {Array<string>} Array of categories
   */
  getAllCategories() {
    const categories = new Set();
    this.todos.forEach(todo => {
      todo.categories.forEach(cat => categories.add(cat));
    });
    return Array.from(categories).sort();
  }

  /**
   * Get all unique tags
   * @returns {Array<string>} Array of tags
   */
  getAllTags() {
    const tags = new Set();
    this.todos.forEach(todo => {
      todo.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }

  /**
   * Clear all todos
   */
  clear() {
    this.todos = [];
    this.save();
  }

  /**
   * Subscribe to changes
   * @param {Function} listener - Callback function
   */
  subscribe(listener) {
    this.listeners.push(listener);
  }

  /**
   * Unsubscribe from changes
   * @param {Function} listener - Callback function to remove
   */
  unsubscribe(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Notify all subscribers of changes
   */
  notify() {
    this.listeners.forEach(listener => listener(this.todos));
  }
}
