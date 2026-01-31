import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './DashboardPage.css'; // Reusing layout
import './PaymentProofPage.css'; // New styles

const PaymentProofPage = () => {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', null

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setStudentName(user.full_name || user.name);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setUploadStatus(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    // Simulate upload
    try {
        // In reality, use FormData to send file
        // const formData = new FormData();
        // formData.append('receipt', file);
        // await api.post('/upload-receipt', formData);

        // Create mock payment object and save to localStorage for Admin view
        const user = JSON.parse(localStorage.getItem('user'));
        const newPayment = {
             id: Date.now(),
             studentId: user.student_code || user.username || '65xxxxx',
             studentName: user.full_name || user.name || 'นักศึกษา',
             date: new Date().toLocaleDateString('th-TH'),
             status: 'pending',
             slipUrl: 'https://via.placeholder.com/300?text=Slip+Image' // In real app, this would be the uploaded image URL
        };
        
        const existingPayments = JSON.parse(localStorage.getItem('payment_proofs') || '[]');
        existingPayments.push(newPayment);
        localStorage.setItem('payment_proofs', JSON.stringify(existingPayments));

        await new Promise(resolve => setTimeout(resolve, 1500)); // Mock delay
        setUploadStatus('success');
        setFile(null);
        setPreviewUrl(null);
        
        alert('อัพโหลดหลักฐานเรียบร้อยแล้ว รอเจ้าหน้าที่ตรวจสอบ');
    } catch (error) {
        console.error(error);
        setUploadStatus('error');
    } finally {
        setUploading(false);
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
          <Link to="/dashboard/new-request" className="nav-item">
            <span className="nav-icon">➕</span>
            <span>ยื่นคำร้องใหม่</span>
          </Link>
          <Link to="/dashboard/my-requests" className="nav-item">
            <span className="nav-icon">📝</span>
            <span>คำร้องของฉัน</span>
          </Link>
          <Link to="/dashboard/profile" className="nav-item">
            <span className="nav-icon">👤</span>
            <span>โปรไฟล์</span>
          </Link>
           <Link to="/dashboard/payment-proof" className="nav-item active">
            <span className="nav-icon">💰</span>
            <span>หลักฐานการชำระเงิน</span>
          </Link>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span>← ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
            <div>
                <h1>หลักฐานการชำระค่าธรรมเนียมออกฝึก</h1>
                <p>อัพโหลดใบเสร็จหรือสลิปการโอนเงินเพื่อยืนยัน</p>
            </div>
             <div className="user-info">
                <span>{studentName}</span>
            </div>
        </header>

        <div className="content-wrapper">
            <div className="payment-proof-card">
                <h3>📤 อัพโหลดใบเสร็จ</h3>
                <p className="instruction-text">กรุณาแนบไฟล์รูปภาพ (JPG, PNG) ของหลักฐานการชำระเงิน</p>
                
                <form onSubmit={handleUpload} className="upload-form">
                    <div className="file-drop-area">
                        {previewUrl ? (
                            <div className="image-preview">
                                <img src={previewUrl} alt="Preview" />
                                <button type="button" className="remove-btn" onClick={() => {
                                    setFile(null);
                                    setPreviewUrl(null);
                                }}>❌ ยกเลิก</button>
                            </div>
                        ) : (
                            <div className="placeholder-preview">
                                <span className="icon">📷</span>
                                <span>คลิกเพื่อเลือกรูปภาพ</span>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleFileChange}
                                    className="file-input"
                                />
                            </div>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        className={`submit-btn ${uploading ? 'disabled' : ''}`}
                        disabled={!file || uploading}
                    >
                        {uploading ? 'กำลังอัพโหลด...' : 'ยืนยันการส่งหลักฐาน'}
                    </button>

                    {uploadStatus === 'success' && (
                        <div className="success-message">
                            ✅ ส่งหลักฐานเรียบร้อยแล้ว รอการตรวจสอบจากเจ้าหน้าที่
                        </div>
                    )}
                     {uploadStatus === 'error' && (
                        <div className="error-message">
                            ❌ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง
                        </div>
                    )}
                </form>
            </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentProofPage;
