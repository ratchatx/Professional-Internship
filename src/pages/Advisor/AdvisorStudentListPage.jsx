import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Admin/Dashboard/AdminDashboardPage.css'; // Reuse styles
import '../Admin/Dashboard/StudentListPage.css';

const AdvisorStudentListPage = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [myRequests, setMyRequests] = useState([]);
    const [advisorDept, setAdvisorDept] = useState('');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }

        const user = JSON.parse(userStr);
        if (user.role !== 'advisor') {
            navigate('/dashboard');
            return;
        }

        const myDept = user.department || user.major || 'วิศวกรรมคอมพิวเตอร์'; 
        setAdvisorDept(myDept);

        const allRequests = JSON.parse(localStorage.getItem('requests') || '[]');
        const filteredRequests = allRequests.filter(req => {
            return req.department === myDept;
        });

        setMyRequests(filteredRequests);

    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const getStatusBadge = (status) => {
        const statusStyles = {
          'รออาจารย์ที่ปรึกษาอนุมัติ': { bg: '#fff3cd', color: '#856404' },
          'รอผู้ดูแลระบบตรวจสอบ': { bg: '#c3dafe', color: '#434190' },
          'รอสถานประกอบการตอบรับ': { bg: '#e2e8f0', color: '#2d3748' },
          'อนุมัติแล้ว': { bg: '#d4edda', color: '#155724' },
          'ไม่อนุมัติ (อาจารย์)': { bg: '#f8d7da', color: '#721c24' },
          'ปฏิเสธ': { bg: '#f8d7da', color: '#721c24' }
        };
        const style = statusStyles[status] || { bg: '#e2e3e5', color: '#383d41' };
        
        return (
          <span className="status-badge" style={{ backgroundColor: style.bg, color: style.color }}>
            {status}
          </span>
        );
    };

    return (
        <div className="admin-dashboard-container">
            <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
            <div className={`sidebar-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}></div>
            <aside className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                        <h2>👨‍🏫 อาจารย์ที่ปรึกษา</h2>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/advisor-dashboard" className="nav-item">
                        <span className="nav-icon">🏠</span>
                        <span>หน้าหลัก</span>
                    </Link>
                    <Link to="/advisor-dashboard/students" className="nav-item active">
                        <span className="nav-icon">🎓</span>
                        <span>รายชื่อนักศึกษาฝึกงาน</span>
                    </Link>
                    <Link to="/advisor-dashboard/supervision" className="nav-item">
                        <span className="nav-icon">🚗</span>
                        <span>ตารางนิเทศงาน</span>
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
                        <h1>คำร้องนักศึกษาในที่ปรึกษา</h1>
                        <p>สาขาวิชา: {advisorDept}</p>
                    </div>
                </header>

                <div className="content-section">
                    <div className="section-header">
                        <h2>รายการคำร้องทั้งหมด ({myRequests.length})</h2>
                    </div>

                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>รหัสนักศึกษา</th>
                                    <th>ชื่อ-นามสกุล</th>
                                    <th>สถานประกอบการ</th>
                                    <th>วันที่ส่ง</th>
                                    <th>สถานะ</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {myRequests.length > 0 ? (
                                    myRequests.map((req, index) => (
                                        <tr key={req.id || index}>
                                            <td data-label="รหัสนักศึกษา">{req.studentId}</td>
                                            <td data-label="ชื่อ-นามสกุล">{req.studentName}</td>
                                            <td data-label="สถานประกอบการ">{req.company}</td>
                                            <td data-label="วันที่ส่ง">{new Date(req.submittedDate).toLocaleDateString('th-TH')}</td>
                                            <td data-label="สถานะ">{getStatusBadge(req.status)}</td>
                                            <td data-label="การจัดการ">
                                                <Link to={`/dashboard/request/${req.id}`} className="view-btn">
                                                    ตรวจสอบ
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                                            ไม่พบคำร้องจากนักศึกษาในสาขานี้
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdvisorStudentListPage;
