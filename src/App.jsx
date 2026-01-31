import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ProfilePage from './pages/Dashboard/ProfilePage';
import MyRequestsPage from './pages/Dashboard/MyRequestsPage';
import AdvisorDashboardPage from './pages/Dashboard/AdvisorDashboardPage';
import CompanyDashboardPage from './pages/Dashboard/CompanyDashboardPage';
import NewRequestPage from './pages/NewRequestPage';
import AdminDashboardPage from './pages/Dashboard/AdminDashboardPage';
import StudentListPage from './pages/Dashboard/StudentListPage';
import PaymentProofPage from './pages/Dashboard/PaymentProofPage';
import AdminPaymentCheckPage from './pages/Dashboard/AdminPaymentCheckPage';
import RequestDetailsPage from './pages/Dashboard/RequestDetailsPage';
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
        <Route path="/dashboard/payment-proof" element={<PaymentProofPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin-dashboard/students" element={<StudentListPage />} />
        <Route path="/admin-dashboard/payments" element={<AdminPaymentCheckPage />} />
        <Route path="/advisor-dashboard" element={<AdvisorDashboardPage />} />
        <Route path="/company-dashboard" element={<CompanyDashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;
