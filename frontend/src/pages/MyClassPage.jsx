import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function MyClassPage() {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const [sRes, aRes] = await Promise.all([
                    api.get('/classrooms/my-classmates'),
                    api.get('/assignments/my-class')
                ]);
                setStudents(sRes.data);
                setAssignments(aRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div className="loading-spinner">⏳</div>;

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h2>🏫 Sınıfım: {user?.classroom?.name || 'Sınıf Bilgisi Yok'}</h2>
                <p>{user?.school?.name || ''}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
                {/* Sol Taraf: Ödevler */}
                <div>
                    <h3 style={{ marginBottom: 16, fontSize: 18 }}>📝 Sınıf Ödevleri</h3>
                    {assignments.length === 0 ? (
                        <div className="card empty-state">Henüz verilmiş bir ödeviniz yok.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {assignments.map(a => (
                                <div key={a._id} className="card">
                                    <div className="flex-between">
                                        <h4 style={{ fontWeight: 700 }}>{a.title}</h4>
                                        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{a.teacher?.name} Hoca</span>
                                    </div>
                                    <div style={{ fontSize: 13, margin: '12px 0', color: 'var(--text-secondary)' }}>
                                        {a.hadiths?.length} Hadis Çalışması
                                    </div>
                                    <div className="flex-gap" style={{ flexWrap: 'wrap' }}>
                                        {a.hadiths?.map(h => (
                                            <button key={h._id} className="btn btn-primary btn-sm" onClick={() => navigate(`/quiz/${h._id}`)}>
                                                Hadis #{h.number} Quiz
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sağ Taraf: Sınıf Arkadaşları */}
                <div>
                    <h3 style={{ marginBottom: 16, fontSize: 18 }}>👥 Sınıf Arkadaşlarım</h3>
                    <div className="card" style={{ padding: '8px 0' }}>
                        {students.map((s, idx) => (
                            <div key={s._id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '10px 16px',
                                borderBottom: idx === students.length - 1 ? 'none' : '1px solid var(--border)',
                                background: s._id === user?._id ? 'var(--bg3)' : 'transparent'
                            }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: 10,
                                    background: 'linear-gradient(135deg, var(--primary), var(--purple))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, fontSize: 13, color: 'white', flexShrink: 0
                                }}>
                                    {s.name[0]}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {s.name} {s._id === user?._id && '(Sen)'}
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>⭐ {s.points} Puan</div>
                                </div>
                                {idx < 3 && <span style={{ fontSize: 14 }}>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
