import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import asyncStorage from '../../utils/asyncStorage';
import './AdminDashboardPage.css';
import './AdminUserManagementPage.css';

const AdminUserManagementPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [adminName, setAdminName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'student',
    studentId: '', // For students
    department: '', // For students/advisors
    address: '', // For companies
    phone: '', // For companies/students
    contactPerson: '' // For companies
  });

  useEffect(() => {
    const checkAdmin = async () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role !== 'admin') {
           navigate('/dashboard'); 
           return;
        }
        setAdminName(user.name || 'Admin');
      } else {
        navigate('/login');
        return;
      }

      // Load users
      const storedUsers = await asyncStorage.getItem('users');
      let parsedUsers = storedUsers ? JSON.parse(storedUsers) : [];
      
      // Initial seed if empty (for demo)
      if (parsedUsers.length === 0) {
        parsedUsers = [
          { id: '1', username: 'admin', password: 'password', name: 'Admin User', role: 'admin' },
          { id: '2', username: 'advisor', password: 'password', name: 'Dr. Advisor', role: 'advisor', department: 'Computer Engineering' },
          { id: '3', username: 'student1', password: 'password', name: 'Student One', role: 'student', studentId: '65000001', department: 'Computer Engineering' }
        ];
        await asyncStorage.setItem('users', JSON.stringify(parsedUsers));
      }
      setUsers(parsedUsers);
    };

    checkAdmin();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username || user.email || '',
        password: user.password || '',
        name: user.name || user.full_name || '',
        role: user.role || 'student',
        studentId: user.studentId || user.student_code || '',
        department: user.department || user.major || '',
        address: user.address || '',
        phone: user.phone || '',
        contactPerson: user.contactPerson || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        password: '',
        name: '',
        role: 'student',
        studentId: '',
        department: '',
        address: '',
        phone: '',
        contactPerson: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.username || !formData.name || !formData.role) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน (Username, ชื่อ, ตำแหน่ง)');
      return;
    }

    let updatedUsers = [...users];

    if (editingUser) {
      // Update
      updatedUsers = updatedUsers.map(u => 
        u.id === editingUser.id ? { 
          ...u, 
          username: formData.username,
          password: formData.password || u.password,
          name: formData.name,
          role: formData.role,
          studentId: formData.studentId,
          department: formData.department,
          address: formData.address,
          phone: formData.phone,
          contactPerson: formData.contactPerson,
          // Adapting fields to match inconsistent schema if needed
          email: formData.username,
          full_name: formData.name,
          student_code: formData.studentId,
          major: formData.department
        } : u
      );
    } else {
      // Add
      const newUser = {
        id: Date.now().toString(),
        username: formData.username,
        password: formData.password || '123456',
        name: formData.name,
        role: formData.role,
        studentId: formData.studentId,
        department: formData.department,
        address: formData.address,
        phone: formData.phone,
        contactPerson: formData.contactPerson,
        email: formData.username,
        full_name: formData.name,
        student_code: formData.studentId,
        major: formData.department
      };
      updatedUsers.push(newUser);
    }

    setUsers(updatedUsers);
    await asyncStorage.setItem('users', JSON.stringify(updatedUsers));
    handleCloseModal();
  };

  const handleDelete = async (id) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าจะลบผู้ใช้นี้?')) {
      const updatedUsers = users.filter(u => u.id !== id);
      setUsers(updatedUsers);
      await asyncStorage.setItem('users', JSON.stringify(updatedUsers));
    }
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case 'admin': return <span className="status-badge" style={{background: '#805ad5', color: 'white'}}>ผู้ดูแลระบบ</span>;
      case 'advisor': return <span className="status-badge" style={{background: '#3182ce', color: 'white'}}>อาจารย์</span>;
      case 'student': return <span className="status-badge" style={{background: '#38a169', color: 'white'}}>นักศึกษา</span>;
      case 'company': return <span className="status-badge" style={{background: '#d69e2e', color: 'white'}}>บริษัท</span>;
      default: return <span className="status-badge">{role}</span>;
    }
  };

  const departments = [...new Set(users.map(u => u.department || u.major).filter(Boolean))];

  const filteredUsers = users.filter(user => {
      if (selectedDepartment === 'all') return true;
      const userDept = user.department || user.major;
      return userDept === selectedDepartment;
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
          <Link to="/admin-dashboard/users" className="nav-item active">
            <span className="nav-icon">⚙️</span>
            <span>จัดการผู้ใช้</span>
          </Link>
          <Link to="/admin-dashboard/payments" className="nav-item">
            <span className="nav-icon">💰</span>
            <span>ตรวจสอบการชำระเงิน</span>
          </Link>
          <Link to="/admin-dashboard/reports" className="nav-item">
            <span className="nav-icon">📊</span>
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
            <h1>จัดการผู้ใช้</h1>
            <p>เพิ่ม ลบ แก้ไข ข้อมูลผู้ใช้งานในระบบ</p>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
             <span>สวัสดี, {adminName}</span>
          </div>
        </header>

        <div className="content-section">
          <div className="user-management-actions" style={{justifyContent: 'space-between', alignItems: 'center'}}>
             <div className="filter-group" style={{display: 'flex', gap: 10, alignItems: 'center'}}>
                <label>คัดกรองสาขา:</label>
                <select 
                    value={selectedDepartment} 
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    style={{padding: '5px 10px', borderRadius: '4px', border: '1px solid #ddd'}}
                >
                    <option value="all">ทั้งหมด</option>
                    {departments.map((dept, idx) => (
                        <option key={idx} value={dept}>{dept}</option>
                    ))}
                </select>
             </div>
            <button className="btn-add-user" onClick={() => handleOpenModal()}>
              <span>+</span> เพิ่มผู้ใช้ใหม่
            </button>
          </div>

          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ชื่อผู้ใช้/Email</th>
                  <th>ชื่อ-นามสกุล</th>
                  <th>บทบาท</th>
                  <th>รายละเอียดเพิ่มเติม</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.username || user.email}</td>
                    <td>{user.name || user.full_name}</td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td>
                      {user.role === 'student' && user.studentId && <div>รหัส: {user.studentId}</div>}
                      {user.department && <div style={{fontSize: '0.85em', color: '#666'}}>สาขา: {user.department}</div>}
                      {user.role === 'company' && (
                        <>
                           {user.contactPerson && <div style={{fontSize: '0.85em', color: '#666'}}>ผู้ติดต่อ: {user.contactPerson}</div>}
                           {user.phone && <div style={{fontSize: '0.85em', color: '#666'}}>โทร: {user.phone}</div>}
                        </>
                      )}
                    </td>
                    <td>
                      <button className="btn-edit-user" onClick={() => handleOpenModal(user)}>แก้ไข</button>
                      <button className="btn-delete-user" onClick={() => handleDelete(user.id)}>ลบ</button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>ไม่พบข้อมูลผู้ใช้</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingUser ? 'แก้ไขข้อมูลผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-group">
                <label>ชื่อผู้ใช้ (Username/Email)</label>
                <input 
                  type="text" 
                  name="username" 
                  value={formData.username} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>รหัสผ่าน (Password)</label>
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleInputChange} 
                  placeholder={editingUser ? 'เว้นว่างหากไม่ต้องการเปลี่ยน' : ''}
                />
              </div>
              <div className="form-group">
                <label>{formData.role === 'company' ? 'ชื่อบริษัท' : 'ชื่อ-นามสกุล'}</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>บทบาท (Role)</label>
                <select name="role" value={formData.role} onChange={handleInputChange}>
                  <option value="student">นักศึกษา</option>
                  <option value="advisor">อาจารย์ที่ปรึกษา</option>
                  <option value="company">บริษัท</option>
                  <option value="admin">ผู้ดูแลระบบ</option>
                </select>
              </div>

              {formData.role === 'student' && (
                <div className="form-group">
                  <label>รหัสนักศึกษา</label>
                  <input 
                    type="text" 
                    name="studentId" 
                    value={formData.studentId} 
                    onChange={handleInputChange} 
                  />
                </div>
              )}

              {(formData.role === 'student' || formData.role === 'advisor') && (
                <div className="form-group">
                  <label>สาขาวิชา</label>
                  <input 
                    type="text" 
                    name="department" 
                    value={formData.department} 
                    onChange={handleInputChange} 
                  />
                </div>
              )}

              {formData.role === 'company' && (
                <>
                  <div className="form-group">
                    <label>ชื่อผู้ติดต่อ</label>
                    <input 
                      type="text" 
                      name="contactPerson" 
                      value={formData.contactPerson} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  <div className="form-group">
                    <label>เบอร์โทรศัพท์</label>
                    <input 
                      type="text" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  <div className="form-group">
                    <label>ที่อยู่บริษัท</label>
                    <textarea 
                      name="address" 
                      value={formData.address} 
                      onChange={handleInputChange} 
                      rows="3"
                      style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd'}}
                    />
                  </div>
                </>
              )}

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>ยกเลิก</button>
                <button type="submit" className="btn-submit">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagementPage;
