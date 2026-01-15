import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './DashboardPage.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [studentName] = useState('นายสมชาย ใจดี'); // This would come from auth

  const handleLogout = () => {
    console.log('Logging out...');
    navigate('/login');
  };

  // ข้อมูลคำร้องตัวอย่าง (จริงจะมาจาก API)
  const internshipRequests = [
    { 
      id: 1, 
      company: 'บริษัท ABC จำกัด', 
      position: 'โปรแกรมเมอร์', 
      status: 'รออนุมัติ',
      date: '2026-01-05',
      color: '#f093fb'
    },
    { 
      id: 2, 
      company: 'บริษัท XYZ Tech', 
      position: 'Web Developer', 
      status: 'อนุมัติแล้ว',
      date: '2025-12-20',
      color: '#43e97b'
    },
    { 
      id: 3, 
      company: 'สถาบัน Digital Solutions', 
      position: 'UI/UX Designer', 
      status: 'ไม่อนุมัติ',
      date: '2025-12-15',
      color: '#fa709a'
    }
  ];

  const stats = [
    { title: 'คำร้องทั้งหมด', value: internshipRequests.length, icon: '📝', color: '#667eea' },
    { title: 'รออนุมัติ', value: internshipRequests.filter(r => r.status === 'รออนุมัติ').length, icon: '⏳', color: '#f093fb' },
    { title: 'อนุมัติแล้ว', value: internshipRequests.filter(r => r.status === 'อนุมัติแล้ว').length, icon: '✅', color: '#43e97b' },
    { title: 'ไม่อนุมัติ', value: internshipRequests.filter(r => r.status === 'ไม่อนุมัติ').length, icon: '❌', color: '#fa709a' }
  ];

  const getStatusBadge = (status) => {
    const statusStyles = {
      'รออนุมัติ': { bg: '#fff3cd', color: '#856404' },
      'อนุมัติแล้ว': { bg: '#d4edda', color: '#155724' },
      'ไม่อนุมัติ': { bg: '#f8d7da', color: '#721c24' }
    };
    return statusStyles[status] || { bg: '#e2e3e5', color: '#383d41' };
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>🎓 นักศึกษา</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item active">
            <span className="nav-icon">🏠</span>
            <span>หน้าหลัก</span>
          </Link>
          <Link to="/dashboard/new-request" className="nav-item">
            <span className="nav-icon">➕</span>
            <span>ยื่นคำร้องใหม่</span>
          </Link>
          <Link to="/dashboard/requests" className="nav-item">
            <span className="nav-icon">📝</span>
            <span>คำร้องของฉัน</span>
          </Link>
          <Link to="/dashboard/profile" className="nav-item">
            <span className="nav-icon">👤</span>
            <span>โปรไฟล์</span>
          </Link>
          <Link to="/dashboard/settings" className="nav-item">
            <span className="nav-icon">⚙️</span>
            <span>ตั้งค่า</span>
          </Link>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span>← ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>สวัสดีค่ะ, {studentName}!</h1>
            <p>จัดการและติดตามคำร้องฝึกงานของคุณ</p>
          </div>
          <Link to="/" className="home-link">
            หน้าแรก
          </Link>
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
            <h2>คำร้องล่าสุด</h2>
            <Link to="/dashboard/new-request" className="btn-add">
              + ยื่นคำร้องใหม่
            </Link>
          </div>

          <div className="requests-list">
            {internshipRequests.length > 0 ? (
              internshipRequests.map((request) => {
                const statusStyle = getStatusBadge(request.status);
                return (
                  <div key={request.id} className="request-card">
                    <div className="request-header">
                      <div>
                        <h3>{request.company}</h3>
                        <p className="position">{request.position}</p>
                      </div>
                      <span 
                        className="status-badge" 
                        style={{ 
                          background: statusStyle.bg, 
                          color: statusStyle.color 
                        }}
                      >
                        {request.status}
                      </span>
                    </div>
                    <div className="request-footer">
                      <span className="request-date">
                        📅 ยื่นเมื่อ: {new Date(request.date).toLocaleDateString('th-TH')}
                      </span>
                      <Link to={`/dashboard/request/${request.id}`} className="view-link">
                        ดูรายละเอียด →
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h3>ยังไม่มีคำร้อง</h3>
                <p>คลิกปุ่มด้านบนเพื่อยื่นคำร้องฝึกงานใหม่</p>
                <Link to="/dashboard/new-request" className="btn-primary">
                  ยื่นคำร้องเลย
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
