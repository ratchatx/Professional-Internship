import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert as MuiAlert } from '@mui/material';
import './RequestDetailsPage.css';

const RequestDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState({ open: false, reason: '' });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    // 1. Get User Role
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(userStr);
    setUserRole(user.role);

    // 2. Load Request Details
    const allRequests = JSON.parse(localStorage.getItem('requests') || '[]');
    const foundRequest = allRequests.find(r => r.id.toString() === id);

    if (foundRequest) {
      setRequest(foundRequest);
    } else {
      setToast({ open: true, message: 'ไม่พบข้อมูลคำร้อง', severity: 'error' });
      navigate(-1);
    }
    setLoading(false);
  }, [id, navigate]);

  const handleApprove = () => {
    const allRequests = JSON.parse(localStorage.getItem('requests') || '[]');
    let updatedRequests = [];
    let newStatus = '';
    let alertMsg = 'อนุมัติคำร้องเรียบร้อยแล้ว';

    if (userRole === 'advisor') {
      newStatus = 'รอผู้ดูแลระบบตรวจสอบ';
    } else if (userRole === 'admin') {
      newStatus = 'รอสถานประกอบการตอบรับ';
      alertMsg = 'ตรวจสอบและส่งคำขอไปยังสถานประกอบการเรียบร้อยแล้ว';
    } else if (userRole === 'company') {
      newStatus = 'อนุมัติแล้ว';
      alertMsg = 'ตอบรับนักศึกษาเข้าฝึกงานเรียบร้อยแล้ว';
    }

    if (newStatus) {
      updatedRequests = allRequests.map(r => 
        r.id.toString() === id ? { ...r, status: newStatus } : r
      );
      localStorage.setItem('requests', JSON.stringify(updatedRequests));
      setRequest({ ...request, status: newStatus });
      setToast({ open: true, message: alertMsg, severity: 'success' });
      navigate(-1);
    }
  };

  const handleReject = () => {
    setRejectModal({ open: true, reason: '' });
  };

  const handleRejectConfirm = () => {
    if (!rejectModal.reason.trim()) {
      setToast({ open: true, message: 'กรุณาระบุเหตุผลที่ไม่อนุมัติ/ปฏิเสธ', severity: 'warning' });
      return;
    }

    const allRequests = JSON.parse(localStorage.getItem('requests') || '[]');
    let newStatus = '';

    if (userRole === 'advisor') {
      newStatus = 'ไม่อนุมัติ (อาจารย์)';
    } else if (userRole === 'admin') {
      newStatus = 'ไม่อนุมัติ (Admin)';
    } else if (userRole === 'company') {
      newStatus = 'ปฏิเสธ';
    }

    if (newStatus) {
      const reason = rejectModal.reason.trim();
      const updatedRequests = allRequests.map(r => 
        r.id.toString() === id ? { ...r, status: newStatus, rejectReason: reason } : r
      );
      localStorage.setItem('requests', JSON.stringify(updatedRequests));
      setRequest({ ...request, status: newStatus, rejectReason: reason });
      setToast({ open: true, message: 'บันทึกผลการไม่อนุมัติ/ปฏิเสธเรียบร้อย', severity: 'info' });
      setRejectModal({ open: false, reason: '' });
      navigate(-1);
    }
  };

  const handleRejectClose = () => {
    setRejectModal({ open: false, reason: '' });
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'รออาจารย์ที่ปรึกษาอนุมัติ': { bg: '#fff3cd', color: '#856404' },
      'รอผู้ดูแลระบบตรวจสอบ': { bg: '#c3dafe', color: '#434190' },
      'รอผู้ดูแลระบบอนุมัติ': { bg: '#c3dafe', color: '#434190' }, // Legacy support
      'รอสถานประกอบการตอบรับ': { bg: '#e2e8f0', color: '#2d3748' },
      'อนุมัติแล้ว': { bg: '#d4edda', color: '#155724' },
      'ไม่อนุมัติ (อาจารย์)': { bg: '#f8d7da', color: '#721c24' },
      'ไม่อนุมัติ (Admin)': { bg: '#f8d7da', color: '#721c24' },
      'ปฏิเสธ': { bg: '#f8d7da', color: '#721c24' }
    };
    const style = statusStyles[status] || { bg: '#e2e3e5', color: '#383d41' };
    return { ...style, label: status };
  };

  if (loading || !request) return <div className="loading">กำลังโหลดข้อมูล...</div>;

  const statusInfo = getStatusBadge(request.status);
  const details = request.details || {}; // Fields from NewRequestPage payload

  // Determine if current user can execute actions
  const canApprove = (userRole === 'advisor' && request.status === 'รออาจารย์ที่ปรึกษาอนุมัติ') ||
                     (userRole === 'admin' && (request.status === 'รอผู้ดูแลระบบตรวจสอบ' || request.status === 'รอผู้ดูแลระบบอนุมัติ')) ||
                     (userRole === 'company' && request.status === 'รอสถานประกอบการตอบรับ');

  return (
    <div className="request-details-container">
      <div className="details-card">
        <header className="details-header">
          <div>
            <h2>รายละเอียดคำร้องฝึกงาน</h2>
            <p style={{ color: '#718096', marginTop: '5px' }}>เลขที่คำร้อง: {request.id}</p>
          </div>
          <span className="status-badge-lg" style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}>
            {statusInfo.label}
          </span>
        </header>

        <section className="detail-section">
          <h3>ข้อมูลนักศึกษา</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">รหัสนักศึกษา</span>
              <span className="detail-value">{request.studentId}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">ชื่อ-นามสกุล</span>
              <span className="detail-value">{request.studentName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">สาขาวิชา</span>
              <span className="detail-value">{request.department}</span>
            </div>
            {details.student_info?.lastSemesterGrade && (
              <div className="detail-item">
                <span className="detail-label">เกรดเฉลี่ยเทอมล่าสุด</span>
                <span className="detail-value">{details.student_info.lastSemesterGrade}</span>
              </div>
            )}
             <div className="detail-item">
              <span className="detail-label">วันที่ยื่นคำร้อง</span>
              <span className="detail-value">{new Date(request.submittedDate).toLocaleDateString('th-TH')}</span>
            </div>
          </div>
        </section>

        <section className="detail-section">
          <h3>ข้อมูลสถานประกอบการ</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">ชื่อบริษัท/องค์กร</span>
              <span className="detail-value">{details.companyName || request.company}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">ตำแหน่ง</span>
              <span className="detail-value">{details.position || request.position}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">ที่อยู่บริษัท</span>
              <span className="detail-value">{details.address || '-'}</span>
            </div>
          </div>
        </section>

        <section className="detail-section">
          <h3> ระยะเวลาการฝึกงาน</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">วันเริ่มฝึกงาน</span>
              <span className="detail-value">{details.startDate ? new Date(details.startDate).toLocaleDateString('th-TH') : '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">วันสิ้นสุดการฝึกงาน</span>
              <span className="detail-value">{details.endDate ? new Date(details.endDate).toLocaleDateString('th-TH') : '-'}</span>
            </div>
          </div>
        </section>

         <section className="detail-section">
          <h3> ข้อมูลพี่เลี้ยง/ผู้ดูแล</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">ชื่อพี่เลี้ยง/ผู้ดูแล</span>
              <span className="detail-value">{details.contactPerson || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">เบอร์โทรศัพท์</span>
              <span className="detail-value">{details.contactPhone || '-'}</span>
            </div>
             <div className="detail-item">
              <span className="detail-label">อีเมล</span>
              <span className="detail-value">{details.contactEmail || '-'}</span>
            </div>
          </div>
        </section>

        <section className="detail-section">
          <h3>รายละเอียดงาน</h3>
          <div className="detail-item">
             <span className="detail-label">ลักษณะงานที่ทำ</span>
             <p className="detail-value" style={{whiteSpace: 'pre-wrap'}}>{details.description || '-'}</p>
          </div>
           <div className="detail-item" style={{ marginTop: '15px' }}>
             <span className="detail-label">ทักษะที่ต้องการ</span>
             <p className="detail-value" style={{whiteSpace: 'pre-wrap'}}>{details.skills || '-'}</p>
          </div>
        </section>

        {request.rejectReason && (
             <section className="detail-section" style={{ backgroundColor: '#fff5f5', padding: '15px', borderRadius: '8px', border: '1px solid #fed7d7' }}>
               <h3 style={{ color: '#c53030', borderLeftColor: '#c53030' }}>เหตุผลที่ไม่อนุมัติ</h3>
                <p className="detail-value" style={{ color: '#c53030' }}>{request.rejectReason}</p>
             </section>
        )}

        <footer className="actions-footer">
          <Button variant="outlined" className="btn-back" onClick={() => navigate(-1)}>
            ย้อนกลับ
          </Button>
          
          {canApprove && (
            <>
              <Button variant="contained" color="error" className="btn-reject-lg" onClick={handleReject}>
                ✗ ไม่อนุมัติ
              </Button>
              <Button variant="contained" color="success" className="btn-approve-lg" onClick={handleApprove}>
                ✓ อนุมัติคำร้อง
              </Button>
            </>
          )}
        </footer>
      </div>

      <Dialog open={rejectModal.open} onClose={handleRejectClose} fullWidth maxWidth="sm">
        <DialogTitle>ระบุเหตุผลที่ไม่อนุมัติ/ปฏิเสธ</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            margin="dense"
            label="เหตุผล"
            value={rejectModal.reason}
            onChange={(event) => setRejectModal(prev => ({ ...prev, reason: event.target.value }))}
            placeholder="กรอกเหตุผลที่ไม่อนุมัติ/ปฏิเสธ"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleRejectClose}>ยกเลิก</Button>
          <Button variant="contained" color="error" onClick={handleRejectConfirm}>ยืนยัน</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={2600}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default RequestDetailsPage;
