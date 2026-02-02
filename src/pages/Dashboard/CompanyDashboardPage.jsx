import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminDashboardPage.css'; // Reuse Admin styles

const CompanyDashboardPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [companyName, setCompanyName] = useState('');
  const [allRequests, setAllRequests] = useState([]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role !== 'company') {
         navigate('/login'); 
         return;
      }
      setCompanyName(user.name);
      
      const storedRequests = JSON.parse(localStorage.getItem('requests') || '[]');
      setAllRequests(storedRequests);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const filteredRequests = allRequests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const stats = [
    { title: 'ผู้สมัครทั้งหมด', value: allRequests.length, icon: '👥', color: '#667eea' },
    { title: 'รอการตอบรับ', value: allRequests.filter(r => r.status === 'รออนุมัติ').length, icon: '⏳', color: '#f093fb' },
  ];

  const getStatusBadge = (status) => {
    const statusStyles = {
      'รออนุมัติ': { bg: '#fff3cd', color: '#856404' },
      'อนุมัติแล้ว': { bg: '#d4edda', color: '#155724' },
      'ไม่อนุมัติ': { bg: '#f8d7da', color: '#721c24' },
      'ออกฝึกงาน': { bg: '#c3dafe', color: '#434190' },
      'ฝึกงานเสร็จแล้ว': { bg: '#fed7e2', color: '#702459' }
    };
    return statusStyles[status] || { bg: '#e2e3e5', color: '#383d41' };
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
          <Link to="/company-dashboard" className="nav-item active">
            <span className="nav-icon">🏠</span>
            <span>หน้าหลัก</span>
          </Link>
          <Link to="/company-dashboard/interns" className="nav-item">
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
             <h1>ยินดีต้อนรับ, {companyName}</h1>
             <p>จัดการข้อมูลนักศึกษาฝึกงาน</p>
          </div>
        </header>

        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card" style={{ borderTop: `4px solid ${stat.color}` }}>
              <div className="stat-icon" style={{ background: `${stat.color}20` }}>
                {stat.icon}
              </div>
              <div className="stat-info">
                <p className="stat-title">{stat.title}</p>
                <h3 className="stat-value">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="content-section">
          <div className="section-header">
            <h2>รายชื่อผู้สมัครฝึกงาน</h2>
             <div className="filter-buttons">
              <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>ทั้งหมด</button>
              <button className={`filter-btn ${filter === 'รออนุมัติ' ? 'active' : ''}`} onClick={() => setFilter('รออนุมัติ')}>รอการตอบรับ</button>
            </div>
          </div>

          <div className="requests-table">
            <table>
              <thead>
                <tr>
                  <th>วันที่ยื่น</th>
                  <th>ชื่อนักศึกษา</th>
                  <th>ตำแหน่งงาน</th>
                  <th>สถานะ</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.submittedDate}</td>
                    <td>{request.studentName}</td>
                    <td>{request.position}</td>
                    <td>
                      <span className="status-badge" style={getStatusBadge(request.status)}>
                        {request.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/dashboard/student/${request.studentId || request.studentId}`} className="btn-view" style={{border: '1px solid #ddd', padding: '4px 8px', borderRadius: '4px'}}>ดูรายละเอียด</Link>
                    </td>
                  </tr>
                ))}
                 {filteredRequests.length === 0 && (
                  <tr><td colSpan="5" style={{textAlign: 'center'}}>ไม่พบข้อมูล</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompanyDashboardPage;
