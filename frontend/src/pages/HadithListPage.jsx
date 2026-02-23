import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function HadithListPage() {
    const [hadiths, setHadiths] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/hadiths').then(r => setHadiths(r.data)).finally(() => setLoading(false));
    }, []);

    const filtered = hadiths.filter(h =>
        h.turkish.toLowerCase().includes(search.toLowerCase()) ||
        h.topic.toLowerCase().includes(search.toLowerCase()) ||
        h.narrator.toLowerCase().includes(search.toLowerCase())
    );

    const toggleMemorize = async (h, e) => {
        e.stopPropagation();
        const isMemorized = user?.memorizedHadiths?.includes(h._id);
        if (isMemorized) await api.delete(`/hadiths/${h._id}/memorize`);
        else await api.post(`/hadiths/${h._id}/memorize`);
        // Refresh user
        window.location.reload();
    };

    if (loading) return <div style={{ textAlign: 'center', paddingTop: 80, fontSize: 32 }}>⏳</div>;

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h2>📖 Hadis Listesi</h2>
                <p>10. sınıf müfredatındaki tüm hadisler</p>
            </div>

            <input
                className="form-input"
                placeholder="🔍 Hadis, konu veya raviye göre ara..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ marginBottom: 20 }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {filtered.map(h => {
                    const isMemorized = user?.memorizedHadiths?.includes(h._id);
                    return (
                        <div key={h._id} className="card" style={{ cursor: 'pointer', transition: 'var(--transition)' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ background: 'var(--primary)', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700 }}>#{h.number}</span>
                                    <span className="tag tag-topic">{h.topic}</span>
                                    {isMemorized && <span style={{ color: 'var(--gold)', fontSize: 13 }}>✅ Ezberlendi</span>}
                                </div>
                                <span className="tag" style={{ background: h.difficulty === 'kolay' ? 'rgba(16,185,129,0.15)' : h.difficulty === 'zor' ? 'rgba(239,68,68,0.15)' : 'rgba(251,191,36,0.1)', color: h.difficulty === 'kolay' ? 'var(--green)' : h.difficulty === 'zor' ? 'var(--red)' : 'var(--gold)' }}>
                                    {h.difficulty}
                                </span>
                            </div>
                            <div className="hadis-arabic" style={{ fontSize: 20, marginBottom: 8 }}>{h.arabic}</div>
                            <div style={{ fontSize: 14, color: 'var(--text-dim)', marginBottom: 12, lineHeight: 1.6 }}>"{h.turkish.substring(0, 120)}..."</div>
                            <div className="hadis-meta" style={{ marginBottom: 12 }}>
                                <span className="tag tag-narrator">📜 {h.narrator}</span>
                                <span className="tag tag-source">📚 {h.source}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <button className="btn btn-primary btn-sm" onClick={() => navigate(`/quiz/${h._id}`)}>🎯 Quiz Başlat</button>
                                <button className={`btn btn-sm ${isMemorized ? 'btn-outline' : 'btn-gold'}`} onClick={e => toggleMemorize(h, e)}>
                                    {isMemorized ? '✅ Ezberlendi' : '⭐ Ezberledim'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
