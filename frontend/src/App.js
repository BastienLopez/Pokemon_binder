import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Home from './pages/Home';
import Cards from './pages/Cards';
import MyCards from './pages/MyCards';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cartes" element={<Cards />} />
            <Route path="/mes-cartes" element={<MyCards />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
