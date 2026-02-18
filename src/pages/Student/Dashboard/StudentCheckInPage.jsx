import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, MenuItem, Button } from '@mui/material';
import './DashboardPage.css';
import '../../Admin/Shared/CheckInPage.css';

const StudentCheckInPage = () => {
  const navigate = useNavigate();
  const todayDate = new Date().toISOString().slice(0, 10);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [message, setMessage] = useState('');
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [currentRequestStatus, setCurrentRequestStatus] = useState('ไม่มีคำร้อง');
  const [form, setForm] = useState({
    date: todayDate,
    status: 'present',
    note: ''
  });

  const getRequestStatusDisplay = (status) => {
    if (status === 'รออาจารย์ที่ปรึกษาอนุมัติ') return 'รออาจารย์อนุมัติ';
    if (status === 'รอผู้ดูแลระบบอนุมัติ' || status === 'รอผู้ดูแลระบบตรวจสอบ') return 'รอแอดมินอนุมัติ';
    if (status === 'รอสถานประกอบการตอบรับ') return 'รอบริษัทอนุมัติ';
    if (!status || status === 'ไม่มีคำร้อง') return 'ยังไม่มีคำร้อง';
    return status;
  };

  const getRequestStatusStyle = (status) => {
    if (status === 'ออกฝึกงาน' || status === 'ฝึกงานเสร็จแล้ว') {
      return { background: '#d4edda', color: '#155724' };
    }
    if (status === 'อนุมัติแล้ว') {
      return { background: '#e6fffa', color: '#0c5460' };
    }
    if (status.includes('ไม่อนุมัติ') || status === 'ปฏิเสธ') {
      return { background: '#f8d7da', color: '#721c24' };
    }
    if (status === 'ไม่มีคำร้อง') {
      return { background: '#e2e3e5', color: '#495057' };
    }
    return { background: '#fff3cd', color: '#856404' };
  };

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
    const studentId = parsed.student_code || parsed.username || parsed.email;
    const requests = JSON.parse(localStorage.getItem('requests') || '[]');
    const ownRequests = requests.filter((request) => {
      const requestStudentId = request.studentId || request.student_code || request.username || request.email;
      return requestStudentId === studentId;
    });

    const latestRequest = [...ownRequests].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.submittedDate || 0).getTime();
      const dateB = new Date(b.updatedAt || b.submittedDate || 0).getTime();
      if (dateA !== dateB) return dateB - dateA;
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    })[0];

    setCurrentRequestStatus(latestRequest?.status || 'ไม่มีคำร้อง');

    const isInternshipStarted = ownRequests.some((request) => request.status === 'ออกฝึกงาน');

    setCanCheckIn(isInternshipStarted);

    if (!isInternshipStarted) {
      setMessage('ยังไม่สามารถใช้งานเช็คชื่อรายวันได้ กรุณารอให้ผู้ดูแลระบบกดเริ่มฝึกงานก่อน');
      return;
    }

    const stored = JSON.parse(localStorage.getItem('daily_checkins') || '[]');
    const ownEntries = stored.filter((entry) => entry.studentId === studentId);
    ownEntries.sort((a, b) => b.date.localeCompare(a.date));
    setEntries(ownEntries);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
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
    if (!user || !canCheckIn) return;

    if (form.date !== todayDate) {
      setMessage('เช็คชื่อได้เฉพาะวันที่ปัจจุบันเท่านั้น');
      return;
    }

    const studentId = user.student_code || user.username || user.email;
    const studentName = user.full_name || user.name || user.username || 'นักศึกษา';
    const stored = JSON.parse(localStorage.getItem('daily_checkins') || '[]');

    const existingIndex = stored.findIndex(
      (entry) => entry.studentId === studentId && entry.date === form.date
    );

    if (existingIndex >= 0) {
      setMessage('คุณเช็คชื่อวันที่นี้แล้ว (เช็คชื่อได้วันละ 1 ครั้ง)');
      return;
    }

    const payload = {
      id: Date.now(),
      studentId,
      studentName,
      date: form.date,
      status: form.status,
      note: form.note || '',
      createdAt: new Date().toISOString()
    };

    stored.push(payload);
    setMessage('บันทึกการเช็คชื่อเรียบร้อยแล้ว');

    localStorage.setItem('daily_checkins', JSON.stringify(stored));
    const ownEntries = stored.filter((entry) => entry.studentId === studentId);
    ownEntries.sort((a, b) => b.date.localeCompare(a.date));
    setEntries(ownEntries);
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <div className="mobile-top-navbar">
        <Link to="/" className="mobile-top-logo" aria-label="LASC Home"></Link>
        <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
      </div>
      <div className={`sidebar-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}></div>
      <aside className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>นักศึกษา</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item">
            <span>หน้าหลัก</span>
          </Link>
          <Link to="/dashboard/new-request" className="nav-item">
            <span>ยื่นคำร้องใหม่</span>
          </Link>
          <Link to="/dashboard/my-requests" className="nav-item">
            <span>คำร้องของฉัน</span>
          </Link>
          <Link to="/dashboard/payment-proof" className="nav-item">
            <span>หลักฐานการชำระออกฝึก</span>
          </Link>
          <Link to="/dashboard/check-in" className="nav-item active">
            <span>เช็คชื่อรายวัน</span>
          </Link>
          <Link to="/dashboard/profile" className="nav-item">
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
          {!canCheckIn ? (
            <div className="checkin-card">
              <h3>ยังไม่สามารถเช็คชื่อได้</h3>
              <p style={{ marginTop: '0.5rem' }}>
                สถานะคำร้องปัจจุบัน:{' '}
                <span className="status-badge" style={getRequestStatusStyle(currentRequestStatus)}>
                  {getRequestStatusDisplay(currentRequestStatus)}
                </span>
              </p>
              <p>หน้านี้จะใช้งานได้เมื่อผู้ดูแลระบบกด “เริ่มฝึกงาน” ให้คุณแล้วเท่านั้น</p>
              <div className="checkin-actions" style={{ marginTop: '1rem' }}>
                <Link to="/dashboard/my-requests" className="checkin-submit" style={{ textDecoration: 'none' }}>
                  ไปที่คำร้องของฉัน
                </Link>
              </div>
              {message && <div className="checkin-message">{message}</div>}
            </div>
          ) : (
            <>
              <div className="checkin-card">
                <h3>บันทึกการเช็คชื่อ</h3>
                <p style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                  สถานะคำร้องปัจจุบัน:{' '}
                  <span className="status-badge" style={getRequestStatusStyle(currentRequestStatus)}>
                    {getRequestStatusDisplay(currentRequestStatus)}
                  </span>
                </p>
                <form onSubmit={handleSubmit}>
                  <div className="checkin-fields">
                    <div className="checkin-field">
                      <TextField
                        fullWidth
                        size="small"
                        label="วันที่"
                        type="date"
                        value={form.date}
                        onChange={() => {}}
                        inputProps={{ min: todayDate, max: todayDate, readOnly: true }}
                        helperText="ระบบกำหนดให้เช็คชื่อได้เฉพาะวันปัจจุบัน"
                        InputLabelProps={{ shrink: true }}
                        required
                      />
                    </div>
                    <div className="checkin-field">
                      <TextField
                        fullWidth
                        size="small"
                        label="สถานะ"
                        select
                        value={form.status}
                        onChange={(event) => setForm({ ...form, status: event.target.value })}
                      >
                        <MenuItem value="present">มา</MenuItem>
                        <MenuItem value="late">สาย</MenuItem>
                        <MenuItem value="absent">ขาด</MenuItem>
                      </TextField>
                    </div>
                    <div className="checkin-field" style={{ gridColumn: '1 / -1' }}>
                      <TextField
                        fullWidth
                        label="หมายเหตุเพิ่มเติม"
                        multiline
                        rows={4}
                        placeholder="เช่น มาสายเพราะ..."
                        value={form.note}
                        onChange={(event) => setForm({ ...form, note: event.target.value })}
                      />
                    </div>
                  </div>
                  <div className="checkin-actions">
                    <Button type="submit" variant="contained" className="checkin-submit">บันทึกเช็คชื่อ</Button>
                  </div>
                </form>
                {message && <div className="checkin-message">{message}</div>}
              </div>

              <div className="checkin-table-wrapper">
                <h3>ประวัติการเช็คชื่อ</h3>
                <TableContainer className="checkin-table-container">
                  <Table size="small" className="checkin-table" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>วันที่</TableCell>
                        <TableCell>สถานะ</TableCell>
                        <TableCell>หมายเหตุ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {entries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3}>ยังไม่มีประวัติการเช็คชื่อ</TableCell>
                        </TableRow>
                      ) : (
                        entries.map((entry) => (
                          <TableRow key={entry.id} hover>
                            <TableCell>{entry.date}</TableCell>
                            <TableCell>
                              <span className={`checkin-status ${entry.status}`}>
                                {statusLabel[entry.status]}
                              </span>
                            </TableCell>
                            <TableCell>{entry.note || '-'}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentCheckInPage;
