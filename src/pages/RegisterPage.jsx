import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentId: '',
    fullName: '',
    email: '',
    phone: '',
    department: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('รหัสผ่านไม่ตรงกัน!');
      return;
    }

    // Add your registration logic here
    console.log('Registration attempt:', formData);
    // Navigate to login after successful registration
    navigate('/login');
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <div className="logo-section">
            🎓
          </div>
          <h1>ลงทะเบียนนักศึกษา</h1>
          <p>สร้างบัญชีเพื่อยื่นคำร้องฝึกงาน</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="studentId">รหัสนักศึกษา</label>
              <input
                type="text"
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="เช่น 6512345678"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="fullName">ชื่อ-นามสกุล</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="กรอกชื่อและนามสกุล"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">อีเมล</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@university.ac.th"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">เบอร์โทรศัพท์</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0812345678"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="department">สาขาวิชา</label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            >
              <option value="">เลือกสาขาวิชา</option>
              <option value="วิศวกรรมคอมพิวเตอร์">วิศวกรรมคอมพิวเตอร์</option>
              <option value="วิศวกรรมไฟฟ้า">วิศวกรรมไฟฟ้า</option>
              <option value="บริหารธุรกิจ">บริหารธุรกิจ</option>
              <option value="วิศวกรรมเครื่องกล">วิศวกรรมเครื่องกล</option>
              <option value="อื่นๆ">อื่นๆ</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">รหัสผ่าน</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="อย่างน้อย 6 ตัวอักษร"
                required
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                required
                minLength="6"
              />
            </div>
          </div>

          <div className="terms-section">
            <label className="terms-checkbox">
              <input type="checkbox" required />
              <span>
                ข้าพเจ้ายอมรับ <Link to="/terms">เงื่อนไขและข้อกำหนด</Link>
              </span>
            </label>
          </div>

          <button type="submit" className="register-btn">
            ลงทะเบียน
          </button>
        </form>

        <div className="register-footer">
          <p>
            มีบัญชีอยู่แล้ว?{' '}
            <Link to="/login" className="login-link">
              เข้าสู่ระบบ
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

export default RegisterPage;
