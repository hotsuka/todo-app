import { escapeHtml, formatDateShort, getPriorityLabel, getPriorityClass } from '../utils/helpers.js';

/**
 * TodoItem component
 * Renders a single todo item
 */
export class TodoItem {
  constructor(todo, callbacks = {}) {
    this.todo = todo;
    this.callbacks = callbacks;
  }

  /**
   * Render the todo item as an HTML element
   * @returns {HTMLElement} List item element
   */
  render() {
    const li = document.createElement('li');
    li.className = `todo-item ${getPriorityClass(this.todo.priority)} ${this.todo.completed ? 'completed' : ''}`;
    li.dataset.id = this.todo.id;

    li.innerHTML = `
      <div class="todo-item-content">
        <input
          type="checkbox"
          class="todo-checkbox"
          ${this.todo.completed ? 'checked' : ''}
          aria-label="完了をマーク"
        >
        <div class="todo-info">
          <h3 class="todo-title">${escapeHtml(this.todo.title)}</h3>
          ${this.renderDescription()}
          <div class="todo-meta">
            ${this.renderPriorityBadge()}
            ${this.renderDueDate()}
            ${this.renderCategories()}
            ${this.renderTags()}
          </div>
        </div>
      </div>
      <div class="todo-actions">
        <button class="btn-edit" title="編集" aria-label="編集">✏️</button>
        <button class="btn-delete" title="削除" aria-label="削除">🗑️</button>
      </div>
    `;

    this.attachEventListeners(li);
    return li;
  }

  /**
   * Render description if exists
   * @returns {string} HTML string
   */
  renderDescription() {
    if (!this.todo.description) return '';
    return `<p class="todo-description">${escapeHtml(this.todo.description)}</p>`;
  }

  /**
   * Render priority badge
   * @returns {string} HTML string
   */
  renderPriorityBadge() {
    return `<span class="priority-badge ${getPriorityClass(this.todo.priority)}">${getPriorityLabel(this.todo.priority)}</span>`;
  }

  /**
   * Render due date
   * @returns {string} HTML string
   */
  renderDueDate() {
    if (!this.todo.dueDate) return '';

    const overdueClass = this.todo.isOverdue() ? 'overdue' : '';
    const todayText = this.todo.isDueToday() ? ' (今日)' : '';

    return `<span class="due-date ${overdueClass}">期限: ${formatDateShort(this.todo.dueDate)}${todayText}</span>`;
  }

  /**
   * Render categories
   * @returns {string} HTML string
   */
  renderCategories() {
    if (!this.todo.categories || this.todo.categories.length === 0) return '';

    return this.todo.categories
      .map(cat => `<span class="category-tag">${escapeHtml(cat)}</span>`)
      .join('');
  }

  /**
   * Render tags
   * @returns {string} HTML string
   */
  renderTags() {
    if (!this.todo.tags || this.todo.tags.length === 0) return '';

    return this.todo.tags
      .map(tag => `<span class="tag">${escapeHtml(tag)}</span>`)
      .join('');
  }

  /**
   * Attach event listeners to the item
   * @param {HTMLElement} li - List item element
   */
  attachEventListeners(li) {
    // Checkbox toggle
    const checkbox = li.querySelector('.todo-checkbox');
    checkbox.addEventListener('change', () => {
      if (this.callbacks.onToggle) {
        this.callbacks.onToggle(this.todo.id);
      }
    });

    // Edit button
    const editBtn = li.querySelector('.btn-edit');
    editBtn.addEventListener('click', () => {
      if (this.callbacks.onEdit) {
        this.callbacks.onEdit(this.todo.id);
      }
    });

    // Delete button
    const deleteBtn = li.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', () => {
      if (this.callbacks.onDelete) {
        this.callbacks.onDelete(this.todo.id);
      }
    });
  }
}
