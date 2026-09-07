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
import ModuleDetails from './pages/ModuleDetails';
import AdminModules from './pages/admin/AdminModules';
import CreateModule from './pages/admin/CreateModule';
import EditModule from './pages/admin/EditModule';
import SectionDetails from './pages/SectionDetails';
import AdminSections from './pages/admin/AdminSections';
import CreateSection from './pages/admin/CreateSection';
import EditSection from './pages/admin/EditSection';
import TopicDetails from './pages/TopicDetails';
import AdminTopics from './pages/admin/AdminTopics';
import CreateTopic from './pages/admin/CreateTopic';
import EditTopic from './pages/admin/EditTopic';
import Notes from './pages/Notes';
import NoteDetails from './pages/NoteDetails';
import AdminNotes from './pages/admin/AdminNotes';
import CreateNote from './pages/admin/CreateNote';
import EditNote from './pages/admin/EditNote';

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
            path="/modules/:slug"
            element={
              <ProtectedRoute>
                <ModuleDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sections/:slug"
            element={
              <ProtectedRoute>
                <SectionDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/topics/:slug"
            element={
              <ProtectedRoute>
                <TopicDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <Notes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes/:slug"
            element={
              <ProtectedRoute>
                <NoteDetails />
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
          <Route
            path="/admin/modules"
            element={
              <AdminRoute>
                <AdminModules />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/modules/create"
            element={
              <AdminRoute>
                <CreateModule />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/modules/:id/edit"
            element={
              <AdminRoute>
                <EditModule />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/sections"
            element={
              <AdminRoute>
                <AdminSections />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/sections/create"
            element={
              <AdminRoute>
                <CreateSection />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/sections/:id/edit"
            element={
              <AdminRoute>
                <EditSection />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/topics"
            element={
              <AdminRoute>
                <AdminTopics />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/topics/create"
            element={
              <AdminRoute>
                <CreateTopic />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/topics/:id/edit"
            element={
              <AdminRoute>
                <EditTopic />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/notes"
            element={
              <AdminRoute>
                <AdminNotes />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/notes/create"
            element={
              <AdminRoute>
                <CreateNote />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/notes/:id/edit"
            element={
              <AdminRoute>
                <EditNote />
              </AdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Learning Hub — Phase 7 Notes</p>
      </footer>
    </div>
  );
}
