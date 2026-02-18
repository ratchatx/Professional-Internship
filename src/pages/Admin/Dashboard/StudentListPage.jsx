import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import asyncStorage from '../../../utils/asyncStorage';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, MenuItem } from '@mui/material';
import './AdminDashboardPage.css'; // Reusing admin styles for sidebar
import './StudentListPage.css';

const StudentListPage = () => {
  const navigate = useNavigate();
  const departmentOptions = [
    'สาขาวิชาวิทยาการคอมพิวเตอร์',
    'สาขาวิชาเทคโนโลยีคอมพิวเตอร์และดิจิทัล',
    'สาขาวิชาสาธารณสุขชุมชน',
    'สาขาวิชาวิทยาศาสตร์การกีฬา',
    'สาขาวิชาเทคโนโลยีการเกษตร',
    'สาขาวิชาเทคโนโลยีและนวัตกรรมอาหาร',
    'สาขาวิชาอาชีวอนามัยและความปลอดภัย',
    'สาขาวิชาวิศวกรรมซอฟต์แวร์',
    'สาขาวิชาวิศวกรรมโลจิสติกส์',
    'สาขาวิศวกรรมการจัดการอุตสาหกรรมและสิ่งแวดล้อม',
    'สาขาวิชาการออกแบบผลิตภัณฑ์และนวัตกรรมวัสดุ',
    'สาขาวิชาเทคโนโลยีโยธาและสถาปัตยกรรม'
  ];
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('all');

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
    navigate('/');
  };

  const filteredStudents = students.filter((student) => {
    if (selectedDepartment === 'all') return true;
    const dept = student.major || student.department || '';
    return dept === selectedDepartment;
  });

  return (
    <div className="admin-dashboard-container">
      <div className="mobile-top-navbar">
        <Link to="/" className="mobile-top-logo" aria-label="LASC Home"></Link>
        <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
      </div>
      <div className={`sidebar-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}></div>
      <aside className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2> ผู้ดูแลระบบ</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin-dashboard" className="nav-item">
            <span>หน้าหลัก</span>
          </Link>
          <Link to="/admin-dashboard/students" className="nav-item active">
            <span>นักศึกษา</span>
          </Link>
          <Link to="/admin-dashboard/users" className="nav-item">
            <span>จัดการผู้ใช้</span>
          </Link>
          <Link to="/admin-dashboard/payments" className="nav-item">
            <span>ตรวจสอบการชำระเงิน</span>
          </Link>
          <Link to="/admin-dashboard/checkins" className="nav-item">
            <span>เช็คชื่อรายวัน</span>
          </Link>
          <Link to="/admin-dashboard/reports" className="nav-item">
            <span>รายงาน</span>
          </Link>
          <Link to="/admin-dashboard/profile" className="nav-item">
            <span>โปรไฟล์</span>
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
        </header>

        <div className="content-section">
          <div className="section-header">
            <h2>นักศึกษาทั้งหมด ({filteredStudents.length})</h2>
          </div>

          <div className="filter-group" style={{display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16}}>
            <TextField
              select
              size="small"
              label="คัดกรองสาขา"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              sx={{ minWidth: 280 }}
            >
              <MenuItem value="all">ทั้งหมด</MenuItem>
              {departmentOptions.map((dept) => (
                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
              ))}
            </TextField>
          </div>

          <TableContainer component={Box} className="compact-table"> {/* Reusing table styles */}
            {loading ? (
                <p>กำลังโหลดข้อมูล...</p>
            ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>รหัสนักศึกษา</TableCell>
                  <TableCell>ชื่อ-นามสกุล</TableCell>
                  <TableCell>สาขา</TableCell>
                  <TableCell>อีเมล</TableCell>
                  <TableCell>เบอร์โทร</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell>การกระทำ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.length > 0 ? filteredStudents.map((student, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{student.student_code}</TableCell>
                      <TableCell>{student.full_name}</TableCell>
                      <TableCell>{student.major || student.department || '-'}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.phone}</TableCell>
                      <TableCell>
                        <span className="status-badge" style={{ background: '#d4edda', color: '#155724' }}>
                          ลงทะเบียนแล้ว
                        </span>
                      </TableCell>
                      <TableCell>
                        <Link to={`/dashboard/student/${student.student_code || student.username}`} className="btn-view" style={{border: '1px solid #ddd', padding: '6px 10px', borderRadius: 6}}>ดูรายละเอียด</Link>
                      </TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 2.5 }}>ไม่พบข้อมูลนักศึกษา</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
            )}
          </TableContainer>
        </div>
      </main>
    </div>
  );
};

export default StudentListPage;
