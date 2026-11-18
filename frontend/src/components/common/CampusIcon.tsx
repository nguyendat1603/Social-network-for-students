import React from 'react';

const paths: Record<string, React.ReactNode> = {
  search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
  message: <path d="M20 11.5a8 8 0 0 1-8 8 9 9 0 0 1-4-.9L3 20l1.4-4.5a8 8 0 1 1 15.6-4Z" />,
  home: <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" />,
  book: <path d="M12 7c-2.6-1.8-5.4-2.1-9-1v14c3.6-1.1 6.4-.8 9 1 2.6-1.8 5.4-2.1 9-1V6c-3.6-1.1-6.4-.8-9 1Zm0 0v14" />,
  files: <path d="M7 3h7l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm7 0v5h4M9 12h6M9 16h6" />,
  users: <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m7-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 4a4 4 0 0 1 4 4v2m-4-17a4 4 0 0 1 0 8" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  building: <path d="m3 9 9-6 9 6H3Zm2 3v7m7-7v7m7-7v7M3 22h18" />,
  shop: <path d="M3 10 5 3h14l2 7M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M5 13v8h14v-8M10 21v-6h4v6" />,
  bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />,
  'chevron-left': <path d="m15 6-6 6 6 6" />,
  'chevron-right': <path d="m9 6 6 6-6 6" />,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  'chevron-up': <path d="m6 15 6-6 6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  x: <path d="m6 6 12 12M18 6 6 18" />,
  spark: <path d="m12 2 2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2Z" />,
};

export const CampusIcon: React.FC<{ name: string }> = ({ name }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
    {paths[name]}
  </svg>
);
