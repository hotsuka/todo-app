/**
 * TodoStats component
 * Displays statistics about todos
 */
export class TodoStats {
  constructor() {
    this.container = null;
  }

  /**
   * Render the stats component
   * @param {string} containerId - ID of container element
   */
  render(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.update({ total: 0, active: 0, completed: 0, overdue: 0, dueToday: 0 });
  }

  /**
   * Update the stats display
   * @param {Object} stats - Statistics object
   */
  update(stats) {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="stats-container">
        <div class="stat-item">
          <span>📊 合計: ${stats.total}</span>
        </div>
        <div class="stat-item">
          <span>✅ 完了: ${stats.completed}</span>
        </div>
        <div class="stat-item">
          <span>⏳ 未完了: ${stats.active}</span>
        </div>
        ${stats.dueToday > 0 ? `
          <div class="stat-item">
            <span>📅 今日期限: ${stats.dueToday}</span>
          </div>
        ` : ''}
        ${stats.overdue > 0 ? `
          <div class="stat-item">
            <span style="color: var(--color-danger);">⚠️ 期限切れ: ${stats.overdue}</span>
          </div>
        ` : ''}
      </div>
    `;
  }
}
