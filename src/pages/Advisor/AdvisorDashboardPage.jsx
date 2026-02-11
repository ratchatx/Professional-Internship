import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Admin/Dashboard/AdminDashboardPage.css'; // Reuse Admin styles

const AdvisorDashboardPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [advisorName, setAdvisorName] = useState('');
  const [advisorDepartment, setAdvisorDepartment] = useState('');
  const [allRequests, setAllRequests] = useState([]);
  const [rejectModal, setRejectModal] = useState({
    open: false,
    requestId: null,
    reason: ''
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role !== 'advisor') {
         navigate('/login'); 
         return;
      }
      setAdvisorName(user.name);
      setAdvisorDepartment(user.department || user.major || '');
      
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

  const departmentFilteredRequests = allRequests.filter((req) => {
    const dept = req.department || req.details?.student_info?.major || '';
    if (!advisorDepartment) return true;
    return dept === advisorDepartment;
  });

  const filteredRequests = departmentFilteredRequests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });
  
  const handleApprove = (requestId) => {
    // Step 2: Advisor Approve -> Send to Admin
    const updated = allRequests.map(r => r.id === requestId ? {...r, status: 'รอผู้ดูแลระบบอนุมัติ'} : r);
    setAllRequests(updated);
    localStorage.setItem('requests', JSON.stringify(updated));
    alert(`อนุมัติคำร้องเรียบร้อย ส่งต่อให้ผู้ดูแลระบบตรวจสอบ`);
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
        ? { ...r, status: 'ไม่อนุมัติ (อาจารย์)', rejectReason: rejectModal.reason.trim() }
        : r
    );
    setAllRequests(updated);
    localStorage.setItem('requests', JSON.stringify(updated));
    alert('บันทึกผลการไม่อนุมัติเรียบร้อย');
    setRejectModal({ open: false, requestId: null, reason: '' });
  };

  const handleRejectClose = () => {
    setRejectModal({ open: false, requestId: null, reason: '' });
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'รออาจารย์ที่ปรึกษาอนุมัติ': { bg: '#fff3cd', color: '#856404' },
      'รอผู้ดูแลระบบอนุมัติ': { bg: '#c3dafe', color: '#434190' },
      'อนุมัติแล้ว': { bg: '#d4edda', color: '#155724' },
      'ไม่อนุมัติ (อาจารย์)': { bg: '#f8d7da', color: '#721c24' },
      'ไม่อนุมัติ (Admin)': { bg: '#f8d7da', color: '#721c24' }
    };
    return statusStyles[status] || { bg: '#e2e3e5', color: '#383d41' };
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
          <Link to="/advisor-dashboard" className="nav-item active">
              <span className="nav-icon">🏠</span>
              <span>หน้าหลัก</span>
          </Link>
          <Link to="/advisor-dashboard/students" className="nav-item">
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
            <h1>สวัสดี, {advisorName}</h1>
            <p>ติดตามสถานะการฝึกงานของนักศึกษา</p>
          </div>
        </header>

        <div className="stats-grid">
           {/* Update Stats for Advisor View */}
           <div className="stat-card" style={{ borderTop: `4px solid #667eea` }}>
              <div className="stat-info">
                <p className="stat-title">ทั้งหมด</p>
                <h3 className="stat-value">{departmentFilteredRequests.length}</h3>
              </div>
            </div>
            <div className="stat-card" style={{ borderTop: `4px solid #f093fb` }}>
              <div className="stat-info">
                <p className="stat-title">รอตรวจสอบ</p>
                <h3 className="stat-value">{departmentFilteredRequests.filter(r => r.status === 'รออาจารย์ที่ปรึกษาอนุมัติ').length}</h3>
              </div>
            </div>
        </div>

        <div className="content-section">
          <div className="section-header">
            <h2>รายการคำร้องที่ต้องตรวจสอบ</h2>
            <div className="filter-buttons">
              <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>ทั้งหมด</button>
              <button className={`filter-btn ${filter === 'รออาจารย์ที่ปรึกษาอนุมัติ' ? 'active' : ''}`} onClick={() => setFilter('รออาจารย์ที่ปรึกษาอนุมัติ')}>รออนุมัติ</button>
            </div>
          </div>

          <div className="requests-table">
            <table>
              <thead>
                <tr>
                  <th>รหัสนักศึกษา</th>
                  <th>ชื่อ-นามสกุล</th>
                  <th>บริษัท</th>
                  <th>ตำแหน่ง</th>
                  <th>สถานะ</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => {
                  const statusStyle = getStatusBadge(request.status);
                  const isPending = request.status === 'รออาจารย์ที่ปรึกษาอนุมัติ';
                  return (
                    <tr key={request.id}>
                      <td>{request.studentId}</td>
                      <td>{request.studentName}</td>
                      <td>{request.company}</td>
                      <td>{request.position}</td>
                      <td>
                        <span className="status-badge" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                          {request.status}
                        </span>
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

export default AdvisorDashboardPage;
