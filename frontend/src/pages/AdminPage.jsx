import { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminPage() {
    const [tab, setTab] = useState('users');
    const [loading, setLoading] = useState(true);

    // Users
    const [users, setUsers] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('');

    // Hadiths
    const [hadiths, setHadiths] = useState([]);
    const [hadithSearch, setHadithSearch] = useState('');
    const [showHadithForm, setShowHadithForm] = useState(false);
    const [editHadith, setEditHadith] = useState(null);
    const [hadithForm, setHadithForm] = useState({ number: '', arabic: '', turkish: '', narrator: '', source: '', topic: '', difficulty: 'orta', dailyExample: '' });

    // Badges
    const [badges, setBadges] = useState([]);
    const [showBadgeForm, setShowBadgeForm] = useState(false);
    const [editBadge, setEditBadge] = useState(null);
    const [badgeForm, setBadgeForm] = useState({ name: '', icon: '', description: '', color: '#FFD700', rarity: 'common', requirement: { type: 'points', value: 0 } });

    // Stats
    const [stats, setStats] = useState(null);

    // School Program
    const [schoolContent, setSchoolContent] = useState('');

    // Schools & Classes
    const [schools, setSchools] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [showSchoolForm, setShowSchoolForm] = useState(false);
    const [showClassForm, setShowClassForm] = useState(false);
    const [editSchool, setEditSchool] = useState(null);
    const [editClass, setEditClass] = useState(null);
    const [schoolForm, setSchoolForm] = useState({ name: '', city: '', institutionCode: '' });
    const [classForm, setClassForm] = useState({ name: '', school: '' });

    useEffect(() => { loadData(); }, [tab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (tab === 'users') {
                const res = await api.get('/admin/users');
                setUsers(res.data);
            } else if (tab === 'hadiths') {
                const res = await api.get('/hadiths?limit=200');
                setHadiths(res.data.hadiths || res.data || []);
            } else if (tab === 'badges') {
                const res = await api.get('/badges');
                setBadges(res.data);
            } else if (tab === 'stats') {
                const res = await api.get('/admin/stats');
                setStats(res.data);
            } else if (tab === 'school') {
                const res = await api.get('/school-program');
                setSchoolContent(res.data.content || '');
            } else if (tab === 'schools_classes') {
                const sRes = await api.get('/admin/schools');
                const cRes = await api.get('/admin/classrooms');
                setSchools(sRes.data);
                setClassrooms(cRes.data);
            }
        } catch (err) {
            console.error('Data loading error:', err);
            alert('Veriler yüklenirken hata oluştu: ' + (err.response?.data?.error || err.message));
        }
        setLoading(false);
    };

    // User actions
    const approveUser = async (id) => { await api.put(`/admin/users/${id}/approve`); loadData(); };
    const rejectUser = async (id) => { await api.put(`/admin/users/${id}/reject`); loadData(); };
    const deleteUser = async (id) => { if (confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) { await api.delete(`/admin/users/${id}`); loadData(); } };
    const changeRole = async (id, role) => { await api.put(`/admin/users/${id}/role`, { role }); loadData(); };

    // Hadith actions
    const saveHadith = async (e) => {
        e.preventDefault();
        try {
            if (editHadith) {
                await api.put(`/admin/hadiths/${editHadith._id}`, hadithForm);
            } else {
                await api.post('/admin/hadiths', hadithForm);
            }
            setShowHadithForm(false); setEditHadith(null);
            setHadithForm({ number: '', arabic: '', turkish: '', narrator: '', source: '', topic: '', difficulty: 'orta', dailyExample: '' });
            loadData();
        } catch (err) { alert(err.response?.data?.error || 'Hata'); }
    };

    const deleteHadith = async (id) => { if (confirm('Bu hadisi silmek istediğinize emin misiniz?')) { await api.delete(`/admin/hadiths/${id}`); loadData(); } };

    const openEditHadith = (h) => {
        setEditHadith(h);
        setHadithForm({ number: h.number, arabic: h.arabic, turkish: h.turkish, narrator: h.narrator, source: h.source, topic: h.topic, difficulty: h.difficulty, dailyExample: h.dailyExample || '' });
        setShowHadithForm(true);
    };

    const saveSchoolProgram = async () => {
        try {
            await api.put('/admin/school-program', { content: schoolContent });
            alert('Okul Ezberi açıklaması kaydedildi!');
        } catch (err) { alert(err.response?.data?.error || 'Hata'); }
    };

    // School actions
    const saveSchool = async (e) => {
        e.preventDefault();
        try {
            if (editSchool) await api.put(`/admin/schools/${editSchool._id}`, schoolForm);
            else await api.post('/admin/schools', schoolForm);
            setShowSchoolForm(false); setEditSchool(null); setSchoolForm({ name: '', city: '', institutionCode: '' });
            loadData();
        } catch (err) { alert(err.response?.data?.error || 'Hata'); }
    };
    const deleteSchool = async (id) => { if (confirm('Bu okulu silmek istediğinize emin misiniz?')) { await api.delete(`/admin/schools/${id}`); loadData(); } };

    // Class actions
    const saveClass = async (e) => {
        e.preventDefault();
        try {
            if (editClass) await api.put(`/admin/classrooms/${editClass._id}`, classForm);
            else await api.post('/admin/classrooms', classForm);
            setShowClassForm(false); setEditClass(null); setClassForm({ name: '', school: '' });
            loadData();
        } catch (err) { alert(err.response?.data?.error || 'Hata'); }
    };
    const deleteClass = async (id) => { if (confirm('Bu sınıfı silmek istediğinize emin misiniz?')) { await api.delete(`/admin/classrooms/${id}`); loadData(); } };

    // Badge actions
    const saveBadge = async (e) => {
        e.preventDefault();
        try {
            if (editBadge) {
                await api.put(`/admin/badges/${editBadge._id}`, badgeForm);
            } else {
                await api.post('/admin/badges', badgeForm);
            }
            setShowBadgeForm(false); setEditBadge(null);
            setBadgeForm({ name: '', icon: '', description: '', color: '#FFD700', rarity: 'common', requirement: { type: 'points', value: 0 } });
            loadData();
        } catch (err) { alert(err.response?.data?.error || 'Hata'); }
    };

    const deleteBadge = async (id) => { if (confirm('Bu rozeti silmek istediğinize emin misiniz?')) { await api.delete(`/admin/badges/${id}`); loadData(); } };

    const openEditBadge = (b) => {
        setEditBadge(b);
        setBadgeForm({ name: b.name, icon: b.icon, description: b.description, color: b.color, rarity: b.rarity || 'common', requirement: b.requirement || { type: 'points', value: 0 } });
        setShowBadgeForm(true);
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

    const filteredHadiths = hadiths.filter(h => !hadithSearch || h.turkish?.toLowerCase().includes(hadithSearch.toLowerCase()) || h.topic?.toLowerCase().includes(hadithSearch.toLowerCase()));

    const pendingTeachers = users.filter(u => u.role === 'teacher' && !u.isApproved);

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h2>🛡️ Admin Paneli</h2>
                <p>Platform yönetimi</p>
            </div>

            {/* Onay bekleyen öğretmenler */}
            {pendingTeachers.length > 0 && tab === 'users' && (
                <div className="card" style={{ marginBottom: 16, borderColor: 'rgba(249,183,43,0.3)', background: 'linear-gradient(135deg, rgba(249,183,43,0.06), var(--card))' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold)', marginBottom: 10 }}>
                        ⏳ Onay Bekleyen Öğretmenler ({pendingTeachers.length})
                    </div>
                    {pendingTeachers.map(u => (
                        <div key={u._id} className="flex-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                            <div>
                                <span style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</span>
                                <span style={{ fontSize: 12, color: 'var(--text-dim)', marginLeft: 8 }}>{u.email} • {u.phone}</span>
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
                <button className={`tab-btn ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>👥 Kullanıcılar</button>
                <button className={`tab-btn ${tab === 'hadiths' ? 'active' : ''}`} onClick={() => setTab('hadiths')}>📖 Hadisler</button>
                <button className={`tab-btn ${tab === 'badges' ? 'active' : ''}`} onClick={() => setTab('badges')}>🏅 Rozetler</button>
                <button className={`tab-btn ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>📊 İstatistikler</button>
                <button className={`tab-btn ${tab === 'schools_classes' ? 'active' : ''}`} onClick={() => setTab('schools_classes')}>🏫 Okullar & Sınıflar</button>
                <button className={`tab-btn ${tab === 'school' ? 'active' : ''}`} onClick={() => setTab('school')}>🎓 Okul Ezber Sayfası</button>
            </div>

            {loading ? <div className="loading-spinner">⏳</div> : (
                <>
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
                                    <option value="admin">Admin</option>
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
                                            <th>Kayıt</th>
                                            <th>İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map(u => (
                                            <tr key={u._id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: u.role === 'admin' ? 'linear-gradient(135deg, #f59e0b, #dc2626)' : 'linear-gradient(135deg, var(--primary), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: 'white', flexShrink: 0 }}>
                                                            {u.name?.[0]}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div>
                                                            <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                                                                {u.email} {u.school && `• ${u.school.name}`} {u.classroom && `• ${u.classroom.name}`}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <select value={u.role} onChange={e => changeRole(u._id, e.target.value)}
                                                        style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 6, padding: '4px 8px', fontSize: 12 }}>
                                                        <option value="student">Öğrenci</option>
                                                        <option value="teacher">Öğretmen</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 12, fontWeight: 600, background: u.isApproved ? 'var(--green-dim)' : 'var(--red-dim)', color: u.isApproved ? 'var(--green)' : 'var(--red)' }}>
                                                        {u.isApproved ? 'Aktif' : 'Bekliyor'}
                                                    </span>
                                                </td>
                                                <td style={{ color: 'var(--gold)', fontWeight: 600 }}>⭐ {u.points || 0}</td>
                                                <td style={{ fontSize: 12, color: 'var(--text-dim)' }}>{new Date(u.createdAt).toLocaleDateString('tr-TR')}</td>
                                                <td>
                                                    <div className="flex-gap" style={{ gap: 4 }}>
                                                        {!u.isApproved && <button className="btn btn-green btn-sm" onClick={() => approveUser(u._id)}>Onayla</button>}
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

                    {/* ========== HADİSLER ========== */}
                    {tab === 'hadiths' && (
                        <div>
                            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                                <div className="search-bar" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
                                    <span className="search-icon">🔍</span>
                                    <input placeholder="Hadis ara..." value={hadithSearch} onChange={e => setHadithSearch(e.target.value)} />
                                </div>
                                <button className="btn btn-primary" onClick={() => { setShowHadithForm(true); setEditHadith(null); setHadithForm({ number: '', arabic: '', turkish: '', narrator: '', source: '', topic: '', difficulty: 'orta', dailyExample: '' }); }}>
                                    ➕ Yeni Hadis
                                </button>
                            </div>

                            <div className="card" style={{ overflowX: 'auto' }}>
                                <table className="data-table">
                                    <thead><tr><th>#</th><th>Konu</th><th>Kaynak</th><th>Ravi</th><th>Zorluk</th><th>İşlem</th></tr></thead>
                                    <tbody>
                                        {filteredHadiths.map(h => (
                                            <tr key={h._id}>
                                                <td style={{ fontWeight: 700 }}>{h.number}</td>
                                                <td style={{ fontWeight: 600 }}>{h.topic}</td>
                                                <td style={{ fontSize: 12 }}>{h.source}</td>
                                                <td style={{ fontSize: 12 }}>{h.narrator}</td>
                                                <td><span className="tag tag-difficulty" style={{ fontSize: 10 }}>{h.difficulty}</span></td>
                                                <td>
                                                    <div className="flex-gap" style={{ gap: 4 }}>
                                                        <button className="btn btn-outline btn-sm" onClick={() => openEditHadith(h)}>✏️</button>
                                                        <button className="btn btn-red btn-sm" onClick={() => deleteHadith(h._id)}>🗑️</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div style={{ textAlign: 'center', padding: 12, color: 'var(--text-dim)', fontSize: 12 }}>Toplam: {filteredHadiths.length} hadis</div>
                            </div>
                        </div>
                    )}

                    {/* ========== ROZETLER ========== */}
                    {tab === 'badges' && (
                        <div>
                            <button className="btn btn-primary" style={{ marginBottom: 16 }} onClick={() => { setShowBadgeForm(true); setEditBadge(null); setBadgeForm({ name: '', icon: '', description: '', color: '#FFD700', rarity: 'common', requirement: { type: 'points', value: 0 } }); }}>
                                ➕ Yeni Rozet
                            </button>

                            <div className="badge-grid">
                                {badges.map(b => (
                                    <div key={b._id} className="badge-item" style={{ cursor: 'pointer' }}>
                                        <div className="badge-icon">{b.icon}</div>
                                        <div className="badge-name">{b.name}</div>
                                        <div className="badge-desc">{b.description}</div>
                                        <div className="flex-gap" style={{ justifyContent: 'center', marginTop: 8, gap: 4 }}>
                                            <button className="btn btn-outline btn-sm" onClick={() => openEditBadge(b)} style={{ fontSize: 10, padding: '4px 8px' }}>✏️</button>
                                            <button className="btn btn-red btn-sm" onClick={() => deleteBadge(b._id)} style={{ fontSize: 10, padding: '4px 8px' }}>🗑️</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ========== İSTATİSTİKLER ========== */}
                    {tab === 'stats' && stats && (
                        <div>
                            <div className="grid-3" style={{ marginBottom: 20 }}>
                                <div className="stat-box"><div className="stat-icon">👥</div><div className="stat-value" style={{ color: 'var(--primary)' }}>{stats.totalStudents}</div><div className="stat-label">Öğrenci</div></div>
                                <div className="stat-box"><div className="stat-icon">🏫</div><div className="stat-value" style={{ color: 'var(--purple)' }}>{stats.totalSchools}</div><div className="stat-label">Okul</div></div>
                                <div className="stat-box"><div className="stat-icon">👨‍🏫</div><div className="stat-value" style={{ color: 'var(--green)' }}>{stats.totalTeachers}</div><div className="stat-label">Öğretmen</div></div>
                            </div>
                            <div className="grid-3" style={{ marginBottom: 20 }}>
                                <div className="stat-box"><div className="stat-icon">📖</div><div className="stat-value" style={{ color: 'var(--gold)' }}>{stats.totalHadiths}</div><div className="stat-label">Hadis</div></div>
                                <div className="stat-box"><div className="stat-icon">🏅</div><div className="stat-value" style={{ color: 'var(--purple)' }}>{stats.totalBadges}</div><div className="stat-label">Rozet</div></div>
                                <div className="stat-box"><div className="stat-icon">📝</div><div className="stat-value" style={{ color: 'var(--blue)' }}>{stats.totalQuizzes}</div><div className="stat-label">Quiz</div></div>
                            </div>

                            <div className="card" style={{ marginBottom: 16 }}>
                                <div className="card-title" style={{ marginBottom: 4 }}>🎯 Ortalama Başarı Oranı</div>
                                <div style={{ fontSize: 36, fontWeight: 900, color: stats.avgScore >= 70 ? 'var(--green)' : 'var(--gold)' }}>%{stats.avgScore}</div>
                                <div className="progress-bar-outer" style={{ marginTop: 8 }}>
                                    <div className="progress-bar-inner" style={{ width: `${stats.avgScore}%` }} />
                                </div>
                            </div>

                            <div className="card" style={{ marginBottom: 16 }}>
                                <div className="card-title" style={{ marginBottom: 4 }}>📊 Son 7 Gün Aktivite</div>
                                <div className="card-sub">{stats.recentQuizzes} quiz tamamlandı</div>
                            </div>

                            {stats.topStudents?.length > 0 && (
                                <div className="card">
                                    <div className="card-title" style={{ marginBottom: 12 }}>🏆 En Başarılı Öğrenciler</div>
                                    {stats.topStudents.map((s, i) => (
                                        <div key={i} className="flex-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <span style={{ fontWeight: 800, fontSize: 16, color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--text-dim)', width: 28 }}>
                                                    {i + 1}.
                                                </span>
                                                <span style={{ fontWeight: 600 }}>{s.name}</span>
                                                <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{s.classroom?.name || s.class}</span>
                                            </div>
                                            <span style={{ color: 'var(--gold)', fontWeight: 700 }}>⭐ {s.points}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ========== OKULLAR VE SINIFLAR ========== */}
                    {tab === 'schools_classes' && (
                        <div>
                            <div className="grid-2">
                                {/* OKULLAR */}
                                <div>
                                    <div className="flex-between" style={{ marginBottom: 12 }}>
                                        <h3 style={{ fontSize: 18 }}>🏫 Okullar</h3>
                                        <button className="btn btn-primary btn-sm" onClick={() => { setShowSchoolForm(true); setEditSchool(null); setSchoolForm({ name: '', city: '' }); }}>➕ Yeni</button>
                                    </div>
                                    <div className="card">
                                        {schools.map(s => (
                                            <div key={s._id} className="flex-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                                                        {s.institutionCode && <span style={{ marginRight: 8, color: 'var(--primary-light)' }}>Kodu: {s.institutionCode}</span>}
                                                        {s.city && <span>({s.city})</span>}
                                                    </div>
                                                </div>
                                                <div className="flex-gap">
                                                    <button className="btn btn-red btn-sm" onClick={() => deleteSchool(s._id)}>🗑️</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* SINIFLAR */}
                                <div>
                                    <div className="flex-between" style={{ marginBottom: 12 }}>
                                        <h3 style={{ fontSize: 18 }}>📖 Sınıflar</h3>
                                        <button className="btn btn-primary btn-sm" onClick={() => { setShowClassForm(true); setEditClass(null); setClassForm({ name: '', school: '' }); }}>➕ Yeni</button>
                                    </div>
                                    <div className="card">
                                        {classrooms.map(c => (
                                            <div key={c._id} className="flex-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                                                    <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{c.school?.name}</div>
                                                </div>
                                                <div className="flex-gap">
                                                    <button className="btn btn-red btn-sm" onClick={() => deleteClass(c._id)}>🗑️</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ========== OKUL EZBERİ ========== */}
                    {tab === 'school' && (
                        <div className="card">
                            <h3 style={{ marginBottom: 12 }}>🎓 Okul Ezberi İçeriği</h3>
                            <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 20 }}>
                                Tüm öğrencilerin görebileceği Okul Ezber sayfasının açıklama/duyuru metnini buradan güncelleyebilirsiniz. Format olarak düz metin kullanabilirsiniz. Ayrıca öğretmen panelinden atanan "Günlük Quiz" hadisleri otomatik olarak sayfanın altında görünecektir.
                            </p>
                            <textarea
                                className="form-textarea"
                                style={{ minHeight: 200, marginBottom: 16 }}
                                value={schoolContent}
                                onChange={e => setSchoolContent(e.target.value)}
                                placeholder="Öğrenciler için okul ezber programı içeriği..."
                            />
                            <button className="btn btn-primary" onClick={saveSchoolProgram}>💾 Kaydet</button>
                        </div>
                    )}
                </>
            )}

            {/* Hadis Form Modal */}
            {showHadithForm && (
                <div className="modal-overlay" onClick={() => setShowHadithForm(false)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editHadith ? '✏️ Hadis Düzenle' : '➕ Yeni Hadis'}</h3>
                            <button className="modal-close" onClick={() => setShowHadithForm(false)}>✕</button>
                        </div>
                        <form onSubmit={saveHadith}>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Numara</label>
                                    <input className="form-input" type="number" value={hadithForm.number} onChange={e => setHadithForm(f => ({ ...f, number: e.target.value }))} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Zorluk</label>
                                    <select className="form-select" value={hadithForm.difficulty} onChange={e => setHadithForm(f => ({ ...f, difficulty: e.target.value }))}>
                                        <option value="kolay">Kolay</option>
                                        <option value="orta">Orta</option>
                                        <option value="zor">Zor</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group"><label className="form-label">Arapça</label><textarea className="form-textarea" value={hadithForm.arabic} onChange={e => setHadithForm(f => ({ ...f, arabic: e.target.value }))} required style={{ direction: 'rtl', fontFamily: 'var(--arabic)' }} /></div>
                            <div className="form-group"><label className="form-label">Türkçe</label><textarea className="form-textarea" value={hadithForm.turkish} onChange={e => setHadithForm(f => ({ ...f, turkish: e.target.value }))} required /></div>
                            <div className="grid-2">
                                <div className="form-group"><label className="form-label">Ravi</label><input className="form-input" value={hadithForm.narrator} onChange={e => setHadithForm(f => ({ ...f, narrator: e.target.value }))} required /></div>
                                <div className="form-group"><label className="form-label">Kaynak</label><input className="form-input" value={hadithForm.source} onChange={e => setHadithForm(f => ({ ...f, source: e.target.value }))} required /></div>
                            </div>
                            <div className="form-group"><label className="form-label">Konu</label><input className="form-input" value={hadithForm.topic} onChange={e => setHadithForm(f => ({ ...f, topic: e.target.value }))} required /></div>
                            <div className="form-group"><label className="form-label">Günlük Hayat Örneği</label><textarea className="form-textarea" value={hadithForm.dailyExample} onChange={e => setHadithForm(f => ({ ...f, dailyExample: e.target.value }))} /></div>
                            <button type="submit" className="btn btn-primary btn-full">{editHadith ? '💾 Güncelle' : '➕ Ekle'}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Badge Form Modal */}
            {showBadgeForm && (
                <div className="modal-overlay" onClick={() => setShowBadgeForm(false)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editBadge ? '✏️ Rozet Düzenle' : '➕ Yeni Rozet'}</h3>
                            <button className="modal-close" onClick={() => setShowBadgeForm(false)}>✕</button>
                        </div>
                        <form onSubmit={saveBadge}>
                            <div className="grid-2">
                                <div className="form-group"><label className="form-label">Ad</label><input className="form-input" value={badgeForm.name} onChange={e => setBadgeForm(f => ({ ...f, name: e.target.value }))} required /></div>
                                <div className="form-group"><label className="form-label">İkon (emoji)</label><input className="form-input" value={badgeForm.icon} onChange={e => setBadgeForm(f => ({ ...f, icon: e.target.value }))} required placeholder="🏅" /></div>
                            </div>
                            <div className="form-group"><label className="form-label">Açıklama</label><input className="form-input" value={badgeForm.description} onChange={e => setBadgeForm(f => ({ ...f, description: e.target.value }))} required /></div>
                            <div className="grid-2">
                                <div className="form-group"><label className="form-label">Renk</label><input className="form-input" type="color" value={badgeForm.color} onChange={e => setBadgeForm(f => ({ ...f, color: e.target.value }))} /></div>
                                <div className="form-group">
                                    <label className="form-label">Nadirlik</label>
                                    <select className="form-select" value={badgeForm.rarity} onChange={e => setBadgeForm(f => ({ ...f, rarity: e.target.value }))}>
                                        <option value="common">Yaygın</option>
                                        <option value="rare">Nadir</option>
                                        <option value="epic">Epik</option>
                                        <option value="legendary">Efsanevi</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Şart Tipi</label>
                                    <select className="form-select" value={badgeForm.requirement.type} onChange={e => setBadgeForm(f => ({ ...f, requirement: { ...f.requirement, type: e.target.value } }))}>
                                        <option value="points">Puan</option>
                                        <option value="memorized">Ezber</option>
                                        <option value="correct">Doğru Cevap</option>
                                        <option value="streak">Seri</option>
                                        <option value="quizzes">Quiz</option>
                                        <option value="weekly_rank">Haftalık Sıra</option>
                                        <option value="manual">Manuel</option>
                                    </select>
                                </div>
                                <div className="form-group"><label className="form-label">Şart Değeri</label><input className="form-input" type="number" value={badgeForm.requirement.value} onChange={e => setBadgeForm(f => ({ ...f, requirement: { ...f.requirement, value: parseInt(e.target.value) || 0 } }))} /></div>
                            </div>
                            <button type="submit" className="btn btn-primary btn-full">{editBadge ? '💾 Güncelle' : '➕ Ekle'}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Okul Form Modal */}
            {showSchoolForm && (
                <div className="modal-overlay" onClick={() => setShowSchoolForm(false)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editSchool ? '✏️ Okul Düzenle' : '🏫 Yeni Okul Ekle'}</h3>
                            <button className="modal-close" onClick={() => setShowSchoolForm(false)}>✕</button>
                        </div>
                        <form onSubmit={saveSchool}>
                            <div className="form-group"><label className="form-label">Okul Adı</label><input className="form-input" value={schoolForm.name} onChange={e => setSchoolForm(f => ({ ...f, name: e.target.value }))} required /></div>
                            <div className="grid-2">
                                <div className="form-group"><label className="form-label">Şehir</label><input className="form-input" value={schoolForm.city} onChange={e => setSchoolForm(f => ({ ...f, city: e.target.value }))} /></div>
                                <div className="form-group"><label className="form-label">Kurum Kodu</label><input className="form-input" placeholder="Örn: 763119" value={schoolForm.institutionCode} onChange={e => setSchoolForm(f => ({ ...f, institutionCode: e.target.value }))} /></div>
                            </div>
                            <button type="submit" className="btn btn-primary btn-full">💾 Kaydet</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Sınıf Form Modal */}
            {showClassForm && (
                <div className="modal-overlay" onClick={() => setShowClassForm(false)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editClass ? '✏️ Sınıf Düzenle' : '📖 Yeni Sınıf Ekle'}</h3>
                            <button className="modal-close" onClick={() => setShowClassForm(false)}>✕</button>
                        </div>
                        <form onSubmit={saveClass}>
                            <div className="form-group"><label className="form-label">Sınıf Adı (Örn: 10-A)</label><input className="form-input" value={classForm.name} onChange={e => setClassForm(f => ({ ...f, name: e.target.value }))} required /></div>
                            <div className="form-group">
                                <label className="form-label">Okul</label>
                                <select className="form-select" value={classForm.school} onChange={e => setClassForm(f => ({ ...f, school: e.target.value }))} required>
                                    <option value="">Seçiniz...</option>
                                    {schools.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary btn-full">💾 Kaydet</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
