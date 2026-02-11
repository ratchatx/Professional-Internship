import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Admin/Dashboard/AdminDashboardPage.css'; // Reuse Admin styles
import '../Admin/Dashboard/StudentListPage.css'; // Reuse Student List styles

const CompanyStudentListPage = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role !== 'company') {
         navigate('/login'); 
         return;
      }
      setCompanyName(user.name);
      
      // Load requests and filter for this company
      const storedRequests = JSON.parse(localStorage.getItem('requests') || '[]');
      
      // Filter requests for this company
      const companyRequests = storedRequests.filter(req => {
        const reqCompany = req.companyName || req.company || '';
        return reqCompany.includes(user.name);
      });

      setStudents(companyRequests);

    } else {
      navigate('/login');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
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

  return (
    <div className="admin-dashboard-container">
      <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
      <div className={`sidebar-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}></div>
      <aside className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>🏢 สถานประกอบการ</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/company-dashboard" className="nav-item">
            <span className="nav-icon">🏠</span>
            <span>หน้าหลัก</span>
          </Link>
          <Link to="/company-dashboard/interns" className="nav-item active">
            <span className="nav-icon">👥</span>
            <span>รายชื่อนักศึกษาฝึกงาน</span>
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
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>รหัสนักศึกษา</th>
                  <th>ชื่อ-นามสกุล</th>
                  <th>สาขาวิชา</th>
                  <th>ตำแหน่ง</th>
                  <th>ช่วงเวลาฝึกงาน</th>
                  <th>สถานะ</th>
                  <th>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? (
                  students.map((req, index) => (
                    <tr key={req.id || index}>
                      <td data-label="รหัสนักศึกษา">{req.studentId}</td>
                      <td data-label="ชื่อ-นามสกุล">
                        <div className="user-info">
                          <div className="user-details">
                            <span className="user-name">{req.studentName}</span>
                            <span className="user-email">{req.studentEmail}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label="สาขาวิชา">{req.studentMajor}</td>
                      <td data-label="ตำแหน่ง">{req.position}</td>
                      <td data-label="ช่วงเวลาฝึกงาน">{req.startDate} - {req.endDate}</td>
                      <td data-label="สถานะ">{getStatusBadge(req.status)}</td>
                      <td data-label="การจัดการ">
                        <Link to={`/dashboard/request/${req.id}`} className="view-btn">
                          ดูรายละเอียด
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">ไม่พบข้อมูลนักศึกษาฝึกงาน</td>
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

export default CompanyStudentListPage;
