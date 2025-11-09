import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Cards from './pages/Cards';
import MyCards from './pages/MyCards';
import MyBinders from './pages/MyBinders';
import BinderDetail from './pages/BinderDetail';
import UserDashboard from './pages/UserDashboard';
import DeckBuilder from './pages/DeckBuilder';

// Component to handle 404.html redirect
function RedirectHandler() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    
    if (redirect) {
      // Remove the redirect param and navigate to the path
      navigate(redirect, { replace: true });
    }
  }, [navigate]);
  
  return null;
}

function App() {
  const basename = process.env.NODE_ENV === 'production' ? (process.env.PUBLIC_URL || '') : '';
  return (
    <AuthProvider>
      <Router basename={basename}>
        <RedirectHandler />
        <div className="App">
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/cartes" element={<Cards />} />

            {/* Routes prot?g?es */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/user" element={<UserDashboard />} />
              <Route path="/mes-cartes" element={<MyCards />} />
              <Route path="/listing" element={<Cards showHeader={false} />} />
              <Route path="/mes-binders" element={<MyBinders />} />
              <Route path="/binder/:id" element={<BinderDetail />} />
              <Route path="/deck-builder" element={<DeckBuilder />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
