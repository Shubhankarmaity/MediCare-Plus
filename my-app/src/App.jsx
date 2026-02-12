import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import ScrollToHash from './components/ScrollToHash';
import AnimatedRoutes from './components/AnimatedRoutes';
import ScrollProgress from './components/ScrollProgress';
import BackToTop from './components/BackToTop';

function App() {
  return (
    <Router>
      <ScrollProgress />
      <ScrollToHash />
      <ScrollToHash />
      <AnimatedRoutes />
      {/* Route for Forgot Password is likely inside AnimatedRoutes or should be added where routes are defined. 
          Wait, AnimatedRoutes usually handles routes. I need to check AnimatedRoutes.jsx
          But if I can add it here... no, better check AnimatedRoutes.jsx first.
      */}
      <BackToTop />
      <BackToTop />
    </Router>
  );
}

export default App;