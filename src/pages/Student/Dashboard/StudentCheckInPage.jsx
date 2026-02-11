import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './DashboardPage.css';
import '../../Admin/Shared/CheckInPage.css';

const StudentCheckInPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    status: 'present',
    note: ''
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }

    const parsed = JSON.parse(userStr);
    if (parsed.role === 'admin') {
      navigate('/admin-dashboard');
      return;
    }
    if (parsed.role === 'advisor') {
      navigate('/advisor-dashboard');
      return;
    }
    if (parsed.role === 'company') {
      navigate('/company-dashboard');
      return;
    }
    if (parsed.role !== 'student') {
      navigate('/login');
      return;
    }

    setUser(parsed);
    const stored = JSON.parse(localStorage.getItem('daily_checkins') || '[]');
    const studentId = parsed.student_code || parsed.username || parsed.email;
    const ownEntries = stored.filter((entry) => entry.studentId === studentId);
    ownEntries.sort((a, b) => b.date.localeCompare(a.date));
    setEntries(ownEntries);
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

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!user) return;

    const studentId = user.student_code || user.username || user.email;
    const studentName = user.full_name || user.name || user.username || 'นักศึกษา';
    const stored = JSON.parse(localStorage.getItem('daily_checkins') || '[]');

    const existingIndex = stored.findIndex(
      (entry) => entry.studentId === studentId && entry.date === form.date
    );

    const payload = {
      id: existingIndex >= 0 ? stored[existingIndex].id : Date.now(),
      studentId,
      studentName,
      date: form.date,
      status: form.status,
      note: form.note || '',
      createdAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      stored[existingIndex] = payload;
      setMessage('อัปเดตการเช็คชื่อเรียบร้อยแล้ว');
    } else {
      stored.push(payload);
      setMessage('บันทึกการเช็คชื่อเรียบร้อยแล้ว');
    }

    localStorage.setItem('daily_checkins', JSON.stringify(stored));
    const ownEntries = stored.filter((entry) => entry.studentId === studentId);
    ownEntries.sort((a, b) => b.date.localeCompare(a.date));
    setEntries(ownEntries);
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
      <div className={`sidebar-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}></div>
      <aside className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>🎓 นักศึกษา</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item">
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
          <Link to="/dashboard/check-in" className="nav-item active">
            <span className="nav-icon">✅</span>
            <span>เช็คชื่อรายวัน</span>
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
          <div>
            <h1>เช็คชื่อรายวัน</h1>
            <p>รายงานตัวให้เจ้าหน้าที่รับทราบในแต่ละวัน</p>
          </div>
          <div className="user-info">
            <span>{user.full_name || user.name || user.username}</span>
          </div>
        </header>

        <div className="content-wrapper">
          <div className="checkin-card">
            <h3>บันทึกการเช็คชื่อ</h3>
            <form onSubmit={handleSubmit}>
              <div className="checkin-fields">
                <div className="checkin-field">
                  <label htmlFor="checkin-date">วันที่</label>
                  <input
                    id="checkin-date"
                    type="date"
                    value={form.date}
                    onChange={(event) => setForm({ ...form, date: event.target.value })}
                    required
                  />
                </div>
                <div className="checkin-field">
                  <label htmlFor="checkin-status">สถานะ</label>
                  <select
                    id="checkin-status"
                    value={form.status}
                    onChange={(event) => setForm({ ...form, status: event.target.value })}
                  >
                    <option value="present">มา</option>
                    <option value="late">สาย</option>
                    <option value="absent">ขาด</option>
                  </select>
                </div>
                <div className="checkin-field" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="checkin-note">หมายเหตุเพิ่มเติม</label>
                  <textarea
                    id="checkin-note"
                    placeholder="เช่น มาสายเพราะ..."
                    value={form.note}
                    onChange={(event) => setForm({ ...form, note: event.target.value })}
                  />
                </div>
              </div>
              <div className="checkin-actions">
                <button type="submit" className="checkin-submit">บันทึกเช็คชื่อ</button>
              </div>
            </form>
            {message && <div className="checkin-message">{message}</div>}
          </div>

          <div className="checkin-table-wrapper">
            <h3>ประวัติการเช็คชื่อ</h3>
            <div className="checkin-table-container">
              <table className="checkin-table">
                <thead>
                  <tr>
                    <th>วันที่</th>
                    <th>สถานะ</th>
                    <th>หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan="3">ยังไม่มีประวัติการเช็คชื่อ</td>
                    </tr>
                  ) : (
                    entries.map((entry) => (
                      <tr key={entry.id}>
                        <td>{entry.date}</td>
                        <td>
                          <span className={`checkin-status ${entry.status}`}>
                            {statusLabel[entry.status]}
                          </span>
                        </td>
                        <td>{entry.note || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentCheckInPage;
