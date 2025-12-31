/**
 * StorageService class
 * Handles all LocalStorage operations for the TODO app
 */
export class StorageService {
  constructor(key = 'todoApp') {
    this.key = key;
    this.version = '1.0.0';
  }

  /**
   * Load todos from LocalStorage
   * @returns {Array} Array of todo objects
   */
  load() {
    try {
      const data = localStorage.getItem(this.key);
      if (!data) {
        return [];
      }

      const parsed = JSON.parse(data);

      // Validate data structure
      if (!parsed || typeof parsed !== 'object') {
        console.warn('Invalid data structure in storage');
        return [];
      }

      // Handle version migration if needed
      if (parsed.version !== this.version) {
        console.log('Data version mismatch, may need migration');
      }

      return Array.isArray(parsed.todos) ? parsed.todos : [];
    } catch (error) {
      console.error('Failed to load from storage:', error);
      return [];
    }
  }

  /**
   * Save todos to LocalStorage
   * @param {Array} todos - Array of todo objects to save
   * @returns {boolean} True if saved successfully
   */
  save(todos) {
    try {
      const data = {
        version: this.version,
        todos: todos,
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem(this.key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to save to storage:', error);

      // Handle QuotaExceededError
      if (error.name === 'QuotaExceededError') {
        alert('ストレージ容量が不足しています。古いデータを削除してください。');
      }

      return false;
    }
  }

  /**
   * Clear all data from storage
   * @returns {boolean} True if cleared successfully
   */
  clear() {
    try {
      localStorage.removeItem(this.key);
      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }

  /**
   * Export data as JSON string
   * @returns {string|null} JSON string of data or null on error
   */
  export() {
    try {
      const data = localStorage.getItem(this.key);
      return data || null;
    } catch (error) {
      console.error('Failed to export data:', error);
      return null;
    }
  }

  /**
   * Import data from JSON string
   * @param {string} jsonData - JSON string to import
   * @returns {boolean} True if imported successfully
   */
  import(jsonData) {
    try {
      // Validate JSON
      const parsed = JSON.parse(jsonData);

      if (!parsed || !Array.isArray(parsed.todos)) {
        throw new Error('Invalid data format');
      }

      // Save the imported data
      localStorage.setItem(this.key, jsonData);
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      alert('インポートに失敗しました。JSONファイルの形式を確認してください。');
      return false;
    }
  }

  /**
   * Check if storage is available
   * @returns {boolean} True if LocalStorage is available
   */
  isAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      console.error('LocalStorage is not available:', error);
      return false;
    }
  }

  /**
   * Get storage usage information
   * @returns {Object} Storage usage stats
   */
  getStorageInfo() {
    try {
      const data = localStorage.getItem(this.key);
      const size = data ? new Blob([data]).size : 0;
      const sizeInKB = (size / 1024).toFixed(2);

      return {
        size: size,
        sizeInKB: sizeInKB,
        key: this.key
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { size: 0, sizeInKB: '0', key: this.key };
    }
  }
}
