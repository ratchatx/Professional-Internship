import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NewRequestPage.css';

const NewRequestPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    position: '',
    startDate: '',
    endDate: '',
    address: '',
    supervisor: '',
    supervisorEmail: '',
    supervisorPhone: '',
    jobDescription: '',
    skills: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('New internship request:', formData);
    alert('ยื่นคำร้องสำเร็จ! รอการอนุมัติจากผู้ดูแลระบบ');
    navigate('/dashboard');
  };

  return (
    <div className="new-request-container">
      <div className="new-request-header">
        <Link to="/dashboard" className="back-button">
          ← กลับ
        </Link>
        <h1>📝 ยื่นคำร้องฝึกงานวิชาชีพ</h1>
        <p>กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง</p>
      </div>

      <form onSubmit={handleSubmit} className="request-form">
        <div className="form-section">
          <h2>ข้อมูลสถานประกอบการ</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="companyName">ชื่อบริษัท/องค์กร *</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="เช่น บริษัท ABC จำกัด"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="position">ตำแหน่งที่ฝึกงาน *</label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="เช่น Web Developer"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">ที่อยู่สถานประกอบการ *</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="ระบุที่อยู่ครบถ้วน"
              rows="3"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">วันที่เริ่มฝึกงาน *</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">วันที่สิ้นสุดฝึกงาน *</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>ข้อมูลพี่เลี้ยง/ผู้ดูแล</h2>
          
          <div className="form-group">
            <label htmlFor="supervisor">ชื่อพี่เลี้ยง/ผู้ดูแล *</label>
            <input
              type="text"
              id="supervisor"
              name="supervisor"
              value={formData.supervisor}
              onChange={handleChange}
              placeholder="ชื่อ-นามสกุล"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="supervisorEmail">อีเมลพี่เลี้ยง *</label>
              <input
                type="email"
                id="supervisorEmail"
                name="supervisorEmail"
                value={formData.supervisorEmail}
                onChange={handleChange}
                placeholder="supervisor@company.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="supervisorPhone">เบอร์โทรพี่เลี้ยง *</label>
              <input
                type="tel"
                id="supervisorPhone"
                name="supervisorPhone"
                value={formData.supervisorPhone}
                onChange={handleChange}
                placeholder="0812345678"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>รายละเอียดงานที่ฝึก</h2>
          
          <div className="form-group">
            <label htmlFor="jobDescription">รายละเอียดงาน *</label>
            <textarea
              id="jobDescription"
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleChange}
              placeholder="อธิบายลักษณะงานที่จะทำระหว่างฝึกงาน"
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="skills">ทักษะที่คาดว่าจะได้รับ *</label>
            <textarea
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="เช่น React, Node.js, Database Design"
              rows="3"
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <Link to="/dashboard" className="btn-cancel">
            ยกเลิก
          </Link>
          <button type="submit" className="btn-submit">
            ยื่นคำร้อง
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewRequestPage;
