import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import asyncStorage from '../../utils/asyncStorage';
import './AdminPaymentCheckPage.css';

const AdminPaymentCheckPage = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    
    useEffect(() => {
        const checkAdmin = async () => {
            const userStr = localStorage.getItem('user');
             if (userStr) {
                  const user = JSON.parse(userStr);
                  if (user.role !== 'admin') {
                     navigate('/dashboard'); 
                     return;
                  }
            } else {
                navigate('/login');
                return; 
            }

            // In a real app, you would fetch from API. 
            // For now, let's load from localStorage where PaymentProofPage.jsx might have saved data,
            // or we can simulate some data if none exists
            const storedPayments = JSON.parse(localStorage.getItem('payment_proofs') || '[]');
            
            // Mock data if empty for demonstration
            if (storedPayments.length === 0) {
                 const mockPayments = [
                     { id: 1, studentId: '65000001', studentName: 'สมชาย ใจดี', date: '2023-10-25', status: 'pending', slipUrl: 'https://via.placeholder.com/150' },
                     { id: 2, studentId: '65000002', studentName: 'สมหญิง รักเรียน', date: '2023-10-26', status: 'approved', slipUrl: 'https://via.placeholder.com/150' }
                 ];
                 setPayments(mockPayments);
            } else {
                 setPayments(storedPayments);
            }

        };
        checkAdmin();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleApprove = (id) => {
        const updated = payments.map(p => p.id === id ? { ...p, status: 'approved' } : p);
        setPayments(updated);
        // localStorage.setItem('payment_proofs', JSON.stringify(updated));
        alert('อนุมัติการชำระเงินเรียบร้อย');
    };

    const handleReject = (id) => {
        const updated = payments.map(p => p.id === id ? { ...p, status: 'rejected' } : p);
        setPayments(updated);
        // localStorage.setItem('payment_proofs', JSON.stringify(updated));
         alert('ปฏิเสธการชำระเงินเรียบร้อย');
    };
    
    return (
        <div className="admin-dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>👨‍💼 ผู้ดูแลระบบ</h2>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/admin-dashboard" className="nav-item">
                        <span className="nav-icon">🏠</span>
                        <span>หน้าหลัก</span>
                    </Link>
                    <Link to="/admin-dashboard/students" className="nav-item">
                        <span className="nav-icon">👥</span>
                        <span>นักศึกษา</span>
                    </Link>
                    <Link to="/admin-dashboard/reports" className="nav-item">
                        <span className="nav-icon">📊</span>
                        <span>รายงาน</span>
                    </Link>
                     <Link to="/admin-dashboard/payments" className="nav-item active">
                        <span className="nav-icon">💰</span>
                        <span>ตรวจสอบการชำระเงิน</span>
                    </Link>
                </nav>
                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        <span>← ออกจากระบบ</span>
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                 <header className="admin-header">
                    <div>
                        <h1>ตรวจสอบหลักฐานการชำระเงิน</h1>
                        <p>รายการแจ้งชำระค่าธรรมเนียมฝึกงานของนักศึกษา</p>
                    </div>
                 </header>

                 <div className="content-section">
                    <div className="requests-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>รหัสนักศึกษา</th>
                                    <th>ชื่อ-นามสกุล</th>
                                    <th>วันที่ส่ง</th>
                                    <th>หลักฐาน</th>
                                    <th>สถานะ</th>
                                    <th>จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((payment) => (
                                    <tr key={payment.id}>
                                        <td>{payment.studentId}</td>
                                        <td>{payment.studentName}</td>
                                        <td>{payment.date}</td>
                                        <td>
                                            <a href={payment.slipUrl} target="_blank" rel="noopener noreferrer" style={{color: '#667eea', textDecoration: 'underline'}}>
                                                ดูสลิป
                                            </a>
                                        </td>
                                        <td>
                                            {payment.status === 'pending' && <span className="status-badge" style={{background: '#fff3cd', color: '#856404'}}>รอตรวจสอบ</span>}
                                            {payment.status === 'approved' && <span className="status-badge" style={{background: '#d4edda', color: '#155724'}}>อนุมัติแล้ว</span>}
                                            {payment.status === 'rejected' && <span className="status-badge" style={{background: '#f8d7da', color: '#721c24'}}>ไม่อนุมัติ</span>}
                                        </td>
                                        <td>
                                            {payment.status === 'pending' && (
                                                <div className="action-buttons">
                                                    <button className="btn-approve" onClick={() => handleApprove(payment.id)}>✓</button>
                                                    <button className="btn-reject" onClick={() => handleReject(payment.id)}>✗</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {payments.length === 0 && (
                                    <tr><td colSpan="6" style={{textAlign: 'center'}}>ไม่พบรายการแจ้งชำระเงิน</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                 </div>
            </main>
        </div>
    );
};

export default AdminPaymentCheckPage;
