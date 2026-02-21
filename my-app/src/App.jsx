import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import ScrollToHash from './components/ScrollToHash';
import AnimatedRoutes from './components/AnimatedRoutes';
import ScrollProgress from './components/ScrollProgress';
import BackToTop from './components/BackToTop';
import MediBot from './components/MediBot';

function App() {
  return (
    <Router>
      <ScrollProgress />
      <ScrollToHash />
      <AnimatedRoutes />
      <BackToTop />
      {/* AI Chatbot — visible on all pages */}
      <MediBot />
    </Router>
  );
}

export default App;
