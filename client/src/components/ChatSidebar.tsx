import { MessageSquarePlus, MessageSquare, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { ChatThread } from '../types/chat';

interface ChatSidebarProps {
  threads: ChatThread[];
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onNewChat: () => void;
  onDeleteThread: (threadId: string) => void;
}

export function ChatSidebar({
  threads,
  activeThreadId,
  onSelectThread,
  onNewChat,
  onDeleteThread
}: ChatSidebarProps) {
  return (
    <div className="w-64 h-screen bg-card border-r border-border flex flex-col">
      {/* New Chat Button */}
      <div className="p-4 border-b border-border">
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2"
          variant="outline"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Chat Threads List */}
      <div className="flex-1 overflow-y-auto">
        {threads.map((thread) => (
          <div
            key={thread.id}
            className={`
              group relative w-full border-b border-border
              hover:bg-accent transition-colors
              ${activeThreadId === thread.id ? 'bg-accent' : ''}
            `}
          >
            <button
              onClick={() => onSelectThread(thread.id)}
              className="w-full text-left p-4 pr-12"
            >
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 mt-1 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {thread.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(thread.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </button>

            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteThread(thread.id);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md
                opacity-0 group-hover:opacity-100 transition-opacity
                hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
              title="Delete chat"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
