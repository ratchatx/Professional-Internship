import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'student' // student or admin
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', formData);

    // Simulate functionality - Save to localStorage
    const userInfo = {
      name: formData.userType === 'admin' ? 'Admin User' : 
            formData.userType === 'advisor' ? 'อาจารย์ที่ปรึกษา' :
            formData.userType === 'company' ? 'HR บริษัท' : 'นายสมชาย ใจดี',
      role: formData.userType,
      email: formData.email
    };
    localStorage.setItem('user', JSON.stringify(userInfo));

    // Navigate to dashboard based on role
    if (formData.userType === 'admin') {
      navigate('/admin-dashboard');
    } else if (formData.userType === 'advisor') {
      navigate('/advisor-dashboard');
    } else if (formData.userType === 'company') {
      navigate('/company-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-section">
            🎓
          </div>
          <h1>เข้าสู่ระบบ</h1>
          <p>ระบบคำร้องฝึกงานวิชาชีพ</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="userType">ประเภทผู้ใช้</label>
            <select
              id="userType"
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              required
            >
              <option value="student">นักศึกษา</option>
              <option value="advisor">อาจารย์ที่ปรึกษา</option>
              <option value="company">บริษัท/สถานประกอบการ</option>
              <option value="admin">ผู้ดูแลระบบ</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="email">อีเมล</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="กรอกอีเมลของคุณ"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">รหัสผ่าน</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="กรอกรหัสผ่าน"
              required
            />
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>จดจำฉันไว้</span>
            </label>
            <Link to="/forgot-password" className="forgot-link">
              ลืมรหัสผ่าน?
            </Link>
          </div>

          <button type="submit" className="login-btn">
            เข้าสู่ระบบ
          </button>
        </form>

        <div className="login-footer">
          <p>
            ยังไม่มีบัญชี?{' '}
            <Link to="/register" className="register-link">
              ลงทะเบียนเลย
            </Link>
          </p>
          <Link to="/" className="back-link">
            ← กลับหน้าแรก
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
