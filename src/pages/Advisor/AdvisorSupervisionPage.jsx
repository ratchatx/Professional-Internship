import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Admin/Dashboard/AdminDashboardPage.css';

const AdvisorSupervisionPage = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [supervisionList, setSupervisionList] = useState([]);
    const [advisorName, setAdvisorName] = useState('');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }
        const user = JSON.parse(userStr);
        if (user.role !== 'advisor') {
            navigate('/dashboard');
            return;
        }
        setAdvisorName(user.name);

        // Load requests
        const allRequests = JSON.parse(localStorage.getItem('requests') || '[]');
        
        // Filter for active internships (Approved or Started) related to this advisor's students
        // For simplicity in this demo, we assume all 'active' internships are visible to the advisor
        // We filter for status "ออกฝึกงาน" (Internship Started) as these are the ones needing supervision
        const activeInternships = allRequests.filter(req => 
            req.status === 'ออกฝึกงาน' || req.status === 'อนุมัติแล้ว'
        );

        // Group by Company
        const groupedByCompany = activeInternships.reduce((acc, curr) => {
            const company = curr.company || curr.companyName || 'Unknown Company';
            if (!acc[company]) {
                acc[company] = {
                    name: company,
                    address: curr.details?.address || 'ไม่ระบุที่อยู่',
                    students: []
                };
            }
            acc[company].students.push(curr);
            return acc;
        }, {});

        setSupervisionList(Object.values(groupedByCompany));

    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
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
                    <Link to="/advisor-dashboard" className="nav-item">
                        <span className="nav-icon">🏠</span>
                        <span>หน้าหลัก</span>
                    </Link>
                    <Link to="/advisor-dashboard/students" className="nav-item">
                        <span className="nav-icon">🎓</span>
                        <span>รายชื่อนักศึกษาฝึกงาน</span>
                    </Link>
                    <Link to="/advisor-dashboard/supervision" className="nav-item active">
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
                        <h1>ตารางนิเทศงานสหกิจศึกษา</h1>
                        <p>รายการสถานประกอบการที่ต้องออกนิเทศ</p>
                    </div>
                </header>

                <div className="content-section">
                    
                    {supervisionList.length > 0 ? (
                        <div className="supervision-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px', marginTop: '20px' }}>
                            {supervisionList.map((company, index) => (
                                <div key={index} className="company-card" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderTop: '4px solid #667eea' }}>
                                    <div style={{ marginBottom: '15px' }}>
                                        <h3 style={{ margin: '0 0 10px 0', color: '#2d3748' }}>🏢 {company.name}</h3>
                                        <p style={{ color: '#718096', fontSize: '0.9rem', display: 'flex', gap: '5px' }}>
                                            📍 <span>{company.address}</span>
                                        </p>
                                    </div>
                                    
                                    <div style={{ borderTop: '1px solid #edf2f7', paddingTop: '15px' }}>
                                        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#4a5568' }}>นักศึกษาที่ต้องนิเทศ ({company.students.length})</h4>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {company.students.map((student, sIndex) => (
                                                <li key={sIndex} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: sIndex !== company.students.length - 1 ? '1px dashed #edf2f7' : 'none' }}>
                                                    <span style={{ fontWeight: 500 }}>{student.studentName}</span>
                                                    <span style={{ fontSize: '0.85rem', color: '#718096', background: '#edf2f7', padding: '2px 6px', borderRadius: '4px' }}>
                                                        {student.position}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div style={{ marginTop: '15px' }}>
                                       <button style={{ width: '100%', padding: '8px', background: '#ebf4ff', color: '#4299e1', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
                                            บันทึกผลการนิเทศ
                                       </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state" style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '8px', marginTop: '20px' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🧘‍♂️</div>
                            <h3>ยังไม่มีรายการนิเทศงาน</h3>
                            <p style={{ color: '#718096' }}>ไม่มีนักศึกษาที่กำลังฝึกงาน หรือยังไม่ถึงกำหนดการนิเทศ</p>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

export default AdvisorSupervisionPage;
