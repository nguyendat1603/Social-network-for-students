import React from 'react';
import { Link } from 'react-router-dom';
import { APP_ROUTES } from '../../config/routes.config';
import { Sidebar } from './Sidebar';
import { RightSidebar } from './RightSidebar';
import { CampusAppShell } from './CampusAppShell';
import { useDemoStore } from '../../demo/demo.store';
import { FloatingChatBubbles } from './FloatingChatBubbles';

interface MainLayoutProps {
  children: React.ReactNode;
  variant?: 'legacy' | 'campus';
  onAsk?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, variant = 'legacy', onAsk }) => {
  const demo = useDemoStore(state => state.active);
  if (variant === 'campus') {
    return <CampusAppShell onAsk={onAsk}>
      {children}
      {!(import.meta.env.DEV && demo) && <FloatingChatBubbles />}
    </CampusAppShell>;
  }
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-paper)',
        color: 'var(--color-ink)',
      }}
    >
      {/* Mobile-only Header (since on Desktop, the Left Sidebar IS the Nav per Substack spec) */}
      <header
        className="md:hidden"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid var(--color-cloud)',
          backgroundColor: 'var(--color-paper)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <Link
          to={APP_ROUTES.CAMPUS_FEED}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
          }}
        >
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              backgroundColor: 'var(--color-signal-orange)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#ffffff">
              <rect x="3" y="2" width="18" height="2.6" rx="0.5" />
              <rect x="3" y="6.8" width="18" height="2.6" rx="0.5" />
              <path d="M3 11.6h18V22l-9-5.2L3 22V11.6z" />
            </svg>
          </span>
          <span
            style={{
              fontFamily: 'var(--font-cahuenga)',
              fontSize: 20,
              fontWeight: 600,
              color: 'var(--color-ink)',
            }}
          >
            BáchKhoa
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to={APP_ROUTES.STUDY_GROUPS} className="substack-btn-secondary">
            Đồ án
          </Link>
          <Link to={APP_ROUTES.RESOURCE_HUB} className="substack-btn-secondary">
            Tài liệu
          </Link>
          <Link to={APP_ROUTES.ACADEMIC_PROFILE} className="substack-btn-primary" style={{ padding: '6px 14px', fontSize: 13 }}>
            Hồ sơ
          </Link>
        </div>
      </header>

      {/* Three-Column Substack Newsroom Desktop Layout */}
      <div className="substack-layout-grid">
        <Sidebar />

        <main
          style={{
            minWidth: 0,
            width: '100%',
            maxWidth: 620,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          {children}
        </main>
        {!(import.meta.env.DEV && demo) && <RightSidebar />}
      </div>

      {/* Facebook-style Floating Chat Bubbles & Popup Chat Windows (Bottom-Right) */}
      {!(import.meta.env.DEV && demo) && <FloatingChatBubbles />}
    </div>
  );
};
