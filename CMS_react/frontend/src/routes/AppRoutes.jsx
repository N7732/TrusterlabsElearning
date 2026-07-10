import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import Navbar from '../Components/common/Navbar';
import Footer from '../Components/common/Footer';

// Public Pages (to be created)
import Home from '../pages/public/Home';
import AuthPage from '../pages/auth/AuthPage';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import CourseCatalog from '../pages/public/CourseCatalog';
import CoursePlayer from '../pages/public/CoursePlayer';
import CourseTraining from '../pages/public/CourseTraining';
import Admission from '../pages/public/Admission';
import MemberPortal from '../pages/public/MemberPortal';
import LearnerDashboard from '../pages/learner/LearnerDashboard';
import Profile from '../pages/public/Profile';
import AboutUs from '../pages/public/AboutUs';
import Membership from '../pages/public/Membership';
import ResearchArticles from '../pages/public/ResearchArticles';
import ResearchWebinars from '../pages/public/ResearchWebinars';
import Academics from '../pages/public/Academics';

// SuperAdmin Pages
import SuperAdminLayout from '../layouts/SuperAdminLayout';
import SuperAdminDashboard from '../pages/superadmin/SuperAdminDashboard';
import SuperAdminEntityList from '../pages/superadmin/SuperAdminEntityList';
import SuperAdminEntityForm from '../pages/superadmin/SuperAdminEntityForm';

// Instructor Pages
import InstructorLayout from '../layouts/InstructorLayout';
import InstructorDashboard from '../pages/instructor/InstructorDashboard';

const AppRoutes = () => {
  const location = useLocation();
  const isAdminLayout = location.pathname.startsWith('/superadmin') || location.pathname.startsWith('/instructor');

  return (
    <>
      {!isAdminLayout && <Navbar />}
      <main className={!isAdminLayout ? "flex-grow" : ""}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
          <Route path="/courses" element={<CourseCatalog />} />
          <Route path="/training" element={<CourseTraining />} />
          <Route path="/admission" element={<Admission />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/member-portal" element={<MemberPortal />} />
          <Route path="/research/articles" element={<ResearchArticles />} />
          <Route path="/research/webinars" element={<ResearchWebinars />} />
          <Route path="/academics" element={<Academics />} />
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
            <Route path="/instructor" element={<InstructorLayout />}>
              <Route index element={<InstructorDashboard />} />
              <Route path="entity/:entityId" element={<SuperAdminEntityList />} />
              <Route path="entity/:entityId/:id" element={<SuperAdminEntityForm />} />
            </Route>
          </Route>
        </Routes>
      </main>
      {!isAdminLayout && <Footer />}
    </>
  );
};

export default AppRoutes;
