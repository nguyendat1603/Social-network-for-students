import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { RightSidebar } from './RightSidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
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
        <RightSidebar />
      </div>
    </div>
  );
};
