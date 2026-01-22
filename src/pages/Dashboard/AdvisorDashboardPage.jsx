import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminDashboardPage.css'; // Reuse Admin styles

const AdvisorDashboardPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [advisorName, setAdvisorName] = useState('');
  const [allRequests, setAllRequests] = useState([]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role !== 'advisor') {
         navigate('/login'); 
         return;
      }
      setAdvisorName(user.name);
      
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
    { title: 'คำร้องทั้งหมด', value: allRequests.length, icon: '📋', color: '#667eea' },
    { title: 'รออนุมัติ', value: allRequests.filter(r => r.status === 'รออนุมัติ').length, icon: '⏳', color: '#f093fb' },
    { title: 'อนุมัติแล้ว', value: allRequests.filter(r => r.status === 'อนุมัติแล้ว').length, icon: '✅', color: '#43e97b' },
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
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>👨‍🏫 อาจารย์ที่ปรึกษา</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/advisor-dashboard" className="nav-item active">
            <span className="nav-icon">🏠</span>
            <span>หน้าหลัก</span>
          </Link>
          <Link to="/advisor-dashboard/students" className="nav-item">
            <span className="nav-icon">🎓</span>
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
            <h1>สวัสดี, {advisorName}</h1>
            <p>ติดตามสถานะการฝึกงานของนักศึกษา</p>
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
            <h2>รายการคำร้องฝึกงาน</h2>
            <div className="filter-buttons">
              <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>ทั้งหมด</button>
              <button className={`filter-btn ${filter === 'รออนุมัติ' ? 'active' : ''}`} onClick={() => setFilter('รออนุมัติ')}>รออนุมัติ</button>
              <button className={`filter-btn ${filter === 'อนุมัติแล้ว' ? 'active' : ''}`} onClick={() => setFilter('อนุมัติแล้ว')}>อนุมัติแล้ว</button>
            </div>
          </div>

          <div className="requests-table">
            <table>
              <thead>
                <tr>
                  <th>วันที่ยื่น</th>
                  <th>ชื่อนักศึกษา</th>
                  <th>บริษัท</th>
                  <th>ตำแหน่ง</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.submittedDate}</td>
                    <td>{request.studentName}</td>
                    <td>{request.companyName}</td>
                    <td>{request.position}</td>
                    <td>
                      <span className="status-badge" style={getStatusBadge(request.status)}>
                        {request.status}
                      </span>
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

export default AdvisorDashboardPage;
