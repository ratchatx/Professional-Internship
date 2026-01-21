import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import asyncStorage from '../../utils/asyncStorage';
import './ProfilePage.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', username: '' });
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    asyncStorage.getItem('user').then((raw) => {
      if (!mounted) return;
      if (raw) {
        try {
          const u = JSON.parse(raw);
          setUser(u);
          setForm({ name: u.name || '', email: u.email || '', username: u.username || '' });
        } catch (e) {
          setUser(null);
        }
      }
    });
    return () => (mounted = false);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    const updated = { ...user, ...form };
    await asyncStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
    setEditing(false);
  };

  const handleLogout = async () => {
    await asyncStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <h2>ไม่ได้ล็อกอิน</h2>
          <p>กรุณาเข้าสู่ระบบเพื่อดูข้อมูลโปรไฟล์</p>
          <div className="profile-actions">
            <Link to="/login" className="btn btn-primary">เข้าสู่ระบบ</Link>
            <Link to="/register" className="btn btn-secondary">ลงทะเบียน</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>ข้อมูลโปรไฟล์</h2>
        {!editing ? (
          <div className="profile-info">
            <p><strong>ชื่อ:</strong> {user.name || user.username || '-'}</p>
            <p><strong>อีเมล:</strong> {user.email || '-'}</p>
            <p><strong>ชื่อผู้ใช้:</strong> {user.username || '-'}</p>
          </div>
        ) : (
          <div className="profile-form">
            <label>
              ชื่อ
              <input name="name" value={form.name} onChange={handleChange} />
            </label>
            <label>
              อีเมล
              <input name="email" value={form.email} onChange={handleChange} />
            </label>
            <label>
              ชื่อผู้ใช้
              <input name="username" value={form.username} onChange={handleChange} />
            </label>
          </div>
        )}

        <div className="profile-actions">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>กลับ</button>
          {editing ? (
            <>
              <button className="btn btn-primary" onClick={handleSave}>บันทึก</button>
              <button className="btn btn-secondary" onClick={() => setEditing(false)}>ยกเลิก</button>
            </>
          ) : (
            <>
              <button className="btn btn-primary" onClick={() => setEditing(true)}>แก้ไขโปรไฟล์</button>
              <button className="btn btn-secondary" onClick={handleLogout}>ออกจากระบบ</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
