import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminDashboardPage.css';
import '../Shared/CheckInPage.css';

const AdminCheckInPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [entries, setEntries] = useState([]);
  const [filters, setFilters] = useState({ date: '', status: 'all', search: '' });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    setAdminName(user.name || 'Admin');
    const stored = JSON.parse(localStorage.getItem('daily_checkins') || '[]');
    stored.sort((a, b) => b.date.localeCompare(a.date));
    setEntries(stored);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const statusLabel = useMemo(() => {
    return {
      present: 'มา',
      absent: 'ขาด',
      late: 'สาย'
    };
  }, []);

  const filteredEntries = entries.filter((entry) => {
    if (filters.date && entry.date !== filters.date) return false;
    if (filters.status !== 'all' && entry.status !== filters.status) return false;
    if (filters.search) {
      const term = filters.search.toLowerCase();
      const name = (entry.studentName || '').toLowerCase();
      const id = (entry.studentId || '').toLowerCase();
      return name.includes(term) || id.includes(term);
    }
    return true;
  });

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
          <Link to="/admin-dashboard/checkins" className="nav-item active">
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
            <h1>เช็คชื่อรายวัน</h1>
            <p>ตรวจสอบการเช็คชื่อของนักศึกษาทุกวัน</p>
          </div>
          <div className="user-info">
            <span>{adminName}</span>
          </div>
        </header>

        <div className="content-section">
          <div className="checkin-filters">
            <div className="checkin-field">
              <label htmlFor="filter-date">วันที่</label>
              <input
                id="filter-date"
                type="date"
                value={filters.date}
                onChange={(event) => setFilters({ ...filters, date: event.target.value })}
              />
            </div>
            <div className="checkin-field">
              <label htmlFor="filter-status">สถานะ</label>
              <select
                id="filter-status"
                value={filters.status}
                onChange={(event) => setFilters({ ...filters, status: event.target.value })}
              >
                <option value="all">ทั้งหมด</option>
                <option value="present">มา</option>
                <option value="late">สาย</option>
                <option value="absent">ขาด</option>
              </select>
            </div>
            <div className="checkin-field" style={{ flex: 1 }}>
              <label htmlFor="filter-search">ค้นหา</label>
              <input
                id="filter-search"
                type="text"
                placeholder="ชื่อหรือรหัสนักศึกษา"
                value={filters.search}
                onChange={(event) => setFilters({ ...filters, search: event.target.value })}
              />
            </div>
          </div>

          <div className="checkin-table-container">
            <table className="checkin-table">
              <thead>
                <tr>
                  <th>วันที่</th>
                  <th>รหัสนักศึกษา</th>
                  <th>ชื่อ-นามสกุล</th>
                  <th>สถานะ</th>
                  <th>กิจกรรมที่ทำในวันนี้</th>
                  <th>เวลาเช็ค</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan="6">ยังไม่มีข้อมูลการเช็คชื่อ</td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => (
                    <tr key={`${entry.id}-${entry.date}`}>
                      <td>{entry.date}</td>
                      <td>{entry.studentId}</td>
                      <td>{entry.studentName}</td>
                      <td>
                        <span className={`checkin-status ${entry.status}`}>
                          {statusLabel[entry.status]}
                        </span>
                      </td>
                      <td>{entry.note || '-'}</td>
                      <td>{new Date(entry.createdAt).toLocaleString('th-TH')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminCheckInPage;
