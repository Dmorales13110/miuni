import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/login';
import Register from './pages/auth/signUp';
import Dashboard from './pages/dashboard';
import { checkSession } from './utils/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await checkSession();
        if (res.data && res.data.authenticated) {
          setIsAuthenticated(true);
          setUserId(res.data.user_id);
          setUsername(res.data.username);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '1.5rem'
      }}>
        Cargando juego...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={
        !isAuthenticated ?
          <Login setAuth={setIsAuthenticated} setUserId={setUserId} setUsername={setUsername} /> :
          <Navigate to="/" />
      } />
      <Route path="/register" element={
        !isAuthenticated ?
          <Register setAuth={setIsAuthenticated} setUserId={setUserId} setUsername={setUsername} /> :
          <Navigate to="/" />
      } />
      <Route path="/" element={
        isAuthenticated ?
          <Dashboard userId={userId} setAuth={setIsAuthenticated} username={username} /> :
          <Navigate to="/login" />
      } />
    </Routes>
  );
}

export default App;