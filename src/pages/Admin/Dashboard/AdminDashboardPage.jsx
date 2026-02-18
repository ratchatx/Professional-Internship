import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as am5 from '@amcharts/amcharts5';
import * as am5percent from '@amcharts/amcharts5/percent';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import {
  Alert as MuiAlert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { STAT_EMOJI } from '../../../utils/statEmojis';
import './AdminDashboardPage.css';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [adminName, setAdminName] = useState('');
  const [allRequests, setAllRequests] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [rejectModal, setRejectModal] = useState({
    open: false,
    requestId: null,
    reason: ''
  });
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const pieChartRef = useRef(null);

  const getAdminDisplayStatus = (status) => {
    if (status === 'รออาจารย์ที่ปรึกษาอนุมัติ') return 'รออาจารย์อนุมัติ';
    if (status === 'รอผู้ดูแลระบบตรวจสอบ' || status === 'รอผู้ดูแลระบบอนุมัติ') return 'รออนุมัติ';
    return status;
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role !== 'admin') {
         navigate('/dashboard'); 
         return;
      }
      setAdminName(user.name);
      
      // Load requests
      const storedRequests = JSON.parse(localStorage.getItem('requests') || '[]');
      setAllRequests(storedRequests);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const filteredRequests = allRequests.filter(req => {
    if (filter === 'all') return true;
    if (filter === 'pending_admin') return req.status === 'รอผู้ดูแลระบบตรวจสอบ' || req.status === 'รอผู้ดูแลระบบอนุมัติ';
    if (filter === 'rejected') return req.status.includes('ไม่อนุมัติ') || req.status === 'ปฏิเสธ';
    return req.status === filter; 
  });

  const toggleSort = (key) => {
    if (sortBy === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
  };

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (!sortBy) return 0;
    const va = a[sortBy] ?? '';
    const vb = b[sortBy] ?? '';
    if (sortBy === 'submittedDate') {
      const da = new Date(va).getTime() || 0;
      const db = new Date(vb).getTime() || 0;
      return (da - db) * (sortDir === 'asc' ? 1 : -1);
    }
    // numeric-like compare for studentId
    if (sortBy === 'studentId') {
      const na = parseInt(String(va).replace(/[^0-9]/g, ''), 10) || 0;
      const nb = parseInt(String(vb).replace(/[^0-9]/g, ''), 10) || 0;
      return (na - nb) * (sortDir === 'asc' ? 1 : -1);
    }
    return String(va).localeCompare(String(vb), 'th-TH', { numeric: true }) * (sortDir === 'asc' ? 1 : -1);
  });

  const statusCounts = useMemo(() => {
    const count = {
      total: allRequests.length,
      pendingAdmin: allRequests.filter((req) => req.status === 'รอผู้ดูแลระบบตรวจสอบ' || req.status === 'รอผู้ดูแลระบบอนุมัติ').length,
      waitingCompany: allRequests.filter((req) => req.status === 'รอสถานประกอบการตอบรับ').length,
      approved: allRequests.filter((req) => req.status === 'อนุมัติแล้ว').length,
      rejected: allRequests.filter((req) => req.status.includes('ไม่อนุมัติ') || req.status === 'ปฏิเสธ').length,
    };
    return count;
  }, [allRequests]);

  const summaryCards = useMemo(() => ([
    { key: 'total', label: 'ทั้งหมด', value: statusCounts.total, color: '#2563eb', icon: STAT_EMOJI.TOTAL },
    { key: 'pendingAdmin', label: 'รอตรวจสอบ', value: statusCounts.pendingAdmin, color: '#db2777', icon: STAT_EMOJI.PENDING },
    { key: 'waitingCompany', label: 'รอสถานประกอบการ', value: statusCounts.waitingCompany, color: '#7c3aed', icon: STAT_EMOJI.PENDING },
    { key: 'approved', label: 'อนุมัติแล้ว', value: statusCounts.approved, color: '#16a34a', icon: STAT_EMOJI.APPROVED },
    { key: 'rejected', label: 'ไม่อนุมัติ', value: statusCounts.rejected, color: '#dc2626', icon: STAT_EMOJI.REJECTED },
  ]), [statusCounts]);

  const statusChartData = useMemo(() => {
    return summaryCards
      .filter((item) => item.key !== 'total')
      .map((item) => ({
        category: item.label,
        value: item.value,
        color: item.color,
      }));
  }, [summaryCards]);

  const latestRequests = useMemo(() => {
    return allRequests
      .slice()
      .sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate))
      .slice(0, 5);
  }, [allRequests]);

  const urgentAlerts = useMemo(() => {
    const notices = [];

    if (statusCounts.pendingAdmin > 0) {
      notices.push({
        severity: 'warning',
        text: `มีคำร้องรอตรวจสอบ ${statusCounts.pendingAdmin} รายการ`,
      });
    }

    if (statusCounts.rejected > 0) {
      notices.push({
        severity: 'error',
        text: `มีคำร้องที่ไม่อนุมัติ ${statusCounts.rejected} รายการ`,
      });
    }

    if (statusCounts.waitingCompany > 0) {
      notices.push({
        severity: 'info',
        text: `มีคำร้องรอสถานประกอบการตอบรับ ${statusCounts.waitingCompany} รายการ`,
      });
    }

    if (notices.length === 0) {
      notices.push({ severity: 'success', text: 'ไม่พบแจ้งเตือนด่วนในขณะนี้' });
    }

    return notices;
  }, [statusCounts]);

  useLayoutEffect(() => {
    if (!pieChartRef.current) return undefined;

    const root = am5.Root.new(pieChartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
        innerRadius: am5.percent(45),
      }),
    );

    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: 'value',
        categoryField: 'category',
      }),
    );

    const pieData = statusChartData.map((item) => ({
      category: item.category,
      value: item.value,
      sliceSettings: {
        fill: am5.color(item.color),
        stroke: am5.color('#ffffff'),
        strokeWidth: 1,
      },
    }));

    series.data.setAll(pieData);
    series.slices.template.setAll({ templateField: 'sliceSettings', tooltipText: '{category}: {value}' });
    series.labels.template.setAll({ fontSize: 12, oversizedBehavior: 'truncate', maxWidth: 110 });

    return () => {
      root.dispose();
    };
  }, [statusChartData]);

  const handleDelete = async (id) => {
    const confirmed = await window.showMuiConfirm('คุณต้องการลบคำร้องนี้ใช่หรือไม่?', {
      title: 'ยืนยันการลบคำร้อง',
      confirmText: 'ลบคำร้อง',
      cancelText: 'ยกเลิก',
    });

    if (!confirmed) return;
    const updatedRequests = allRequests.filter((req) => req.id !== id);
    setAllRequests(updatedRequests);
    localStorage.setItem('requests', JSON.stringify(updatedRequests));
  };


  const handleApprove = (requestId) => {
    // Step 3: Admin check -> Send to Company
    const newStatus = 'รอสถานประกอบการตอบรับ';
    const updated = allRequests.map(r => r.id === requestId ? {...r, status: newStatus} : r);
    setAllRequests(updated);
    localStorage.setItem('requests', JSON.stringify(updated));
    alert(`ตรวจสอบและส่งคำขอไปยังสถานประกอบการเรียบร้อยแล้ว (สถานะ: ${newStatus})`);
  };

  const handleUpdateStatus = (requestId, newStatus) => {
     const updated = allRequests.map(r => r.id === requestId ? {...r, status: newStatus} : r);
     setAllRequests(updated);
     localStorage.setItem('requests', JSON.stringify(updated));
     alert(`อัปเดตสถานะเป็น "${newStatus}" เรียบร้อยแล้ว`);
  };

  const handleReject = (requestId) => {
    setRejectModal({ open: true, requestId, reason: '' });
  };

  const handleRejectConfirm = () => {
    if (!rejectModal.reason.trim()) {
      alert('กรุณาระบุเหตุผลที่ไม่อนุมัติ');
      return;
    }

    const updated = allRequests.map(r =>
      r.id === rejectModal.requestId
        ? { ...r, status: 'ไม่อนุมัติ (Admin)', rejectReason: rejectModal.reason.trim() }
        : r
    );
    setAllRequests(updated);
    localStorage.setItem('requests', JSON.stringify(updated));
    alert(`ไม่อนุมัติคำร้องเลขที่ ${rejectModal.requestId}`);
    setRejectModal({ open: false, requestId: null, reason: '' });
  };

  const handleRejectClose = () => {
    setRejectModal({ open: false, requestId: null, reason: '' });
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'รออาจารย์ที่ปรึกษาอนุมัติ': { bg: '#e2e3e5', color: '#666' },
      'รอผู้ดูแลระบบตรวจสอบ': { bg: '#fff3cd', color: '#856404' },
      'รอผู้ดูแลระบบอนุมัติ': { bg: '#fff3cd', color: '#856404' },
      'รอสถานประกอบการตอบรับ': { bg: '#e2e8f0', color: '#2d3748' },
      'อนุมัติแล้ว': { bg: '#d4edda', color: '#155724' },
      'ไม่อนุมัติ (Admin)': { bg: '#f8d7da', color: '#721c24' },
      'ไม่อนุมัติ (อาจารย์)': { bg: '#f8d7da', color: '#721c24' },
      'ปฏิเสธ': { bg: '#f8d7da', color: '#721c24' }
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
          <h2> ผู้ดูแลระบบ</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin-dashboard" className="nav-item active">
            <span>หน้าหลัก</span>
          </Link>
          <Link to="/admin-dashboard/students" className="nav-item">
            <span>นักศึกษา</span>
          </Link>
          <Link to="/admin-dashboard/users" className="nav-item">
            <span>จัดการผู้ใช้</span>
          </Link>
           <Link to="/admin-dashboard/payments" className="nav-item">
            <span>ตรวจสอบการชำระเงิน</span>
          </Link>
          <Link to="/admin-dashboard/checkins" className="nav-item">
            <span>เช็คชื่อรายวัน</span>
          </Link>
          <Link to="/admin-dashboard/reports" className="nav-item">
            <span>รายงาน</span>
          </Link>
          <Link to="/admin-dashboard/profile" className="nav-item">
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
            <h1>ระบบจัดการคำร้องฝึกงาน</h1>
            <p>จัดการและอนุมัติคำร้องของนักศึกษา</p>
          </div>
          <Button
            variant="contained"
            onClick={() => navigate('/admin-dashboard/reports')}
            sx={{
              bgcolor: '#111111',
              '&:hover': { bgcolor: '#000000' },
              borderRadius: 2,
              px: 2,
              py: 1,
            }}
          >
            ดูรายงานทั้งหมด
          </Button>
        </header>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' },
            gap: 2,
            mb: 3,
          }}
        >
          {summaryCards.map((card) => (
            <Card
              key={card.key}
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                background: `linear-gradient(135deg, ${card.color}22 0%, #ffffff 56%)`,
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
              }}
            >
              <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      color: card.color,
                      backgroundColor: `${card.color}1a`,
                      border: `1px solid ${card.color}33`,
                      flexShrink: 0,
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                      {card.label}
                    </Typography>
                    <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 700, color: card.color }}>
                      {card.value}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', xl: '1.5fr 1fr' },
            gap: 2,
            mb: 3,
          }}
        >
          <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              กราฟภาพรวม
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>Pie (amCharts)</Typography>
                <Box ref={pieChartRef} className="dashboard-amchart" />
              </Box>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              แจ้งเตือนด่วน
            </Typography>
            <Stack spacing={1.2}>
              {urgentAlerts.map((notice, index) => (
                <MuiAlert key={`${notice.severity}-${index}`} severity={notice.severity} variant="outlined">
                  {notice.text}
                </MuiAlert>
              ))}
            </Stack>
          </Paper>
        </Box>

        <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            คำร้องล่าสุด 5 รายการ
          </Typography>
          <TableContainer component={Box} className="compact-table">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>วันที่</TableCell>
                  <TableCell>รหัสนักศึกษา</TableCell>
                  <TableCell>ชื่อ-นามสกุล</TableCell>
                  <TableCell>บริษัท</TableCell>
                  <TableCell>สถานะ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {latestRequests.map((request) => {
                  const style = getStatusBadge(request.status);
                  return (
                    <TableRow key={`recent-${request.id}`}>
                      <TableCell>{new Date(request.submittedDate).toLocaleDateString('th-TH')}</TableCell>
                      <TableCell>{request.studentId}</TableCell>
                      <TableCell>{request.studentName}</TableCell>
                      <TableCell>{request.company}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={getAdminDisplayStatus(request.status)}
                          sx={{ bgcolor: style.bg, color: style.color, fontWeight: 700 }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {latestRequests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">ไม่มีข้อมูล</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Paper className="content-section" elevation={0} sx={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 2, boxShadow: 'none', p: { xs: 2, md: 3 } }}>
          <div className="section-header">
            <h2>คำร้องทั้งหมด</h2>
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                ทั้งหมด
              </button>
              <button 
                className={`filter-btn ${filter === 'pending_admin' ? 'active' : ''}`}
                onClick={() => setFilter('pending_admin')}
              >
                รอตรวจสอบ
              </button>
              <button 
                className={`filter-btn ${filter === 'รอสถานประกอบการตอบรับ' ? 'active' : ''}`}
                onClick={() => setFilter('รอสถานประกอบการตอบรับ')}
              >
                รอสถานประกอบการ
              </button>
              <button 
                className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
                onClick={() => setFilter('อนุมัติแล้ว')}
              >
                อนุมัติแล้ว
              </button>
              <button 
                className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
                onClick={() => setFilter('rejected')}
              >
                ไม่อนุมัติ
              </button>
            </div>
          </div>

          <TableContainer component={Box} className="compact-table">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell className="sortable" onClick={() => toggleSort('studentId')}>รหัสนักศึกษา {sortBy === 'studentId' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</TableCell>
                  <TableCell className="sortable" onClick={() => toggleSort('studentName')}>ชื่อ-นามสกุล {sortBy === 'studentName' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</TableCell>
                  <TableCell className="sortable" onClick={() => toggleSort('department')}>สาขา {sortBy === 'department' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</TableCell>
                  <TableCell className="sortable" onClick={() => toggleSort('company')}>บริษัท {sortBy === 'company' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</TableCell>
                  <TableCell className="sortable" onClick={() => toggleSort('submittedDate')}>วันที่ยื่น {sortBy === 'submittedDate' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</TableCell>
                  <TableCell className="sortable" onClick={() => toggleSort('status')}>สถานะ {sortBy === 'status' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</TableCell>
                  <TableCell>จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedRequests.map((request) => {
                  const statusStyle = getStatusBadge(request.status);
                  const displayStatus = getAdminDisplayStatus(request.status);
                  return (
                    <TableRow key={request.id} hover>
                      <TableCell>{request.studentId}</TableCell>
                      <TableCell>{request.studentName}</TableCell>
                      <TableCell>{request.department}</TableCell>
                      <TableCell>{request.company}</TableCell>
                      <TableCell>{new Date(request.submittedDate).toLocaleDateString('th-TH')}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={displayStatus}
                          sx={{ bgcolor: statusStyle.bg, color: statusStyle.color, fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="action-buttons">
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(request.id)}
                            style={{ padding: '5px 10px', background: '#ff4d4d', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >ลบ</button>
                          {(request.status === 'รอผู้ดูแลระบบตรวจสอบ' || request.status === 'รอผู้ดูแลระบบอนุมัติ') && (
                            <>
                              <button className="btn-approve" onClick={() => handleApprove(request.id)} title="ส่งต่อให้สถานประกอบการ">✓</button>
                              <button className="btn-reject" onClick={() => handleReject(request.id)} title="ไม่อนุมัติ">✗</button>
                            </>
                          )}
                          {request.status === 'อนุมัติแล้ว' && (
                            <button className="btn-next-step" onClick={() => handleUpdateStatus(request.id, 'ออกฝึกงาน')} style={{ padding: '5px 10px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>เริ่มฝึกงาน</button>
                          )}
                          {request.status === 'ออกฝึกงาน' && (
                            <button className="btn-finish" onClick={() => handleUpdateStatus(request.id, 'ฝึกงานเสร็จแล้ว')} style={{ padding: '5px 10px', background: '#48bb78', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>จบการฝึกงาน</button>
                          )}
                          <Link to={`/dashboard/request/${request.id}`} style={{ padding: '5px 10px', background: '#edf2f7', color: '#4a5568', borderRadius: '4px', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-block', marginLeft: '5px' }}>ดูรายละเอียด</Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {sortedRequests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">ไม่มีข้อมูล</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </main>

      <Dialog open={rejectModal.open} onClose={handleRejectClose} fullWidth maxWidth="sm">
        <DialogTitle>ระบุเหตุผลที่ไม่อนุมัติ</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={4}
            label="เหตุผล"
            value={rejectModal.reason}
            onChange={(event) => setRejectModal((prev) => ({ ...prev, reason: event.target.value }))}
            placeholder="กรอกเหตุผลที่ไม่อนุมัติ"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={handleRejectClose}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleRejectConfirm} sx={{ bgcolor: '#111111', '&:hover': { bgcolor: '#000000' } }}>
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminDashboardPage;
