import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminDashboardPage.css';
import './AdminReportsPage.css';

const AdminReportsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    const [selectedDepartment, setSelectedDepartment] = useState('all');

    const msPerDay = 24 * 60 * 60 * 1000;
    const normalizeDate = (value) => {
        if (!value) return null;
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return null;
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    };

    const buildProgressRows = () => {
        const today = normalizeDate(new Date());

        return requests
            .map((req) => {
                const details = req.details || {};
                const start = normalizeDate(details.startDate || req.startDate);
                const end = normalizeDate(details.endDate || req.endDate);

                if (!start || !end) return null;

                const totalDays = Math.max(1, Math.floor((end - start) / msPerDay) + 1);
                let elapsedDays = 0;

                if (today < start) elapsedDays = 0;
                else if (today > end) elapsedDays = totalDays;
                else elapsedDays = Math.floor((today - start) / msPerDay) + 1;

                const progress = Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));
                const remainingDays = Math.max(0, totalDays - elapsedDays);

                return {
                    id: req.id,
                    studentName: req.studentName || details.student_info?.name || '- ',
                    company: req.company || req.companyName || details.companyName || '- ',
                    department: req.department || details.student_info?.major || '- ',
                    start,
                    end,
                    progress,
                    totalDays,
                    elapsedDays,
                    remainingDays,
                    status: req.status
                };
            })
            .filter(Boolean)
            .sort((a, b) => b.progress - a.progress);
    };

    const progressRows = buildProgressRows();

  // Group by Department
  const departmentStats = requests.reduce((acc, curr) => {
    const dept = curr.department || 'ไม่ระบุ';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

    const internshipEligibleStatuses = new Set(['อนุมัติแล้ว', 'ออกฝึกงาน', 'ฝึกงานเสร็จแล้ว']);
    const internshipRequests = requests.filter(req => internshipEligibleStatuses.has(req.status));
    const departmentOptions = [
        'all',
        'สาขาวิชาวิทยาการคอมพิวเตอร์',
        'สาขาวิชาเทคโนโลยีคอมพิวเตอร์และดิจิทัล',
        'สาขาวิชาสาธารณสุขชุมชน',
        'สาขาวิชาวิทยาศาสตร์การกีฬา',
        'สาขาวิชาเทคโนโลยีการเกษตร',
        'สาขาวิชาเทคโนโลยีและนวัตกรรมอาหาร',
        'สาขาวิชาอาชีวอนามัยและความปลอดภัย',
        'สาขาวิชาวิศวกรรมซอฟต์แวร์',
        'สาขาวิชาวิศวกรรมโลจิสติกส์',
        'สาขาวิศวกรรมการจัดการอุตสาหกรรมและสิ่งแวดล้อม',
        'สาขาวิชาการออกแบบผลิตภัณฑ์และนวัตกรรมวัสดุ',
        'สาขาวิชาเทคโนโลยีโยธาและสถาปัตยกรรม'
    ];

    const filteredInternshipStudents = internshipRequests.filter(req => {
        if (selectedDepartment === 'all') return true;
        return (req.department || 'ไม่ระบุ') === selectedDepartment;
    });

  // Group by Company
  const companyStats = requests.reduce((acc, curr) => {
    const company = curr.company || 'ไม่ระบุ';
    acc[company] = (acc[company] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="admin-dashboard-container">
      <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
      <div className={`sidebar-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}></div>
      <aside className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>👨‍💼 ผู้ดูแลระบบ</h2>
        </div>
        <nav className="sidebar-nav">
            <Link to="/admin-dashboard" className="nav-item">
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
            <Link to="/admin-dashboard/reports" className="nav-item active">
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
            <h1>รายงาน</h1>
                        <p>สรุปสถานะคำร้องและความคืบหน้าระหว่างฝึกงาน</p>
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
                {/* Internship Progress */}
                <div className="report-section full-width">
                    <h3>📈 ความคืบหน้าระหว่างฝึกงาน</h3>
                    {progressRows.length === 0 ? (
                        <div className="empty-state">ไม่มีข้อมูลช่วงเวลาฝึกงาน</div>
                    ) : (
                        <div className="progress-list">
                            {progressRows.map((row) => (
                                <div className="progress-card" key={row.id}>
                                    <div className="progress-header">
                                        <div>
                                            <div className="progress-title">{row.studentName}</div>
                                            <div className="progress-subtitle">{row.department} • {row.company}</div>
                                        </div>
                                        <span className={`progress-status status-${row.status === 'ฝึกงานเสร็จแล้ว' ? 'done' : row.status === 'ออกฝึกงาน' ? 'active' : 'pending'}`}>
                                            {row.status}
                                        </span>
                                    </div>
                                    <div className="progress-meta">
                                        <span>เริ่ม {row.start.toLocaleDateString('th-TH')}</span>
                                        <span>สิ้นสุด {row.end.toLocaleDateString('th-TH')}</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-bar-fill" style={{ width: `${row.progress}%` }} />
                                    </div>
                                    <div className="progress-footer">
                                        <span>ทำไปแล้ว {row.elapsedDays}/{row.totalDays} วัน</span>
                                        <span>เหลืออีก {row.remainingDays} วัน</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Department Filter */}
                <div className="report-section full-width">
                    <div className="report-filter-header">
                        <div>
                            <h3>👥 รายชื่อนักศึกษาฝึกงานตามสาขา</h3>
                            <p className="report-subtitle">เลือกสาขาเพื่อดูรายชื่อนักศึกษาที่ได้รับการฝึกงาน</p>
                        </div>
                        <div className="report-filter">
                            <label htmlFor="department-filter">สาขา</label>
                            <select
                                id="department-filter"
                                value={selectedDepartment}
                                onChange={(event) => setSelectedDepartment(event.target.value)}
                            >
                                {departmentOptions.map((dept) => (
                                    <option key={dept} value={dept}>
                                        {dept === 'all' ? 'ทั้งหมด' : dept}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="table-container">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>รหัสนักศึกษา</th>
                                    <th>ชื่อ-นามสกุล</th>
                                    <th>สาขาวิชา</th>
                                    <th>บริษัท</th>
                                    <th>สถานะ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInternshipStudents.length > 0 ? (
                                    filteredInternshipStudents.map((req) => (
                                        <tr key={req.id}>
                                            <td>{req.studentId || '-'}</td>
                                            <td>{req.studentName || '-'}</td>
                                            <td>{req.department || 'ไม่ระบุ'}</td>
                                            <td>{req.company || req.companyName || '-'}</td>
                                            <td>
                                                <span className={`status-badge status-${req.status === 'ฝึกงานเสร็จแล้ว' ? 'approved' : req.status === 'ออกฝึกงาน' ? 'pending' : 'other'}`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5">ไม่มีข้อมูลนักศึกษาฝึกงานในสาขานี้</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

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
