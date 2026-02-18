import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Paper,
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Tabs,
  Tab,
  Button,
  Chip,
  Input,
  TextField,
  Snackbar,
  Alert as MuiAlert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Radio,
  Divider,
} from '@mui/material';
import { jsPDF } from 'jspdf';
import { STAT_EMOJI } from '../../utils/statEmojis';
import { filterRequestsForCompanyUser, getCompanyDisplayName } from '../../utils/companyRequestFilter';
import '../Admin/Dashboard/AdminDashboardPage.css'; // Reuse Admin styles

const EVALUATION_FORM_SECTIONS = [
  {
    title: 'ด้านบุคลิกภาพ (25 คะแนน)',
    items: [
      'การแต่งกาย (เรียบร้อยและถูกระเบียบ)',
      'กิริยามารยาท',
      'การพูดจา (ภาษาที่ใช้น้ำเสียง-จังหวะชัดเจน)',
      'มีมนุษยสัมพันธ์กับทีมงาน ทำงานร่วมกับผู้อื่นได้ดี',
      'การควบคุมอารมณ์',
    ],
  },
  {
    title: 'ด้านความรับผิดชอบ และความมีมนุษยสัมพันธ์ (25 คะแนน)',
    items: [
      'การตรงต่อเวลา',
      'การให้ความร่วมมือช่วยเหลือต่อสถานที่ฝึกงาน',
      'ความรับผิดชอบและความเอาใจใส่ต่องานที่ทำ',
      'การปรับตัวเข้ากับผู้อื่น',
      'การปฏิบัติตามระเบียบข้อบังคับของสถานที่ฝึกงาน',
    ],
  },
  {
    title: 'ด้านการปฏิบัติงาน (50 คะแนน)',
    items: [
      'การเตรียมตัวและความพร้อมในการปฏิบัติงาน',
      'ความกระตือรือร้นในการทำงาน',
      'ความตั้งใจความมุ่งมั่นในการทำงาน',
      'การลำดับขั้นตอนในการทำงาน',
      'มีความรู้และเจตคติที่ดีต่อวิชาชีพ',
      'ความสามารถในการเชื่อมโยงกรณีต่าง ๆ',
      'ความอดทนในการทำงาน',
      'ความมีไหวพริบและความสามารถในการแก้ไขปัญหาเฉพาะหน้า',
      'การยอมรับฟังความคิดเห็นของผู้อื่น',
      'ความสนใจในการแสวงหาความรู้เพิ่มเติม',
    ],
  },
];

const EVALUATION_ITEMS = EVALUATION_FORM_SECTIONS.flatMap((section, sectionIndex) =>
  section.items.map((item, itemIndex) => ({
    id: `s${sectionIndex + 1}-q${itemIndex + 1}`,
    label: item,
  }))
);

const EVALUATION_ITEM_IDS = EVALUATION_ITEMS.map((item) => item.id);

const createInitialEvaluationForm = () => ({
  traineeName: '',
  position: '',
  major: '',
  periodStart: '',
  periodEnd: '',
  scores: {},
  remark: '',
});

const calculateEvaluationScore = (scores = {}) => (
  EVALUATION_ITEM_IDS.reduce((sum, id) => sum + Number(scores[id] || 0), 0)
);

const CompanyDashboardPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('applicants');
  const [companyName, setCompanyName] = useState('');
  const [allRequests, setAllRequests] = useState([]);
  const [sortBy, setSortBy] = useState('submittedDate');
  const [sortDir, setSortDir] = useState('asc');
  const uploadInputRef = useRef(null);
  const [rejectModal, setRejectModal] = useState({
    open: false,
    requestId: null,
    reason: ''
  });
  const [evaluationModal, setEvaluationModal] = useState({
    open: false,
    requestId: null,
    studentName: '',
    form: createInitialEvaluationForm(),
  });
  const [messageModal, setMessageModal] = useState({
    open: false,
    requestId: null,
    studentName: '',
    message: '',
  });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const loadCompanyRequests = (user) => {
    const storedRequests = JSON.parse(localStorage.getItem('requests') || '[]');
    const companyRequests = filterRequestsForCompanyUser(storedRequests, user);
    setAllRequests(companyRequests);
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role !== 'company') {
         navigate('/login'); 
         return;
      }
      setCompanyName(getCompanyDisplayName(user));
      loadCompanyRequests(user);

      const refreshRequests = () => {
        const latestUserStr = localStorage.getItem('user');
        if (!latestUserStr) return;
        const latestUser = JSON.parse(latestUserStr);
        if (latestUser.role !== 'company') return;
        loadCompanyRequests(latestUser);
      };

      const handleVisibility = () => {
        if (document.visibilityState === 'visible') {
          refreshRequests();
        }
      };

      window.addEventListener('focus', refreshRequests);
      window.addEventListener('storage', refreshRequests);
      document.addEventListener('visibilitychange', handleVisibility);

      return () => {
        window.removeEventListener('focus', refreshRequests);
        window.removeEventListener('storage', refreshRequests);
        document.removeEventListener('visibilitychange', handleVisibility);
      };
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const openToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const syncCompanyRequests = (updater) => {
    setAllRequests((prevCompanyRequests) => {
      const nextCompanyRequests = typeof updater === 'function' ? updater(prevCompanyRequests) : updater;
      const allStoredRequests = JSON.parse(localStorage.getItem('requests') || '[]');
      const prevIds = new Set(prevCompanyRequests.map((req) => req.id));
      const nextMap = new Map(nextCompanyRequests.map((req) => [req.id, req]));

      const merged = allStoredRequests.map((request) => {
        if (!prevIds.has(request.id)) return request;
        return nextMap.get(request.id) || request;
      });

      nextCompanyRequests.forEach((request) => {
        if (!merged.some((item) => item.id === request.id)) {
          merged.push(request);
        }
      });

      localStorage.setItem('requests', JSON.stringify(merged));
      return nextCompanyRequests;
    });
  };

  const handleApprove = (requestId) => {
    syncCompanyRequests((prev) => prev.map((request) => (
      request.id === requestId
        ? { ...request, status: 'อนุมัติแล้ว', companyRespondedAt: new Date().toISOString() }
        : request
    )));
    openToast('อนุมัติคำขอเรียบร้อยแล้ว');
  };

  const handleReject = (requestId) => {
    setRejectModal({ open: true, requestId, reason: '' });
  };

  const handleRejectConfirm = () => {
    if (!rejectModal.reason.trim()) {
      openToast('กรุณาระบุเหตุผลที่ปฏิเสธ', 'warning');
      return;
    }

    const rejectedRequest = allRequests.find((request) => request.id === rejectModal.requestId);
    syncCompanyRequests((prev) => prev.map((request) => (
      request.id === rejectModal.requestId
        ? {
          ...request,
          status: 'ปฏิเสธ',
          rejectReason: rejectModal.reason.trim(),
          companyRespondedAt: new Date().toISOString(),
        }
        : request
    )));
    openToast(`ปฏิเสธคำขอของ ${rejectedRequest?.studentName || 'นักศึกษา'} แล้ว`, 'info');
    setRejectModal({ open: false, requestId: null, reason: '' });
  };

  const handleRejectClose = () => {
    setRejectModal({ open: false, requestId: null, reason: '' });
  };

  const openEvaluationModal = (request) => {
    const existingForm = request.evaluationForm || {};
    setEvaluationModal({
      open: true,
      requestId: request.id,
      studentName: request.studentName || '-',
      form: {
        traineeName: existingForm.traineeName || request.studentName || '',
        position: existingForm.position || request.position || '',
        major: existingForm.major || request.major || request.field || '',
        periodStart: existingForm.periodStart || request.startDate || request.details?.startDate || '',
        periodEnd: existingForm.periodEnd || request.endDate || request.details?.endDate || '',
        scores: existingForm.scores || {},
        remark: existingForm.remark || request.evaluationComment || '',
      },
    });
  };

  const closeEvaluationModal = () => {
    setEvaluationModal({ open: false, requestId: null, studentName: '', form: createInitialEvaluationForm() });
  };

  const updateEvaluationField = (field, value) => {
    setEvaluationModal((prev) => ({
      ...prev,
      form: {
        ...prev.form,
        [field]: value,
      },
    }));
  };

  const updateEvaluationScore = (itemId, value) => {
    setEvaluationModal((prev) => ({
      ...prev,
      form: {
        ...prev.form,
        scores: {
          ...prev.form.scores,
          [itemId]: value,
        },
      },
    }));
  };

  const handleSaveEvaluation = () => {
    const missingCount = EVALUATION_ITEM_IDS.filter((id) => {
      const value = Number(evaluationModal.form.scores?.[id] || 0);
      return value < 1 || value > 5;
    }).length;

    if (missingCount > 0) {
      openToast(`กรุณาประเมินให้ครบทุกข้อ (ขาด ${missingCount} ข้อ)`, 'warning');
      return;
    }

    const scoreNumber = calculateEvaluationScore(evaluationModal.form.scores);

    syncCompanyRequests((prev) => prev.map((request) => (
      request.id === evaluationModal.requestId
        ? {
          ...request,
          evaluationScore: scoreNumber,
          evaluationComment: evaluationModal.form.remark.trim(),
          evaluationForm: {
            traineeName: evaluationModal.form.traineeName,
            position: evaluationModal.form.position,
            major: evaluationModal.form.major,
            periodStart: evaluationModal.form.periodStart,
            periodEnd: evaluationModal.form.periodEnd,
            scores: evaluationModal.form.scores,
            remark: evaluationModal.form.remark,
          },
          evaluationCompleted: true,
          evaluatedAt: new Date().toISOString(),
          certificateIssued: request.certificateIssued ?? false,
        }
        : request
    )));

    openToast('บันทึกผลการประเมินเรียบร้อยแล้ว');
    closeEvaluationModal();
  };

  const openMessageModal = (request) => {
    setMessageModal({
      open: true,
      requestId: request.id,
      studentName: request.studentName || '-',
      message: '',
    });
  };

  const handleSendMessage = () => {
    if (!messageModal.message.trim()) {
      openToast('กรุณากรอกข้อความก่อนส่ง', 'warning');
      return;
    }

    const messages = JSON.parse(localStorage.getItem('companyMessages') || '[]');
    const payload = {
      requestId: messageModal.requestId,
      studentName: messageModal.studentName,
      companyName,
      message: messageModal.message.trim(),
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('companyMessages', JSON.stringify([payload, ...messages]));
    openToast('ส่งข้อความถึงมหาวิทยาลัยเรียบร้อยแล้ว');
    setMessageModal({ open: false, requestId: null, studentName: '', message: '' });
  };

  const handleDocumentUploadClick = () => {
    uploadInputRef.current?.click();
  };

  const handleDocumentUploadChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const documents = JSON.parse(localStorage.getItem('companyDocuments') || '[]');
    const payload = {
      companyName,
      type: 'acceptance-letter',
      filename: file.name,
      uploadedAt: new Date().toISOString(),
    };
    localStorage.setItem('companyDocuments', JSON.stringify([payload, ...documents]));
    openToast(`อัปโหลดไฟล์ ${file.name} สำเร็จแล้ว`);
    event.target.value = '';
  };

  const handleDownloadCertificateTemplate = () => {
    try {
      const width = 1600;
      const height = 1131;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');
      if (!context) {
        openToast('ไม่สามารถสร้างไฟล์ PDF ได้', 'error');
        return;
      }

      const lineColor = '#7ab7ca';
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, width, height);

      context.strokeStyle = lineColor;
      context.lineWidth = 6;
      context.strokeRect(42, 42, width - 84, height - 84);

      context.lineWidth = 2.2;
      context.strokeRect(62, 62, width - 124, height - 124);
      context.strokeRect(104, 212, width - 208, 560);

      context.strokeStyle = '#95d0df';
      context.lineWidth = 1.2;
      context.strokeRect(72, 72, width - 144, height - 144);

      context.fillStyle = '#1f78c8';
      context.beginPath();
      context.ellipse(width / 2, 145, 165, 58, 0, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = '#ef3340';
      context.beginPath();
      context.ellipse(width / 2 + 80, 145, 86, 58, 0, -Math.PI / 3, Math.PI / 3);
      context.fill();

      context.fillStyle = '#ffffff';
      context.font = 'bold 68px "Times New Roman", "Kanit", sans-serif';
      context.textAlign = 'center';
      context.fillText('V-SERVE', width / 2, 164);

      const fitCenteredText = (text, y, options = {}) => {
        const {
          maxWidth = width - 260,
          maxFontSize = 46,
          minFontSize = 24,
          weight = 500,
          family = '"Kanit", "TH Sarabun New", sans-serif',
        } = options;

        let fontSize = maxFontSize;
        context.font = `${weight} ${fontSize}px ${family}`;
        while (fontSize > minFontSize && context.measureText(text).width > maxWidth) {
          fontSize -= 1;
          context.font = `${weight} ${fontSize}px ${family}`;
        }
        context.fillText(text, width / 2, y);
      };

      context.fillStyle = '#111111';
      fitCenteredText(
        `${companyName || 'บริษัท วี-เซิร์ฟ โลจิสติกส์ จำกัด และบริษัทในเครือ'}`,
        272,
        { maxWidth: width - 260, maxFontSize: 50, minFontSize: 30, weight: 600 }
      );

      fitCenteredText('ขอมอบใบรับรองฉบับนี้ ให้ไว้เพื่อแสดงว่า', 350, {
        maxWidth: width - 300,
        maxFontSize: 40,
        minFontSize: 26,
        weight: 500,
      });

      fitCenteredText('นาย/นางสาว.........................................................', 438, {
        maxWidth: width - 400,
        maxFontSize: 46,
        minFontSize: 30,
        weight: 600,
      });

      fitCenteredText('ได้ผ่านการฝึกปฏิบัติงาน ด้าน CUSTOMER SERVICE คลังสินค้า ขนส่ง และด้านการตลาด', 518, {
        maxWidth: width - 280,
        maxFontSize: 42,
        minFontSize: 24,
        weight: 500,
      });

      fitCenteredText('ระหว่างวันที่ ........................... ถึง วันที่............................... เป็นเวลา  วัน', 578, {
        maxWidth: width - 340,
        maxFontSize: 40,
        minFontSize: 24,
        weight: 500,
      });

      fitCenteredText('ขอให้มีความสุข สวัสดี เจริญรุ่งเรือง ตลอดไป', 678, {
        maxWidth: width - 460,
        maxFontSize: 40,
        minFontSize: 24,
        weight: 500,
      });

      fitCenteredText('ให้ไว้ ณ วันที่.......กันยายน ๒๕๖๑', 738, {
        maxWidth: width - 600,
        maxFontSize: 40,
        minFontSize: 24,
        weight: 500,
      });

      fitCenteredText('หมายเหตุ : สถานี ABC บริษัท ABC จำกัด', 1068, {
        maxWidth: width - 320,
        maxFontSize: 28,
        minFontSize: 20,
        weight: 500,
      });

      const imageData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imageData, 'PNG', 0, 0, pageWidth, pageHeight);
      pdf.save('intern-certificate-template.pdf');
      openToast('ดาวน์โหลดใบรับรอง (PDF) เรียบร้อยแล้ว');
    } catch {
      openToast('เกิดข้อผิดพลาดระหว่างสร้าง PDF', 'error');
    }
  };

  const handleIssueCertificate = (requestId) => {
    syncCompanyRequests((prev) => prev.map((request) => (
      request.id === requestId
        ? { ...request, certificateIssued: true, certificateIssuedAt: new Date().toISOString() }
        : request
    )));
    openToast('ออกใบรับรองเรียบร้อยแล้ว');
  };

  const getCompanyDisplayStatus = (status) => {
    if (status === 'รอสถานประกอบการตอบรับ') return 'รออนุมัติ';
    return status;
  };

  const toggleSort = (key) => {
    if (sortBy === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
  };

  const sortRows = (rows) => [...rows].sort((a, b) => {
    const va = (a?.[sortBy] ?? '').toString();
    const vb = (b?.[sortBy] ?? '').toString();
    if (!isNaN(Number(va)) && !isNaN(Number(vb))) {
      return sortDir === 'asc' ? Number(va) - Number(vb) : Number(vb) - Number(va);
    }
    return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
  });

  const isRejectedStatus = (status) => status === 'ไม่อนุมัติ' || status === 'ปฏิเสธ';
  const applicants = sortRows(allRequests);
  const interning = sortRows(allRequests.filter(r => r.status === 'ออกฝึกงาน'));
  const completed = sortRows(allRequests.filter(r => r.status === 'ฝึกงานเสร็จแล้ว'));

  const parseDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const getDaysLeft = (endDate) => {
    const end = parseDate(endDate);
    if (!end) return null;
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getProgress = (startDate, endDate) => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    if (!start || !end || end <= start) return '-';
    const now = new Date();
    const total = end.getTime() - start.getTime();
    const current = Math.min(Math.max(now.getTime() - start.getTime(), 0), total);
    return `${Math.round((current / total) * 100)}%`;
  };

  const nearDeadlineCount = interning.filter(r => {
    const daysLeft = getDaysLeft(r.endDate);
    return daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
  }).length;

  const pendingEvaluationCount = [...interning, ...completed].filter(
    r => !r.evaluationScore && !r.evaluationCompleted
  ).length;

  const stats = [
    { title: 'ผู้สมัครทั้งหมด', value: allRequests.length, icon: STAT_EMOJI.TOTAL, color: '#667eea' },
    { title: 'รอการตอบรับ', value: allRequests.filter(r => r.status === 'รอสถานประกอบการตอบรับ').length, icon: STAT_EMOJI.PENDING, color: '#f093fb' },
    { title: 'รับแล้ว', value: allRequests.filter(r => r.status === 'อนุมัติแล้ว').length, icon: STAT_EMOJI.APPROVED, color: '#22c55e' },
    { title: 'ปฏิเสธแล้ว', value: allRequests.filter(r => isRejectedStatus(r.status)).length, icon: STAT_EMOJI.REJECTED, color: '#ef4444' },
    { title: 'กำลังฝึกงาน', value: interning.length, icon: STAT_EMOJI.INTERNING, color: '#3b82f6' },
    { title: 'เสร็จสิ้นแล้ว', value: completed.length, icon: STAT_EMOJI.COMPLETED, color: '#8b5cf6' },
  ];

  const getStatusBadge = (status) => {
    const statusStyles = {
      'รอสถานประกอบการตอบรับ': { bg: '#fff3cd', color: '#856404' },
      'อนุมัติแล้ว': { bg: '#d4edda', color: '#155724' },
      'ไม่อนุมัติ': { bg: '#f8d7da', color: '#721c24' },
      'ปฏิเสธ': { bg: '#f8d7da', color: '#721c24' },
      'ออกฝึกงาน': { bg: '#c3dafe', color: '#434190' },
      'ฝึกงานเสร็จแล้ว': { bg: '#fed7e2', color: '#702459' }
    };
    return statusStyles[status] || { bg: '#e2e3e5', color: '#383d41' };
  };

  return (
    <div className="admin-dashboard-container">
      <div className="mobile-top-navbar">
        <Link to="/" className="mobile-top-logo" aria-label="LASC Home"></Link>
        <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
      </div>
      <div className={`sidebar-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}></div>
      <aside className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>สถานประกอบการ</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/company-dashboard" className="nav-item active">
            <span>หน้าหลัก</span>
          </Link>
          <Link to="/company-dashboard/interns" className="nav-item">
            <span>รายชื่อนักศึกษาฝึกงาน</span>
          </Link>
          <Link to="/company-dashboard/profile" className="nav-item">
            <span>โปรไฟล์</span>
          </Link>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span>← ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
             <h1>ยินดีต้อนรับ, {companyName}</h1>
             <p>จัดการข้อมูลนักศึกษาฝึกงาน</p>
          </div>
        </header>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
            gap: 2,
            mb: 3,
          }}
        >
          {stats.map((stat, index) => (
            <Card
              key={index}
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                background: `linear-gradient(135deg, ${stat.color}22 0%, #ffffff 56%)`,
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
              }}
            >
              <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: 2,
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 800,
                      fontSize: '1rem',
                      color: stat.color,
                      backgroundColor: `${stat.color}1a`,
                      border: `1px solid ${stat.color}33`,
                      flexShrink: 0,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, fontWeight: 500 }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.1, color: 'text.primary' }}>
                      {stat.value}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.2fr 1fr' }, gap: 2, mb: 3 }}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Quick Insight</Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">นักศึกษาที่ใกล้ครบกำหนด (ภายใน 7 วัน)</Typography>
                <Chip size="small" color="warning" label={nearDeadlineCount} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">นักศึกษาที่ประเมินยังไม่เสร็จ</Typography>
                <Chip size="small" color="error" label={pendingEvaluationCount} />
              </Box>
            </Stack>
          </Paper>

          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>เอกสารบริษัท</Typography>
            <Stack spacing={1}>
              <Button variant="contained" onClick={handleDocumentUploadClick}>
                อัปโหลดหนังสือตอบรับ
              </Button>
              <Button variant="outlined" onClick={handleDownloadCertificateTemplate}>
                ดาวน์โหลดใบรับรอง
              </Button>
            </Stack>
            <Input
              inputRef={uploadInputRef}
              type="file"
              sx={{ display: 'none' }}
              onChange={handleDocumentUploadChange}
            />
          </Paper>
        </Box>

        <div className="content-section">
          <div className="section-header">
            <h2>แดชบอร์ดนักศึกษาฝึกงาน</h2>
          </div>

          <Tabs
            value={activeTab}
            onChange={(event, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            allowScrollButtonsMobile
            sx={{ mb: 2 }}
          >
            <Tab value="applicants" label="ผู้สมัคร" />
            <Tab value="interning" label="กำลังฝึกงาน" />
            <Tab value="completed" label="เสร็จสิ้น" />
          </Tabs>

          <Paper elevation={0} style={{background: 'linear-gradient(90deg, #f093fb20 0%, #667eea10 100%)', borderRadius: 10, padding: '1rem', boxShadow: 'none', border: 'none'}}>
            <TableContainer component={Box} className="compact-table" sx={{ overflowX: 'auto' }}>
              {activeTab === 'applicants' && (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell className="sortable" onClick={() => toggleSort('submittedDate')}>วันที่ยื่น {sortBy === 'submittedDate' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</TableCell>
                      <TableCell className="sortable" onClick={() => toggleSort('studentName')}>ชื่อนักศึกษา {sortBy === 'studentName' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</TableCell>
                      <TableCell className="sortable" onClick={() => toggleSort('position')}>ตำแหน่งงาน {sortBy === 'position' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</TableCell>
                      <TableCell className="sortable" onClick={() => toggleSort('status')}>สถานะ {sortBy === 'status' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</TableCell>
                      <TableCell>การดำเนินการ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {applicants.map((request) => {
                      const isPendingCompany = request.status === 'รอสถานประกอบการตอบรับ';
                      const displayStatus = getCompanyDisplayStatus(request.status);
                      return (
                        <TableRow key={request.id} hover>
                          <TableCell>{request.submittedDate || '-'}</TableCell>
                          <TableCell>{request.studentName || '-'}</TableCell>
                          <TableCell>{request.position || '-'}</TableCell>
                          <TableCell>
                            <span className="status-badge" style={getStatusBadge(request.status)}>
                              {displayStatus}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="action-buttons">
                              {isPendingCompany && (
                                <>
                                  <button className="btn-approve" onClick={() => handleApprove(request.id)} title="อนุมัติคำขอ">✓</button>
                                  <button className="btn-reject" onClick={() => handleReject(request.id)} title="ปฏิเสธคำขอ">✗</button>
                                </>
                              )}
                              <Link to={`/dashboard/student/${request.studentId || request.studentId}`} className="btn-view" style={{border: '1px solid #ddd', padding: '4px 8px', borderRadius: '4px'}}>
                                ดูรายละเอียด
                              </Link>
                              <Button size="small" variant="outlined" onClick={() => openMessageModal(request)}>
                                ส่งข้อความ
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {applicants.length === 0 && (
                      <TableRow><TableCell colSpan={5} align="center">ไม่พบข้อมูล</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              )}

              {activeTab === 'interning' && (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ชื่อนักศึกษา</TableCell>
                      <TableCell>วันที่เริ่ม</TableCell>
                      <TableCell>วันที่สิ้นสุด</TableCell>
                      <TableCell>ความคืบหน้า</TableCell>
                      <TableCell>การดำเนินการ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {interning.map((request) => (
                      <TableRow key={request.id} hover>
                        <TableCell>{request.studentName || '-'}</TableCell>
                        <TableCell>{request.startDate || '-'}</TableCell>
                        <TableCell>{request.endDate || '-'}</TableCell>
                        <TableCell>{getProgress(request.startDate, request.endDate)}</TableCell>
                        <TableCell>
                          <div className="action-buttons">
                            <Link to={`/dashboard/student/${request.studentId || request.studentId}`} className="btn-view" style={{border: '1px solid #ddd', padding: '4px 8px', borderRadius: '4px'}}>
                              ดูรายละเอียด
                            </Link>
                            <Button size="small" variant="contained" onClick={() => openEvaluationModal(request)}>
                              ประเมิน
                            </Button>
                            <Button size="small" variant="outlined" onClick={() => openMessageModal(request)}>
                              ส่งข้อความ
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {interning.length === 0 && (
                      <TableRow><TableCell colSpan={5} align="center">ไม่พบข้อมูลนักศึกษาที่กำลังฝึกงาน</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              )}

              {activeTab === 'completed' && (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ชื่อนักศึกษา</TableCell>
                      <TableCell>ตำแหน่ง</TableCell>
                      <TableCell>คะแนนที่ให้</TableCell>
                      <TableCell>สถานะใบรับรอง</TableCell>
                      <TableCell>การดำเนินการ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {completed.map((request) => (
                      <TableRow key={request.id} hover>
                        <TableCell>{request.studentName || '-'}</TableCell>
                        <TableCell>{request.position || '-'}</TableCell>
                        <TableCell>{request.evaluationScore || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            color={request.certificateIssued ? 'success' : 'default'}
                            label={request.certificateIssued ? 'ออกใบรับรองแล้ว' : 'ยังไม่ออกใบรับรอง'}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="action-buttons">
                            <Button size="small" variant="contained" onClick={() => openEvaluationModal(request)}>
                              ประเมิน
                            </Button>
                            <Button size="small" variant="outlined" onClick={handleDownloadCertificateTemplate}>
                              ดาวน์โหลดใบรับรอง
                            </Button>
                            <Button
                              size="small"
                              variant={request.certificateIssued ? 'outlined' : 'contained'}
                              onClick={() => handleIssueCertificate(request.id)}
                              disabled={Boolean(request.certificateIssued)}
                            >
                              {request.certificateIssued ? 'ออกใบรับรองแล้ว' : 'ออกใบรับรอง'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {completed.length === 0 && (
                      <TableRow><TableCell colSpan={5} align="center">ไม่พบข้อมูลที่เสร็จสิ้น</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </TableContainer>
          </Paper>
        </div>
      </main>

      <Dialog open={rejectModal.open} onClose={handleRejectClose} fullWidth maxWidth="sm">
        <DialogTitle>ระบุเหตุผลที่ปฏิเสธ</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            margin="dense"
            label="คอมเมนต์ถึงนักศึกษา"
            value={rejectModal.reason}
            onChange={(event) => setRejectModal((prev) => ({ ...prev, reason: event.target.value }))}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleRejectClose}>ยกเลิก</Button>
          <Button variant="contained" color="error" onClick={handleRejectConfirm}>ยืนยันการปฏิเสธ</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={evaluationModal.open}
        onClose={closeEvaluationModal}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>ประเมินนักศึกษา: {evaluationModal.studentName}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                gap: 1.5,
              }}
            >
              <TextField
                label="ชื่อนักศึกษาฝึกงาน"
                value={evaluationModal.form.traineeName}
                onChange={(event) => updateEvaluationField('traineeName', event.target.value)}
              />
              <TextField
                label="ชื่อสถานที่ฝึกงาน"
                value={companyName}
                disabled
              />
              <TextField
                label="สาขาวิชา"
                value={evaluationModal.form.major}
                onChange={(event) => updateEvaluationField('major', event.target.value)}
              />
              <TextField
                label="ตำแหน่งฝึกงาน"
                value={evaluationModal.form.position}
                onChange={(event) => updateEvaluationField('position', event.target.value)}
              />
              <TextField
                label="ระยะเวลาฝึกงานเริ่ม"
                type="date"
                value={evaluationModal.form.periodStart}
                onChange={(event) => updateEvaluationField('periodStart', event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="ระยะเวลาฝึกงานสิ้นสุด"
                type="date"
                value={evaluationModal.form.periodEnd}
                onChange={(event) => updateEvaluationField('periodEnd', event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Paper elevation={0} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                ระดับคะแนน: 5 = ดีมาก, 4 = ดี, 3 = พอใช้, 2 = ต้องปรับปรุง, 1 = ยังใช้ไม่ได้
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                คะแนนรวม: {calculateEvaluationScore(evaluationModal.form.scores)} / 100
                {' • '}
                ตอบแล้ว {EVALUATION_ITEM_IDS.filter((id) => Number(evaluationModal.form.scores?.[id] || 0) > 0).length}/{EVALUATION_ITEM_IDS.length} ข้อ
              </Typography>
            </Paper>

            {EVALUATION_FORM_SECTIONS.map((section, sectionIndex) => (
              <Box key={section.title}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>{section.title}</Typography>
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflowX: 'auto' }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ minWidth: 340 }}>รายการประเมินผล</TableCell>
                        <TableCell align="center" sx={{ width: 52 }}>5</TableCell>
                        <TableCell align="center" sx={{ width: 52 }}>4</TableCell>
                        <TableCell align="center" sx={{ width: 52 }}>3</TableCell>
                        <TableCell align="center" sx={{ width: 52 }}>2</TableCell>
                        <TableCell align="center" sx={{ width: 52 }}>1</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {section.items.map((item, itemIndex) => {
                        const itemId = `s${sectionIndex + 1}-q${itemIndex + 1}`;
                        const selected = Number(evaluationModal.form.scores?.[itemId] || 0);
                        return (
                          <TableRow key={itemId} hover>
                            <TableCell>{itemIndex + 1}. {item}</TableCell>
                            {[5, 4, 3, 2, 1].map((score) => (
                              <TableCell key={`${itemId}-${score}`} align="center" sx={{ px: 0.5 }}>
                                <Radio
                                  size="small"
                                  checked={selected === score}
                                  onChange={() => updateEvaluationScore(itemId, score)}
                                />
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                {sectionIndex < EVALUATION_FORM_SECTIONS.length - 1 && <Divider sx={{ mt: 2 }} />}
              </Box>
            ))}

            <TextField
              label="หมายเหตุเพิ่มเติม"
              multiline
              rows={4}
              value={evaluationModal.form.remark}
              onChange={(event) => updateEvaluationField('remark', event.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeEvaluationModal}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleSaveEvaluation}>บันทึกผลการประเมิน</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={messageModal.open}
        onClose={() => setMessageModal({ open: false, requestId: null, studentName: '', message: '' })}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>ส่งข้อความถึงมหาวิทยาลัย</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            นักศึกษา: {messageModal.studentName}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="ข้อความ"
            value={messageModal.message}
            onChange={(event) => setMessageModal((prev) => ({ ...prev, message: event.target.value }))}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setMessageModal({ open: false, requestId: null, studentName: '', message: '' })}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleSendMessage}>ส่งข้อความ</Button>
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

export default CompanyDashboardPage;
