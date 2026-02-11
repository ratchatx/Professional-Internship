import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './NewRequestPage.css';
import './Dashboard/DashboardPage.css'; // Import dashboard styles

const NewRequestPage = () => {
  const departmentOptions = [
    'สาขาวิชาวิทยาการคอมพิวเตอร์',
    'สาขาวิชาเทคโนโลยีคอมพิวเตอร์และดิจิทัล',
    'สาขาวิชาสาธารณสุขชุมชน',
    'สาขาวิชาวิทยาศาสตร์การกีฬา',
    'สาขาวิชาเทคโนโลยีการเกษตร',
    'สาขาวิชาเทคโนโลยีและนวัตกรรมอาหาร',
    'สาขาวิชาอาชีวอนามัยและความปลอดภัย',
    'สาขาวิชาวิศวกรรมซอฟต์แวร์',
    'สาขาวิชาวิศวกรรมโลจิสติกส์',
    'สาขาวิศวกรรมการจัดการอุตสาหกรรมและสิ่งแวดล้อม',
    'สาขาวิชาการออกแบบผลิตภัณฑ์และนวัตกรรมวัสดุ',
    'สาขาวิชาเทคโนโลยีโยธาและสถาปัตยกรรม'
  ];
  const navigate = useNavigate();
  const [hasExistingRequest, setHasExistingRequest] = useState(false);
  const alertShown = useRef(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const MAX_LOCAL_STORAGE_IMAGE_SIZE = 512 * 1024; // 512KB limit for demo storage
  const [provinceOptions, setProvinceOptions] = useState([]);
  const [amphureOptions, setAmphureOptions] = useState([]);
  const [tambonOptions, setTambonOptions] = useState([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState(null);
  const [selectedAmphureId, setSelectedAmphureId] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [useManualAddress, setUseManualAddress] = useState(false);
  
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

    // Optional: Check for existing active request
    const allRequests = JSON.parse(localStorage.getItem('requests') || '[]');
    // Find any request that is NOT rejected
    const REJECTED_STATUSES = ['ไม่อนุมัติ (อาจารย์)', 'ไม่อนุมัติ (Admin)', 'ปฏิเสธ'];
    
    // Check against multiple possible ID fields for robustness
    const activeRequest = allRequests.find(req => 
      (req.studentId == user.student_code || 
       req.studentId == user.username || 
       (user.email && req.studentId === user.email)) &&
      !REJECTED_STATUSES.includes(req.status)
    );

    if (activeRequest) {
      setHasExistingRequest(true);
    }

  }, [navigate]);

  useEffect(() => {
    let mounted = true;
    const loadAddressData = async () => {
      setAddressLoading(true);
      setAddressError('');
      try {
        const [provinceRes, amphureRes, tambonRes] = await Promise.all([
          fetch('https://raw.githubusercontent.com/kongvut/thai-province-data/master/api/latest/province.json'),
          fetch('https://raw.githubusercontent.com/kongvut/thai-province-data/master/api/latest/district.json'),
          fetch('https://raw.githubusercontent.com/kongvut/thai-province-data/master/api/latest/sub_district.json')
        ]);

        if (!provinceRes.ok || !amphureRes.ok || !tambonRes.ok) {
          throw new Error('Failed to load address data');
        }

        const [provinces, amphures, tambons] = await Promise.all([
          provinceRes.json(),
          amphureRes.json(),
          tambonRes.json()
        ]);

        if (!mounted) return;
        setProvinceOptions(provinces);
        setAmphureOptions(amphures);
        setTambonOptions(tambons);
        setUseManualAddress(false);
      } catch (error) {
        if (!mounted) return;
        setAddressError('ไม่สามารถโหลดข้อมูลจังหวัด/อำเภอ/ตำบลได้');
        setUseManualAddress(true);
      } finally {
        if (mounted) setAddressLoading(false);
      }
    };

    loadAddressData();
    return () => {
      mounted = false;
    };
  }, []);

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
    lastSemesterGrade: '',
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

  const handleProvinceChange = (e) => {
    const value = e.target.value;
    const matched = provinceOptions.find((p) => p.name_th === value);
    setSelectedProvinceId(matched ? matched.id : null);
    setSelectedAmphureId(null);
    setFormData((prev) => ({
      ...prev,
      homeProvince: value,
      homeAmphur: '',
      homeTambon: '',
      homePostal: ''
    }));
  };

  const handleAmphureChange = (e) => {
    const value = e.target.value;
    const matched = amphureOptions.find(
      (a) => a.name_th === value && a.province_id === selectedProvinceId
    );
    setSelectedAmphureId(matched ? matched.id : null);
    setFormData((prev) => ({
      ...prev,
      homeAmphur: value,
      homeTambon: '',
      homePostal: ''
    }));
  };

  const handleTambonChange = (e) => {
    const value = e.target.value;
    const matched = tambonOptions.find(
      (t) => t.name_th === value && t.district_id === selectedAmphureId
    );
    setFormData((prev) => ({
      ...prev,
      homeTambon: value,
      homePostal: matched?.zip_code ? String(matched.zip_code) : ''
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setStudentPhoto(null);
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('กรุณาอัพโหลดไฟล์รูปภาพ (JPG, PNG) หรือ PDF เท่านั้น');
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

      const canStorePhotoLocally = photoData && photoData.length <= MAX_LOCAL_STORAGE_IMAGE_SIZE;
      const storePhotoNotice = studentPhoto && !canStorePhotoLocally;
      const trySetLocalStorage = (key, value) => {
        try {
          localStorage.setItem(key, value);
          return true;
        } catch (err) {
          console.error(`Failed to write ${key} to localStorage`, err);
          return false;
        }
      };

      const payload = {
        student_id: user._id, // Assumes user object has Student ID (from profile spread)
        student_info: {
          title: formData.studentTitle,
          name: formData.studentName,
            email: formData.studentEmail,
          studentId: formData.studentId,
          year: formData.studentYear,
          lastSemesterGrade: formData.lastSemesterGrade,
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

      let apiAvailable = Boolean(api.defaults.baseURL);
      if (apiAvailable) {
        try {
          await api.post('/requests', payload);
        } catch (err) {
          apiAvailable = false;
          console.warn('API unavailable, using local storage');
        }
      } else {
        console.warn('API base URL not set, using local storage');
      }

      // Start: Add to LocalStorage for Demo
      const existingRequests = JSON.parse(localStorage.getItem('requests') || '[]');
      
      // Update User Avatar if photo is an image
      if (studentPhoto && studentPhoto.type.startsWith('image/') && canStorePhotoLocally) {
         try {
             // Update local user object
             const latestUser = { ...user, avatar: photoData };
             trySetLocalStorage('user', JSON.stringify(latestUser));
             
             // Update users list in storage if it exists (for sync across simulated users)
             const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
             const userIndex = allUsers.findIndex(u => u.username === user.username || u.email === user.email);
             if (userIndex !== -1) {
                 allUsers[userIndex].avatar = photoData;
                 trySetLocalStorage('users', JSON.stringify(allUsers));
             }
         } catch (err) {
             console.error("Failed to update user avatar", err);
         }
      }

      const storedPhoto = canStorePhotoLocally
        ? { name: studentPhoto?.name || null, data: photoData }
        : (studentPhoto ? { name: studentPhoto.name, data: null } : null);

      const newRequest = {
        id: Date.now().toString(),
        studentId: formData.studentId || user.student_code || user.username || 'N/A',
        studentName: formData.studentName || user.full_name || user.name || 'Student',
        department: formData.studentMajor || user.major || 'Computer Engineering',
        company: formData.companyName,
        position: formData.position,
        submittedDate: new Date().toISOString(),
        status: 'รออาจารย์ที่ปรึกษาอนุมัติ', // Step 1: Send to Advisor
        details: { ...payload, studentPhoto: storedPhoto },
        studentPhotoName: studentPhoto ? studentPhoto.name : null,
        studentAvatar: (studentPhoto && studentPhoto.type.startsWith('image/') && canStorePhotoLocally) ? photoData : null 
      };
      existingRequests.push(newRequest);
      const saved = trySetLocalStorage('requests', JSON.stringify(existingRequests));
      // End: Add to LocalStorage

      if (!saved) {
        throw new Error('Local storage is full. Please clear browser storage and try again.');
      }

      const successMessage = storePhotoNotice
        ? 'ยื่นคำร้องสำเร็จ! รอการอนุมัติจากอาจารย์ที่ปรึกษา\nรูปภาพมีขนาดใหญ่ จึงไม่ถูกบันทึกในเครื่อง (โหมดเดโม)'
        : 'ยื่นคำร้องสำเร็จ! รอการอนุมัติจากอาจารย์ที่ปรึกษา';
      alert(successMessage);
      navigate('/dashboard/my-requests');
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('เกิดข้อผิดพลาดในการยื่นคำร้อง: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="dashboard-container">
      <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
      <div className={`sidebar-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}></div>
      <aside className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
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
          <Link to="/dashboard/check-in" className="nav-item">
            <span className="nav-icon">✅</span>
            <span>เช็คชื่อรายวัน</span>
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


          {/* Modal for existing request */}
          {hasExistingRequest && (
            <div className="modal-overlay" style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}>
              <div className="modal-content" style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '8px',
                width: '90%',
                maxWidth: '500px',
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>⚠️</span>
                <h2 style={{ marginBottom: '1rem', color: '#e53e3e' }}>ไม่สามารถยื่นคำร้องใหม่ได้</h2>
                <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  คุณมีคำร้องที่อยู่ระหว่างการดำเนินการ <br/>
                  ระบบจำกัดการยื่นคำร้อง 1 รายการต่อ 1 บัญชีเท่านั้น
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="btn-secondary"
                    style={{ padding: '0.75rem 1.5rem', cursor: 'pointer' }}
                  >
                    กลับหน้าหลัก
                  </button>
                  <button 
                    onClick={() => navigate('/dashboard/my-requests')}
                    className="btn-primary"
                    style={{ padding: '0.75rem 1.5rem', cursor: 'pointer', background: '#3182ce', color: 'white', border: 'none', borderRadius: '4px' }}
                  >
                    ดูสถานะคำร้อง
                  </button>
                </div>
              </div>
            </div>
          )}
          
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
                  <label htmlFor="lastSemesterGrade">เกรดเฉลี่ยเทอมล่าสุด</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.00"
                    id="lastSemesterGrade"
                    name="lastSemesterGrade"
                    value={formData.lastSemesterGrade}
                    onChange={handleChange}
                    placeholder="เช่น 3.50"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="studentMajor">สาขา</label>
                  <select id="studentMajor" name="studentMajor" value={formData.studentMajor} onChange={handleChange}>
                    <option value="">เลือกสาขา</option>
                    {departmentOptions.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
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
                {addressError && (
                  <p className="field-hint" style={{ color: '#c53030' }}>{addressError}</p>
                )}
                <div className="form-row">
                  {useManualAddress ? (
                    <>
                      <input type="text" id="homeTambon" name="homeTambon" value={formData.homeTambon} onChange={handleChange} placeholder="ตำบล" />
                      <input type="text" id="homeAmphur" name="homeAmphur" value={formData.homeAmphur} onChange={handleChange} placeholder="อำเภอ" />
                    </>
                  ) : (
                    <>
                      <select id="homeProvince" name="homeProvince" value={formData.homeProvince} onChange={handleProvinceChange}>
                        <option value="">เลือกจังหวัด</option>
                        {provinceOptions.map((province) => (
                          <option key={province.id} value={province.name_th}>{province.name_th}</option>
                        ))}
                      </select>
                      <select id="homeAmphur" name="homeAmphur" value={formData.homeAmphur} onChange={handleAmphureChange} disabled={!selectedProvinceId}>
                        <option value="">เลือกอำเภอ</option>
                        {amphureOptions
                          .filter((amphure) => amphure.province_id === selectedProvinceId)
                          .map((amphure) => (
                            <option key={amphure.id} value={amphure.name_th}>{amphure.name_th}</option>
                          ))}
                      </select>
                    </>
                  )}
                </div>
                <div className="form-row">
                  {useManualAddress ? (
                    <>
                      <input type="text" id="homeProvince" name="homeProvince" value={formData.homeProvince} onChange={handleChange} placeholder="จังหวัด" />
                      <input type="text" id="homePostal" name="homePostal" value={formData.homePostal} onChange={handleChange} placeholder="รหัสไปรษณีย์" />
                    </>
                  ) : (
                    <>
                      <select id="homeTambon" name="homeTambon" value={formData.homeTambon} onChange={handleTambonChange} disabled={!selectedAmphureId}>
                        <option value="">เลือกตำบล</option>
                        {tambonOptions
                          .filter((tambon) => tambon.district_id === selectedAmphureId)
                          .map((tambon) => (
                            <option key={tambon.id} value={tambon.name_th}>{tambon.name_th}</option>
                          ))}
                      </select>
                      <input type="text" id="homePostal" name="homePostal" value={formData.homePostal} onChange={handleChange} placeholder="รหัสไปรษณีย์" readOnly />
                    </>
                  )}
                </div>
                {addressLoading && (
                  <p className="field-hint">กำลังโหลดข้อมูลที่อยู่...</p>
                )}
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
                <label htmlFor="studentPhoto">อัพโหลดรูปถ่ายนักศึกษา (JPG/PNG หรือ PDF)</label>
                <input
                  type="file"
                  id="studentPhoto"
                  name="studentPhoto"
                  accept="image/png, image/jpeg, application/pdf"
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
