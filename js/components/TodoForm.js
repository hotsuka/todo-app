import { parseTags, escapeHtml } from '../utils/helpers.js';

/**
 * TodoForm component
 * Handles the todo input form rendering and interactions
 */
export class TodoForm {
  constructor(callbacks = {}) {
    this.callbacks = callbacks;
    this.editingId = null;
    this.allCategories = [];
    this.formElement = null;
  }

  /**
   * Render the form
   * @param {string} containerId - ID of container element
   */
  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = this.getFormHTML();
    this.formElement = container.querySelector('.todo-form');
    this.attachEventListeners();
  }

  /**
   * Get the HTML for the form
   * @returns {string} HTML string
   */
  getFormHTML() {
    return `
      <form class="todo-form">
        <div class="form-group form-row-full">
          <label class="form-label" for="todo-title">タイトル *</label>
          <input
            type="text"
            id="todo-title"
            class="form-input"
            placeholder="何をする必要がありますか？"
            required
            maxlength="200"
          >
        </div>

        <div class="form-group form-row-full">
          <label class="form-label" for="todo-description">説明（オプション）</label>
          <textarea
            id="todo-description"
            class="form-textarea"
            placeholder="詳細を追加..."
            rows="3"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="todo-priority">優先度</label>
            <select id="todo-priority" class="form-select">
              <option value="low">低</option>
              <option value="medium" selected>中</option>
              <option value="high">高</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="todo-due-date">期限</label>
            <input
              type="date"
              id="todo-due-date"
              class="form-input"
            >
          </div>
        </div>

        <div class="form-group form-row-full">
          <label class="form-label" for="todo-categories">カテゴリ</label>
          <input
            type="text"
            id="todo-categories"
            class="form-input"
            placeholder="カテゴリをカンマ区切りで入力（例: 仕事, 個人）"
          >
        </div>

        <div class="form-group form-row-full">
          <label class="form-label" for="todo-tags">タグ</label>
          <input
            type="text"
            id="todo-tags"
            class="form-input"
            placeholder="タグをカンマ区切りで入力（例: #重要, #レビュー）"
          >
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" id="btn-submit">
            追加
          </button>
          <button type="button" class="btn btn-secondary hidden" id="btn-cancel">
            キャンセル
          </button>
        </div>
      </form>
    `;
  }

  /**
   * Attach event listeners to the form
   */
  attachEventListeners() {
    if (!this.formElement) return;

    // Form submit
    this.formElement.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Cancel button
    const cancelBtn = this.formElement.querySelector('#btn-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.reset();
      });
    }
  }

  /**
   * Handle form submission
   */
  handleSubmit() {
    const data = this.getFormData();

    if (!data.title.trim()) {
      alert('タイトルを入力してください');
      return;
    }

    if (this.editingId) {
      // Update mode
      if (this.callbacks.onUpdate) {
        this.callbacks.onUpdate(this.editingId, data);
      }
    } else {
      // Add mode
      if (this.callbacks.onSubmit) {
        this.callbacks.onSubmit(data);
      }
    }

    this.reset();
  }

  /**
   * Get form data
   * @returns {Object} Form data
   */
  getFormData() {
    const titleInput = this.formElement.querySelector('#todo-title');
    const descriptionInput = this.formElement.querySelector('#todo-description');
    const prioritySelect = this.formElement.querySelector('#todo-priority');
    const dueDateInput = this.formElement.querySelector('#todo-due-date');
    const categoriesInput = this.formElement.querySelector('#todo-categories');
    const tagsInput = this.formElement.querySelector('#todo-tags');

    const categories = categoriesInput.value
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    const tags = parseTags(tagsInput.value);

    return {
      title: titleInput.value.trim(),
      description: descriptionInput.value.trim(),
      priority: prioritySelect.value,
      dueDate: dueDateInput.value || null,
      categories: categories,
      tags: tags
    };
  }

  /**
   * Populate form with todo data for editing
   * @param {Object} todo - Todo to edit
   */
  populate(todo) {
    if (!this.formElement) return;

    this.editingId = todo.id;

    const titleInput = this.formElement.querySelector('#todo-title');
    const descriptionInput = this.formElement.querySelector('#todo-description');
    const prioritySelect = this.formElement.querySelector('#todo-priority');
    const dueDateInput = this.formElement.querySelector('#todo-due-date');
    const categoriesInput = this.formElement.querySelector('#todo-categories');
    const tagsInput = this.formElement.querySelector('#todo-tags');
    const submitBtn = this.formElement.querySelector('#btn-submit');
    const cancelBtn = this.formElement.querySelector('#btn-cancel');

    titleInput.value = todo.title;
    descriptionInput.value = todo.description || '';
    prioritySelect.value = todo.priority;
    dueDateInput.value = todo.dueDate || '';
    categoriesInput.value = todo.categories.join(', ');
    tagsInput.value = todo.tags.join(', ');

    submitBtn.textContent = '更新';
    cancelBtn.classList.remove('hidden');

    // Scroll to form
    this.formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Reset the form
   */
  reset() {
    if (!this.formElement) return;

    this.editingId = null;
    this.formElement.reset();

    const submitBtn = this.formElement.querySelector('#btn-submit');
    const cancelBtn = this.formElement.querySelector('#btn-cancel');

    submitBtn.textContent = '追加';
    cancelBtn.classList.add('hidden');
  }

  /**
   * Update available categories for autocomplete
   * @param {Array<string>} categories - Array of categories
   */
  updateCategories(categories) {
    this.allCategories = categories;
    // Could implement autocomplete here
  }
}
