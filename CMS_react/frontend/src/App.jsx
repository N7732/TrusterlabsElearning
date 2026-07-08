import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEntityList from './pages/admin/AdminEntityList';
import AdminEntityForm from './pages/admin/AdminEntityForm';
import AdminAddInstructor from './pages/admin/AdminAddInstructor';
import AdminEnrollments from './pages/admin/AdminEnrollments';
import TrainingDashboard from './pages/admin/TrainingDashboard';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="instructors/new" element={<AdminAddInstructor />} />
              <Route path="enrollments" element={<AdminEnrollments />} />
              <Route path="trainings/:id/dashboard" element={<TrainingDashboard />} />
              <Route path=":entity" element={<AdminEntityList />} />
              <Route path=":entity/:id" element={<AdminEntityForm />} />
            </Route>
            
            {/* Main App Routes */}
            <Route path="/*" element={<AppRoutes />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
