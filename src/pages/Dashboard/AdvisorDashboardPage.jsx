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
  
  const handleApprove = (requestId) => {
    // Step 2: Advisor Approve -> Send to Admin
    const updated = allRequests.map(r => r.id === requestId ? {...r, status: 'รอผู้ดูแลระบบอนุมัติ'} : r);
    setAllRequests(updated);
    localStorage.setItem('requests', JSON.stringify(updated));
    alert(`อนุมัติคำร้องเรียบร้อย ส่งต่อให้ผู้ดูแลระบบตรวจสอบ`);
  };

  const handleReject = (requestId) => {
    const reason = prompt('กรุณาระบุเหตุผลที่ไม่อนุมัติ:');
    if (reason) {
        const updated = allRequests.map(r => r.id === requestId ? {...r, status: 'ไม่อนุมัติ (อาจารย์)', rejectReason: reason} : r);
        setAllRequests(updated);
        localStorage.setItem('requests', JSON.stringify(updated));
        alert('บันทึกผลการไม่อนุมัติเรียบร้อย');
    }
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
                <h3 className="stat-value">{allRequests.length}</h3>
              </div>
            </div>
            <div className="stat-card" style={{ borderTop: `4px solid #f093fb` }}>
              <div className="stat-info">
                <p className="stat-title">รอตรวจสอบ</p>
                <h3 className="stat-value">{allRequests.filter(r => r.status === 'รออาจารย์ที่ปรึกษาอนุมัติ').length}</h3>
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
                      <td>
                        <div className="action-buttons">
                        {isPending && (
                          <>
                            <button className="btn-approve" onClick={() => handleApprove(request.id)} title="อนุมัติ">✓</button>
                            <button className="btn-reject" onClick={() => handleReject(request.id)} title="ไม่อนุมัติ">✗</button>
                          </>
                        )}
                        <Link 
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
                            🔍 รายละเอียด
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
