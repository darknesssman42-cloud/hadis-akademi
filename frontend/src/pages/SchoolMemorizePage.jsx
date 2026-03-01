import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SchoolMemorizePage() {
    const [data, setData] = useState({ content: '', dailyQuizHadiths: [] });
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchSchoolData = () => {
        setLoading(true);
        api.get(`/school-program`)
            .then(r => setData(r.data))
            .catch(() => alert('Veri alınamadı'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchSchoolData(); }, []);

    const isMemorized = (id) => user?.memorizedHadiths?.some(h => (typeof h === 'string' ? h : h._id) === id);
    const diffColors = { kolay: 'var(--green)', orta: 'var(--gold)', zor: 'var(--red)' };

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h2>🎓 Okul Ezber Programı</h2>
                <p>Okul yönetimi tarafından belirlenen ezberlenmesi gereken özel hadisler</p>
            </div>

            {loading ? (
                <div className="loading-spinner">⏳</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Admin Metni (Açıklama vb.) */}
                    <div className="card" style={{ padding: '24px', whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: 15 }}>
                        {data.content}
                    </div>

                    {/* Günlük Quiz Hadisleri (Öğretmen / Admin Seçimi) */}
                    {data.dailyQuizHadiths.length > 0 && (
                        <div>
                            <h3 style={{ fontSize: 16, marginBottom: 12, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                ⭐ Seçilmiş Quiz Hadisleri
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {data.dailyQuizHadiths.map(h => (
                                    <div key={h._id} className="card" style={{ cursor: 'pointer', border: '1px solid rgba(249, 183, 43, 0.3)' }} onClick={() => navigate(`/quiz/${h._id}`)}>
                                        <div className="flex-between" style={{ marginBottom: 8 }}>
                                            <div>
                                                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)' }}>#{h.number}</span>
                                                <span style={{ fontSize: 13, fontWeight: 600, marginLeft: 8 }}>{h.topic}</span>
                                                {isMemorized(h._id) && <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--green)' }}>✅ Ezberlendi</span>}
                                            </div>
                                            <span className="tag" style={{ borderColor: diffColors[h.difficulty] || 'var(--primary)', color: diffColors[h.difficulty] || 'var(--text)', background: 'transparent', fontSize: 11 }}>
                                                {h.difficulty}
                                            </span>
                                        </div>
                                        <div style={{ fontFamily: 'var(--arabic)', fontSize: 20, direction: 'rtl', textAlign: 'right', color: 'var(--gold)', lineHeight: 1.7, marginBottom: 6 }}>
                                            {h.arabic}
                                        </div>
                                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: 8 }}>
                                            "{h.turkish}"
                                        </div>
                                        <div className="flex-gap" style={{ gap: 6 }}>
                                            <span className="tag tag-narrator" style={{ fontSize: 10 }}>📜 {h.narrator}</span>
                                            <span className="tag tag-source" style={{ fontSize: 10 }}>📚 {h.source}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
