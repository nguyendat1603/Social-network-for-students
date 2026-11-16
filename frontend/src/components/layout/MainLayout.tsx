import React from 'react';
import { CampusAppShell } from './CampusAppShell';
import { useDemoStore } from '../../demo/demo.store';
import { FloatingChatBubbles } from './FloatingChatBubbles';

interface MainLayoutProps {
  children: React.ReactNode;
  variant?: 'legacy' | 'campus';
  courseCode?: string;
  pageClassName?: string;
  onAsk?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, onAsk, pageClassName, courseCode }) => {
  const demo = useDemoStore(state => state.active);
  return <CampusAppShell onAsk={onAsk} courseCode={courseCode}>
    <div className={pageClassName}>{children}</div>
    {!(import.meta.env.DEV && demo) && <FloatingChatBubbles />}
  </CampusAppShell>;
};
