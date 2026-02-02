import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import asyncStorage from '../../utils/asyncStorage';
import './DashboardPage.css'; // Shared dashboard layout
import './ProfilePage.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    username: '', 
    phone: '', 
    studentId: '',
    major: ''
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    asyncStorage.getItem('user').then((raw) => {
      if (!mounted) return;
      if (raw) {
        try {
          const u = JSON.parse(raw);
          setUser(u);
          setForm({ 
            name: u.full_name || u.name || '', 
            email: u.email || '', 
            username: u.username || '',
            phone: u.phone || '',
            studentId: u.studentId || '',
            major: u.major || ''
          });
          setAvatarPreview(u.avatar || null);
        } catch (e) {
          setUser(null);
        }
      } else {
          navigate('/login');
      }
    });
    return () => (mounted = false);
  }, [navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAvatarClick = () => {
    if (editing) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const updated = { 
        ...user, 
        ...form,
        full_name: form.name, // Ensure consistency
        avatar: avatarPreview 
    };
    await asyncStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
    setEditing(false);
  };

  const handleLogout = async () => {
    await asyncStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  if (!user) return null; // Or loading spinner

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
          <Link to="/dashboard/profile" className="nav-item active">
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
            <h1>ข้อมูลส่วนตัว</h1>
            <p>จัดการข้อมูลโปรไฟล์และรูปภาพของคุณ</p>
          </div>
          <div className="user-info">
             <span>{user.name || user.username}</span>
          </div>
        </header>

        <div className="content-wrapper profile-content-wrapper">
          <div className="profile-layout">
            {/* Left Column: Avatar */}
            <div className="profile-avatar-section">
                <div className={`avatar-wrapper ${editing ? 'editable' : ''}`} onClick={handleAvatarClick}>
                    {avatarPreview ? (
                        <img src={avatarPreview} alt="Profile" className="avatar-img" />
                    ) : (
                        <div className="avatar-placeholder">
                            <span>{user.username ? user.username.charAt(0).toUpperCase() : 'U'}</span>
                        </div>
                    )}
                    
                    {editing && (
                        <div className="avatar-overlay">
                            <span>📷 แก้ไขรูป</span>
                        </div>
                    )}
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    style={{ display: 'none' }} 
                    accept="image/*"
                />
                <h3 className="profile-name-display">{user.full_name || user.name || user.username}</h3>
                <span className="profile-role-badge">นักศึกษา</span>
            </div>

            {/* Right Column: Details */}
            <div className="profile-details-section">
                <div className="section-header-row">
                    <h3>รายละเอียดบัญชี</h3>
                    {!editing ? (
                        <button className="btn-edit-profile" onClick={() => setEditing(true)}>
                            ✏️ แก้ไขข้อมูล
                        </button>
                    ) : (
                        <div className="edit-actions">
                            <button className="btn-cancel-profile" onClick={() => {
                                setEditing(false);
                                // Reset form to original values
                                setForm({ 
                                    name: user.full_name || user.name || '', 
                                    email: user.email || '', 
                                    username: user.username || '',
                                    phone: user.phone || '',
                                    studentId: user.studentId || '',
                                    major: user.major || ''
                                });
                                setAvatarPreview(user.avatar || null);
                            }}>ยกเลิก</button>
                            <button className="btn-save-profile" onClick={handleSave}>บันทึกการเปลี่ยนแปลง</button>
                        </div>
                    )}
                </div>

                <div className="profile-fields-grid">
                    <div className="form-group-profile">
                        <label>รหัสนักศึกษา</label>
                        <input 
                            name="studentId" 
                            value={form.studentId} 
                            onChange={handleChange} 
                            disabled={!editing}
                            placeholder="ระบุรหัสนักศึกษา"
                        />
                    </div>

                    <div className="form-group-profile">
                        <label>ชื่อ-นามสกุล</label>
                        <input 
                            name="name" 
                            value={form.name} 
                            onChange={handleChange} 
                            disabled={!editing} 
                        />
                    </div>
                    
                    <div className="form-group-profile">
                        <label>สาขาวิชา</label>
                        <input 
                            name="major" 
                            value={form.major} 
                            onChange={handleChange} 
                            disabled={!editing}
                            placeholder="เช่น วิทยาการคอมพิวเตอร์"
                        />
                    </div>

                    <div className="form-group-profile">
                        <label>ชื่อผู้ใช้ (Username)</label>
                        <input 
                            name="username" 
                            value={form.username} 
                            onChange={handleChange} 
                            disabled={!editing} 
                        />
                    </div>

                    <div className="form-group-profile">
                        <label>อีเมล</label>
                        <input 
                            name="email" 
                            value={form.email} 
                            onChange={handleChange} 
                            disabled={true} 
                            style={{ cursor: 'not-allowed', backgroundColor: '#f1f5f9' }}
                        />
                    </div>

                     <div className="form-group-profile">
                        <label>เบอร์โทรศัพท์</label>
                        <input 
                            name="phone" 
                            value={form.phone} 
                            onChange={handleChange} 
                            disabled={!editing}
                            placeholder="09x-xxx-xxxx"
                        />
                    </div>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
