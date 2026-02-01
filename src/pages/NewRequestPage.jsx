import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './NewRequestPage.css';
import './Dashboard/DashboardPage.css'; // Import dashboard styles

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

    // Prefill student-related fields if available from the logged-in user
    setFormData(prev => ({
      ...prev,
      studentName: user.full_name || user.name || prev.studentName,
      studentEmail: user.email || prev.studentEmail,
      studentId: user.student_code || user.username || prev.studentId,
      studentMajor: user.major || prev.studentMajor,
      studentFaculty: user.faculty || prev.studentFaculty,
      studentPhone: user.phone || prev.studentPhone
    }));

    // Optional: Check for existing active request via API
    // For now, we'll keep it simple or implement check later
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const [formData, setFormData] = useState({
    companyName: '',
    position: '',
    startDate: '',
    endDate: '',
    address: '',
    supervisor: '',
    supervisorEmail: '',
    supervisorPhone: '',
    supervisorPosition: '',

    // Student personal fields
    studentTitle: '',
    studentName: '',
    studentEmail: '',
    studentId: '',
    studentYear: '',
    studentMajor: '',
    studentFaculty: '',
    homeHouse: '',
    homeMoo: '',
    homeTambon: '',
    homeAmphur: '',
    homeProvince: '',
    homePostal: '',
    studentPhone: '',

    jobDescription: '',
    skills: ''
  });

  const [studentPhoto, setStudentPhoto] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setStudentPhoto(null);
      return;
    }
    if (file.type !== 'application/pdf') {
      alert('กรุณาอัพโหลดไฟล์เป็นรูปแบบ PDF เท่านั้น');
      e.target.value = null;
      return;
    }
    setStudentPhoto(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasExistingRequest) return;

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      let photoData = null;
      if (studentPhoto) {
        photoData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(studentPhoto);
        });
      }

      const payload = {
        student_id: user._id, // Assumes user object has Student ID (from profile spread)
        student_info: {
          title: formData.studentTitle,
          name: formData.studentName,
            email: formData.studentEmail,
          studentId: formData.studentId,
          year: formData.studentYear,
          major: formData.studentMajor,
          faculty: formData.studentFaculty,
          address: {
            house: formData.homeHouse,
            moo: formData.homeMoo,
            tambon: formData.homeTambon,
            amphur: formData.homeAmphur,
            province: formData.homeProvince,
            postal: formData.homePostal
          },
          phone: formData.studentPhone
        },
        companyName: formData.companyName,
        address: formData.address,
        contactPerson: formData.supervisor,
        contactPosition: formData.supervisorPosition,
        contactEmail: formData.supervisorEmail,
        contactPhone: formData.supervisorPhone,
        position: formData.position,
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.jobDescription,
        skills: formData.skills
        ,
        studentPhoto: photoData ? { name: studentPhoto.name, data: photoData } : null
      };

      await api.post('/requests', payload).catch(e => console.warn("API unavailable, using local storage"));

      // Start: Add to LocalStorage for Demo
      const existingRequests = JSON.parse(localStorage.getItem('requests') || '[]');
      const newRequest = {
        id: Date.now().toString(),
        studentId: formData.studentId || user.student_code || user.username || 'N/A',
        studentName: formData.studentName || user.full_name || user.name || 'Student',
        department: formData.studentMajor || user.major || 'Computer Engineering',
        company: formData.companyName,
        position: formData.position,
        submittedDate: new Date().toISOString(),
        status: 'รออาจารย์ที่ปรึกษาอนุมัติ', // Step 1: Send to Advisor
        details: payload,
        studentPhotoName: studentPhoto ? studentPhoto.name : null
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
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>🎓 นักศึกษา</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item">
            <span className="nav-icon">🏠</span>
            <span>หน้าหลัก</span>
          </Link>
          <Link to="/dashboard/new-request" className="nav-item active">
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
          <Link to="/dashboard/profile" className="nav-item">
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
        <div className="new-request-content"> {/* Renamed from container to avoid full height issues if any */}
          <div className="new-request-header">
            {/* Removed Back Button as we have sidebar now */}
            <h1>📝 ยื่นคำร้องฝึกงานวิชาชีพ</h1>
            <p>กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง</p>
          </div>

          <form onSubmit={handleSubmit} className="request-form">
            <div className="form-section">
              <h2>ข้อมูลส่วนตัวนักศึกษา</h2>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="studentTitle">คำนำหน้า</label>
                  <select id="studentTitle" name="studentTitle" value={formData.studentTitle} onChange={handleChange}>
                    <option value="">-- เลือก --</option>
                    <option value="นาย">นาย</option>
                    <option value="นาง">นาง</option>
                    <option value="นางสาว">นางสาว</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="studentName">ชื่อ-นามสกุล</label>
                  <input type="text" id="studentName" name="studentName" value={formData.studentName} onChange={handleChange} placeholder="ชื่อ-นามสกุล" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="studentId">รหัสนักศึกษา</label>
                  <input type="text" id="studentId" name="studentId" value={formData.studentId} onChange={handleChange} placeholder="รหัสนักศึกษา" />
                </div>

                <div className="form-group">
                  <label htmlFor="studentYear">ปีการศึกษา/ชั้นปี</label>
                  <input type="text" id="studentYear" name="studentYear" value={formData.studentYear} onChange={handleChange} placeholder="เช่น ปี 4" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="studentMajor">สาขา</label>
                  <input type="text" id="studentMajor" name="studentMajor" value={formData.studentMajor} onChange={handleChange} placeholder="สาขา" />
                </div>

                <div className="form-group">
                  <label htmlFor="studentFaculty">คณะ/วิทยาลัย</label>
                  <input type="text" id="studentFaculty" name="studentFaculty" value={formData.studentFaculty} onChange={handleChange} placeholder="คณะ/วิทยาลัย" />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="homeAddress">ที่อยู่ตามบัตรประชาชน</label>
                <div className="form-row">
                  <input type="text" id="homeHouse" name="homeHouse" value={formData.homeHouse} onChange={handleChange} placeholder="บ้านเลขที่" />
                  <input type="text" id="homeMoo" name="homeMoo" value={formData.homeMoo} onChange={handleChange} placeholder="หมู่" />
                </div>
                <div className="form-row">
                  <input type="text" id="homeTambon" name="homeTambon" value={formData.homeTambon} onChange={handleChange} placeholder="ตำบล" />
                  <input type="text" id="homeAmphur" name="homeAmphur" value={formData.homeAmphur} onChange={handleChange} placeholder="อำเภอ" />
                </div>
                <div className="form-row">
                  <input type="text" id="homeProvince" name="homeProvince" value={formData.homeProvince} onChange={handleChange} placeholder="จังหวัด" />
                  <input type="text" id="homePostal" name="homePostal" value={formData.homePostal} onChange={handleChange} placeholder="รหัสไปรษณีย์" />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="studentPhone">เบอร์โทรศัพท์</label>
                <input type="tel" id="studentPhone" name="studentPhone" value={formData.studentPhone} onChange={handleChange} placeholder="094-xxxxxxx" />
              </div>
              <div className="form-group">
                <label htmlFor="studentEmail">อีเมลล์</label>
                <input type="email" id="studentEmail" name="studentEmail" value={formData.studentEmail} onChange={handleChange} placeholder="student@university.ac.th" />
              </div>
              <div className="form-group">
                <label htmlFor="studentPhoto">อัพโหลดรูปถ่ายนักศึกษา (PDF)</label>
                <input
                  type="file"
                  id="studentPhoto"
                  name="studentPhoto"
                  accept="application/pdf"
                  onChange={handleFileChange}
                />
                {studentPhoto && (
                  <p className="file-info">ไฟล์ที่เลือก: {studentPhoto.name}</p>
                )}
              </div>
            </div>

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

              <h3>ข้อมูลหัวหน้าหน่วยงาน/ผู้ดูแล</h3>
              <div className="form-group">
                <label htmlFor="supervisor"></label>
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
                  <label htmlFor="supervisorPosition">ตำแหน่ง</label>
                  <input
                    type="text"
                    id="supervisorPosition"
                    name="supervisorPosition"
                    value={formData.supervisorPosition}
                    onChange={handleChange}
                    placeholder="ตำแหน่งหัวหน้าหน่วยงาน"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="supervisorEmail">อีเมลหัวหน้าหน่วยงาน</label>
                  <input
                    type="email"
                    id="supervisorEmail"
                    name="supervisorEmail"
                    value={formData.supervisorEmail}
                    onChange={handleChange}
                    placeholder="supervisor@company.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="supervisorPhone">เบอร์โทรหัวหน้าหน่วยงาน</label>
                <input
                  type="tel"
                  id="supervisorPhone"
                  name="supervisorPhone"
                  value={formData.supervisorPhone}
                  onChange={handleChange}
                  placeholder="0812345678"
                />
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
      </main>
    </div>
  );
};

export default NewRequestPage;
