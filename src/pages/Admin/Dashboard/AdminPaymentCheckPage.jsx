import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import asyncStorage from '../../../utils/asyncStorage';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, TextField, MenuItem, Button, Snackbar, Alert as MuiAlert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import './AdminPaymentCheckPage.css';

const AdminPaymentCheckPage = () => {
    const navigate = useNavigate();
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
    const [payments, setPayments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
    const [slipDialog, setSlipDialog] = useState({ open: false, imageUrl: '', studentName: '', fileName: '' });
    
    useEffect(() => {
        const checkAdmin = async () => {
            const userStr = localStorage.getItem('user');
             if (userStr) {
                  const user = JSON.parse(userStr);
                  if (user.role !== 'admin') {
                     navigate('/dashboard'); 
                     return;
                  }
            } else {
                navigate('/login');
                return; 
            }

            // Load users to get department info
            const usersJson = await asyncStorage.getItem('users');
            const users = usersJson ? JSON.parse(usersJson) : [];
            const getDept = (id) => {
                const u = users.find(u => u.studentId === id || u.student_code === id || u.username === id);
                return u ? (u.department || u.major) : 'N/A';
            };

            // In a real app, you would fetch from API. 
            // For now, let's load from localStorage where PaymentProofPage.jsx might have saved data,
            // or we can simulate some data if none exists
            const storedPayments = JSON.parse(localStorage.getItem('payment_proofs') || '[]');
            
            let paymentData = [];
            // Mock data if empty for demonstration
            if (storedPayments.length === 0) {
                 const mockPayments = [
                     { id: 1, studentId: '65000001', studentName: 'สมชาย ใจดี', date: '2023-10-25', status: 'pending', slipUrl: 'https://via.placeholder.com/150', department: 'วิศวกรรมคอมพิวเตอร์' },
                     { id: 2, studentId: '65000002', studentName: 'สมหญิง รักเรียน', date: '2023-10-26', status: 'approved', slipUrl: 'https://via.placeholder.com/150', department: 'วิศวกรรมไฟฟ้า' }
                 ];
                 paymentData = mockPayments;
            } else {
                 paymentData = storedPayments.map(p => ({
                     ...p,
                     department: p.department || getDept(p.studentId) || 'ไม่ระบุ'
                 }));
            }
            setPayments(paymentData);

        };
        checkAdmin();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    const handleApprove = (id) => {
        const updated = payments.map(p => p.id === id ? { ...p, status: 'approved' } : p);
        setPayments(updated);
        // localStorage.setItem('payment_proofs', JSON.stringify(updated));
        setToast({ open: true, message: 'อนุมัติการชำระเงินเรียบร้อย', severity: 'success' });
    };

    const handleReject = (id) => {
        const updated = payments.map(p => p.id === id ? { ...p, status: 'rejected' } : p);
        setPayments(updated);
        // localStorage.setItem('payment_proofs', JSON.stringify(updated));
            setToast({ open: true, message: 'ปฏิเสธการชำระเงินเรียบร้อย', severity: 'info' });
    };

    const handleOpenSlip = (payment) => {
        const imageUrl = payment.slipDataUrl || payment.slipUrl || '';
        if (!imageUrl) {
            setToast({ open: true, message: 'ไม่พบรูปสลิปของรายการนี้', severity: 'warning' });
            return;
        }

        setSlipDialog({
            open: true,
            imageUrl,
            studentName: payment.studentName,
            fileName: payment.slipFileName || ''
        });
    };

    const handleCloseSlip = () => {
        setSlipDialog({ open: false, imageUrl: '', studentName: '', fileName: '' });
    };

    const handleDownloadSlip = () => {
        if (!slipDialog.imageUrl) {
            setToast({ open: true, message: 'ไม่พบรูปที่ต้องการดาวน์โหลด', severity: 'warning' });
            return;
        }

        const link = document.createElement('a');
        link.href = slipDialog.imageUrl;
        link.download = slipDialog.fileName || `payment-slip-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    // Get unique departments
    const departments = departmentOptions;

    const filteredPayments = payments.filter(p => {
        if (selectedDepartment === 'all') return true;
        return p.department === selectedDepartment;
    });

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
                    <Link to="/admin-dashboard" className="nav-item">
                        <span>หน้าหลัก</span>
                    </Link>
                    <Link to="/admin-dashboard/students" className="nav-item">
                        <span>นักศึกษา</span>
                    </Link>
                    <Link to="/admin-dashboard/users" className="nav-item">
                        <span>จัดการผู้ใช้</span>
                    </Link>
                    <Link to="/admin-dashboard/payments" className="nav-item active">
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
                        <h1>ตรวจสอบการชำระเงิน</h1>
                        <p>จัดการหลักฐานการชำระเงินจากนักศึกษา</p>
                    </div>
                </header>

                <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, p: 2, mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                        รายการหลักฐานการชำระเงิน
                    </Typography>
                        <div className="filter-group" style={{display: 'flex', gap: 10, alignItems: 'center'}}>
                        <TextField
                            select
                            size="small"
                            label="คัดกรองสาขา"
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            sx={{ minWidth: 280 }}
                        >
                            <MenuItem value="all">ทั้งหมด</MenuItem>
                            {departments.map((dept, idx) => (
                                <MenuItem key={idx} value={dept}>{dept}</MenuItem>
                            ))}
                        </TextField>
                                        </div><br/>
                                                <TableContainer component={Box} className="compact-table">
                                                    <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>รหัสนักศึกษา</TableCell>
                                    <TableCell>ชื่อ-นามสกุล</TableCell>
                                    <TableCell>สาขา</TableCell>
                                    <TableCell>วันที่ส่ง</TableCell>
                                    <TableCell>หลักฐาน</TableCell>
                                    <TableCell>สถานะ</TableCell>
                                    <TableCell>จัดการ</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredPayments.map((payment) => (
                                    <TableRow key={payment.id} hover>
                                        <TableCell>{payment.studentId}</TableCell>
                                        <TableCell>{payment.studentName}</TableCell>
                                        <TableCell>{payment.department}</TableCell>
                                        <TableCell>{payment.date}</TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                variant="text"
                                                onClick={() => handleOpenSlip(payment)}
                                                sx={{ textDecoration: 'underline', minWidth: 0, p: 0 }}
                                            >
                                                ดูสลิป
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            {payment.status === 'pending' && <span className="status-badge" style={{background: '#fff3cd', color: '#856404'}}>รอตรวจสอบ</span>}
                                            {payment.status === 'approved' && <span className="status-badge" style={{background: '#d4edda', color: '#155724'}}>อนุมัติแล้ว</span>}
                                            {payment.status === 'rejected' && <span className="status-badge" style={{background: '#f8d7da', color: '#721c24'}}>ไม่อนุมัติ</span>}
                                        </TableCell>
                                        <TableCell>
                                            {payment.status === 'pending' && (
                                                <div className="action-buttons">
                                                    <Button size="small" variant="contained" color="success" onClick={() => handleApprove(payment.id)}>✓</Button>
                                                    <Button size="small" variant="contained" color="error" onClick={() => handleReject(payment.id)}>✗</Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredPayments.length === 0 && (
                                    <TableRow><TableCell colSpan={7} align="center">ไม่พบรายการแจ้งชำระเงิน</TableCell></TableRow>
                                )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                </Paper>

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

                <Dialog
                    open={slipDialog.open}
                    onClose={handleCloseSlip}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>
                        สลิปการชำระเงิน {slipDialog.studentName ? `- ${slipDialog.studentName}` : ''}
                    </DialogTitle>
                    <DialogContent dividers>
                        {slipDialog.fileName && (
                            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                                ชื่อไฟล์: {slipDialog.fileName}
                            </Typography>
                        )}
                        <Box
                            component="img"
                            src={slipDialog.imageUrl}
                            alt="slip-preview"
                            sx={{
                                width: '100%',
                                maxHeight: '70vh',
                                objectFit: 'contain',
                                borderRadius: 1,
                                border: '1px solid #e5e7eb'
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseSlip}>ปิด</Button>
                        <Button variant="contained" onClick={handleDownloadSlip}>ดาวน์โหลด</Button>
                    </DialogActions>
                </Dialog>
            </main>
        </div>
    );
};

export default AdminPaymentCheckPage;
