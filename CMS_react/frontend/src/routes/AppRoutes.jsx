import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import Navbar from '../Components/common/Navbar';

// Public Pages (to be created)
import Home from '../pages/public/Home';
import Login from '../pages/auth/Login';
import RegisterLearner from '../pages/auth/RegisterLearner';
import CourseCatalog from '../pages/public/CourseCatalog';
import CoursePlayer from '../pages/public/CoursePlayer';
import LearnerDashboard from '../pages/learner/LearnerDashboard';
import Profile from '../pages/public/Profile';

// SuperAdmin Pages
import SuperAdminLayout from '../layouts/SuperAdminLayout';
import SuperAdminDashboard from '../pages/superadmin/SuperAdminDashboard';
import SuperAdminEntityList from '../pages/superadmin/SuperAdminEntityList';
import SuperAdminEntityForm from '../pages/superadmin/SuperAdminEntityForm';

const AppRoutes = () => {
  const location = useLocation();
  const isSuperAdmin = location.pathname.startsWith('/superadmin');

  return (
    <>
      {!isSuperAdmin && <Navbar />}
      <main className={!isSuperAdmin ? "flex-grow" : ""}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterLearner />} />
          <Route path="/courses" element={<CourseCatalog />} />
          <Route path="/course/:courseId" element={<CoursePlayer />} />
          
          {/* Superadmin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/superadmin" element={<SuperAdminLayout />}>
              <Route index element={<SuperAdminDashboard />} />
              <Route path="entity/:entityId" element={<SuperAdminEntityList />} />
              <Route path="entity/:entityId/:id" element={<SuperAdminEntityForm />} />
            </Route>
          </Route>

          {/* Learner Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['learner', 'admin']} />}>
            <Route path="/learner/dashboard" element={<LearnerDashboard />} />
          </Route>

          {/* User Profile */}
          <Route element={<ProtectedRoute allowedRoles={['learner', 'instructor', 'admin']} />}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Instructor Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['instructor', 'admin']} />}>
            {/* <Route path="/instructor/dashboard" element={<InstructorDashboard />} /> */}
          </Route>
        </Routes>
      </main>
    </>
  );
};

export default AppRoutes;
