import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './NewRequestPage.css';

const NewRequestPage = () => {
  const navigate = useNavigate();
  const [hasExistingRequest, setHasExistingRequest] = useState(false);
  const alertShown = useRef(false);
  
  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(userStr);

    // Optional: Check for existing active request via API
    // For now, we'll keep it simple or implement check later
  }, [navigate]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasExistingRequest) return;

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      const payload = {
        student_id: user._id, // Assumes user object has Student ID (from profile spread)
        companyName: formData.companyName,
        address: formData.address,
        contactPerson: formData.supervisor,
        contactEmail: formData.supervisorEmail,
        contactPhone: formData.supervisorPhone,
        position: formData.position,
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.jobDescription,
        skills: formData.skills
      };

      await api.post('/requests', payload).catch(e => console.warn("API unavailable, using local storage"));

      // Start: Add to LocalStorage for Demo
      const existingRequests = JSON.parse(localStorage.getItem('requests') || '[]');
      const newRequest = {
        id: Date.now().toString(),
        studentId: user.student_code || user.username || 'N/A',
        studentName: user.full_name || user.name || 'Student',
        department: user.major || 'Computer Engineering',
        company: formData.companyName,
        position: formData.position,
        submittedDate: new Date().toISOString(),
        status: 'รออาจารย์ที่ปรึกษาอนุมัติ', // Step 1: Send to Advisor
        details: payload
      };
      existingRequests.push(newRequest);
      localStorage.setItem('requests', JSON.stringify(existingRequests));
      // End: Add to LocalStorage

      alert('ยื่นคำร้องสำเร็จ! รอการอนุมัติจากอาจารย์ที่ปรึกษา');
      navigate('/dashboard/my-requests');
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('เกิดข้อผิดพลาดในการยื่นคำร้อง: ' + (error.response?.data?.message || error.message));
    }
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
