import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import './DashboardPage.css'; // Reusing layout styles
import './MyRequestsPage.css'; // Specific styles for this page

const MyRequestsPage = () => {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState(''); 
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [myRequests, setMyRequests] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const mapStatus = (status) => {
    switch(status) {
        case 'submitted': return 'รออนุมัติ';
        case 'advisor_approved': return 'รออนุมัติ (อาจารย์ผ่านแล้ว)'; 
        case 'admin_approved': return 'อนุมัติแล้ว';
        case 'rejected': return 'ไม่อนุมัติ';
        default: return 'รออนุมัติ'; // draft defaults to waiting
    }
  };

  useEffect(() => {
    const fetchRequests = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                
                // Demo Mode: Fetch from LocalStorage for consistency with other roles
                const allRequests = JSON.parse(localStorage.getItem('requests') || '[]');
                // Filter requests for this student (using simple string match for demo, better to use ID)
                // In NewRequestPage we saved studentId as either code or username
                // Let's match roughly
                const myReqs = allRequests.filter(req => 
                    req.studentId == user.student_code || 
                    req.studentId == user.username ||
                    req.studentName === user.full_name ||
                    (user.email && req.studentId === user.email)
                ).map(req => ({
                    ...req,
                    companyName: req.companyName || req.company || 'Unknown Company',
                    position: req.position || 'Unknown Position'
                }));

                setMyRequests(myReqs);
            } else {
                navigate('/login');
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
            setMyRequests([]);
        }
    };
    
    fetchRequests();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const filteredRequests = myRequests.filter(req => {
    const term = searchTerm.toLowerCase();
    const company = (req.companyName || '').toLowerCase();
    const position = (req.position || '').toLowerCase();
    const matchesSearch = company.includes(term) || position.includes(term);
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatThaiDateTime = (dateValue) => {
    if (!dateValue) return { date: '-', time: '-' };
    const dateObj = new Date(dateValue);
    if (Number.isNaN(dateObj.getTime())) return { date: '-', time: '-' };

    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear() + 543; // Buddhist year
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');

    return {
      date: `${day}-${month}-${year}`,
      time: `${hours}:${minutes}:${seconds}`
    };
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'รออาจารย์ที่ปรึกษาอนุมัติ': { bg: '#fff3cd', color: '#856404' },
      'รอผู้ดูแลระบบอนุมัติ': { bg: '#c3dafe', color: '#434190' },
      'อนุมัติแล้ว': { bg: '#d4edda', color: '#155724' },
      'ไม่อนุมัติ (อาจารย์)': { bg: '#f8d7da', color: '#721c24' },
      'ไม่อนุมัติ (Admin)': { bg: '#f8d7da', color: '#721c24' }
    };
    const style = statusStyles[status] || { bg: '#e2e3e5', color: '#383d41' };
    return <span className="status-badge" style={{ backgroundColor: style.bg, color: style.color }}>{status}</span>;
  };

  return (
    <div className="dashboard-container">
      <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
      <div className={`sidebar-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}></div>
      {/* Sidebar - Reused Structure */}
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
          <Link to="/dashboard/my-requests" className="nav-item active">
            <span className="nav-icon">📝</span>
            <span>คำร้องของฉัน</span>
          </Link>
          <Link to="/dashboard/payment-proof" className="nav-item">
            <span className="nav-icon">💰</span>
            <span>หลักฐานการชำระออกฝึก</span>
          </Link>
          <Link to="/dashboard/check-in" className="nav-item">
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
            <h1>คำร้องของฉัน</h1>
            <p>ประวัติและสถานะการยื่นคำร้องทั้งหมด</p>
          </div>
          <div className="user-info">
             <span>{studentName}</span>
          </div>
        </header>

        <div className="content-wrapper">
            {/* Filter Section */}
            <div className="filter-section">
                <div className="search-box">
                    <input 
                        type="text" 
                        placeholder="🔍 ค้นหาบริษัท หรือ ตำแหน่ง..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="status-filter">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">สถานะทั้งหมด</option>
                        <option value="รออนุมัติ">รออนุมัติ</option>
                        <option value="อนุมัติแล้ว">อนุมัติแล้ว</option>
                        <option value="ไม่อนุมัติ">ไม่อนุมัติ</option>
                    </select>
                </div>
            </div>

            {/* Requests Table */}
            <div className="table-container">
                <table className="requests-table">
                    <thead>
                        <tr>
                            <th>บริษัท</th>
                            <th>ตำแหน่ง</th>
                            <th>วันที่ยื่น</th>
                            <th>สถานะ</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRequests.length > 0 ? (
                            filteredRequests.map((req) => (
                                <tr key={req.id}>
                                    <td className="company-name"><span className="compact-text">{req.companyName}</span></td>
                                    <td><span className="compact-text">{req.position}</span></td>
                                    <td>
                                      <div>{formatThaiDateTime(req.submittedDate).date}</div>
                                      <div>{formatThaiDateTime(req.submittedDate).time}</div>
                                    </td>
                                    <td>{getStatusBadge(req.status)}</td>
                                    <td>
                                      <Link to={`/dashboard/request/${req.id}`} className="btn-view">
                                        รายละเอียด
                                      </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                            <td colSpan="5" className="no-data">ไม่พบข้อมูลคำร้อง</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </main>
    </div>
  );
};

export default MyRequestsPage;
