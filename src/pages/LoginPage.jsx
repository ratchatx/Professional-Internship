import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Mock Login Implementation since backend is disconnected
      // const response = await api.post('/users/login', {
      //   email: formData.email,
      //   password: formData.password
      // });
      // const user = response.data.user;

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const user = {
        _id: 'mock_id_12345',
        email: formData.email,
        role: formData.userType, // Use the selected type from dropdown
        profile: {
          firstName: 'Exam',
          lastName: 'User'
        }
      };

      console.log('Mock login success:', user);
      
      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify({
        ...user,
        // Map backend role to frontend expected role if names differ, but they seem to match (student, advisor, admin)
        // If profile exists, merge it
        ...(user.profile || {})
      }));

      // Navigate based on role
      // Note: The backend role is 'student', 'advisor', 'admin'. 
      // Ensure these match your routes.
      
      if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (user.role === 'advisor') {
        navigate('/advisor-dashboard');
      } else if (user.role === 'company') { // If you added company role later
        navigate('/company-dashboard');
      } else {
        navigate('/dashboard'); // Student dashboard
      }

    } catch (error) {
      console.error('Login error:', error);
      alert('เข้าสู่ระบบล้มเหลว: ' + (error.response?.data?.message || 'โปรดตรวจสอบความถูกต้อง'));
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
