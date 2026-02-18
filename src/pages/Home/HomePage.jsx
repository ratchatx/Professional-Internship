import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import asyncStorage from '../../utils/asyncStorage';
import './HomePage.css';
import logo from '../../assets/LASC-SSKRU-1.png';
import banner from '../../assets/Banner.jpg';

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [companyCatalog, setCompanyCatalog] = useState([]);

  const fallbackCompanies = [
    { name: 'บริษัท ABC', businessType: 'เทคโนโลยีสารสนเทศ', address: 'สงขลา', source: 'รายการแนะนำ', imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop&crop=top' },
    { name: 'บริษัท NEX Digital', businessType: 'ซอฟต์แวร์และดิจิทัลโซลูชัน', address: 'หาดใหญ่', source: 'รายการแนะนำ', imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop&crop=top' },
    { name: 'บริษัท Green Agro Tech', businessType: 'เทคโนโลยีการเกษตร', address: 'พัทลุง', source: 'รายการแนะนำ', imageUrl: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=800&auto=format&fit=crop&crop=top' },
    { name: 'บริษัท HealthPlus Care', businessType: 'สุขภาพและสาธารณสุข', address: 'สงขลา', source: 'รายการแนะนำ', imageUrl: 'https://picsum.photos/id/1011/800/600' },
    { name: 'บริษัท BuildWise Engineering', businessType: 'วิศวกรรมและโครงสร้าง', address: 'นครศรีธรรมราช', source: 'รายการแนะนำ', imageUrl: 'https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=800&auto=format&fit=crop&crop=top' },
    { name: 'บริษัท Smart Logistics Hub', businessType: 'โลจิสติกส์และซัพพลายเชน', address: 'สุราษฎร์ธานี', source: 'รายการแนะนำ', imageUrl: 'https://picsum.photos/id/1037/800/600' },
  ];

  const normalizeCompanyName = (value) =>
    String(value || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');

  const buildCompanyCatalog = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const requests = JSON.parse(localStorage.getItem('requests') || '[]');
    const map = new Map();

    users
      .filter((item) => item.role === 'company')
      .forEach((company) => {
        const companyName = company.companyName || company.name || company.full_name || company.username || '';
        const key = normalizeCompanyName(companyName);
        if (!key) return;

        map.set(key, {
          name: companyName,
          businessType: company.businessType || 'ไม่ระบุประเภทธุรกิจ',
          address: company.address || 'ไม่ระบุที่อยู่',
          source: 'จากบัญชีบริษัท'
        });
      });

    requests.forEach((request) => {
      const companyName = request.companyName || request.company || request.details?.companyName || '';
      const key = normalizeCompanyName(companyName);
      if (!key) return;

      const existing = map.get(key);
      if (existing) {
        if (existing.businessType === 'ไม่ระบุประเภทธุรกิจ' && request.position) {
          existing.businessType = `ตำแหน่งยอดฮิต: ${request.position}`;
        }
        return;
      }

      map.set(key, {
        name: companyName,
        businessType: request.position ? `ตำแหน่งยอดฮิต: ${request.position}` : 'ไม่ระบุประเภทธุรกิจ',
        address: request.details?.address || request.address || 'ไม่ระบุที่อยู่',
        source: 'จากคำร้องรุ่นพี่'
      });
    });

    const result = Array.from(map.values());
    setCompanyCatalog(result.length > 0 ? result.slice(0, 12) : fallbackCompanies);
  };

  useEffect(() => {
    let mounted = true;
    asyncStorage.getItem('user').then((raw) => {
      if (!mounted) return;
      try {
        if (raw) setUser(JSON.parse(raw));
      } catch (e) {
        setUser(null);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    buildCompanyCatalog();

    const reloadCatalog = () => buildCompanyCatalog();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') reloadCatalog();
    };

    window.addEventListener('focus', reloadCatalog);
    window.addEventListener('storage', reloadCatalog);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', reloadCatalog);
      window.removeEventListener('storage', reloadCatalog);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const handleLogout = async () => {
    await asyncStorage.removeItem('user');
    setUser(null);
    setMenuAnchorEl(null);
  };

  const handleOpenMenu = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  const getDashboardPath = (role) => {
    if (role === 'admin') return '/admin-dashboard';
    if (role === 'advisor') return '/advisor-dashboard';
    if (role === 'company') return '/company-dashboard';
    return '/dashboard';
  };

  const getProfilePath = (role) => {
    if (role === 'admin') return '/admin-dashboard/profile';
    if (role === 'company') return '/company-dashboard/profile';
    if (role === 'student') return '/dashboard/profile';
    return null;
  };

  return (
    <div className="home-container">
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #e5e7eb', bgcolor: '#ffffff' }}>
        <Toolbar
          sx={{
            minHeight: 90,
            px: { xs: 2, md: 4 },
            display: 'flex',
            flexWrap: 'nowrap',
            justifyContent: 'space-between',
            gap: 2,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ minWidth: 0, flex: '1 1 auto', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                component="img"
                src={logo}
                alt="LASC Logo"
                sx={{
                  height: { xs: 36, sm: 44, md: 54 },
                  width: 'auto',
                  maxWidth: '100%',
                  display: 'block',
                  objectFit: 'contain',
                }}
              />
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography sx={{ fontWeight: 800, fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }, letterSpacing: '0.2px' }}>
                  Professional Internship
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 0.75, sm: 1.25 },
              flex: '0 0 auto',
              whiteSpace: 'nowrap',
            }}
          >
            {!user ? (
              <Button component={Link} to="/login" variant="text" sx={{ color: '#111111', fontWeight: 600, minWidth: 'auto', px: 1 }}>
                เข้าสู่ระบบ
              </Button>
            ) : (
              <>
                <Button
                  component={Link}
                  to={getDashboardPath(user.role)}
                  variant="text"
                  sx={{
                    color: '#111111',
                    fontWeight: 700,
                    minWidth: 'auto',
                    px: { xs: 0.5, sm: 1 },
                  }}
                >
                  Dashboard
                </Button>

                <IconButton onClick={handleOpenMenu} size="small" sx={{ p: 0.25 }}>
                  <Avatar sx={{ width: 38, height: 38, bgcolor: '#111111', fontSize: '1rem', fontWeight: 700 }}>
                    {(user?.name || user?.full_name || 'U').charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>

                <Menu
                  anchorEl={menuAnchorEl}
                  open={Boolean(menuAnchorEl)}
                  onClose={handleCloseMenu}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  {getProfilePath(user.role) && (
                    <MenuItem
                      component={Link}
                      to={getProfilePath(user.role)}
                      onClick={handleCloseMenu}
                    >
                      โปรไฟล์
                    </MenuItem>
                  )}
                  <MenuItem className="logout-btn" onClick={handleLogout}>ออกจากระบบ</MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <main className="hero-section" style={{
        backgroundImage: `url(${banner})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
      }}>
        <div className="hero-content">
          <div className="hero-buttons">
            {/* Buttons removed */ }
          </div>
        </div>
      </main>

      <section className="features-section">
        <h2 className="section-title">สถานประกอบการแนะนำ</h2>
        <div className="features-grid">
          {companyCatalog.map((company) => (
            <div className="feature-card" key={`${company.name}-${company.source}`}>
              {company.imageUrl && (
                <Box
                  component="img"
                  src={company.imageUrl}
                  alt={company.name}
                  sx={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 1, mb: 2 }}
                />
              )}
              <h3>{company.name}</h3>
              <p>{company.businessType}</p>
              <p>พื้นที่: {company.address}</p>
              <p className="catalog-source">{company.source}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="how-it-works">
        <h2 className="section-title">ขั้นตอนการใช้งาน</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>ยื่นคำร้อง</h3>
            <p>กรอกแบบฟอร์มคำร้องขอฝึกงาน</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>รอการอนุมัติ</h3>
            <p>รอผู้ดูแลระบบตรวจสอบ</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>เริ่มฝึกงาน</h3>
            <p>เริ่มฝึกงานตามที่ได้รับอนุมัติ</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2026 ระบบคำร้องฝึกงานวิชาชีพ. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
