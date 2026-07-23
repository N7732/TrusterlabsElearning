import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import GlobalLoader from '../components/common/GlobalLoader';

// Public Pages
const Home = lazy(() => import('../pages/public/Home'));
const AuthPage = lazy(() => import('../pages/auth/AuthPage'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'));
const CourseCatalog = lazy(() => import('../pages/public/CourseCatalog'));
const CoursePlayer = lazy(() => import('../pages/public/CoursePlayer'));
const CourseTraining = lazy(() => import('../pages/public/CourseTraining'));
const Admission = lazy(() => import('../pages/public/Admission'));
const MemberPortal = lazy(() => import('../pages/public/MemberPortal'));
const LearnerDashboard = lazy(() => import('../pages/learner/LearnerDashboard'));
const LearnerTrainingDetail = lazy(() => import('../pages/learner/LearnerTrainingDetail'));
const Profile = lazy(() => import('../pages/public/Profile'));
const AboutUs = lazy(() => import('../pages/public/AboutUs'));
const Membership = lazy(() => import('../pages/public/Membership'));
const ResearchArticles = lazy(() => import('../pages/public/ResearchArticles'));
const ResearchWebinars = lazy(() => import('../pages/public/ResearchWebinars'));
const Academics = lazy(() => import('../pages/public/Academics'));
const CertificateView = lazy(() => import('../pages/public/CertificateView'));
const CertificateSearch = lazy(() => import('../pages/public/CertificateSearch'));
const TermsAndConditions = lazy(() => import('../pages/public/TermsAndConditions'));

// SuperAdmin Pages
const SuperAdminLayout = lazy(() => import('../layouts/SuperAdminLayout'));
const SuperAdminDashboard = lazy(() => import('../pages/superadmin/SuperAdminDashboard'));
const SuperAdminEntityList = lazy(() => import('../pages/superadmin/SuperAdminEntityList'));
const SuperAdminEntityForm = lazy(() => import('../pages/superadmin/SuperAdminEntityForm'));
const CertificateOverview = lazy(() => import('../pages/admin/CertificateOverview'));
const OfferCertificates = lazy(() => import('../pages/admin/OfferCertificates'));
const TrainingDashboard = lazy(() => import('../pages/admin/TrainingDashboard'));

// Instructor Pages
const InstructorLayout = lazy(() => import('../layouts/InstructorLayout'));
const InstructorDashboard = lazy(() => import('../pages/instructor/InstructorDashboard'));

const AppRoutes = () => {
  const location = useLocation();
  const isAdminLayout = location.pathname.startsWith('/superadmin') || location.pathname.startsWith('/instructor');

  return (
    <>
      {!isAdminLayout && <Navbar />}
      <main className={!isAdminLayout ? "flex-grow" : ""}>
        <Suspense fallback={<GlobalLoader />}>
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
            <Route path="/verify" element={<CertificateSearch />} />
            <Route path="/verify/:code" element={<CertificateView />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            
            {/* Superadmin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/superadmin" element={<SuperAdminLayout />}>
                <Route index element={<SuperAdminDashboard />} />
                <Route path="dashboard" element={<SuperAdminDashboard />} />
                <Route path="entity/certificates/overview" element={<CertificateOverview />} />
                <Route path="entity/certificates/offer" element={<OfferCertificates />} />
                <Route path="trainings/:id/dashboard" element={<TrainingDashboard />} />
                <Route path="entity/:entityId" element={<SuperAdminEntityList />} />
                <Route path="entity/:entityId/:id" element={<SuperAdminEntityForm />} />
              </Route>
            </Route>

            {/* Learner Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['learner', 'admin']} />}>
              <Route path="/learner/dashboard" element={<LearnerDashboard />} />
              <Route path="/learner/trainings/:id" element={<LearnerTrainingDetail />} />
            </Route>

            {/* User Profile */}
            <Route element={<ProtectedRoute allowedRoles={['learner', 'instructor', 'admin']} />}>
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Instructor Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['instructor', 'admin']} />}>
              <Route path="/instructor" element={<InstructorLayout />}>
                <Route index element={<InstructorDashboard />} />
                <Route path="dashboard" element={<InstructorDashboard />} />
                <Route path="entity/:entityId" element={<SuperAdminEntityList />} />
                <Route path="entity/:entityId/:id" element={<SuperAdminEntityForm />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </main>
      {!isAdminLayout && <Footer />}
    </>
  );
};

export default AppRoutes;
