import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Cards from './pages/Cards';
import MyCards from './pages/MyCards';
import MyBinders from './pages/MyBinders';
import BinderDetail from './pages/BinderDetail';
import UserDashboard from './pages/UserDashboard';

function App() {
  return (
    <AuthProvider>
      <Router basename={process.env.PUBLIC_URL}>
        <div className="App">
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/cartes" element={<Cards />} />
            
            {/* Routes protégées */}
            <Route 
              path="/user" 
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/mes-cartes" 
              element={
                <ProtectedRoute>
                  <MyCards />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/mes-binders" 
              element={
                <ProtectedRoute>
                  <MyBinders />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/binder/:id" 
              element={
                <ProtectedRoute>
                  <BinderDetail />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
