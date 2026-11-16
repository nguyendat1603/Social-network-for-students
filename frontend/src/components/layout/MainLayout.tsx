import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { RightSidebar } from './RightSidebar';
import { CampusAppShell } from './CampusAppShell';
import { useDemoStore } from '../../demo/demo.store';

interface MainLayoutProps {
  children: React.ReactNode;
  variant?: 'legacy' | 'campus';
  onAsk?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, variant = 'legacy', onAsk }) => {
  const demo = useDemoStore(state => state.active);
  if (variant === 'campus') {
    return <CampusAppShell onAsk={onAsk}>{children}</CampusAppShell>;
  }
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      <Navbar />
      <div
        style={{
          display: 'flex',
          flex: 1,
          justifyContent: 'center',
          width: '100%',
          maxWidth: 1440,
          margin: '0 auto',
        }}
      >
        <Sidebar />
        <main
          style={{
            flex: 1,
            padding: '24px 28px',
            maxWidth: 820,
            minWidth: 0,
          }}
        >
          {children}
        </main>
        {!(import.meta.env.DEV && demo) && <RightSidebar />}
      </div>
    </div>
  );
};
