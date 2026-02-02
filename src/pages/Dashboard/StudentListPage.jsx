import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import asyncStorage from '../../utils/asyncStorage';
import './AdminDashboardPage.css'; // Reusing admin styles for sidebar
import './StudentListPage.css';

const StudentListPage = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      // Check admin role
      const userStr = localStorage.getItem('user'); // Or asyncStorage
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

      // Load students
      try {
        const usersJson = await asyncStorage.getItem('users');
        const allUsers = usersJson ? JSON.parse(usersJson) : [];
        const studentList = allUsers.filter(u => u.role === 'student');
        
        // Add some mock data if empty for demo purposes
        if (studentList.length === 0) {
            const mockStudents = [
                { student_code: '65000001', full_name: 'สมชาย ใจดี', major: 'วิศวกรรมคอมพิวเตอร์', email: 'somchai@example.com', phone: '081-111-1111' },
                { student_code: '65000002', full_name: 'สมหญิง รักเรียน', major: 'วิศวกรรมไฟฟ้า', email: 'somying@example.com', phone: '082-222-2222' }
            ];
            setStudents(mockStudents);
            // Optionally save them back so they persist
            // await asyncStorage.setItem('users', JSON.stringify(mockStudents.map(s => ({...s, role: 'student'}))));
        } else {
            setStudents(studentList);
        }
      } catch (error) {
        console.error("Failed to load students", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAdmin();
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
          <h2>👨‍💼 ผู้ดูแลระบบ</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin-dashboard" className="nav-item">
            <span className="nav-icon">🏠</span>
            <span>หน้าหลัก</span>
          </Link>
          <Link to="/admin-dashboard/students" className="nav-item active">
            <span className="nav-icon">👥</span>
            <span>นักศึกษา</span>
          </Link>
          <Link to="/admin-dashboard/users" className="nav-item">
            <span className="nav-icon">⚙️</span>
            <span>จัดการผู้ใช้</span>
          </Link>
          <Link to="/admin-dashboard/payments" className="nav-item">
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
            <h1>รายชื่อนักศึกษา</h1>
            <p>จัดการข้อมูลนักศึกษาในระบบ</p>
          </div>
          <Link to="/" className="home-link">
            หน้าแรก
          </Link>
        </header>

        <div className="content-section">
          <div className="section-header">
            <h2>นักศึกษาทั้งหมด ({students.length})</h2>
          </div>

          <div className="requests-table"> {/* Reusing table styles */}
            {loading ? (
                <p>กำลังโหลดข้อมูล...</p>
            ) : (
            <table>
              <thead>
                <tr>
                  <th>รหัสนักศึกษา</th>
                  <th>ชื่อ-นามสกุล</th>
                  <th>สาขา</th>
                  <th>อีเมล</th>
                  <th>เบอร์โทร</th>
                  <th>สถานะ</th>
                  <th>การกระทำ</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? students.map((student, index) => (
                    <tr key={index}>
                      <td>{student.student_code}</td>
                      <td>{student.full_name}</td>
                      <td>{student.major}</td>
                      <td>{student.email}</td>
                      <td>{student.phone}</td>
                      <td>
                        <span className="status-badge" style={{ background: '#d4edda', color: '#155724' }}>
                          ลงทะเบียนแล้ว
                        </span>
                      </td>
                      <td>
                        <Link to={`/dashboard/student/${student.student_code || student.username}`} className="btn-view" style={{border: '1px solid #ddd', padding: '6px 10px', borderRadius: 6}}>ดูรายละเอียด</Link>
                      </td>
                    </tr>
                )) : (
                    <tr>
                        <td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>ไม่พบข้อมูลนักศึกษา</td>
                    </tr>
                )}
              </tbody>
            </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentListPage;
