import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './store/slices/authSlice';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import LearningPaths from './pages/LearningPaths';
import LearningPathDetails from './pages/LearningPathDetails';
import AdminLearningPaths from './pages/admin/AdminLearningPaths';
import CreateLearningPath from './pages/admin/CreateLearningPath';
import EditLearningPath from './pages/admin/EditLearningPath';

export default function App() {
  const dispatch = useDispatch();
  const { accessToken, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // If token exists in storage but user isn't loaded, verify session
    if (accessToken && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [accessToken, user, dispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning-paths"
            element={
              <ProtectedRoute>
                <LearningPaths />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning-paths/:slug"
            element={
              <ProtectedRoute>
                <LearningPathDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/learning-paths"
            element={
              <AdminRoute>
                <AdminLearningPaths />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/learning-paths/create"
            element={
              <AdminRoute>
                <CreateLearningPath />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/learning-paths/:id/edit"
            element={
              <AdminRoute>
                <EditLearningPath />
              </AdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Learning Hub — Phase 3 Learning Paths</p>
      </footer>
    </div>
  );
}
