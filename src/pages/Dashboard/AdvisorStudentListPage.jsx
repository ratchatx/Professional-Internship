import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminDashboardPage.css'; // Reuse styles
import './StudentListPage.css';

const AdvisorStudentListPage = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [students, setStudents] = useState([]);
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

        // Assuming advisor object has a 'department' field
        const myDept = user.department || 'วิศวกรรมคอมพิวเตอร์'; // Default or from user data
        setAdvisorDept(myDept);

        // Load all users, filter by student role AND matching department
        const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Mock data logic for demo if users are sparse
        let studentList = allUsers.filter(u => u.role === 'student' && u.major === myDept);
        
        // If empty for demo, create some mock students in this major
        if (studentList.length === 0) {
             const mockStudents = [
                { student_code: '65000101', full_name: 'นายรักเรียน เพียรศึกษา', major: myDept, email: 'std1@example.com', phone: '081-111-1234' },
                { student_code: '65000102', full_name: 'นางสาวตั้งใจ เรียนดี', major: myDept, email: 'std2@example.com', phone: '089-999-8888' },
                 // Add one from another major to prove filtering works effectively (in real scenario handled by API)
            ];
            // Filter only matching major
            studentList = mockStudents.filter(s => s.major === myDept);
        }

        setStudents(studentList);

    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
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
                        <h1>รายชื่อนักศึกษาในที่ปรึกษา</h1>
                        <p>สาขาวิชา: {advisorDept}</p>
                    </div>
                </header>

                <div className="content-section">
                    <div className="section-header">
                        <h2>นักศึกษาทั้งหมด ({students.length})</h2>
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>รหัสนักศึกษา</th>
                                    <th>ชื่อ-นามสกุล</th>
                                    <th>สาขาวิชา</th>
                                    <th>อีเมล</th>
                                    <th>เบอร์โทร</th>
                                    <th>การกระทำ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.length > 0 ? (
                                    students.map((student, index) => (
                                        <tr key={index}>
                                            <td>{student.student_code || student.username}</td>
                                            <td>{student.full_name || student.name}</td>
                                            <td>{student.major}</td>
                                            <td>{student.email || '-'}</td>
                                            <td>{student.phone || '-'}</td>
                                            <td>
                                                <Link to={`/dashboard/student/${student.student_code || student.username}`} className="btn-view" style={{border: '1px solid #ddd', padding: '6px 8px', borderRadius: 6}}>ดูรายละเอียด</Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                                            ไม่พบรายชื่อนักศึกษาในสาขานี้
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
