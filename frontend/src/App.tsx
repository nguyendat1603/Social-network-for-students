import React from 'react';
import { AppRouter } from './router';
import { DemoModeBanner } from './demo/DemoMode';

export const App: React.FC = () => {
  return <><DemoModeBanner /><AppRouter /></>;
};

export default App;
