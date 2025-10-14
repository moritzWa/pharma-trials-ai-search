import { ChatThread } from '../types/chat';

const STORAGE_KEY = 'pharma-trials-chat-threads';

export const storage = {
  getThreads: (): ChatThread[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },

  saveThreads: (threads: ChatThread[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },

  addThread: (thread: ChatThread): void => {
    const threads = storage.getThreads();
    threads.unshift(thread); // Add to beginning
    storage.saveThreads(threads);
  },

  updateThread: (threadId: string, updates: Partial<ChatThread>): void => {
    const threads = storage.getThreads();
    const index = threads.findIndex(t => t.id === threadId);
    if (index !== -1) {
      threads[index] = { ...threads[index], ...updates, updatedAt: Date.now() };
      storage.saveThreads(threads);
    }
  },

  deleteThread: (threadId: string): void => {
    const threads = storage.getThreads();
    const filtered = threads.filter(t => t.id !== threadId);
    storage.saveThreads(filtered);
  },
};
