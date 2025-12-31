/**
 * Todo model class
 * Represents a single TODO item with all its properties and methods
 */
export class Todo {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.title = data.title || '';
    this.description = data.description || '';
    this.completed = data.completed || false;
    this.priority = data.priority || 'medium';
    this.dueDate = data.dueDate || null;
    this.categories = data.categories || [];
    this.tags = data.tags || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.completedAt = data.completedAt || null;
  }

  /**
   * Generate a unique ID for the todo
   * @returns {string} Unique ID
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Toggle the completed status of the todo
   */
  toggleComplete() {
    this.completed = !this.completed;
    this.completedAt = this.completed ? new Date().toISOString() : null;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Update the todo with new data
   * @param {Object} data - New data to update
   */
  update(data) {
    // Don't allow updating id, createdAt
    const { id, createdAt, ...updateData } = data;
    Object.assign(this, updateData);
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Check if the todo is overdue
   * @returns {boolean} True if overdue
   */
  isOverdue() {
    if (!this.dueDate || this.completed) {
      return false;
    }
    return new Date(this.dueDate) < new Date();
  }

  /**
   * Check if the todo is due today
   * @returns {boolean} True if due today
   */
  isDueToday() {
    if (!this.dueDate) {
      return false;
    }
    const today = new Date();
    const dueDate = new Date(this.dueDate);
    return (
      today.getFullYear() === dueDate.getFullYear() &&
      today.getMonth() === dueDate.getMonth() &&
      today.getDate() === dueDate.getDate()
    );
  }

  /**
   * Convert the todo to a plain JSON object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      completed: this.completed,
      priority: this.priority,
      dueDate: this.dueDate,
      categories: [...this.categories],
      tags: [...this.tags],
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      completedAt: this.completedAt
    };
  }

  /**
   * Validate the todo data
   * @returns {Object} Validation result with isValid and errors
   */
  validate() {
    const errors = [];

    if (!this.title || this.title.trim() === '') {
      errors.push('タイトルは必須です');
    }

    if (this.title.length > 200) {
      errors.push('タイトルは200文字以内にしてください');
    }

    if (!['high', 'medium', 'low'].includes(this.priority)) {
      errors.push('優先度が無効です');
    }

    if (this.dueDate && isNaN(new Date(this.dueDate).getTime())) {
      errors.push('期限の日付が無効です');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
