import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';
import lascLogo from '../assets/LASC-SSKRU-1.png';
import sskruLogo from '../assets/SSKRU-logo-400x400-1-192x192.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // 1. Try to find user in localStorage (registered users)
      const usersStr = localStorage.getItem('users');
      const users = usersStr ? JSON.parse(usersStr) : [];
      
      const foundUser = users.find(u => 
        (u.email === formData.email || u.username === formData.email) && 
        u.password === formData.password
      );

      if (foundUser) {
        console.log('Login success:', foundUser);
        localStorage.setItem('user', JSON.stringify(foundUser));
        
        switch(foundUser.role) {
            case 'admin': navigate('/admin-dashboard'); break;
            case 'advisor': navigate('/advisor-dashboard'); break;
            case 'company': navigate('/company-dashboard'); break;
            default: navigate('/dashboard');
        }
        return;
      }

      // If not found in stored users, fallback to mock demo logic (for admin/advisor if not registered)
      if (formData.email.includes('admin') || formData.email.includes('advisor')) {
        let role = 'student';
        if (formData.email.includes('admin')) role = 'admin';
        if (formData.email.includes('advisor')) role = 'advisor';

        const mockUser = {
            _id: 'mock_id_' + Date.now(),
            email: formData.email,
            role: role, 
            name: role === 'admin' ? 'Admin User' : 'Advisor User',
            full_name: role === 'admin' ? 'Admin User' : 'Advisor User',
        };
        localStorage.setItem('user', JSON.stringify(mockUser));
        if (role === 'admin') navigate('/admin-dashboard');
        else if (role === 'advisor') navigate('/advisor-dashboard');
        return;
      }
      
      alert('ไม่พบผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');

    } catch (error) {
      console.error('Login error:', error);
      alert('เข้าสู่ระบบล้มเหลว: ' + (error.response?.data?.message || 'โปรดตรวจสอบความถูกต้อง'));
    }
  };

  return (
    <div className="login-page">
      <header className="top-header">
        <div className="header-content">
            <img src={lascLogo} alt="LASC Logo" className="header-logo" />
        </div>
      </header>
      
      <div className="login-wrapper">
        <div className="login-card-redesigned">
          <div className="left-panel">
            <h2>Professional Internship</h2>
            <p>( ระบบยื่นคำร้องขอเข้าฝึกประสบการณ์วิชาชีพ )</p>
            <div className="university-logo-container">
               <img src={sskruLogo} alt="SSKRU Logo" className="university-logo" />
            </div>
          </div>
          
          <div className="vertical-divider"></div>
          
          <div className="right-panel">
            <h3>ยินดีต้อนรับ</h3>
            <form onSubmit={handleSubmit} className="redesigned-form">
              <div className="input-group">
                <input
                  type="text"
                  name="email"
                  placeholder="Email (อีเมล)"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Password (รหัสผ่าน)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-actions">
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  <span>Remember Me (จดจำการเข้าสู่ระบบ)</span>
                </label>
              </div>

              <div className="button-group">
                <button type="submit" className="btn-login">LOGIN</button>
              </div>
            </form>
          </div>
        </div>
        <div className="bottom-bar"></div>
      </div>
    </div>
  );
};

export default LoginPage;
