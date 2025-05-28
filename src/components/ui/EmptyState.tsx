import React from 'react';
import { Package2 } from 'lucide-react';
interface EmptyStateProps {
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
export function EmptyState({
  message,
  action
}: EmptyStateProps) {
  return <div className="flex flex-col items-center justify-center p-8 space-y-4 min-h-[200px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-border/50">
      <div className="rounded-full bg-muted p-3">
        <Package2 className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground text-sm text-center">{message}</p>
      {action && <button onClick={action.onClick} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm">
          {action.label}
        </button>}
    </div>;
}