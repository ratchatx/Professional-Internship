import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import asyncStorage from '../../../utils/asyncStorage';
import './AdminDashboardPage.css';
import '../../Student/Dashboard/ProfilePage.css';

const AdminProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
    position: ''
  });

  useEffect(() => {
    let mounted = true;
    asyncStorage.getItem('user').then((raw) => {
      if (!mounted) return;
      if (!raw) {
        navigate('/login');
        return;
      }

      try {
        const parsed = JSON.parse(raw);
        if (parsed.role !== 'admin') {
          navigate('/dashboard');
          return;
        }
        setUser(parsed);
        setForm({
          name: parsed.full_name || parsed.name || '',
          email: parsed.email || '',
          username: parsed.username || '',
          phone: parsed.phone || '',
          position: parsed.position || 'ผู้ดูแลระบบ'
        });
        setAvatarPreview(parsed.avatar || null);
      } catch (error) {
        setUser(null);
        navigate('/login');
      }
    });

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleLogout = async () => {
    await asyncStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    if (editing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const updated = {
      ...user,
      ...form,
      full_name: form.name,
      avatar: avatarPreview,
      role: 'admin'
    };
    await asyncStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
    setEditing(false);
  };

  if (!user) return null;

  return (
    <div className="admin-dashboard-container">
      <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        ☰
      </button>
      <div
        className={`sidebar-overlay ${isMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMenuOpen(false)}
      ></div>
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
          <Link to="/admin-dashboard/reports" className="nav-item">
            <span className="nav-icon">📊</span>
            <span>รายงาน</span>
          </Link>
          <Link to="/admin-dashboard/profile" className="nav-item active">
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
            <h1>ข้อมูลผู้ดูแลระบบ</h1>
            <p>จัดการข้อมูลโปรไฟล์และรูปภาพของคุณ</p>
          </div>
          <div className="user-info">
            <span>{user.name || user.username}</span>
          </div>
        </header>

        <div className="content-wrapper profile-content-wrapper">
          <div className="profile-layout">
            <div className="profile-avatar-section">
              <div
                className={`avatar-wrapper ${editing ? 'editable' : ''}`}
                onClick={handleAvatarClick}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile" className="avatar-img" />
                ) : (
                  <div className="avatar-placeholder">
                    <span>{user.username ? user.username.charAt(0).toUpperCase() : 'A'}</span>
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
              <h3 className="profile-name-display">
                {user.full_name || user.name || user.username}
              </h3>
              <span className="profile-role-badge">ผู้ดูแลระบบ</span>
            </div>

            <div className="profile-details-section">
              <div className="section-header-row">
                <h3>รายละเอียดบัญชี</h3>
                {!editing ? (
                  <button className="btn-edit-profile" onClick={() => setEditing(true)}>
                    ✏️ แก้ไขข้อมูล
                  </button>
                ) : (
                  <div className="edit-actions">
                    <button
                      className="btn-cancel-profile"
                      onClick={() => {
                        setEditing(false);
                        setForm({
                          name: user.full_name || user.name || '',
                          email: user.email || '',
                          username: user.username || '',
                          phone: user.phone || '',
                          position: user.position || 'ผู้ดูแลระบบ'
                        });
                        setAvatarPreview(user.avatar || null);
                      }}
                    >
                      ยกเลิก
                    </button>
                    <button className="btn-save-profile" onClick={handleSave}>
                      บันทึกการเปลี่ยนแปลง
                    </button>
                  </div>
                )}
              </div>

              <div className="profile-fields-grid">
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
                  <label>ตำแหน่ง</label>
                  <input
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    disabled={!editing}
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
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </div>

                <div className="form-group-profile">
                  <label>เบอร์โทรศัพท์</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={!editing}
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

export default AdminProfilePage;
