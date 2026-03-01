import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function MyClassesPage() {
    const { user } = useAuth();
    const [classrooms, setClassrooms] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [hadiths, setHadiths] = useState([]);
    const [showAssign, setShowAssign] = useState(false);
    const [hadithSearch, setHadithSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/teacher/classes')
            .then(res => setClassrooms(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const fetchClassStudents = async (cid) => {
        setLoadingStudents(true);
        try {
            const res = await api.get(`/classrooms/${cid}/students`);
            setStudents(res.data);
            setSelectedClass(cid);
        } catch (err) { console.error(err); }
        finally { setLoadingStudents(false); }
    };

    const openAssign = async () => {
        try {
            const res = await api.get('/hadiths?limit=100');
            setHadiths(res.data.hadiths || res.data || []);
            setShowAssign(true);
        } catch { /* ignore */ }
    };

    const assignHadithToClass = async (hadithId) => {
        if (!selectedClass) return;
        const className = classrooms.find(c => c._id === selectedClass)?.name || 'Sınıf';
        if (!window.confirm(`${className} sınıfına bu hadis ödevini atamak istediğinize emin misiniz?`)) return;

        try {
            await api.post('/assignments', {
                title: `${className} - Özel Quiz`,
                hadiths: [hadithId],
                classrooms: [selectedClass],
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Default 7 days
            });
            alert(`${className} sınıfına başarıyla ödev atandı!`);
            setShowAssign(false);
        } catch (err) {
            alert(err.response?.data?.error || 'Hata oluştu');
        }
    };

    if (loading) return <div className="loading-spinner">⏳</div>;

    const currentClassName = classrooms.find(c => c._id === selectedClass)?.name || '';

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h2>🏫 Sınıflarım</h2>
                <p>Okulunuzdaki sınıfları görün ve ödev atayın</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
                {/* Sol Taraf: Öğrenci Listesi */}
                <div>
                    {!selectedClass ? (
                        <div className="card empty-state">Öğrenci listesini görmek için sağdan bir sınıf seçin.</div>
                    ) : (
                        <div className="card">
                            <div className="flex-between" style={{ marginBottom: 16 }}>
                                <h3 style={{ fontSize: 18 }}>👥 {currentClassName} Öğrencileri</h3>
                                <button className="btn btn-primary btn-sm" onClick={openAssign}>📝 Sınıfa Ödev Ver</button>
                            </div>
                            {loadingStudents ? <div className="loading-spinner">⏳</div> : (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Öğrenci</th>
                                            <th>No</th>
                                            <th>Puan</th>
                                            <th>🔥 Seri</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map(s => (
                                            <tr key={s._id}>
                                                <td>{s.name}</td>
                                                <td>{s.schoolNumber || '—'}</td>
                                                <td><span style={{ color: 'var(--gold)', fontWeight: 700 }}>⭐ {s.points}</span></td>
                                                <td>{s.streak}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                            {students.length === 0 && !loadingStudents && <div className="empty-state">Bu sınıfta henüz öğrenci yok.</div>}
                        </div>
                    )}
                </div>

                {/* Sağ Taraf: Sınıf Seçimi */}
                <div>
                    <h3 style={{ marginBottom: 16, fontSize: 18 }}>📋 Sınıf Listesi</h3>
                    <div className="card" style={{ padding: 0 }}>
                        {classrooms.map(c => (
                            <button key={c._id}
                                onClick={() => fetchClassStudents(c._id)}
                                style={{
                                    display: 'flex',
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '12px 16px',
                                    border: 'none',
                                    background: selectedClass === c._id ? 'var(--bg3)' : 'transparent',
                                    borderBottom: '1px solid var(--border)',
                                    cursor: 'pointer',
                                    alignItems: 'center',
                                    gap: 12,
                                    borderRadius: 0,
                                    outline: 'none'
                                }}>
                                <div style={{ fontSize: 20 }}>🏫</div>
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{c.name}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{c.school?.name}</div>
                                </div>
                                {selectedClass === c._id && <div style={{ marginLeft: 'auto' }}>🎯</div>}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Hadis Atama Modal (Sınıf Bazlı) */}
            {showAssign && (
                <div className="modal-overlay" onClick={() => setShowAssign(false)}>
                    <div className="modal-card animate-scale" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>📝 {currentClassName} Sınıfına Ödev Ver</h3>
                            <button className="modal-close" onClick={() => setShowAssign(false)}>✕</button>
                        </div>
                        <div className="search-bar" style={{ marginBottom: 12 }}>
                            <input placeholder="Hadis ara..." value={hadithSearch} onChange={e => setHadithSearch(e.target.value)} />
                        </div>
                        <div style={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {hadiths
                                .filter(h => !hadithSearch || h.turkish?.toLowerCase().includes(hadithSearch.toLowerCase()) || h.topic?.toLowerCase().includes(hadithSearch.toLowerCase()))
                                .slice(0, 30)
                                .map(h => (
                                    <div key={h._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg3)', borderRadius: 8 }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 13, fontWeight: 700 }}>#{h.number} — {h.topic}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{h.turkish?.substring(0, 80)}...</div>
                                        </div>
                                        <button className="btn btn-primary btn-sm" onClick={() => assignHadithToClass(h._id)}>📋 Ata</button>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
