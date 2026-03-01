import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const studentNavItems = [
    { to: '/', icon: '🌙', label: 'Günün Hadisi' },
    { to: '/hadiths', icon: '📖', label: 'Hadisler' },
    { to: '/memorized', icon: '✅', label: 'Ezberler' },
    { to: '/quiz', icon: '🎯', label: 'Quizler' },
    { to: '/school-program', icon: '🎓', label: 'Okul Ezber' },
    { to: '/badges', icon: '🏅', label: 'Rozetler' },
    { to: '/leaderboard', icon: '🏆', label: 'Sıralama' },
    { to: '/progress', icon: '📊', label: 'İlerleme' },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => { logout(); navigate('/login'); setIsOpen(false); };
    const closeSidebar = () => setIsOpen(false);

    // Close sidebar on route change
    useEffect(() => {
        const handleResize = () => { if (window.innerWidth > 768) setIsOpen(false); };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const roleLabel =
        user?.role === 'admin' ? '🛡️ Admin' :
            user?.role === 'principal' ? '🏫 Müdür' :
                user?.role === 'assistant_principal' ? '🏫 Müdür Yrd.' :
                    user?.role === 'teacher' ? '👨‍🏫 Öğretmen' : '🎓 Öğrenci';

    return (
        <>
            {/* Mobile Header */}
            <div className="mobile-header">
                <button className="hamburger-btn" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? '✕' : '☰'}
                </button>
                <span className="mobile-logo">🕌 Hadis Akademi</span>
                <span className="mobile-points">⭐ {user?.points || 0}</span>
            </div>

            {/* Mobile Overlay */}
            <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={closeSidebar} />

            {/* Sidebar */}
            <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-logo">
                    <span className="logo-icon">🕌</span>
                    <div>
                        <h1>Hadis Akademi</h1>
                        <span>Hadis Eğitim Platformu</span>
                    </div>
                </div>

                <div className="nav-section">
                    <div className="nav-label">Ana Menü</div>
                    {studentNavItems.map(item => (
                        <NavLink key={item.to} to={item.to} end={item.to === '/'}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            onClick={closeSidebar}>
                            <span className="nav-icon">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}

                    {user?.role === 'student' && (
                        <NavLink to="/my-class" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                            <span className="nav-icon">🏫</span>
                            Sınıfım
                        </NavLink>
                    )}

                    {(user?.role === 'teacher' || user?.role === 'admin') && (
                        <>
                            <div className="nav-label" style={{ marginTop: 16 }}>Yönetim</div>
                            <NavLink to="/teacher" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                                <span className="nav-icon">👨‍🏫</span>
                                Öğretmen Paneli
                            </NavLink>
                            <NavLink to="/my-classes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                                <span className="nav-icon">🏫</span>
                                Sınıflarım
                            </NavLink>
                        </>
                    )}

                    {(user?.role === 'principal' || user?.role === 'assistant_principal' || user?.role === 'admin') && (
                        <>
                            {user?.role !== 'admin' && <div className="nav-label" style={{ marginTop: 16 }}>Okul Yönetimi</div>}
                            <NavLink to="/manager" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                                <span className="nav-icon">🏫</span>
                                İdareci Paneli
                            </NavLink>
                        </>
                    )}

                    {user?.role === 'admin' && (
                        <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                            <span className="nav-icon">🛡️</span>
                            Admin Paneli
                        </NavLink>
                    )}
                </div>

                {/* Points */}
                {user?.role === 'student' && (
                    <div className="sidebar-points">
                        <div className="pts-label">Toplam Puan</div>
                        <div className="pts-value">⭐ {user?.points || 0}</div>
                        <div className="pts-streak">🔥 {user?.streak || 0} günlük seri</div>
                    </div>
                )}

                <div className="sidebar-footer">
                    <div className="user-chip">
                        <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
                        <div style={{ overflow: 'hidden' }}>
                            <div className="user-chip-name">{user?.name}</div>
                            <div className="user-chip-role">{roleLabel} {user?.classroom?.name ? `• ${user.classroom.name}` : user?.class ? `• ${user.class}` : ''}</div>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>🚪 Çıkış Yap</button>
                </div>
            </nav>
        </>
    );
}
