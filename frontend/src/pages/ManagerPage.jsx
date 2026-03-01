import { useState, useEffect } from 'react';
import api from '../services/api';

export default function ManagerPage() {
    const [tab, setTab] = useState('stats');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Class Form
    const [showClassForm, setShowClassForm] = useState(false);
    const [classForm, setClassForm] = useState({ name: '' });

    useEffect(() => { loadData(); }, [tab]);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            if (tab === 'stats') {
                const res = await api.get('/manager/stats');
                setStats(res.data);
            } else if (tab === 'users') {
                const res = await api.get('/manager/users');
                setUsers(res.data);
            } else if (tab === 'classrooms') {
                const res = await api.get('/manager/classrooms');
                setClassrooms(res.data);
            }
        } catch (err) {
            console.error('Data loading error:', err);
            setError('Veriler yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    // User actions
    const approveUser = async (id) => {
        try {
            await api.put(`/manager/teachers/${id}/approve`);
            setSuccess('Öğretmen onaylandı.');
            loadData();
        } catch (err) { setError('İşlem başarısız.'); }
    };
    const rejectUser = async (id) => {
        try {
            await api.put(`/manager/teachers/${id}/reject`);
            setSuccess('Öğretmen reddedildi.');
            loadData();
        } catch (err) { setError('İşlem başarısız.'); }
    };
    const deleteUser = async (id) => {
        if (confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
            try {
                await api.delete(`/manager/users/${id}`);
                setSuccess('Kullanıcı silindi.');
                loadData();
            } catch (err) { setError('Silme işlemi başarısız.'); }
        }
    };

    // Class actions
    const saveClass = async (e) => {
        e.preventDefault();
        try {
            await api.post('/manager/classrooms', classForm);
            setShowClassForm(false); setClassForm({ name: '' });
            setSuccess('Sınıf başarıyla eklendi.');
            loadData();
        } catch (err) { setError('Sınıf eklenirken hata oluştu.'); }
    };
    const deleteClass = async (id) => {
        if (confirm('Bu sınıfı silmek istediğinize emin misiniz?')) {
            try {
                await api.delete(`/manager/classrooms/${id}`);
                setSuccess('Sınıf silindi.');
                loadData();
            } catch (err) { setError('Sınıf silinemedi.'); }
        }
    };

    // Filter helpers
    const filteredUsers = users.filter(u => {
        const name = u.name || '';
        const email = u.email || '';
        const matchSearch = !userSearch ||
            name.toLowerCase().includes(userSearch.toLowerCase()) ||
            email.toLowerCase().includes(userSearch.toLowerCase());
        const matchRole = !userRoleFilter || u.role === userRoleFilter;
        return matchSearch && matchRole;
    });

    const pendingTeachers = users.filter(u => u.role === 'teacher' && !u.isApproved);

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h2>🏫 İdareci Paneli</h2>
                <p>Okul yönetimi ve istatistikler</p>
            </div>

            {error && <div className="error-msg" style={{ marginBottom: 16 }}>⚠️ {error}</div>}
            {success && <div className="success-msg" style={{ marginBottom: 16 }}>✅ {success}</div>}

            {/* Onay bekleyen öğretmenler - Bildirim kartı */}
            {pendingTeachers.length > 0 && tab !== 'users' && (
                <div className="card" style={{ marginBottom: 16, borderColor: 'rgba(249,183,43,0.3)', background: 'linear-gradient(135deg, rgba(249,183,43,0.06), var(--card))' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold)', marginBottom: 10 }}>
                        ⏳ Onay Bekleyen Öğretmenler ({pendingTeachers.length})
                    </div>
                    {pendingTeachers.map(u => (
                        <div key={u._id} className="flex-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                            <div>
                                <span style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</span>
                                <span style={{ fontSize: 12, color: 'var(--text-dim)', marginLeft: 8 }}>{u.email}</span>
                            </div>
                            <div className="flex-gap" style={{ gap: 6 }}>
                                <button className="btn btn-green btn-sm" onClick={() => approveUser(u._id)}>✅ Onayla</button>
                                <button className="btn btn-red btn-sm" onClick={() => rejectUser(u._id)}>❌ Reddet</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="tabs">
                <button className={`tab-btn ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>📊 İstatistikler</button>
                <button className={`tab-btn ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>👥 Kullanıcılar</button>
                <button className={`tab-btn ${tab === 'classrooms' ? 'active' : ''}`} onClick={() => setTab('classrooms')}>🏫 Sınıf Yönetimi</button>
            </div>

            {loading ? <div className="loading-spinner">⏳</div> : (
                <>
                    {/* ========== İSTATİSTİKLER ========== */}
                    {tab === 'stats' && stats && (
                        <div>
                            <div className="grid-3" style={{ marginBottom: 20 }}>
                                <div className="stat-box"><div className="stat-icon">👥</div><div className="stat-value" style={{ color: 'var(--primary)' }}>{stats.totalStudents}</div><div className="stat-label">Öğrenci</div></div>
                                <div className="stat-box"><div className="stat-icon">👨‍🏫</div><div className="stat-value" style={{ color: 'var(--green)' }}>{stats.totalTeachers}</div><div className="stat-label">Öğretmen</div></div>
                                <div className="stat-box"><div className="stat-icon">🏫</div><div className="stat-value" style={{ color: 'var(--purple)' }}>{stats.totalClassrooms}</div><div className="stat-label">Sınıf</div></div>
                            </div>

                            <div className="card" style={{ marginBottom: 16 }}>
                                <div className="card-title" style={{ marginBottom: 4 }}>🎯 Okul Başarı Oranı</div>
                                <div style={{ fontSize: 36, fontWeight: 900, color: stats.avgScore >= 70 ? 'var(--green)' : 'var(--gold)' }}>%{stats.avgScore}</div>
                                <div className="progress-bar-outer" style={{ marginTop: 8 }}>
                                    <div className="progress-bar-inner" style={{ width: `${stats.avgScore}%` }} />
                                </div>
                            </div>

                            {stats.topStudents?.length > 0 && (
                                <div className="card">
                                    <div className="card-title" style={{ marginBottom: 12 }}>🏆 En Başarılı 5 Öğrenci</div>
                                    {stats.topStudents.map((s, i) => (
                                        <div key={i} className="flex-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <span style={{ fontWeight: 800, fontSize: 16, color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--text-dim)', width: 28 }}>
                                                    {i + 1}.
                                                </span>
                                                <span style={{ fontWeight: 600 }}>{s.name}</span>
                                                <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{s.classroom?.name}</span>
                                            </div>
                                            <span style={{ color: 'var(--gold)', fontWeight: 700 }}>⭐ {s.points}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ========== KULLANICILAR ========== */}
                    {tab === 'users' && (
                        <div>
                            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                                <div className="search-bar" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
                                    <span className="search-icon">🔍</span>
                                    <input placeholder="Ad veya e-posta ara..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                                </div>
                                <select className="form-select" value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)} style={{ width: 'auto' }}>
                                    <option value="">Tüm Roller</option>
                                    <option value="student">Öğrenci</option>
                                    <option value="teacher">Öğretmen</option>
                                </select>
                            </div>

                            <div className="card" style={{ overflowX: 'auto' }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Kullanıcı</th>
                                            <th>Rol</th>
                                            <th>Durum</th>
                                            <th>Puan</th>
                                            <th>İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map(u => (
                                            <tr key={u._id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--primary), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: 'white', flexShrink: 0 }}>
                                                            {u.name?.[0]}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div>
                                                            <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                                                                {u.email} {u.classroom && `• ${u.classroom.name}`}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ fontSize: 12, textTransform: 'capitalize' }}>
                                                    {u.role === 'student' ? 'Öğrenci' : u.role === 'teacher' ? 'Öğretmen' : u.role}
                                                </td>
                                                <td>
                                                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 600, background: u.isApproved ? 'var(--green-dim)' : 'var(--red-dim)', color: u.isApproved ? 'var(--green)' : 'var(--red)' }}>
                                                        {u.isApproved ? 'Aktif' : 'Bekliyor'}
                                                    </span>
                                                </td>
                                                <td style={{ color: 'var(--gold)', fontWeight: 600 }}>⭐ {u.points || 0}</td>
                                                <td>
                                                    <div className="flex-gap" style={{ gap: 4 }}>
                                                        {!u.isApproved && u.role === 'teacher' && <button className="btn btn-green btn-sm" onClick={() => approveUser(u._id)}>Onayla</button>}
                                                        <button className="btn btn-red btn-sm" onClick={() => deleteUser(u._id)}>Sil</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ========== SINIFLAR ========== */}
                    {tab === 'classrooms' && (
                        <div>
                            <div className="flex-between" style={{ marginBottom: 12 }}>
                                <h3 style={{ fontSize: 18 }}>🏫 Okul Sınıfları</h3>
                                <button className="btn btn-primary btn-sm" onClick={() => setShowClassForm(true)}>➕ Yeni Sınıf Ekle</button>
                            </div>
                            <div className="card">
                                {classrooms.map(c => (
                                    <div key={c._id} className="flex-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{c.name}</div>
                                            <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>ID: {c._id}</div>
                                        </div>
                                        <div className="flex-gap">
                                            <button className="btn btn-red btn-sm" onClick={() => deleteClass(c._id)}>🗑️ Sil</button>
                                        </div>
                                    </div>
                                ))}
                                {classrooms.length === 0 && <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-dim)' }}>Henüz sınıf eklenmemiş.</div>}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Class Form Modal */}
            {showClassForm && (
                <div className="modal-overlay" onClick={() => setShowClassForm(false)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>🏫 Yeni Sınıf Ekle</h3>
                            <button className="modal-close" onClick={() => setShowClassForm(false)}>✕</button>
                        </div>
                        <form onSubmit={saveClass}>
                            <div className="form-group">
                                <label className="form-label">Sınıf Adı</label>
                                <input className="form-input" placeholder="Örn: 9-A, 10-C" value={classForm.name} onChange={e => setClassForm({ name: e.target.value })} required />
                            </div>
                            <button type="submit" className="btn btn-primary btn-full">💾 Kaydet</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
