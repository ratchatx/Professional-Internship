import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../../api/axios';
import '../../Student/Dashboard/DashboardPage.css';
import '../../Student/NewRequestPage.css';
import './RequestDetailsPage.css';

const StudentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [actionModal, setActionModal] = useState({
    open: false,
    status: '',
    title: '',
    description: '',
    successMsg: '',
  });
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  useEffect(() => {
    const load = async () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        navigate('/login');
        return;
      }
      try {
        const parsed = JSON.parse(userStr);
        setUserRole(parsed.role || '');
      } catch {
        setUserRole('');
      }

      let info = null;
      let requestInfo = null;

      // Load student request details first (contains full profile)
      try {
        const reqRes = await api.get(`/requests?studentId=${id}`);
        const reqs = reqRes.data.data || [];
        const req = reqs[0];
        if (req) {
          const s = req.details?.student_info || {};
          requestInfo = {
            studentId: req.studentId || s.studentId || '',
            title: s.title || '',
            name: s.name || req.studentName || '',
            email: s.email || req.studentEmail || '',
            year: s.year || '',
            lastSemesterGrade: s.lastSemesterGrade || '',
            major: s.major || req.department || '',
            phone: s.phone || '',
            homeHouse: s.address?.house || '',
            homeMoo: s.address?.moo || '',
            homeTambon: s.address?.tambon || '',
            homeAmphur: s.address?.amphur || '',
            homeProvince: s.address?.province || '',
            homePostal: s.address?.postal || '',
            studentPhoto: req.details?.studentPhoto || null,
            raw: req,
          };
        }
      } catch (err) {
        console.error('Failed to load requests:', err);
      }

      // Try to load from users API for baseline info (may require admin token)
      try {
        const usersRes = await api.get('/users');
        const users = usersRes.data.data || [];
        const matched = users.find((u) => u.student_code === id || u.username === id || u.studentId === id);

        if (matched) {
          info = {
            studentId: matched.student_code || matched.studentId || matched.username,
            title: matched.title || '',
            name: matched.full_name || matched.name || '',
            email: matched.email || '',
            year: matched.year || '',
            lastSemesterGrade: matched.lastSemesterGrade || '',
            major: matched.major || matched.department || '',
            phone: matched.phone || '',
            homeHouse: '',
            homeMoo: '',
            homeTambon: '',
            homeAmphur: '',
            homeProvince: '',
            homePostal: '',
            studentPhoto: matched.avatar || null,
            raw: matched,
          };
        }
      } catch (err) {
        console.error('Failed to load users:', err);
      }

      // Merge in request info to fill missing fields
      if (requestInfo) {
        info = {
          ...(info || {}),
          ...['studentId', 'title', 'name', 'email', 'major'].reduce((acc, key) => {
            acc[key] = requestInfo[key] || info?.[key] || '';
            return acc;
          }, {}),
          year: info?.year || requestInfo.year || '',
          lastSemesterGrade: info?.lastSemesterGrade || requestInfo.lastSemesterGrade || '',
          phone: info?.phone || requestInfo.phone || '',
          homeHouse: info?.homeHouse || requestInfo.homeHouse || '',
          homeMoo: info?.homeMoo || requestInfo.homeMoo || '',
          homeTambon: info?.homeTambon || requestInfo.homeTambon || '',
          homeAmphur: info?.homeAmphur || requestInfo.homeAmphur || '',
          homeProvince: info?.homeProvince || requestInfo.homeProvince || '',
          homePostal: info?.homePostal || requestInfo.homePostal || '',
          studentPhoto: info?.studentPhoto || requestInfo.studentPhoto || null,
          raw: info?.raw || requestInfo.raw,
          requestRaw: requestInfo.raw || null,
        };
      }

      setStudent({ ...(info || requestInfo || {}), requestRaw: requestInfo?.raw || info?.requestRaw || null });
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

  const formatAddress = () => {
    const parts = [];
    if (student.homeHouse) parts.push(`บ้านเลขที่ ${student.homeHouse}`);
    if (student.homeMoo) parts.push(`หมู่ ${student.homeMoo}`);
    if (student.homeTambon) parts.push(`ตำบล ${student.homeTambon}`);
    if (student.homeAmphur) parts.push(`อำเภอ ${student.homeAmphur}`);
    if (student.homeProvince) parts.push(`จังหวัด ${student.homeProvince}`);
    if (student.homePostal) parts.push(`รหัส ${student.homePostal}`);
    return parts.length ? parts.join(' ') : '-';
  };

  const requestDetails = student.requestRaw || null;
  const details = requestDetails?.details || {};
  const desiredPosition = {
    company: details.companyName || requestDetails?.company || '-',
    position: details.position || requestDetails?.position || '-',
    startDate: details.startDate || requestDetails?.startDate || '',
    endDate: details.endDate || requestDetails?.endDate || '',
    description: details.description || '-',
    skills: details.skills || '-',
  };

  const formatDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString('th-TH');
  };

  const requestId = student.requestRaw?.id;
  const canCompanyRespond =
    userRole === 'company' && requestId && student.requestRaw?.status === 'รอสถานประกอบการตอบรับ';

  const updateRequestStatus = async (newStatus, successMsg) => {
    if (!requestId) return;
    setIsUpdatingStatus(true);
    try {
      await api.patch(`/requests/${requestId}/status`, { status: newStatus });
      setStudent((prev) => (
        prev
          ? {
              ...prev,
              requestRaw: {
                ...(prev.requestRaw || {}),
                status: newStatus,
              },
            }
          : prev
      ));
      setFeedbackMessage(successMsg);
      setActionModal((prev) => ({ ...prev, open: false }));
    } catch (error) {
      console.error('Failed to update status:', error);
      setFeedbackMessage(error.response?.data?.message || 'อัปเดตสถานะไม่สำเร็จ');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const openActionModal = (status, title, description, successMsg) => {
    setActionModal({ open: true, status, title, description, successMsg });
  };

  return (
    <div className="request-details-container">
      <div className="details-card">
        <header className="details-header">
          <div>
            <h2>ข้อมูลนักศึกษา</h2>
            <p style={{ color: '#718096', marginTop: '5px' }}>รหัสนักศึกษา: {student.studentId || '-'}</p>
          </div>
        </header>

        <section className="detail-section">
          <h3>ข้อมูลพื้นฐาน</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">ชื่อ-นามสกุล</span>
              <span className="detail-value">{(student.title ? `${student.title} ` : '') + (student.name || '-')}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">สาขา</span>
              <span className="detail-value">{student.major || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">ปี/ชั้นปี</span>
              <span className="detail-value">{student.year || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">เกรดเฉลี่ยเทอมล่าสุด</span>
              <span className="detail-value">{student.lastSemesterGrade || '-'}</span>
            </div>
          </div>
        </section>

        <section className="detail-section">
          <h3>ช่องทางติดต่อ</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">อีเมล</span>
              <span className="detail-value">{student.email || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">เบอร์โทรศัพท์</span>
              <span className="detail-value">{student.phone || '-'}</span>
            </div>
            <div className="detail-item" style={{ gridColumn: 'span 2' }}>
              <span className="detail-label">ที่อยู่</span>
              <span className="detail-value">{formatAddress()}</span>
            </div>
          </div>
        </section>

        <section className="detail-section">
          <h3>ตำแหน่งที่ต้องการฝึก</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">ชื่อบริษัท/องค์กร</span>
              <span className="detail-value">{desiredPosition.company}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">ตำแหน่ง</span>
              <span className="detail-value">{desiredPosition.position}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">วันที่เริ่มฝึก</span>
              <span className="detail-value">{formatDate(desiredPosition.startDate)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">วันที่สิ้นสุด</span>
              <span className="detail-value">{formatDate(desiredPosition.endDate)}</span>
            </div>
          </div>
          <div className="detail-item" style={{ marginTop: 12 }}>
            <span className="detail-label">รายละเอียดงาน</span>
            <p className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>{desiredPosition.description}</p>
          </div>
          <div className="detail-item" style={{ marginTop: 8 }}>
            <span className="detail-label">ทักษะที่เกี่ยวข้อง</span>
            <p className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>{desiredPosition.skills}</p>
          </div>
        </section>

        <footer className="actions-footer">
          <button type="button" className="btn-back" onClick={() => navigate(-1)}>
            ย้อนกลับ
          </button>
          <div className="actions-right" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {canCompanyRespond && (
              <>
                <button
                  type="button"
                  className="btn-reject-lg"
                  disabled={isUpdatingStatus}
                  onClick={() =>
                    openActionModal(
                      'ปฏิเสธ',
                      'ยืนยันการปฏิเสธนักศึกษารายนี้?',
                      'เมื่อตอบ "ยืนยัน" สถานะคำร้องจะถูกเปลี่ยนเป็น "ปฏิเสธ"',
                      'ปฏิเสธคำร้องเรียบร้อย'
                    )
                  }
                >
                  ยกเลิก (ไม่รับ)
                </button>
                <button
                  type="button"
                  className="btn-approve-lg"
                  disabled={isUpdatingStatus}
                  onClick={() =>
                    openActionModal(
                      'อนุมัติแล้ว',
                      'ตอบรับนักศึกษารายนี้?',
                      'หลังยืนยัน ระบบจะแจ้งว่านักศึกษาถูกตอบรับเข้าฝึกงานเรียบร้อย',
                      'ตอบรับนักศึกษาเรียบร้อย'
                    )
                  }
                >
                  ตอบรับนักศึกษา
                </button>
              </>
            )}
          </div>
        </footer>
        {feedbackMessage && (
          <div style={{ marginTop: '18px', padding: '10px 16px', borderRadius: '12px', background: '#ecfccb', color: '#3f6212' }}>
            {feedbackMessage}
          </div>
        )}
      </div>

      {actionModal.open && (
        <div className="modal-overlay">
          <div className="modal-content action-modal" role="dialog" aria-modal="true">
            <div className="modal-header">
              <h2>{actionModal.title}</h2>
              <button className="close-btn" onClick={() => setActionModal((prev) => ({ ...prev, open: false }))}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>{actionModal.description}</p>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setActionModal((prev) => ({ ...prev, open: false }))}>
                ยกเลิก
              </button>
              <button
                className="btn-submit"
                onClick={() => updateRequestStatus(actionModal.status, actionModal.successMsg)}
                disabled={isUpdatingStatus}
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDetailsPage;
