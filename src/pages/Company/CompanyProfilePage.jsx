import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, TextField } from '@mui/material';
import '../Admin/Dashboard/AdminDashboardPage.css';
import '../Student/Dashboard/ProfilePage.css';

const CompanyProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    companyName: '',
    username: '',
    email: '',
    phone: '',
    contactPerson: '',
    address: ''
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }

    try {
      const parsed = JSON.parse(userStr);
      if (parsed.role !== 'company') {
        navigate('/dashboard');
        return;
      }

      setUser(parsed);
      setAvatarPreview(parsed.avatar || null);
      setForm({
        companyName: parsed.companyName || parsed.name || parsed.full_name || '',
        username: parsed.username || '',
        email: parsed.email || '',
        phone: parsed.phone || '',
        contactPerson: parsed.contactPerson || '',
        address: parsed.address || ''
      });
    } catch (error) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
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
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!user) return;

    const updated = {
      ...user,
      name: form.companyName,
      companyName: form.companyName,
      full_name: form.companyName,
      username: form.username,
      email: form.email,
      phone: form.phone,
      contactPerson: form.contactPerson,
      address: form.address,
      avatar: avatarPreview,
      role: 'company'
    };

    localStorage.setItem('user', JSON.stringify(updated));

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.length > 0) {
      const updatedUsers = users.map((storedUser) => {
        const isSameUser =
          (user.id && storedUser.id === user.id) ||
          (user.username && storedUser.username === user.username) ||
          (user.email && storedUser.email === user.email);

        return isSameUser
          ? {
              ...storedUser,
              name: form.companyName,
              companyName: form.companyName,
              full_name: form.companyName,
              username: form.username,
              email: form.email,
              phone: form.phone,
              contactPerson: form.contactPerson,
              address: form.address,
              avatar: avatarPreview,
              role: 'company'
            }
          : storedUser;
      });

      localStorage.setItem('users', JSON.stringify(updatedUsers));
    }

    setUser(updated);
    setEditing(false);
  };

  if (!user) return null;

  return (
    <div className="admin-dashboard-container">
      <div className="mobile-top-navbar">
        <Link to="/" className="mobile-top-logo" aria-label="LASC Home"></Link>
        <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
      </div>
      <div className={`sidebar-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}></div>
      <aside className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>สถานประกอบการ</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/company-dashboard" className="nav-item">
            <span>หน้าหลัก</span>
          </Link>
          <Link to="/company-dashboard/interns" className="nav-item">
            <span>รายชื่อนักศึกษาฝึกงาน</span>
          </Link>
          <Link to="/company-dashboard/profile" className="nav-item active">
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
            <h1>ข้อมูลสถานประกอบการ</h1>
            <p>จัดการข้อมูลโปรไฟล์บริษัท</p>
          </div>
          <div className="user-info">
            <span>{form.companyName}</span>
          </div>
        </header>

        <div className="content-wrapper profile-content-wrapper">
          <div className="profile-layout">
            <div className="profile-avatar-section">
              <div className={`avatar-wrapper ${editing ? 'editable' : ''}`} onClick={handleAvatarClick}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Company" className="avatar-img" />
                ) : (
                  <div className="avatar-placeholder">
                    <span>{(form.companyName || 'C').charAt(0).toUpperCase()}</span>
                  </div>
                )}
                {editing && (
                  <div className="avatar-overlay">
                    <span>แก้ไขรูป</span>
                  </div>
                )}
              </div>
              <Input
                type="file"
                inputRef={fileInputRef}
                onChange={handleFileChange}
                sx={{ display: 'none' }}
                inputProps={{ accept: 'image/*' }}
              />
              <h3 className="profile-name-display">{form.companyName || '-'}</h3>
              <span className="profile-role-badge">สถานประกอบการ</span>
            </div>

            <div className="profile-details-section">
              <div className="section-header-row">
                <h3>รายละเอียดบัญชี</h3>
                {!editing ? (
                  <Button variant="outlined" onClick={() => setEditing(true)}>แก้ไขข้อมูล</Button>
                ) : (
                  <div className="edit-actions">
                    <Button
                      variant="text"
                      color="inherit"
                      onClick={() => {
                        setEditing(false);
                        setForm({
                          companyName: user.companyName || user.name || user.full_name || '',
                          username: user.username || '',
                          email: user.email || '',
                          phone: user.phone || '',
                          contactPerson: user.contactPerson || '',
                          address: user.address || ''
                        });
                        setAvatarPreview(user.avatar || null);
                      }}
                    >
                      ยกเลิก
                    </Button>
                    <Button variant="contained" onClick={handleSave}>บันทึกการเปลี่ยนแปลง</Button>
                  </div>
                )}
              </div>

              <div className="profile-fields-grid">
                <div className="form-group-profile">
                  <TextField
                    fullWidth
                    label="ชื่อบริษัท"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </div>

                <div className="form-group-profile">
                  <TextField
                    fullWidth
                    label="ชื่อผู้ใช้ (Username)"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </div>

                <div className="form-group-profile">
                  <TextField
                    fullWidth
                    type="email"
                    label="อีเมล"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </div>

                <div className="form-group-profile">
                  <TextField
                    fullWidth
                    label="เบอร์โทรศัพท์"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </div>

                <div className="form-group-profile">
                  <TextField
                    fullWidth
                    label="ผู้ติดต่อ"
                    name="contactPerson"
                    value={form.contactPerson}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </div>

                <div className="form-group-profile">
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="ที่อยู่บริษัท"
                    name="address"
                    value={form.address}
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

export default CompanyProfilePage;
