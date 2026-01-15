import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './AdminDashboardPage.css';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  const handleLogout = () => {
    console.log('Logging out...');
    navigate('/login');
  };

  // ข้อมูลคำร้องทั้งหมด (จริงจะมาจาก API)
  const allRequests = [
    {
      id: 1,
      studentId: '6512345001',
      studentName: 'นายสมชาย ใจดี',
      department: 'วิศวกรรมคอมพิวเตอร์',
      company: 'บริษัท ABC จำกัด',
      position: 'โปรแกรมเมอร์',
      status: 'รออนุมัติ',
      submittedDate: '2026-01-05',
      startDate: '2026-02-01',
      endDate: '2026-05-31'
    },
    {
      id: 2,
      studentId: '6512345002',
      studentName: 'นางสาวมณี รักเรียน',
      department: 'วิศวกรรมคอมพิวเตอร์',
      company: 'บริษัท XYZ Tech',
      position: 'Web Developer',
      status: 'อนุมัติแล้ว',
      submittedDate: '2025-12-20',
      startDate: '2026-01-15',
      endDate: '2026-04-30'
    },
    {
      id: 3,
      studentId: '6512345003',
      studentName: 'นายวิชัย สุขใจ',
      department: 'วิศวกรรมไฟฟ้า',
      company: 'สถาบัน Digital Solutions',
      position: 'UI/UX Designer',
      status: 'ไม่อนุมัติ',
      submittedDate: '2025-12-15',
      startDate: '2026-02-01',
      endDate: '2026-05-31'
    },
    {
      id: 4,
      studentId: '6512345004',
      studentName: 'นางสาวสุดา พากเพียร',
      department: 'บริหารธุรกิจ',
      company: 'บริษัท DEF Enterprise',
      position: 'Marketing Intern',
      status: 'รออนุมัติ',
      submittedDate: '2026-01-07',
      startDate: '2026-03-01',
      endDate: '2026-06-30'
    }
  ];

  const filteredRequests = filter === 'all' 
    ? allRequests 
    : allRequests.filter(req => {
        if (filter === 'pending') return req.status === 'รออนุมัติ';
        if (filter === 'approved') return req.status === 'อนุมัติแล้ว';
        if (filter === 'rejected') return req.status === 'ไม่อนุมัติ';
        return true;
      });

  const stats = [
    { 
      title: 'คำร้องทั้งหมด', 
      value: allRequests.length, 
      icon: '📋', 
      color: '#667eea' 
    },
    { 
      title: 'รออนุมัติ', 
      value: allRequests.filter(r => r.status === 'รออนุมัติ').length, 
      icon: '⏳', 
      color: '#f093fb' 
    },
    { 
      title: 'อนุมัติแล้ว', 
      value: allRequests.filter(r => r.status === 'อนุมัติแล้ว').length, 
      icon: '✅', 
      color: '#43e97b' 
    },
    { 
      title: 'ไม่อนุมัติ', 
      value: allRequests.filter(r => r.status === 'ไม่อนุมัติ').length, 
      icon: '❌', 
      color: '#fa709a' 
    }
  ];

  const handleApprove = (requestId) => {
    console.log('Approving request:', requestId);
    alert(`อนุมัติคำร้องเลขที่ ${requestId} สำเร็จ`);
  };

  const handleReject = (requestId) => {
    console.log('Rejecting request:', requestId);
    const reason = prompt('กรุณาระบุเหตุผลที่ไม่อนุมัติ:');
    if (reason) {
      alert(`ไม่อนุมัติคำร้องเลขที่ ${requestId}`);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'รออนุมัติ': { bg: '#fff3cd', color: '#856404' },
      'อนุมัติแล้ว': { bg: '#d4edda', color: '#155724' },
      'ไม่อนุมัติ': { bg: '#f8d7da', color: '#721c24' }
    };
    return statusStyles[status] || { bg: '#e2e3e5', color: '#383d41' };
  };

  return (
    <div className="admin-dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>👨‍💼 ผู้ดูแลระบบ</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin-dashboard" className="nav-item active">
            <span className="nav-icon">🏠</span>
            <span>หน้าหลัก</span>
          </Link>
          <Link to="/admin-dashboard/students" className="nav-item">
            <span className="nav-icon">👥</span>
            <span>นักศึกษา</span>
          </Link>
          <Link to="/admin-dashboard/reports" className="nav-item">
            <span className="nav-icon">📊</span>
            <span>รายงาน</span>
          </Link>
          <Link to="/admin-dashboard/settings" className="nav-item">
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

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>ระบบจัดการคำร้องฝึกงาน</h1>
            <p>จัดการและอนุมัติคำร้องของนักศึกษา</p>
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
            <h2>คำร้องทั้งหมด</h2>
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                ทั้งหมด
              </button>
              <button 
                className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
              >
                รออนุมัติ
              </button>
              <button 
                className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
                onClick={() => setFilter('approved')}
              >
                อนุมัติแล้ว
              </button>
              <button 
                className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
                onClick={() => setFilter('rejected')}
              >
                ไม่อนุมัติ
              </button>
            </div>
          </div>

          <div className="requests-table">
            <table>
              <thead>
                <tr>
                  <th>รหัสนักศึกษา</th>
                  <th>ชื่อ-นามสกุล</th>
                  <th>สาขา</th>
                  <th>บริษัท</th>
                  <th>ตำแหน่ง</th>
                  <th>วันที่ยื่น</th>
                  <th>สถานะ</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => {
                  const statusStyle = getStatusBadge(request.status);
                  return (
                    <tr key={request.id}>
                      <td>{request.studentId}</td>
                      <td>{request.studentName}</td>
                      <td>{request.department}</td>
                      <td>{request.company}</td>
                      <td>{request.position}</td>
                      <td>{new Date(request.submittedDate).toLocaleDateString('th-TH')}</td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{ background: statusStyle.bg, color: statusStyle.color }}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-view"
                            onClick={() => navigate(`/admin-dashboard/request/${request.id}`)}
                          >
                            ดู
                          </button>
                          {request.status === 'รออนุมัติ' && (
                            <>
                              <button 
                                className="btn-approve"
                                onClick={() => handleApprove(request.id)}
                              >
                                ✓
                              </button>
                              <button 
                                className="btn-reject"
                                onClick={() => handleReject(request.id)}
                              >
                                ✗
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
