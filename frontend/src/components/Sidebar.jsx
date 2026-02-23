import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { to: '/', icon: '🏠', label: 'Günün Hadisi' },
    { to: '/hadiths', icon: '📖', label: 'Hadisler' },
    { to: '/badges', icon: '🏅', label: 'Rozetler' },
    { to: '/leaderboard', icon: '🏆', label: 'Sıralama' },
    { to: '/progress', icon: '📊', label: 'İlerleme' },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <nav className="sidebar">
            <div className="sidebar-logo">
                <span className="logo-icon">🕌</span>
                <div>
                    <h1>Hadis Akademi</h1>
                    <span>10. Sınıf Hadis Dersi</span>
                </div>
            </div>

            <div className="nav-section">
                <div className="nav-label">Menü</div>
                {navItems.map(item => (
                    <NavLink key={item.to} to={item.to} end={item.to === '/'}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <span className="nav-icon">{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
                {user?.role === 'teacher' && (
                    <NavLink to="/teacher" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <span className="nav-icon">👨‍🏫</span>
                        Öğretmen Paneli
                    </NavLink>
                )}
            </div>

            {/* Points display */}
            <div style={{ margin: '16px 0', padding: '14px 12px', background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 6, fontWeight: 600 }}>TOPLAM PUAN</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--gold)' }}>⭐ {user?.points || 0}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>🔥 {user?.streak || 0} günlük seri</div>
            </div>

            <div className="sidebar-footer">
                <div className="user-chip">
                    <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
                    <div>
                        <div className="user-chip-name">{user?.name}</div>
                        <div className="user-chip-role">{user?.role === 'teacher' ? '👨‍🏫 Öğretmen' : '🎓 Öğrenci'} {user?.class ? `• ${user.class}` : ''}</div>
                    </div>
                </div>
                <button className="logout-btn" onClick={handleLogout}>🚪 Çıkış Yap</button>
            </div>
        </nav>
    );
}
