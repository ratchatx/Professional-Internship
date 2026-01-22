import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './DashboardPage.css'; // Reusing layout styles
import './MyRequestsPage.css'; // Specific styles for this page

const MyRequestsPage = () => {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState(''); 
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [myRequests, setMyRequests] = useState([]);

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
                if (user.role !== 'student') {
                    navigate('/admin-dashboard'); 
                    return;
                }
                setStudentName(user.full_name || user.name);

                // Fetch from API
                const response = await api.get(`/requests?student_id=${user._id}`);
                
                const transformed = response.data.map(req => ({
                    id: req._id,
                    companyName: req.company?.company_name || 'ไม่ระบุ',
                    position: req.position,
                    status: mapStatus(req.status),
                    submittedDate: req.request_date ? new Date(req.request_date).toLocaleDateString('th-TH') : '-'
                }));

                setMyRequests(transformed);
            } else {
                navigate('/login');
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
            // Fallback or empty on error
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
    const matchesSearch = req.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          req.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusStyles = {
      'รออนุมัติ': { bg: '#fff3cd', color: '#856404' },
      'อนุมัติแล้ว': { bg: '#d4edda', color: '#155724' },
      'ไม่อนุมัติ': { bg: '#f8d7da', color: '#721c24' }
    };
    const style = statusStyles[status] || { bg: '#e2e3e5', color: '#383d41' };
    return <span className="status-badge" style={{ backgroundColor: style.bg, color: style.color }}>{status}</span>;
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar - Reused Structure */}
      <aside className="sidebar">
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
          <Link to="/dashboard/profile" className="nav-item">
            <span className="nav-icon">👤</span>
            <span>โปรไฟล์</span>
          </Link>
          <Link to="/dashboard/settings" className="nav-item">
            <span className="nav-icon">⚙️</span>
            <span>ตั้งค่า</span>
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
                            <th>ประเภท</th>
                            <th>วันที่ยื่น</th>
                            <th>สถานะ</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRequests.length > 0 ? (
                            filteredRequests.map((req) => (
                                <tr key={req.id}>
                                    <td className="company-name">{req.companyName}</td>
                                    <td>{req.position}</td>
                                    <td>{req.type}</td>
                                    <td>{req.submittedDate}</td>
                                    <td>{getStatusBadge(req.status)}</td>
                                    <td>
                                        <button className="btn-view">ดูรายละเอียด</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="no-data">ไม่พบข้อมูลคำร้อง</td>
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
