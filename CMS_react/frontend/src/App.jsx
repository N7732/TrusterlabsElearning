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
import AdminCustomRequests from './pages/admin/AdminCustomRequests';
import CertificateOverview from './pages/admin/CertificateOverview';
import OfferCertificates from './pages/admin/OfferCertificates';
import ErrorBoundary from './components/ErrorBoundary';
import NetworkStatusIndicator from './components/common/NetworkStatusIndicator';

import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = "415417120310-3414hcps3a9h5kbm4ja682rai9lr2a7h.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ErrorBoundary>
        <BrowserRouter>
          <NetworkStatusIndicator />
          <AuthProvider>
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="instructors/new" element={<AdminAddInstructor />} />
              <Route path="enrollments" element={<AdminEnrollments />} />
              <Route path="trainings/:id/dashboard" element={<TrainingDashboard />} />
              <Route path="custom-training-requests" element={<AdminCustomRequests />} />
              <Route path="certificates/overview" element={<CertificateOverview />} />
              <Route path="certificates/offer" element={<OfferCertificates />} />
              <Route path=":entity" element={<AdminEntityList />} />
              <Route path=":entity/:id" element={<AdminEntityForm />} />
            </Route>
            
            {/* Main App Routes */}
            <Route path="/*" element={<AppRoutes />} />
          </Routes>
        </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </GoogleOAuthProvider>
  );
}

export default App;
