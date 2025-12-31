import { debounce } from '../utils/helpers.js';

/**
 * FilterBar component
 * Handles filtering and searching of todos
 */
export class FilterBar {
  constructor(callbacks = {}) {
    this.callbacks = callbacks;
    this.container = null;
    this.currentFilters = {
      status: 'all',
      priority: null,
      category: null,
      search: ''
    };
  }

  /**
   * Render the filter bar
   * @param {string} containerId - ID of container element
   */
  render(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.container.innerHTML = this.getFilterHTML();
    this.attachEventListeners();
  }

  /**
   * Get the HTML for the filter bar
   * @returns {string} HTML string
   */
  getFilterHTML() {
    return `
      <div class="filter-bar">
        <div class="filter-group">
          <input
            type="text"
            id="search-input"
            class="form-input"
            placeholder="🔍 検索..."
            style="min-width: 250px;"
          >
        </div>

        <div class="filter-group">
          <button class="filter-btn active" data-status="all">全て</button>
          <button class="filter-btn" data-status="active">未完了</button>
          <button class="filter-btn" data-status="completed">完了済み</button>
        </div>

        <div class="filter-group">
          <select id="priority-filter" class="form-select">
            <option value="">優先度: 全て</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>

        <div class="filter-group">
          <select id="category-filter" class="form-select">
            <option value="">カテゴリ: 全て</option>
          </select>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    if (!this.container) return;

    // Search input with debounce
    const searchInput = this.container.querySelector('#search-input');
    if (searchInput) {
      const debouncedSearch = debounce((value) => {
        this.currentFilters.search = value;
        this.notifyChange();
      }, 300);

      searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
      });
    }

    // Status filter buttons
    const statusButtons = this.container.querySelectorAll('[data-status]');
    statusButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active state
        statusButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update filter
        this.currentFilters.status = btn.dataset.status;
        this.notifyChange();
      });
    });

    // Priority filter
    const prioritySelect = this.container.querySelector('#priority-filter');
    if (prioritySelect) {
      prioritySelect.addEventListener('change', (e) => {
        this.currentFilters.priority = e.target.value || null;
        this.notifyChange();
      });
    }

    // Category filter
    const categorySelect = this.container.querySelector('#category-filter');
    if (categorySelect) {
      categorySelect.addEventListener('change', (e) => {
        this.currentFilters.category = e.target.value || null;
        this.notifyChange();
      });
    }
  }

  /**
   * Update available categories in the filter
   * @param {Array<string>} categories - Array of categories
   */
  updateCategories(categories) {
    const categorySelect = this.container?.querySelector('#category-filter');
    if (!categorySelect) return;

    const currentValue = categorySelect.value;

    categorySelect.innerHTML = '<option value="">カテゴリ: 全て</option>';
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      categorySelect.appendChild(option);
    });

    // Restore previous selection if still valid
    if (currentValue && categories.includes(currentValue)) {
      categorySelect.value = currentValue;
    }
  }

  /**
   * Notify callback of filter changes
   */
  notifyChange() {
    if (this.callbacks.onFilterChange) {
      this.callbacks.onFilterChange(this.currentFilters);
    }
  }

  /**
   * Reset all filters
   */
  reset() {
    this.currentFilters = {
      status: 'all',
      priority: null,
      category: null,
      search: ''
    };

    if (!this.container) return;

    // Reset search input
    const searchInput = this.container.querySelector('#search-input');
    if (searchInput) searchInput.value = '';

    // Reset status buttons
    const statusButtons = this.container.querySelectorAll('[data-status]');
    statusButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.status === 'all');
    });

    // Reset selects
    const prioritySelect = this.container.querySelector('#priority-filter');
    if (prioritySelect) prioritySelect.value = '';

    const categorySelect = this.container.querySelector('#category-filter');
    if (categorySelect) categorySelect.value = '';

    this.notifyChange();
  }

  /**
   * Get current filter state
   * @returns {Object} Current filters
   */
  getFilters() {
    return { ...this.currentFilters };
  }
}
