import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { filterRequestsForCompanyUser, getCompanyDisplayName } from '../../utils/companyRequestFilter';
import '../Admin/Dashboard/AdminDashboardPage.css'; // Reuse Admin styles
import '../Admin/Dashboard/StudentListPage.css'; // Reuse Student List styles

const CompanyStudentListPage = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [sortBy, setSortBy] = useState('studentId');
  const [sortDir, setSortDir] = useState('asc');

  const loadCompanyStudents = (user) => {
    const storedRequests = JSON.parse(localStorage.getItem('requests') || '[]');
    const companyRequests = filterRequestsForCompanyUser(storedRequests, user);
    setStudents(companyRequests);
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role !== 'company') {
         navigate('/login'); 
         return;
      }
      setCompanyName(getCompanyDisplayName(user));
      loadCompanyStudents(user);

      const refreshStudents = () => {
        const latestUserStr = localStorage.getItem('user');
        if (!latestUserStr) return;
        const latestUser = JSON.parse(latestUserStr);
        if (latestUser.role !== 'company') return;
        loadCompanyStudents(latestUser);
      };

      const handleVisibility = () => {
        if (document.visibilityState === 'visible') {
          refreshStudents();
        }
      };

      window.addEventListener('focus', refreshStudents);
      window.addEventListener('storage', refreshStudents);
      document.addEventListener('visibilitychange', handleVisibility);

      return () => {
        window.removeEventListener('focus', refreshStudents);
        window.removeEventListener('storage', refreshStudents);
        document.removeEventListener('visibilitychange', handleVisibility);
      };

    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'รอสถานประกอบการตอบรับ': { bg: '#fff3cd', color: '#856404' },
      'อนุมัติแล้ว': { bg: '#d4edda', color: '#155724' },
      'ปฏิเสธ': { bg: '#f8d7da', color: '#721c24' },
      'ออกฝึกงาน': { bg: '#c3dafe', color: '#434190' },
      'ฝึกงานเสร็จแล้ว': { bg: '#fed7e2', color: '#702459' }
    };
    const style = statusStyles[status] || { bg: '#e2e3e5', color: '#383d41' };
    
    return (
      <span className="status-badge" style={{ backgroundColor: style.bg, color: style.color }}>
        {status}
      </span>
    );
  };

  const toggleSort = (key) => {
    if (sortBy === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
  };

  const sortedStudents = [...students].sort((a, b) => {
    const va = (a?.[sortBy] ?? '').toString();
    const vb = (b?.[sortBy] ?? '').toString();
    if (!isNaN(Number(va)) && !isNaN(Number(vb))) {
      return sortDir === 'asc' ? Number(va) - Number(vb) : Number(vb) - Number(va);
    }
    return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
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
          <h2>สถานประกอบการ</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/company-dashboard" className="nav-item">
            <span>หน้าหลัก</span>
          </Link>
          <Link to="/company-dashboard/interns" className="nav-item active">
            <span>รายชื่อนักศึกษาฝึกงาน</span>
          </Link>
          <Link to="/company-dashboard/profile" className="nav-item">
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
             <h1>รายชื่อนักศึกษาฝึกงาน</h1>
             <p>{companyName}</p>
          </div>
        </header>

        <div className="content-card">
          <Paper elevation={0} style={{background: 'linear-gradient(90deg, #f6d36510 0%, #fda08510 100%)', borderRadius: 10, padding: '0.5rem', boxShadow: 'none', border: 'none'}}>
            <TableContainer component={Box} className="compact-table" sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell className="sortable" onClick={() => toggleSort('studentId')}>รหัสนักศึกษา {sortBy === 'studentId' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</TableCell>
                    <TableCell className="sortable" onClick={() => toggleSort('studentName')}>ชื่อ-นามสกุล {sortBy === 'studentName' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</TableCell>
                    <TableCell className="sortable" onClick={() => toggleSort('studentMajor')}>สาขาวิชา {sortBy === 'studentMajor' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</TableCell>
                    <TableCell className="sortable" onClick={() => toggleSort('position')}>ตำแหน่ง {sortBy === 'position' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</TableCell>
                    <TableCell>ช่วงเวลาฝึกงาน</TableCell>
                    <TableCell className="sortable" onClick={() => toggleSort('status')}>สถานะ {sortBy === 'status' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</TableCell>
                    <TableCell>การจัดการ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedStudents.length > 0 ? (
                    sortedStudents.map((req, index) => (
                      <TableRow key={req.id || index} hover>
                        <TableCell>{req.studentId}</TableCell>
                        <TableCell>
                          <div className="user-info">
                            <div className="user-details">
                              <span className="user-name">{req.studentName}</span>
                              <span className="user-email">{req.studentEmail}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{req.studentMajor}</TableCell>
                        <TableCell>{req.position}</TableCell>
                        <TableCell>{req.startDate} - {req.endDate}</TableCell>
                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                        <TableCell>
                          <Link to={`/dashboard/request/${req.id}`} className="view-btn">
                            ดูรายละเอียด
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">ไม่พบข้อมูลนักศึกษาฝึกงาน</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </div>
      </main>
    </div>
  );
};

export default CompanyStudentListPage;
