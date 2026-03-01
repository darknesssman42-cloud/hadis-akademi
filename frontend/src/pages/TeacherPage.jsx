import { useEffect, useState } from 'react';
import api from '../services/api';

export default function TeacherPage() {
    const [students, setStudents] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [schoolFilter, setSchoolFilter] = useState('');
    const [classFilter, setClassFilter] = useState('');
    const [schools, setSchools] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [tab, setTab] = useState('students');

    // Assignments
    const [assignments, setAssignments] = useState([]);
    const [showCreateAssignment, setShowCreateAssignment] = useState(false);
    const [newAssignment, setNewAssignment] = useState({ title: '', hadiths: [], classrooms: [], endDate: '' });

    // Modals
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showMemorized, setShowMemorized] = useState(false);
    const [memorizedData, setMemorizedData] = useState(null);
    const [showQuizStats, setShowQuizStats] = useState(false);
    const [quizStats, setQuizStats] = useState(null);
    const [showAssign, setShowAssign] = useState(false);
    const [hadiths, setHadiths] = useState([]);
    const [hadithSearch, setHadithSearch] = useState('');
    const [dailyQuizHadiths, setDailyQuizHadiths] = useState([]);

    const loadInitialData = async () => {
        try {
            const [sr, str, schR, claR] = await Promise.all([
                api.get('/teacher/students'),
                api.get('/teacher/stats'),
                api.get('/schools'),
                api.get('/teacher/classes') // Correct endpoint
            ]);
            setStudents(sr.data);
            setStats(str.data);
            setSchools(schR.data);
            setClassrooms(claR.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => { loadInitialData(); }, []);

    useEffect(() => {
        if (tab === 'quizzes') {
            api.get('/assignments/teacher').then(res => setAssignments(res.data));
        }
    }, [tab]);

    const filtered = students.filter(s => {
        const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
            (s.schoolNumber || '').toLowerCase().includes(search.toLowerCase()) ||
            (s.school?.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (s.classroom?.name || '').toLowerCase().includes(search.toLowerCase());
        const matchSchool = !schoolFilter || s.school?.id === schoolFilter || s.school?._id === schoolFilter;
        const matchClass = !classFilter || s.classroom?.id === classFilter || s.classroom?._id === classFilter;
        return matchSearch && matchSchool && matchClass;
    });

    const viewMemorized = async (student) => {
        setSelectedStudent(student);
        try {
            const res = await api.get(`/teacher/student/${student.id}/memorized`);
            setMemorizedData(res.data);
            setShowMemorized(true);
        } catch { /* ignore */ }
    };

    const viewQuizStats = async (student) => {
        setSelectedStudent(student);
        try {
            const res = await api.get(`/teacher/student/${student.id}/quiz-stats`);
            setQuizStats(res.data);
            setShowQuizStats(true);
        } catch { /* ignore */ }
    };

    const openAssign = async (student) => {
        setSelectedStudent(student);
        try {
            const res = await api.get('/hadiths?limit=100');
            setHadiths(res.data.hadiths || res.data || []);
            setShowAssign(true);
        } catch { /* ignore */ }
    };

    const assignHadith = async (hadithId) => {
        if (!selectedStudent) return;
        try {
            await api.post('/teacher/assign', { studentId: selectedStudent.id, hadithIds: [hadithId] });
            // Refresh
            const res = await api.get('/teacher/students');
            setStudents(res.data);
            const student = res.data.find(s => s.id === selectedStudent.id);
            if (student) setSelectedStudent(student);
        } catch (err) {
            alert(err.response?.data?.error || 'Hata oluştu');
        }
    };

    const removeAssignment = async (hadithId) => {
        if (!selectedStudent) return;
        try {
            await api.delete(`/teacher/assign/${selectedStudent.id}/${hadithId}`);
            const res = await api.get('/teacher/students');
            setStudents(res.data);
            const student = res.data.find(s => s.id === selectedStudent.id);
            if (student) setSelectedStudent(student);
        } catch { /* ignore */ }
    };

    const saveDailyQuiz = async () => {
        if (dailyQuizHadiths.length === 0) return;
        try {
            await api.post('/teacher/daily-quiz', { hadithIds: dailyQuizHadiths });
            alert('Günlük quiz güncellendi!');
        } catch (err) {
            alert(err.response?.data?.error || 'Hata');
        }
    };

    const toggleDailyQuiz = (hadithId) => {
        setDailyQuizHadiths(prev =>
            prev.includes(hadithId) ? prev.filter(id => id !== hadithId) : [...prev, hadithId]
        );
    };

    const markAsMemorized = async (hadithId) => {
        if (!selectedStudent) return;
        try {
            await api.post(`/teacher/student/${selectedStudent.id}/memorize`, { hadithId });
            alert('Öğrenci için ezber onaylandı ve puanı eklendi!');
            // Refresh
            const res = await api.get('/teacher/students');
            setStudents(res.data);
            const student = res.data.find(s => s.id === selectedStudent.id);
            if (student) setSelectedStudent(student);
        } catch (err) {
            alert(err.response?.data?.error || 'Hata oluştu');
        }
    };

    if (loading) return <div className="loading-spinner">⏳</div>;

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h2>👨‍🏫 Öğretmen Paneli</h2>
                <p>Öğrenci ilerlemesini takip edin ve yönetin</p>
            </div>

            {/* İstatistikler */}
            {stats && (
                <div className="grid-3" style={{ marginBottom: 20 }}>
                    <div className="stat-box">
                        <div className="stat-icon">👥</div>
                        <div className="stat-value" style={{ color: 'var(--primary)' }}>{stats.totalStudents}</div>
                        <div className="stat-label">Öğrenci</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-icon">📝</div>
                        <div className="stat-value" style={{ color: 'var(--gold)' }}>{stats.totalQuizzes}</div>
                        <div className="stat-label">Toplam Quiz</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-icon">🎯</div>
                        <div className="stat-value" style={{ color: 'var(--green)' }}>{stats.avgScore}%</div>
                        <div className="stat-label">Ort. Başarı</div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab-btn ${tab === 'students' ? 'active' : ''}`} onClick={() => setTab('students')}>👥 Öğrenciler</button>
                <button className={`tab-btn ${tab === 'quizzes' ? 'active' : ''}`} onClick={() => setTab('quizzes')}>📝 Sınıf Ödevleri</button>
                <button className={`tab-btn ${tab === 'daily' ? 'active' : ''}`} onClick={() => { setTab('daily'); if (hadiths.length === 0) api.get('/hadiths?limit=100').then(r => setHadiths(r.data.hadiths || r.data || [])); }}>📋 Günlük Quiz</button>
            </div>

            {tab === 'students' && (
                <>
                    {/* Arama */}
                    <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                        <div className="search-bar" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
                            <span className="search-icon">🔍</span>
                            <input placeholder="Öğrenci adı veya okul no ile ara..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <select className="form-select" value={schoolFilter} onChange={e => setSchoolFilter(e.target.value)} style={{ width: 'auto' }}>
                            <option value="">Tüm Okullar</option>
                            {schools.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                        <select className="form-select" value={classFilter} onChange={e => setClassFilter(e.target.value)} style={{ width: 'auto' }}>
                            <option value="">Tüm Sınıflar</option>
                            {classrooms.filter(c => !schoolFilter || c.school?._id === schoolFilter).map(c => (
                                <option key={c._id} value={c._id}>{c.name} ({c.school?.name})</option>
                            ))}
                        </select>
                    </div>

                    {/* Tablo */}
                    <div className="card" style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Öğrenci</th>
                                    <th>Sınıf</th>
                                    <th>Puan</th>
                                    <th>Quiz</th>
                                    <th>Doğruluk</th>
                                    <th>Ezber</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(s => (
                                    <tr key={s.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--primary), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: 'white', flexShrink: 0 }}>
                                                    {s.name[0]}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                                                    <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                                                        {s.school?.name || 'Okul Yok'} • {s.schoolNumber || s.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{s.classroom?.name || s.class || '—'}</td>
                                        <td><span style={{ color: 'var(--gold)', fontWeight: 700 }}>⭐ {s.points}</span></td>
                                        <td>{s.quizCount}</td>
                                        <td>
                                            <span style={{ color: s.accuracy >= 70 ? 'var(--green)' : s.accuracy >= 40 ? 'var(--gold)' : 'var(--red)', fontWeight: 600 }}>
                                                {s.accuracy}%
                                            </span>
                                        </td>
                                        <td>📖 {s.memorizedCount}</td>
                                        <td>
                                            <div className="flex-gap" style={{ gap: 4 }}>
                                                <button className="btn btn-outline btn-sm" onClick={() => viewMemorized(s)} title="Ezberler">📖</button>
                                                <button className="btn btn-outline btn-sm" onClick={() => viewQuizStats(s)} title="Quiz İstats">📊</button>
                                                <button className="btn btn-outline btn-sm" onClick={() => openAssign(s)} title="Hadis Ata">📌</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filtered.length === 0 && (
                            <div className="empty-state"><p>Öğrenci bulunamadı</p></div>
                        )}
                    </div>
                </>
            )}

            {tab === 'quizzes' && (
                <div>
                    <div className="flex-between" style={{ marginBottom: 16 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700 }}>📚 Sınıf Ödev Takibi</h3>
                        <button className="btn btn-primary" onClick={() => {
                            setShowCreateAssignment(true);
                            if (hadiths.length === 0) api.get('/hadiths?limit=100').then(r => setHadiths(r.data.hadiths || r.data || []));
                        }}>➕ Yeni Ödev Oluştur</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                        {assignments.map(a => (
                            <div key={a._id} className="card animate-scale" style={{ borderLeft: '5px solid var(--primary)', position: 'relative' }}>
                                <div className="flex-between" style={{ marginBottom: 10 }}>
                                    <h4 style={{ fontWeight: 800, color: 'var(--text)' }}>{a.title}</h4>
                                    <span style={{ fontSize: 10, fontWeight: 700, background: a.isActive ? 'var(--green-dim)' : 'var(--red-dim)', color: a.isActive ? 'var(--green)' : 'var(--red)', padding: '3px 8px', borderRadius: 4 }}>
                                        {a.isActive ? 'AKTİF' : 'PASİF'}
                                    </span>
                                </div>

                                <div className="info-row" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                    <span style={{ fontSize: 16 }}>🏫</span>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-light)' }}>
                                        {a.classrooms?.map(c => c.name).join(', ') || 'Sınıf Belirtilmemiş'}
                                    </span>
                                </div>

                                <div className="info-row" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                                    <span style={{ fontSize: 16 }}>📖</span>
                                    <span style={{ fontSize: 12 }}>
                                        {a.hadiths?.length} Hadis Atandı
                                    </span>
                                </div>

                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 16 }}>
                                    {a.hadiths?.slice(0, 8).map(h => (
                                        <span key={h._id} style={{ fontSize: 10, background: 'var(--bg3)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border)' }}>
                                            #{h.number}
                                        </span>
                                    ))}
                                    {a.hadiths?.length > 8 && <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>+{a.hadiths.length - 8}</span>}
                                </div>

                                <div className="flex-between" style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                                    <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                                        🗓️ {new Date(a.createdAt).toLocaleDateString('tr-TR')}
                                    </div>
                                    <div className="flex-gap" style={{ gap: 6 }}>
                                        <button className="btn btn-red btn-sm" style={{ padding: '4px 8px' }} onClick={async () => {
                                            if (confirm('Bu ödevi silmek istediğinize emin misiniz?')) {
                                                try {
                                                    await api.delete(`/assignments/${a._id}`);
                                                    api.get('/assignments/teacher').then(res => setAssignments(res.data));
                                                } catch (err) { alert('Hata: ' + (err.response?.data?.error || err.message)); }
                                            }
                                        }}>🗑️ Sil</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {assignments.length === 0 && <div className="empty-state" style={{ padding: '40px 20px' }}>
                        <div style={{ fontSize: 40, marginBottom: 16 }}>📚</div>
                        <p>Henüz oluşturulmuş bir sınıf ödevi bulunmuyor.</p>
                        <p style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 8 }}>Yukarıdaki butonu kullanarak ilk ödevi atayabilirsiniz.</p>
                    </div>}
                </div>
            )}

            {tab === 'daily' && (
                <div>
                    <div className="card" style={{ marginBottom: 16 }}>
                        <div className="card-title" style={{ marginBottom: 4 }}>📋 Günlük Quiz Hadisleri Seçin</div>
                        <div className="card-sub" style={{ marginBottom: 12 }}>1900 hadis arasından günlük quiz için hadis seçin</div>
                        <div style={{ marginBottom: 12 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-light)' }}>
                                Seçilen: {dailyQuizHadiths.length} hadis
                            </span>
                        </div>
                        <button className="btn btn-primary" onClick={saveDailyQuiz} disabled={dailyQuizHadiths.length === 0}>
                            💾 Günlük Quiz Kaydet
                        </button>
                    </div>

                    <div className="search-bar">
                        <span className="search-icon">🔍</span>
                        <input placeholder="Hadis ara..." value={hadithSearch} onChange={e => setHadithSearch(e.target.value)} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {hadiths
                            .filter(h => !hadithSearch || h.turkish?.toLowerCase().includes(hadithSearch.toLowerCase()) || h.topic?.toLowerCase().includes(hadithSearch.toLowerCase()))
                            .slice(0, 30)
                            .map(h => (
                                <div key={h._id} className="card" style={{ padding: '12px 16px', cursor: 'pointer', borderColor: dailyQuizHadiths.includes(h._id) ? 'rgba(108,99,255,0.4)' : 'var(--border)', background: dailyQuizHadiths.includes(h._id) ? 'rgba(108,99,255,0.06)' : 'var(--card)' }}
                                    onClick={() => toggleDailyQuiz(h._id)}>
                                    <div className="flex-between">
                                        <span style={{ fontSize: 13, fontWeight: 600 }}>#{h.number} — {h.topic}</span>
                                        <span>{dailyQuizHadiths.includes(h._id) ? '✅' : '⬜'}</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>{h.turkish?.substring(0, 80)}...</div>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Ezberlenen Hadisler Modal */}
            {showMemorized && memorizedData && (
                <div className="modal-overlay" onClick={() => setShowMemorized(false)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>📖 {memorizedData.name} — Ezberlenen Hadisler</h3>
                            <button className="modal-close" onClick={() => setShowMemorized(false)}>✕</button>
                        </div>
                        {memorizedData.memorizedHadiths?.length === 0 ? (
                            <div className="empty-state"><p>Henüz ezberlenen hadis yok</p></div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {memorizedData.memorizedHadiths?.map(h => (
                                    <div key={h._id} style={{ padding: '12px', background: 'var(--bg3)', borderRadius: 8 }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>#{h.number} — {h.topic}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{h.turkish?.substring(0, 100)}..."</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Quiz Stats Modal */}
            {showQuizStats && quizStats && (
                <div className="modal-overlay" onClick={() => setShowQuizStats(false)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>📊 {selectedStudent?.name} — Quiz İstatistikleri</h3>
                            <button className="modal-close" onClick={() => setShowQuizStats(false)}>✕</button>
                        </div>
                        <div className="grid-2" style={{ marginBottom: 16 }}>
                            <div className="stat-box">
                                <div className="stat-value" style={{ fontSize: 24, color: 'var(--primary)' }}>{quizStats.totalAttempts}</div>
                                <div className="stat-label">Toplam Quiz</div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-value" style={{ fontSize: 24, color: 'var(--green)' }}>{quizStats.accuracy}%</div>
                                <div className="stat-label">Doğruluk</div>
                            </div>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Son Quizler</div>
                        {quizStats.attempts?.slice(0, 10).map(a => (
                            <div key={a._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                                <span>{a.hadith?.topic || 'Konu'}</span>
                                <span style={{ color: a.score === a.totalQuestions ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                                    {a.score}/{a.totalQuestions} • +{a.pointsEarned} puan
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Hadis Atama Modal */}
            {showAssign && selectedStudent && (
                <div className="modal-overlay" onClick={() => setShowAssign(false)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>📌 {selectedStudent.name} — Hadis Ata ({selectedStudent.assignedCount || 0}/40)</h3>
                            <button className="modal-close" onClick={() => setShowAssign(false)}>✕</button>
                        </div>

                        {/* Atanmış hadisler */}
                        {selectedStudent.assignedHadiths?.length > 0 && (
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Atanmış Hadisler:</div>
                                <div className="flex-gap" style={{ gap: 6 }}>
                                    {selectedStudent.assignedHadiths.map(h => (
                                        <span key={h._id} className="tag tag-topic" style={{ cursor: 'pointer' }}
                                            onClick={() => removeAssignment(h._id)}>
                                            #{h.number} {h.topic} ✕
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="search-bar" style={{ marginBottom: 12 }}>
                            <span className="search-icon">🔍</span>
                            <input placeholder="Hadis ara..." value={hadithSearch} onChange={e => setHadithSearch(e.target.value)} />
                        </div>

                        <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {hadiths
                                .filter(h => !hadithSearch || h.turkish?.toLowerCase().includes(hadithSearch.toLowerCase()) || h.topic?.toLowerCase().includes(hadithSearch.toLowerCase()))
                                .slice(0, 20)
                                .map(h => {
                                    const isAssigned = selectedStudent.assignedHadiths?.some(a => a._id === h._id);
                                    return (
                                        <div key={h._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg3)', borderRadius: 6 }}>
                                            <span style={{ fontSize: 12 }}>#{h.number} — {h.topic}</span>
                                            <div className="flex-gap" style={{ gap: 6 }}>
                                                {isAssigned ? (
                                                    <button className="btn btn-red btn-sm" onClick={() => removeAssignment(h._id)}>Atama İptal</button>
                                                ) : (
                                                    <button className="btn btn-green btn-sm" onClick={() => assignHadith(h._id)}>Ödev Ata</button>
                                                )}
                                                <button className="btn btn-gold btn-sm" onClick={() => markAsMemorized(h._id)} title="Öğrencinin ezberini onayla">Ezber Onayla</button>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            )}
            {/* Sınıf Quizi Oluşturma Modal */}
            {showCreateAssignment && (
                <div className="modal-overlay" onClick={() => setShowCreateAssignment(false)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
                        <div className="modal-header">
                            <h3>➕ Yeni Sınıf Ödevi Oluştur</h3>
                            <button className="modal-close" onClick={() => setShowCreateAssignment(false)}>✕</button>
                        </div>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            if (newAssignment.hadiths.length === 0 || newAssignment.classrooms.length === 0) {
                                return alert('Lütfen en az bir hadis ve bir sınıf seçin.');
                            }
                            try {
                                await api.post('/assignments', newAssignment);
                                setShowCreateAssignment(false);
                                setNewAssignment({ title: '', hadiths: [], classrooms: [], endDate: '' });
                                api.get('/assignments/teacher').then(res => setAssignments(res.data));
                            } catch (err) { alert(err.response?.data?.error || 'Hata'); }
                        }}>
                            <div className="form-group">
                                <label className="form-label">Ödev Başlığı</label>
                                <input className="form-input" placeholder="Örn: 10-A Haftalık Çalışma" value={newAssignment.title} onChange={e => setNewAssignment({ ...newAssignment, title: e.target.value })} required />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Sınıflar Seçin</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 100, overflowY: 'auto', border: '1px solid var(--border)', padding: 10, borderRadius: 8 }}>
                                    {classrooms.map(c => (
                                        <label key={c._id} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg3)', padding: '4px 8px', borderRadius: 6, cursor: 'pointer' }}>
                                            <input type="checkbox" checked={newAssignment.classrooms.includes(c._id)}
                                                onChange={() => {
                                                    const updated = newAssignment.classrooms.includes(c._id) ? newAssignment.classrooms.filter(id => id !== c._id) : [...newAssignment.classrooms, c._id];
                                                    setNewAssignment({ ...newAssignment, classrooms: updated });
                                                }}
                                            />
                                            {c.name} ({c.school?.name})
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Hadisler Seçin (Arama ile filtreleyebilirsin)</label>
                                <div className="search-bar" style={{ marginBottom: 10 }}>
                                    <input placeholder="Hadis ara..." onChange={e => setHadithSearch(e.target.value)} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 200, overflowY: 'auto' }}>
                                    {hadiths.filter(h => !hadithSearch || h.turkish?.toLowerCase().includes(hadithSearch.toLowerCase()) || h.topic?.toLowerCase().includes(hadithSearch.toLowerCase()))
                                        .slice(0, 30).map(h => (
                                            <label key={h._id} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 10, padding: '8px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                                                <input type="checkbox" checked={newAssignment.hadiths.includes(h._id)}
                                                    onChange={() => {
                                                        const updated = newAssignment.hadiths.includes(h._id) ? newAssignment.hadiths.filter(id => id !== h._id) : [...newAssignment.hadiths, h._id];
                                                        setNewAssignment({ ...newAssignment, hadiths: updated });
                                                    }}
                                                />
                                                <div style={{ flex: 1 }}>
                                                    <strong>#{h.number}</strong> {h.topic}
                                                    <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{h.turkish?.substring(0, 60)}...</div>
                                                </div>
                                            </label>
                                        ))}
                                </div>
                                <div style={{ marginTop: 8, fontSize: 13, color: 'var(--primary)', fontWeight: 700 }}>Seçilen: {newAssignment.hadiths.length} Hadis</div>
                            </div>

                            <button type="submit" className="btn btn-primary btn-full">🚀 Oluştur ve Sınıfa Ödev Ata</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
