import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/Student/Dashboard/DashboardPage';
import ProfilePage from './pages/Student/Dashboard/ProfilePage';
import MyRequestsPage from './pages/Student/Dashboard/MyRequestsPage';
import AdvisorDashboardPage from './pages/Advisor/AdvisorDashboardPage';
import CompanyDashboardPage from './pages/Company/CompanyDashboardPage';
import CompanyProfilePage from './pages/Company/CompanyProfilePage';
import NewRequestPage from './pages/Student/NewRequestPage';
import AdminDashboardPage from './pages/Admin/Dashboard/AdminDashboardPage';
import StudentListPage from './pages/Admin/Dashboard/StudentListPage';
import PaymentProofPage from './pages/Student/Dashboard/PaymentProofPage';
import AdminPaymentCheckPage from './pages/Admin/Dashboard/AdminPaymentCheckPage';
import AdminReportsPage from './pages/Admin/Dashboard/AdminReportsPage';
import AdminUserManagementPage from './pages/Admin/Dashboard/AdminUserManagementPage';
import AdminProfilePage from './pages/Admin/Dashboard/AdminProfilePage';
import AdvisorStudentListPage from './pages/Advisor/AdvisorStudentListPage';
import AdvisorSupervisionPage from './pages/Advisor/AdvisorSupervisionPage';
import AdvisorProgressCheckPage from './pages/Advisor/AdvisorProgressCheckPage';
import CompanyStudentListPage from './pages/Company/CompanyStudentListPage';
import RequestDetailsPage from './pages/Admin/Shared/RequestDetailsPage';
import StudentDetailsPage from './pages/Admin/Shared/StudentDetailsPage';
import StudentCheckInPage from './pages/Student/Dashboard/StudentCheckInPage';
import AdminCheckInPage from './pages/Admin/Dashboard/AdminCheckInPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/profile" element={<ProfilePage />} />
        <Route path="/dashboard/new-request" element={<NewRequestPage />} />
        <Route path="/dashboard/my-requests" element={<MyRequestsPage />} />
        <Route path="/dashboard/request/:id" element={<RequestDetailsPage />} />
        <Route path="/dashboard/student/:id" element={<StudentDetailsPage />} />
        <Route path="/dashboard/payment-proof" element={<PaymentProofPage />} />
        <Route path="/dashboard/check-in" element={<StudentCheckInPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin-dashboard/students" element={<StudentListPage />} />
        <Route path="/admin-dashboard/users" element={<AdminUserManagementPage />} />
        <Route path="/admin-dashboard/payments" element={<AdminPaymentCheckPage />} />
        <Route path="/admin-dashboard/checkins" element={<AdminCheckInPage />} />
        <Route path="/admin-dashboard/reports" element={<AdminReportsPage />} />
        <Route path="/admin-dashboard/profile" element={<AdminProfilePage />} />
        <Route path="/advisor-dashboard" element={<AdvisorDashboardPage />} />
        <Route path="/advisor-dashboard/students" element={<AdvisorStudentListPage />} />
        <Route path="/advisor-dashboard/supervision" element={<AdvisorSupervisionPage />} />
        <Route path="/advisor-dashboard/progress" element={<AdvisorProgressCheckPage />} />
        <Route path="/company-dashboard" element={<CompanyDashboardPage />} />
        <Route path="/company-dashboard/interns" element={<CompanyStudentListPage />} />
        <Route path="/company-dashboard/profile" element={<CompanyProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;
