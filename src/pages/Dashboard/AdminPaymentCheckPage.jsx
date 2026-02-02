import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import asyncStorage from '../../utils/asyncStorage';
import './AdminPaymentCheckPage.css';

const AdminPaymentCheckPage = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
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

            // Load users to get department info
            const usersJson = await asyncStorage.getItem('users');
            const users = usersJson ? JSON.parse(usersJson) : [];
            const getDept = (id) => {
                const u = users.find(u => u.studentId === id || u.student_code === id || u.username === id);
                return u ? (u.department || u.major) : 'N/A';
            };

            // In a real app, you would fetch from API. 
            // For now, let's load from localStorage where PaymentProofPage.jsx might have saved data,
            // or we can simulate some data if none exists
            const storedPayments = JSON.parse(localStorage.getItem('payment_proofs') || '[]');
            
            let paymentData = [];
            // Mock data if empty for demonstration
            if (storedPayments.length === 0) {
                 const mockPayments = [
                     { id: 1, studentId: '65000001', studentName: 'สมชาย ใจดี', date: '2023-10-25', status: 'pending', slipUrl: 'https://via.placeholder.com/150', department: 'วิศวกรรมคอมพิวเตอร์' },
                     { id: 2, studentId: '65000002', studentName: 'สมหญิง รักเรียน', date: '2023-10-26', status: 'approved', slipUrl: 'https://via.placeholder.com/150', department: 'วิศวกรรมไฟฟ้า' }
                 ];
                 paymentData = mockPayments;
            } else {
                 paymentData = storedPayments.map(p => ({
                     ...p,
                     department: p.department || getDept(p.studentId) || 'ไม่ระบุ'
                 }));
            }
            setPayments(paymentData);

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
    
    // Get unique departments
    const departments = [...new Set(payments.map(p => p.department).filter(Boolean))];

    const filteredPayments = payments.filter(p => {
        if (selectedDepartment === 'all') return true;
        return p.department === selectedDepartment;
    });

    return (
        <div className="admin-dashboard-container">
            <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
            <div className={`sidebar-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}></div>
            <aside className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
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
                    <Link to="/admin-dashboard/users" className="nav-item">
                        <span className="nav-icon">⚙️</span>
                        <span>จัดการผู้ใช้</span>
                    </Link>
                    <Link to="/admin-dashboard/payments" className="nav-item active">
                        <span className="nav-icon">💰</span>
                        <span>ตรวจสอบการชำระเงิน</span>
                    </Link>
                    <Link to="/admin-dashboard/reports" className="nav-item">
                        <span className="nav-icon">📊</span>
                        <span>รายงาน</span>
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
                        <h1>ตรวจสอบการชำระเงิน</h1>
                        <p>จัดการหลักฐานการชำระเงินจากนักศึกษา</p>
                    </div>
                    <Link to="/" className="home-link">หน้าแรก</Link>
                </header>

                <div className="content-section">
                    <div className="requests-table">
                        <div className="filter-group" style={{display: 'flex', gap: 10, alignItems: 'center'}}>
                        <label>คัดกรองสาขา:</label>
                        <select 
                            value={selectedDepartment} 
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            style={{padding: '5px 10px', borderRadius: '4px', border: '1px solid #ddd'}}
                        >
                            <option value="all">ทั้งหมด</option>
                            {departments.map((dept, idx) => (
                                <option key={idx} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div><br/>
                        <table>
                            <thead>
                                <tr>
                                    <th>รหัสนักศึกษา</th>
                                    <th>ชื่อ-นามสกุล</th>
                                    <th>สาขา</th>
                                    <th>วันที่ส่ง</th>
                                    <th>หลักฐาน</th>
                                    <th>สถานะ</th>
                                    <th>จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments.map((payment) => (
                                    <tr key={payment.id}>
                                        <td>{payment.studentId}</td>
                                        <td>{payment.studentName}</td>
                                        <td>{payment.department}</td>
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
                                {filteredPayments.length === 0 && (
                                    <tr><td colSpan="7" style={{textAlign: 'center'}}>ไม่พบรายการแจ้งชำระเงิน</td></tr>
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
