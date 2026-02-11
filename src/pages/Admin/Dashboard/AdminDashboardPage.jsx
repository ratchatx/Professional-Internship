import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminDashboardPage.css';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [adminName, setAdminName] = useState('');
  const [allRequests, setAllRequests] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [rejectModal, setRejectModal] = useState({
    open: false,
    requestId: null,
    reason: ''
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role !== 'admin') {
         navigate('/dashboard'); 
         return;
      }
      setAdminName(user.name);
      
      // Load requests
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
    if (filter === 'pending_admin') return req.status === 'รอผู้ดูแลระบบตรวจสอบ' || req.status === 'รอผู้ดูแลระบบอนุมัติ';
    if (filter === 'rejected') return req.status.includes('ไม่อนุมัติ') || req.status === 'ปฏิเสธ';
    return req.status === filter; 
  });



  const stats = [
    { 
      title: 'คำร้องทั้งหมด', 
      value: allRequests.length, 
      icon: '📋', 
      color: '#667eea' 
    },
    { 
      title: 'รอตรวจสอบ (Admin)', 
      value: allRequests.filter(r => r.status === 'รอผู้ดูแลระบบตรวจสอบ' || r.status === 'รอผู้ดูแลระบบอนุมัติ').length, 
      icon: '⏳', 
      color: '#f093fb' 
    },
    { 
      title: 'รอสถานประกอบการ', 
      value: allRequests.filter(r => r.status === 'รอสถานประกอบการตอบรับ').length, 
      icon: '🏢', 
      color: '#a0aec0' 
    },
    { 
      title: 'อนุมัติแล้ว (สมบูรณ์)', 
      value: allRequests.filter(r => r.status === 'อนุมัติแล้ว').length, 
      icon: '✅', 
      color: '#43e97b' 
    }
  ];

  const handleDelete = (id) => {
    if (window.confirm('คุณต้องการลบคำร้องนี้ใช่หรือไม่? นักศึกษาจะสามารถยื่นคำร้องใหม่ได้หลังจากลบ')) {
      const updatedRequests = allRequests.filter(req => req.id !== id);
      setAllRequests(updatedRequests);
      localStorage.setItem('requests', JSON.stringify(updatedRequests));
    }
  };

  const handleApprove = (requestId) => {
    // Step 3: Admin check -> Send to Company
    const newStatus = 'รอสถานประกอบการตอบรับ';
    const updated = allRequests.map(r => r.id === requestId ? {...r, status: newStatus} : r);
    setAllRequests(updated);
    localStorage.setItem('requests', JSON.stringify(updated));
    alert(`ตรวจสอบและส่งคำขอไปยังสถานประกอบการเรียบร้อยแล้ว (สถานะ: ${newStatus})`);
  };

  const handleUpdateStatus = (requestId, newStatus) => {
     const updated = allRequests.map(r => r.id === requestId ? {...r, status: newStatus} : r);
     setAllRequests(updated);
     localStorage.setItem('requests', JSON.stringify(updated));
     alert(`อัปเดตสถานะเป็น "${newStatus}" เรียบร้อยแล้ว`);
  };

  const handleReject = (requestId) => {
    setRejectModal({ open: true, requestId, reason: '' });
  };

  const handleRejectConfirm = () => {
    if (!rejectModal.reason.trim()) {
      alert('กรุณาระบุเหตุผลที่ไม่อนุมัติ');
      return;
    }

    const updated = allRequests.map(r =>
      r.id === rejectModal.requestId
        ? { ...r, status: 'ไม่อนุมัติ (Admin)', rejectReason: rejectModal.reason.trim() }
        : r
    );
    setAllRequests(updated);
    localStorage.setItem('requests', JSON.stringify(updated));
    alert(`ไม่อนุมัติคำร้องเลขที่ ${rejectModal.requestId}`);
    setRejectModal({ open: false, requestId: null, reason: '' });
  };

  const handleRejectClose = () => {
    setRejectModal({ open: false, requestId: null, reason: '' });
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'รออาจารย์ที่ปรึกษาอนุมัติ': { bg: '#e2e3e5', color: '#666' },
      'รอผู้ดูแลระบบตรวจสอบ': { bg: '#fff3cd', color: '#856404' },
      'รอผู้ดูแลระบบอนุมัติ': { bg: '#fff3cd', color: '#856404' },
      'รอสถานประกอบการตอบรับ': { bg: '#e2e8f0', color: '#2d3748' },
      'อนุมัติแล้ว': { bg: '#d4edda', color: '#155724' },
      'ไม่อนุมัติ (Admin)': { bg: '#f8d7da', color: '#721c24' },
      'ไม่อนุมัติ (อาจารย์)': { bg: '#f8d7da', color: '#721c24' },
      'ปฏิเสธ': { bg: '#f8d7da', color: '#721c24' }
    };
    return statusStyles[status] || { bg: '#e2e3e5', color: '#383d41' };
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
          <Link to="/admin-dashboard" className="nav-item active">
            <span className="nav-icon">🏠</span>
            <span>หน้าหลัก</span>
          </Link>
          <Link to="/admin-dashboard/students" className="nav-item">
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
          <Link to="/admin-dashboard/checkins" className="nav-item">
            <span className="nav-icon">✅</span>
            <span>เช็คชื่อรายวัน</span>
          </Link>
          <Link to="/admin-dashboard/reports" className="nav-item">
            <span className="nav-icon">📊</span>
            <span>รายงาน</span>
          </Link>
          <Link to="/admin-dashboard/profile" className="nav-item">
            <span className="nav-icon">👤</span>
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
                className={`filter-btn ${filter === 'pending_admin' ? 'active' : ''}`}
                onClick={() => setFilter('pending_admin')}
              >
                รอตรวจสอบ
              </button>
              <button 
                className={`filter-btn ${filter === 'รอสถานประกอบการตอบรับ' ? 'active' : ''}`}
                onClick={() => setFilter('รอสถานประกอบการตอบรับ')}
              >
                รอสถานประกอบการ
              </button>
              <button 
                className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
                onClick={() => setFilter('อนุมัติแล้ว')}
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
                            className="btn-delete"
                            onClick={() => handleDelete(request.id)}
                            style={{ padding: '5px 10px', background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}
                          >
                            ลบ
                          </button>
                          {(request.status === 'รอผู้ดูแลระบบตรวจสอบ' || request.status === 'รอผู้ดูแลระบบอนุมัติ') && (
                            <>
                              <button 
                                className="btn-approve"
                                onClick={() => handleApprove(request.id)}
                                title="ส่งต่อให้สถานประกอบการ"
                              >
                                ✓
                              </button>
                              <button 
                                className="btn-reject"
                                onClick={() => handleReject(request.id)}
                                title="ไม่อนุมัติ"
                              >
                                ✗
                              </button>
                            </>
                          )}
                          {request.status === 'อนุมัติแล้ว' && (
                             <button
                               className="btn-next-step"
                               onClick={() => handleUpdateStatus(request.id, 'ออกฝึกงาน')}
                               style={{ padding: '5px 10px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                             >
                               เริ่มฝึกงาน
                             </button>
                          )}
                          {request.status === 'ออกฝึกงาน' && (
                             <button
                               className="btn-finish"
                               onClick={() => handleUpdateStatus(request.id, 'ฝึกงานเสร็จแล้ว')}
                               style={{ padding: '5px 10px', background: '#48bb78', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                             >
                               จบการฝึกงาน
                             </button>
                          )}                           <Link 
                            to={`/dashboard/request/${request.id}`}
                            style={{ 
                                padding: '5px 10px', 
                                background: '#edf2f7', 
                                color: '#4a5568', 
                                borderRadius: '4px', 
                                textDecoration: 'none', 
                                fontSize: '0.9rem',
                                display: 'inline-block',
                                marginLeft: '5px'
                            }}
                          >
                            🔍 ดูรายละเอียด
                          </Link>                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {rejectModal.open && (
        <div className="modal-overlay" onClick={handleRejectClose}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>ระบุเหตุผลที่ไม่อนุมัติ</h2>
              <button className="close-btn" onClick={handleRejectClose}>&times;</button>
            </div>
            <div className="form-group">
              <label>เหตุผล</label>
              <textarea
                rows="4"
                value={rejectModal.reason}
                onChange={(event) => setRejectModal(prev => ({ ...prev, reason: event.target.value }))}
                placeholder="กรอกเหตุผลที่ไม่อนุมัติ"
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={handleRejectClose}>ยกเลิก</button>
              <button type="button" className="btn-submit" onClick={handleRejectConfirm}>ยืนยัน</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
