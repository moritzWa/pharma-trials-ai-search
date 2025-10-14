import { useState, useEffect } from 'react';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatInterface } from './components/ChatInterface';
import { ChatThread, ChatMessage } from './types/chat';
import { storage } from './lib/storage';

function App() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load threads from localStorage on mount
  useEffect(() => {
    const savedThreads = storage.getThreads();
    setThreads(savedThreads);
    if (savedThreads.length > 0) {
      setActiveThreadId(savedThreads[0].id);
    }
  }, []);

  const activeThread = threads.find(t => t.id === activeThreadId);

  const createNewThread = () => {
    const newThread: ChatThread = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    storage.addThread(newThread);
    setThreads([newThread, ...threads]);
    setActiveThreadId(newThread.id);
  };

  const handleDeleteThread = (threadId: string) => {
    storage.deleteThread(threadId);
    const updatedThreads = threads.filter(t => t.id !== threadId);
    setThreads(updatedThreads);

    // If deleting active thread, select another or create new
    if (activeThreadId === threadId) {
      if (updatedThreads.length > 0) {
        setActiveThreadId(updatedThreads[0].id);
      } else {
        setActiveThreadId(null);
      }
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!activeThreadId) {
      createNewThread();
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    // Update thread with user message
    const updatedThread = {
      ...activeThread!,
      messages: [...activeThread!.messages, userMessage],
      title: activeThread!.messages.length === 0 ? content.slice(0, 50) : activeThread!.title,
      updatedAt: Date.now(),
    };

    storage.updateThread(activeThreadId, updatedThread);
    setThreads(threads.map(t => t.id === activeThreadId ? updatedThread : t));

    // Call API
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content }),
      });

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        timestamp: Date.now(),
        results: data.results,
        totalResults: data.totalResults,
        query: data.query,
      };

      // Update thread with assistant message
      const finalThread = {
        ...updatedThread,
        messages: [...updatedThread.messages, assistantMessage],
        updatedAt: Date.now(),
      };

      storage.updateThread(activeThreadId, finalThread);
      setThreads(threads.map(t => t.id === activeThreadId ? finalThread : t));
    } catch (error) {
      console.error('Error calling API:', error);
      // Optionally add error message to chat
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={setActiveThreadId}
        onNewChat={createNewThread}
        onDeleteThread={handleDeleteThread}
      />
      <ChatInterface
        messages={activeThread?.messages || []}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
}

export default App;
