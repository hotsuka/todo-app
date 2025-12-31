import { TodoApp } from './app.js';

/**
 * Initialize the TODO application
 */
document.addEventListener('DOMContentLoaded', () => {
  // Check if LocalStorage is available
  if (!window.localStorage) {
    alert('このブラウザはLocalStorageをサポートしていません。アプリを使用できません。');
    return;
  }

  // Initialize the app
  try {
    const app = new TodoApp();
    console.log('TODO App initialized successfully');

    // Make app available globally for debugging (optional)
    if (process.env.NODE_ENV === 'development') {
      window.todoApp = app;
    }
  } catch (error) {
    console.error('Failed to initialize TODO App:', error);
    alert('アプリの初期化に失敗しました: ' + error.message);
  }
});
