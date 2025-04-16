import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Anchor } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import Sessions from './pages/Sessions';
import MyRegistrations from './pages/MyRegistrations';
import Messages from './pages/Messages';
import PrivateRoute from './components/PrivateRoute';
import Navigation from './components/Navigation';
import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-b from-ocean-50 to-ocean-100">
          <Navigation />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/onboarding" element={
              <PrivateRoute>
                <Onboarding />
              </PrivateRoute>
            } />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/sessions" element={
              <PrivateRoute>
                <Sessions />
              </PrivateRoute>
            } />
            <Route path="/my-registrations" element={
              <PrivateRoute>
                <MyRegistrations />
              </PrivateRoute>
            } />
            <Route path="/messages" element={
              <PrivateRoute>
                <Messages />
              </PrivateRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <ChatWidget />
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;