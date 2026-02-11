import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import asyncStorage from '../../../utils/asyncStorage';
import '../../Student/Dashboard/DashboardPage.css';
import '../../Student/NewRequestPage.css';
import '../../Student/Dashboard/ProfilePage.css';

const StudentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // Try to load from stored users
      const usersRaw = await asyncStorage.getItem('users');
      const users = usersRaw ? JSON.parse(usersRaw) : [];
      let matched = users.find(u => u.student_code === id || u.username === id || u.studentId === id);

      let info = null;

      if (matched) {
        info = {
          studentId: matched.student_code || matched.studentId || matched.username,
          title: matched.title || matched.studentTitle || '',
          name: matched.full_name || matched.name || matched.studentName || '',
          email: matched.email || matched.studentEmail || '',
          year: matched.year || matched.studentYear || '',
          lastSemesterGrade: matched.lastSemesterGrade || '',
          major: matched.major || matched.studentMajor || matched.department || '',
          faculty: matched.faculty || matched.studentFaculty || '',
          phone: matched.phone || matched.studentPhone || '',
          homeHouse: matched.homeHouse || matched.home_house || '',
          homeMoo: matched.homeMoo || matched.home_moo || '',
          homeTambon: matched.homeTambon || matched.home_tambon || '',
          homeAmphur: matched.homeAmphur || matched.home_amphur || '',
          homeProvince: matched.homeProvince || matched.home_province || '',
          homePostal: matched.homePostal || matched.home_postal || '',
          studentPhoto: matched.studentPhoto || matched.photo || null,
          raw: matched
        };
      }

      // If not found in users, try to pull from requests localStorage (older demos store details there)
      if (!info) {
        const requestsRaw = localStorage.getItem('requests');
        const requests = requestsRaw ? JSON.parse(requestsRaw) : [];
        const req = requests.find(r => r.studentId === id || (r.details && r.details.student_info && (r.details.student_info.studentId === id || r.details.student_info.studentId === id)));
        if (req) {
          const s = req.details && req.details.student_info ? req.details.student_info : {};
          info = {
            studentId: req.studentId || s.studentId || s.studentId,
            title: s.title || s.studentTitle || '',
            name: s.name || req.studentName || s.full_name || '',
            email: s.email || s.studentEmail || req.contactEmail || '',
            year: s.year || s.studentYear || '',
            lastSemesterGrade: s.lastSemesterGrade || '',
            major: s.major || s.studentMajor || req.department || '',
            faculty: s.faculty || s.studentFaculty || '',
            phone: s.phone || s.studentPhone || req.studentPhone || '',
            homeHouse: s.homeHouse || s.home_house || '',
            homeMoo: s.homeMoo || s.home_moo || '',
            homeTambon: s.homeTambon || s.home_tambon || '',
            homeAmphur: s.homeAmphur || s.home_amphur || '',
            homeProvince: s.homeProvince || s.home_province || '',
            homePostal: s.homePostal || s.home_postal || '',
            studentPhoto: (req.details && req.details.studentPhoto) || req.studentPhoto || (s.studentPhoto || null),
            raw: req
          };
        }
      }

      setStudent(info || null);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <div style={{ padding: 20 }}>กำลังโหลด...</div>;
  if (!student) return (
    <div style={{ padding: 20 }}>
      <p>ไม่พบข้อมูลนักศึกษาที่ระบุ</p>
      <button onClick={() => navigate(-1)}>ย้อนกลับ</button>
    </div>
  );

  return (
    <div className="dashboard-container">
      <aside className="sidebar" />
      <main className="dashboard-main">
        <div className="new-request-header">
          <h1>ข้อมูลนักศึกษา</h1>
          <p>รายละเอียดของนักศึกษา</p>
        </div>

        <div className="request-form" style={{ maxWidth: 900 }}>
          <div className="form-section">
            <h2>ข้อมูลพื้นฐาน</h2>
            <div className="form-row">
              <div className="form-group">
                <label>รหัสนักศึกษา</label>
                <div>{student.studentId || '-'}</div>
              </div>
              <div className="form-group">
                <label>ชื่อ-นามสกุล</label>
                <div>{(student.title ? student.title + ' ' : '') + (student.name || '-')}</div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>สาขา</label>
                <div>{student.major || '-'}</div>
              </div>
              <div className="form-group">
                <label>อีเมล</label>
                <div>{student.email || '-'}</div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>ชั้นปี</label>
                <div>{student.year || '-'}</div>
              </div>
              <div className="form-group">
                <label>คณะ</label>
                <div>{student.faculty || '-'}</div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>เกรดเฉลี่ยเทอมล่าสุด</label>
                <div>{student.lastSemesterGrade || '-'}</div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>เบอร์ติดต่อ</label>
                <div>{student.phone || '-'}</div>
              </div>
              <div className="form-group">
                <label>ที่อยู่</label>
                <div>{(student.homeHouse || student.homeMoo || student.homeTambon || student.homeAmphur || student.homeProvince) ? `${student.homeHouse || ''} ${student.homeMoo ? 'หมู่' + student.homeMoo : ''} ${student.homeTambon || ''} ${student.homeAmphur || ''} ${student.homeProvince || ''}` : '-'}</div>
              </div>
            </div>

            {student.studentPhoto && (
              <div className="form-row">
                <div className="form-group">
                  <label>รูปถ่าย (PDF)</label>
                  <div>
                    {typeof student.studentPhoto === 'string' && student.studentPhoto.startsWith('data:') ? (
                      <a href={student.studentPhoto} target="_blank" rel="noreferrer" download={`${student.studentId || 'student_photo'}.pdf`}>ดาวน์โหลด/เปิดไฟล์ PDF</a>
                    ) : student.studentPhoto && student.studentPhoto.data ? (
                      <a href={student.studentPhoto.data} target="_blank" rel="noreferrer" download={student.studentPhoto.name || `${student.studentId || 'student_photo'}.pdf`}>ดาวน์โหลด/เปิดไฟล์ PDF</a>
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
              <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>ปิด</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDetailsPage;
