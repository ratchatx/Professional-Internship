import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material';
import './LoginPage.css';
import lascLogo from '../assets/LASC-SSKRU-1.png';
import sskruLogo from '../assets/SSKRU-logo-400x400-1-192x192.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // 1. Try to find user in localStorage (registered users)
      const usersStr = localStorage.getItem('users');
      const users = usersStr ? JSON.parse(usersStr) : [];
      
      const foundUser = users.find(u => 
        (u.email === formData.email || u.username === formData.email) && 
        u.password === formData.password
      );

      if (foundUser) {
        console.log('Login success:', foundUser);
        localStorage.setItem('user', JSON.stringify(foundUser));
        
        switch(foundUser.role) {
            case 'admin': navigate('/admin-dashboard'); break;
            case 'advisor': navigate('/advisor-dashboard'); break;
            case 'company': navigate('/company-dashboard'); break;
            default: navigate('/dashboard');
        }
        return;
      }

      // If not found in stored users, fallback to mock demo logic (for admin/advisor if not registered)
      if (formData.email.includes('admin') || formData.email.includes('advisor')) {
        let role = 'student';
        if (formData.email.includes('admin')) role = 'admin';
        if (formData.email.includes('advisor')) role = 'advisor';

        const mockUser = {
            _id: 'mock_id_' + Date.now(),
            email: formData.email,
            role: role, 
            name: role === 'admin' ? 'Admin User' : 'Advisor User',
            full_name: role === 'admin' ? 'Admin User' : 'Advisor User',
        };
        localStorage.setItem('user', JSON.stringify(mockUser));
        if (role === 'admin') navigate('/admin-dashboard');
        else if (role === 'advisor') navigate('/advisor-dashboard');
        return;
      }
      
      alert('ไม่พบผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');

    } catch (error) {
      console.error('Login error:', error);
      alert('เข้าสู่ระบบล้มเหลว: ' + (error.response?.data?.message || 'โปรดตรวจสอบความถูกต้อง'));
    }
  };

  return (
    <Box className="login-page">
      <Box component="header" className="top-header">
        <Box className="header-content">
          <img src={lascLogo} alt="LASC Logo" className="header-logo" />
        </Box>
      </Box>

      <Box className="login-wrapper">
        <Card
          className="login-card-redesigned"
          elevation={3}
          sx={{
            width: '100%',
            maxWidth: 900,
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '15px',
              backgroundColor: '#000000',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              minHeight: { md: 500 },
              pb: 3,
            }}
          >
            <Box className="left-panel">
              <Typography variant="h5" sx={{ fontWeight: 500, color: '#111111', mb: 0.5 }}>
                Professional Internship
              </Typography>
              <Typography sx={{ color: '#333333', fontSize: '1rem', mb: 5, textAlign: 'center' }}>
                ( ระบบยื่นคำร้องขอเข้าฝึกประสบการณ์วิชาชีพ )
              </Typography>
              <Box className="university-logo-container">
                <img src={sskruLogo} alt="SSKRU Logo" className="university-logo" />
              </Box>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, borderColor: '#e5e7eb' }} />

            <Box className="right-panel">
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 4, color: '#111111' }}>
                ยินดีต้อนรับ
              </Typography>

              <Box component="form" onSubmit={handleSubmit} className="redesigned-form">
                <TextField
                  fullWidth
                  variant="standard"
                  type="text"
                  name="email"
                  label="Email (อีเมล)"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <TextField
                  fullWidth
                  variant="standard"
                  type="password"
                  name="password"
                  label="Password (รหัสผ่าน)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <FormControlLabel
                  control={<Checkbox name="rememberMe" checked={formData.rememberMe} onChange={handleChange} size="small" />}
                  label="Remember Me (จดจำการเข้าสู่ระบบ)"
                />

                <Button type="submit" variant="contained" fullWidth sx={{ mt: 1, py: 1.2, fontWeight: 700, bgcolor: '#111111' }}>
                  LOGIN
                </Button>
              </Box>
            </Box>
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default LoginPage;
