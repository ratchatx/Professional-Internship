import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './DashboardPage.css';
import './ProcessTracker.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState('');
  const [studentAvatar, setStudentAvatar] = useState(null);
  const [internshipRequests, setInternshipRequests] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
              const user = JSON.parse(userStr);

              if (user.role === 'admin') {
                 navigate('/admin-dashboard'); 
                 return;
              }
              if (user.role === 'advisor') {
                 navigate('/advisor-dashboard'); 
                 return;
              }
              if (user.role === 'company') {
                 navigate('/company-dashboard'); 
                 return;
              }
              if (user.role !== 'student') {
                 navigate('/login'); 
                 return;
              }

              setStudentName(user.full_name || user.name);
              setStudentAvatar(user.avatar);
        
              // API Call Replaced with LocalStorage
              // const response = await api.get(`/requests?student_id=${user.user_id}`);
              
              const allRequests = JSON.parse(localStorage.getItem('requests') || '[]');
              // Filter for current user
              const myRequests = allRequests.filter(req => 
                 req.studentId == user.student_code || 
                 req.studentId == user.username ||
                 (user.email && req.studentId === user.email) || // Fallback
                 true // Show all for demo if matching fails, or strictly: req.studentId === user.student_code
              );

              // Sort by date desc
              myRequests.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));

              const mappedRequests = myRequests.map(req => {
                  // Status is already in Thai/correct format in localStorage from NewRequest/Advisor pages
                  return {
                      ...req,
                      companyName: req.company || req.companyName,
                      // status is already correct
                  };
              });
              setInternshipRequests(mappedRequests);
            } else {
              navigate('/login');
            }
        } catch (error) {
            console.error(error);
        }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const currentRequest = internshipRequests[0];
  
  // Map extended status to steps (0-4)
  const getStepIndex = (status) => {
      if (!status) return 0;
      if (['รออาจารย์ที่ปรึกษาอนุมัติ', 'รอผู้ดูแลระบบตรวจสอบ', 'รอผู้ดูแลระบบอนุมัติ'].includes(status)) return 1;
      if (['รอสถานประกอบการตอบรับ'].includes(status)) return 2;
      if (['อนุมัติแล้ว', 'ออกฝึกงาน'].includes(status)) return 3;
      if (['ฝึกงานเสร็จแล้ว'].includes(status)) return 4;
      if (status.includes('ไม่อนุมัติ') || status.includes('ปฏิเสธ')) return 1; 
      return 0;
  };

  const currentStep = getStepIndex(currentRequest?.status);

  const steps = [
    { title: 'ส่งคำร้อง', icon: '📝' },
    { title: 'รอตรวจสอบ', icon: '🔍' },
    { title: 'รอตอบรับ', icon: '🏢' },
    { title: 'อนุมัติแล้ว', icon: '✅' },
    { title: 'เสร็จสิ้น', icon: '🎓' }
  ];

  const getStatusBadge = (status) => {
    const statusStyles = {
      'รออาจารย์ที่ปรึกษาอนุมัติ': { bg: '#fff3cd', color: '#856404' },
      'รอผู้ดูแลระบบตรวจสอบ': { bg: '#c3dafe', color: '#434190' },
      'รอผู้ดูแลระบบอนุมัติ': { bg: '#c3dafe', color: '#434190' },
      'รอสถานประกอบการตอบรับ': { bg: '#e2e8f0', color: '#2d3748' },
      'อนุมัติแล้ว': { bg: '#d4edda', color: '#155724' },
      'ไม่อนุมัติ (อาจารย์)': { bg: '#f8d7da', color: '#721c24' },
      'ไม่อนุมัติ (Admin)': { bg: '#f8d7da', color: '#721c24' },
      'ปฏิเสธ': { bg: '#f8d7da', color: '#721c24' },
      'ออกฝึกงาน': { bg: '#c3dafe', color: '#434190' },
      'ฝึกงานเสร็จแล้ว': { bg: '#fed7e2', color: '#702459' }
    };
    return statusStyles[status] || { bg: '#e2e3e5', color: '#383d41' };
  };

  const hasActiveRequest = internshipRequests.some(req => 
    !['ไม่อนุมัติ (อาจารย์)', 'ไม่อนุมัติ (Admin)', 'ปฏิเสธ'].includes(req.status)
  );

  return (
    <div className="dashboard-container">
      <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
      <div className={`sidebar-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}></div>
      <aside className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
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
          <Link to="/dashboard/my-requests" className="nav-item">
            <span className="nav-icon">📝</span>
            <span>คำร้องของฉัน</span>
          </Link>
          <Link to="/dashboard/payment-proof" className="nav-item">
            <span className="nav-icon">💰</span>
            <span>หลักฐานการชำระออกฝึก</span>
          </Link>
          <Link to="/dashboard/profile" className="nav-item">
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

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div className="profile-img-container" style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
               {studentAvatar ? (
                 <img src={studentAvatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               ) : (
                 <div style={{ width: '100%', height: '100%', background: '#cbd5e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>👤</div>
               )}
            </div>
            <div>
              <h1>สวัสดีค่ะ, {studentName}!</h1>
              <p>จัดการและติดตามคำร้องฝึกงานของคุณ</p>
            </div>
          </div>
          <Link to="/" className="home-link">
            หน้าแรก
          </Link>
        </header>

        <div className="status-tracker-container">
          <h2>📌 สถานะคำร้องปัจจุบัน</h2>
          {currentRequest ? (
            <div className="circular-tracker-wrapper">
              <div className="circular-tracker">
                <svg className="progress-ring" width="300" height="300">
                  <circle
                    className="progress-ring__circle-bg"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                    fill="transparent"
                    r="120"
                    cx="150"
                    cy="150"
                  />
                  <circle
                    className="progress-ring__circle"
                    stroke={currentRequest.status === 'ไม่อนุมัติ' ? '#fa709a' : '#667eea'}
                    strokeWidth="8"
                    fill="transparent"
                    r="120"
                    cx="150"
                    cy="150"
                    style={{
                       strokeDasharray: `${2 * Math.PI * 120}`,
                       strokeDashoffset: (() => {
                          const r = 120;
                          const c = 2 * Math.PI * r;
                          const idx = getStepIndex(currentRequest.status);
                          const progress = idx / 4; 
                          return c - (progress * c);
                       })()
                    }}
                  />
                </svg>
                
                {/* Center Content */}
                <div className="tracker-center-content">
                    <div className="status-icon-large">
                        {(() => {
                            const step = steps.find(st => st.title === currentRequest.status) || steps[1]; // default to pending if matching fail
                             if (currentRequest.status === 'ไม่อนุมัติ') return '❌';
                             if (currentRequest.status === 'ส่งคำร้อง') return '📝';
                             return step.icon;
                        })()}
                    </div>
                    <h3>{currentRequest.status}</h3>
                    <p>{currentRequest.companyName}</p>
                </div>

                {/* Steps Icons around the circle */}
                {steps.map((step, index) => {
                    // Calculate position
                    // Start from top (-90deg). Total 360deg.
                    // 5 steps. But last step completes the circle? 
                    // Let's distribute evenly starting from top.
                    // 0: 0deg(Top), 1: 72deg, 2: 144deg ...
                    
                    const totalSteps = 5;
                    const angle = (index * (360 / totalSteps)) - 90; 
                    const radius = 120;
                    const x = 150 + radius * Math.cos((angle * Math.PI) / 180);
                    const y = 150 + radius * Math.sin((angle * Math.PI) / 180);

                    const s = currentRequest.status;
                    let isActive = false; 
                    let isCompleted = false;
                    let isRejected = false;
                    
                    const currentIdx = getStepIndex(s);
                    
                    if (index < currentIdx) {
                        isCompleted = true;
                    } else if (index === currentIdx) {
                        isActive = true;
                        if (s.includes('ไม่อนุมัติ') || s.includes('ปฏิเสธ')) {
                            isActive = false;
                            isRejected = true;
                        }
                    }

                    return (
                        <div 
                            key={index} 
                            className={`circular-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isRejected ? 'rejected' : ''}`}
                            style={{ left: `${x}px`, top: `${y}px` }}
                            title={step.title}
                        >
                            <div className="circular-step-icon">
                                {isCompleted ? '✓' : isRejected ? '✗' : step.icon}
                            </div>
                            <span className="circular-step-label">{step.title}</span>
                        </div>
                    );
                })}
              </div>
            </div>
          ) : (
             <div className="no-request-tracker">
                <div className="step-circle start">🚀</div>
                <p>คุณยังไม่มีคำร้องที่กำลังดำเนินการ</p>
                <Link to="/dashboard/new-request" className="btn-primary-small">เริ่มยื่นคำร้อง</Link>
             </div>
          )}
        </div>

        <div className="content-section">
          <div className="section-header">
            <h2>คำร้องล่าสุด</h2>
            {!hasActiveRequest && (
              <Link to="/dashboard/new-request" className="btn-add">
                + ยื่นคำร้องใหม่
              </Link>
            )}
            {/* If active request exists, hide the button or show disabled state */}
            {hasActiveRequest && (
                 <span className="info-text text-muted" style={{ fontSize: '0.9rem', color: '#e53e3e' }}>
                    *คุณมีคำร้องที่กำลังดำเนินการ (ต้องรอผลการอนุมัติ/ปฏิเสธก่อนยื่นใหม่)
                 </span>
            )}
          </div>

          <div className="requests-list">
            {internshipRequests.length > 0 ? (
              internshipRequests.map((request) => {
                const statusStyle = getStatusBadge(request.status);
                return (
                  <div key={request.id} className="request-card">
                    <div className="request-header">
                      <div>
                        <h3>{request.companyName}</h3>
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
                        📅 ยื่นเมื่อ: {request.submittedDate}
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
