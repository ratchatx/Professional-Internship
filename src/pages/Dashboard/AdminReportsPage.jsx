import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminDashboardPage.css';
import './AdminReportsPage.css';

const AdminReportsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role !== 'admin') {
         navigate('/dashboard'); 
         return;
      }
      
      // Load requests
      const storedRequests = JSON.parse(localStorage.getItem('requests') || '[]');
      setRequests(storedRequests);

      // Load students (optional, if we want to cross reference)
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      setStudents(storedUsers.filter(u => u.role === 'student'));
      
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Calculate statistics
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.status === 'รอผู้ดูแลระบบอนุมัติ').length;
  const approvedRequests = requests.filter(r => r.status === 'อนุมัติแล้ว').length;
  const rejectedRequests = requests.filter(r => r.status.includes('ไม่อนุมัติ')).length;
  const internshipStarted = requests.filter(r => r.status === 'ออกฝึกงาน').length;
  const internshipFinished = requests.filter(r => r.status === 'ฝึกงานเสร็จแล้ว').length;

  // Group by Department
  const departmentStats = requests.reduce((acc, curr) => {
    const dept = curr.department || 'ไม่ระบุ';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  // Group by Company
  const companyStats = requests.reduce((acc, curr) => {
    const company = curr.company || 'ไม่ระบุ';
    acc[company] = (acc[company] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="admin-dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>ผู้ดูแลระบบ</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin-dashboard" className="nav-item">
            <span className="nav-icon"></span>
            <span>หน้าหลัก</span>
          </Link>
          <Link to="/admin-dashboard/students" className="nav-item">
            <span className="nav-icon"></span>
            <span>นักศึกษา</span>
          </Link>
          <Link to="/admin-dashboard/payments" className="nav-item">
            <span className="nav-icon"></span>
            <span>ตรวจสอบการชำระเงิน</span>
          </Link>
          <Link to="/admin-dashboard/reports" className="nav-item active">
            <span className="nav-icon"></span>
            <span>รายงาน</span>
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
            <h1>รายงาน</h1>
            <p>สรุปสถานะคำร้องและสถิติต่างๆ</p>
          </div>
          <Link to="/" className="home-link">หน้าแรก</Link>
        </header>

        <div className="reports-content">
            
            {/* Summary Cards */}
            <div className="stats-grid">
                <div className="stat-card" style={{ borderTop: '4px solid #667eea' }}>
                    <h3>ทั้งหมด</h3>
                    <p className="big-number">{totalRequests}</p>
                    <p>คำร้อง</p>
                </div>
                <div className="stat-card" style={{ borderTop: '4px solid #f093fb' }}>
                    <h3>รอตรวจสอบ</h3>
                    <p className="big-number">{pendingRequests}</p>
                    <p>คำร้อง</p>
                </div>
                <div className="stat-card" style={{ borderTop: '4px solid #43e97b' }}>
                    <h3>กำลังฝึกงาน</h3>
                    <p className="big-number">{internshipStarted}</p>
                    <p>คน</p>
                </div>
                <div className="stat-card" style={{ borderTop: '4px solid #fa709a' }}>
                    <h3>ฝึกงานเสร็จสิ้น</h3>
                    <p className="big-number">{internshipFinished}</p>
                    <p>คน</p>
                </div>
            </div>

            <div className="reports-grid">
                {/* Department Stats */}
                <div className="report-section">
                    <h3>📊 สถิติแยกตามสาขา</h3>
                    <div className="table-container">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>สาขาวิชา</th>
                                    <th>จำนวน (คำร้อง)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(departmentStats).length > 0 ? (
                                    Object.entries(departmentStats).map(([dept, count]) => (
                                        <tr key={dept}>
                                            <td>{dept}</td>
                                            <td>{count}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="2">ไม่มีข้อมูล</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Company Stats */}
                <div className="report-section">
                    <h3>🏢 บริษัทที่รับนักศึกษา</h3>
                    <div className="table-container">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>บริษัท</th>
                                    <th>จำนวน (คน)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(companyStats).length > 0 ? (
                                    Object.entries(companyStats).map(([company, count]) => (
                                        <tr key={company}>
                                            <td>{company}</td>
                                            <td>{count}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="2">ไม่มีข้อมูล</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Requests */}
                 <div className="report-section full-width">
                    <h3>🕒 คำร้องล่าสุด</h3>
                    <div className="table-container">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>วันที่</th>
                                    <th>นักศึกษา</th>
                                    <th>บริษัท</th>
                                    <th>สถานะ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.slice().reverse().slice(0, 5).map(req => (
                                    <tr key={req.id}>
                                        <td>{new Date(req.submittedDate).toLocaleDateString('th-TH')}</td>
                                        <td>{req.studentName}</td>
                                        <td>{req.company}</td>
                                        <td>
                                            <span className={`status-badge status-${req.status === 'อนุมัติแล้ว' ? 'approved' : req.status === 'รอผู้ดูแลระบบอนุมัติ' ? 'pending' : 'other'}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {requests.length === 0 && <tr><td colSpan="4">ไม่มีข้อมูล</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

        </div>
      </main>
    </div>
  );
};

export default AdminReportsPage;
