import React from 'react';

const paths: Record<string, React.ReactNode> = {
  home: <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" />,
  book: <path d="M12 7c-2.6-1.8-5.4-2.1-9-1v14c3.6-1.1 6.4-.8 9 1 2.6-1.8 5.4-2.1 9-1V6c-3.6-1.1-6.4-.8-9 1Zm0 0v14" />,
  files: <path d="M7 3h7l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm7 0v5h4M9 12h6M9 16h6" />,
  users: <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m7-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 4a4 4 0 0 1 4 4v2m-4-17a4 4 0 0 1 0 8" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  plus: <path d="M12 5v14M5 12h14" />,
  x: <path d="m6 6 12 12M18 6 6 18" />,
  spark: <path d="m12 2 2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2Z" />,
};

export const CampusIcon: React.FC<{ name: string }> = ({ name }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
    {paths[name]}
  </svg>
);
