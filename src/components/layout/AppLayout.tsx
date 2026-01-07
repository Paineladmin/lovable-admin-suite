import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
  onSignOut?: () => void;
}

export function AppLayout({ children, onSignOut }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar onSignOut={onSignOut} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
