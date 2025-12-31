import { TodoList } from './models/TodoList.js';
import { StorageService } from './services/StorageService.js';
import { TodoForm } from './components/TodoForm.js';
import { TodoItem } from './components/TodoItem.js';
import { FilterBar } from './components/FilterBar.js';
import { TodoStats } from './components/TodoStats.js';
import { downloadFile, readFileAsText } from './utils/helpers.js';

/**
 * Main TodoApp class
 * Manages the entire todo application
 */
export class TodoApp {
  constructor() {
    this.storageService = new StorageService();
    this.todoList = new TodoList(this.storageService);
    this.currentFilter = { status: 'all', search: '', priority: null, category: null };

    this.initializeComponents();
    this.attachEventListeners();
    this.loadTodos();
  }

  /**
   * Initialize all components
   */
  initializeComponents() {
    // Todo Form
    this.todoForm = new TodoForm({
      onSubmit: (data) => this.handleAddTodo(data),
      onUpdate: (id, data) => this.handleUpdateTodo(id, data)
    });

    // Filter Bar
    this.filterBar = new FilterBar({
      onFilterChange: (filter) => this.handleFilterChange(filter)
    });

    // Stats
    this.todoStats = new TodoStats();

    // Render components
    this.todoForm.render('todo-form');
    this.filterBar.render('filter-bar');
    this.todoStats.render('todo-stats');
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Subscribe to todoList changes
    this.todoList.subscribe(() => this.render());

    // Export button
    const exportBtn = document.getElementById('btn-export');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.handleExport());
    }

    // Import button
    const importBtn = document.getElementById('btn-import');
    if (importBtn) {
      importBtn.addEventListener('click', () => this.handleImportClick());
    }

    // File input for import
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleImport(e));
    }

    // Clear all button
    const clearAllBtn = document.getElementById('btn-clear-all');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => this.handleClearAll());
    }
  }

  /**
   * Load todos from storage
   */
  loadTodos() {
    this.todoList.load();
    this.updateFilterCategories();
  }

  /**
   * Handle adding a new todo
   * @param {Object} data - Todo data
   */
  handleAddTodo(data) {
    try {
      this.todoList.add(data);
      this.updateFilterCategories();
    } catch (error) {
      alert(error.message);
    }
  }

  /**
   * Handle updating a todo
   * @param {string} id - Todo ID
   * @param {Object} data - Updated data
   */
  handleUpdateTodo(id, data) {
    try {
      this.todoList.update(id, data);
      this.updateFilterCategories();
    } catch (error) {
      alert(error.message);
    }
  }

  /**
   * Handle toggling todo completion
   * @param {string} id - Todo ID
   */
  handleToggleTodo(id) {
    this.todoList.toggle(id);
  }

  /**
   * Handle editing a todo
   * @param {string} id - Todo ID
   */
  handleEditTodo(id) {
    const todo = this.todoList.findById(id);
    if (todo) {
      this.todoForm.populate(todo);
    }
  }

  /**
   * Handle deleting a todo
   * @param {string} id - Todo ID
   */
  handleDeleteTodo(id) {
    if (confirm('このTODOを削除しますか？')) {
      this.todoList.delete(id);
      this.updateFilterCategories();
    }
  }

  /**
   * Handle filter changes
   * @param {Object} filter - Filter criteria
   */
  handleFilterChange(filter) {
    this.currentFilter = { ...this.currentFilter, ...filter };
    this.render();
  }

  /**
   * Handle export
   */
  handleExport() {
    const data = this.storageService.export();
    if (data) {
      const timestamp = new Date().toISOString().split('T')[0];
      downloadFile(data, `todos-${timestamp}.json`, 'application/json');
    } else {
      alert('エクスポートするデータがありません');
    }
  }

  /**
   * Handle import button click
   */
  handleImportClick() {
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.click();
    }
  }

  /**
   * Handle import
   * @param {Event} event - Change event
   */
  async handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const content = await readFileAsText(file);
      const success = this.storageService.import(content);

      if (success) {
        this.loadTodos();
        alert('インポートが完了しました');
      }
    } catch (error) {
      alert('インポートに失敗しました: ' + error.message);
    }

    // Reset file input
    event.target.value = '';
  }

  /**
   * Handle clear all
   */
  handleClearAll() {
    if (confirm('すべてのTODOを削除しますか？この操作は取り消せません。')) {
      this.todoList.clear();
      this.updateFilterCategories();
    }
  }

  /**
   * Update filter bar with current categories
   */
  updateFilterCategories() {
    const categories = this.todoList.getAllCategories();
    this.filterBar.updateCategories(categories);
    this.todoForm.updateCategories(categories);
  }

  /**
   * Render the todo list
   */
  render() {
    // Get filtered and sorted todos
    const filteredTodos = this.todoList.filter(this.currentFilter);
    const sortedTodos = this.sortTodos(filteredTodos);

    // Render todo list
    this.renderTodoList(sortedTodos);

    // Update stats
    const stats = this.todoList.getStats();
    this.todoStats.update(stats);
  }

  /**
   * Sort todos (completed at bottom, then by creation date)
   * @param {Array} todos - Todos to sort
   * @returns {Array} Sorted todos
   */
  sortTodos(todos) {
    return [...todos].sort((a, b) => {
      // Completed items go to bottom
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      // Sort by creation date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  /**
   * Render the todo list
   * @param {Array} todos - Todos to render
   */
  renderTodoList(todos) {
    const todoListEl = document.getElementById('todo-list');
    if (!todoListEl) return;

    todoListEl.innerHTML = '';

    if (todos.length === 0) {
      todoListEl.innerHTML = '<li class="empty-state">TODOがありません</li>';
      return;
    }

    todos.forEach(todo => {
      const todoItem = new TodoItem(todo, {
        onToggle: (id) => this.handleToggleTodo(id),
        onEdit: (id) => this.handleEditTodo(id),
        onDelete: (id) => this.handleDeleteTodo(id)
      });
      todoListEl.appendChild(todoItem.render());
    });
  }
}
