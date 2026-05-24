import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import JobListingPage from './pages/JobListingPage';
import JobDetailPage from './pages/JobDetailPage';
import ApplicationPage from './pages/ApplicationPage';
import LoginPage from './pages/admin/LoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import ManageJobsPage from './pages/admin/ManageJobsPage';
import ApplicationsPage from './pages/admin/ApplicationsPage';
import ManageStaffPage from './pages/admin/ManageStaffPage';
import ActivityLogPage from './pages/admin/ActivityLogPage';
import EmailSettingsPage from './pages/admin/EmailSettingsPage';
import EmailTemplatesPage from './pages/admin/EmailTemplatesPage';
import ProfilePage from './pages/admin/ProfilePage';
import { useLocation } from 'react-router-dom';

function AppContent() {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');

    return (
        <>
            {!isAdmin && <Navbar />}
            <Routes>
                {/* Candidate-facing routes */}
                <Route path="/" element={<JobListingPage />} />
                <Route path="/jobs/:slug" element={<JobDetailPage />} />
                <Route path="/jobs/:slug/apply" element={<ApplicationPage />} />

                {/* Admin login (public) */}
                <Route path="/admin/login" element={<LoginPage />} />

                {/* Admin routes (protected) */}
                <Route path="/admin" element={
                    <ProtectedRoute>
                        <AdminLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<DashboardPage />} />
                    <Route path="jobs" element={<ManageJobsPage />} />
                    <Route path="applications" element={<ApplicationsPage />} />
                    <Route path="staff" element={<ManageStaffPage />} />
                    <Route path="activity" element={<ActivityLogPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="email-settings" element={<EmailSettingsPage />} />
                    <Route path="email-templates" element={<EmailTemplatesPage />} />
                </Route>
            </Routes>
            {!isAdmin && <Footer />}
        </>
    );
}

export default function App() {
    return <AppContent />;
}
