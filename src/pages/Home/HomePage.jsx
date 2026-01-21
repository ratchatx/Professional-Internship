import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import asyncStorage from '../../utils/asyncStorage';
import './HomePage.css';

const HomePage = () => {
  const [user, setUser] = useState(null);

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

  const handleLogout = async () => {
    await asyncStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>ระบบคำร้องฝึกงานวิชาชีพ</h1>
        </div>
        <div className="nav-actions">
          {!user ? (
            <>
              <Link to="/register" className="nav-link">ลงทะเบียน</Link>
              <Link to="/login" className="nav-link">เข้าสู่ระบบ</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard/profile" className="nav-link">โปรไฟล์</Link>
              <button className="nav-link logout-btn" onClick={handleLogout}>ออกจากระบบ</button>
            </>
          )}
        </div>
      </nav>

      <main className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">ยินดีต้อนรับสู่ระบบคำร้องฝึกงาน</h1>
          <p className="hero-description">
            ระบบจัดการคำร้องขอฝึกงานวิชาชีพสำหรับนักศึกษา อย่างมีประสิทธิภาพและสะดวกรวดเร็ว
          </p>
          <div className="hero-buttons">
            {!user && (
              <>
                <Link to="/register" className="btn btn-primary">
                  ลงทะเบียนนักศึกษา
                </Link>
                <Link to="/login" className="btn btn-secondary">
                  เข้าสู่ระบบ
                </Link>
              </>
            )}
          </div>
        </div>
      </main>

      <section className="features-section">
        <h2 className="section-title">ฟีเจอร์หลัก</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>ยื่นคำร้องออนไลน์</h3>
            <p>ยื่นคำร้องขอฝึกงานได้ง่ายๆ ผ่านระบบออนไลน์ตลอด 24 ชั่วโมง</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>ติดตามสถานะ</h3>
            <p>ตรวจสอบสถานะคำร้องของคุณได้แบบเรียลไทม์</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>อนุมัติรวดเร็ว</h3>
            <p>ระบบการอนุมัติที่รวดเร็วและมีประสิทธิภาพ</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h3>แจ้งเตือนอัตโนมัติ</h3>
            <p>รับการแจ้งเตือนเมื่อมีการอัปเดตสถานะคำร้อง</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>ใช้งานง่าย</h3>
            <p>อินเทอร์เฟซที่เรียบง่าย ใช้งานได้บนทุกอุปกรณ์</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>ปลอดภัย</h3>
            <p>ข้อมูลของคุณได้รับการปกป้องด้วยมาตรฐานสูงสุด</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2 className="section-title">ขั้นตอนการใช้งาน</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>ลงทะเบียน</h3>
            <p>สร้างบัญชีนักศึกษาในระบบ</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>ยื่นคำร้อง</h3>
            <p>กรอกแบบฟอร์มคำร้องขอฝึกงาน</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>รอการอนุมัติ</h3>
            <p>รอผู้ดูแลระบบตรวจสอบ</p>
          </div>
          <div className="step-card">
            <div className="step-number">4</div>
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
