import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function HadithListPage() {
    const [hadiths, setHadiths] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchHadiths = () => {
        setLoading(true);
        const params = new URLSearchParams({ page, limit: 20 });
        if (search) params.append('search', search);
        if (difficulty) params.append('difficulty', difficulty);

        api.get(`/hadiths?${params}`)
            .then(r => {
                const data = r.data.hadiths || (Array.isArray(r.data) ? r.data : []);
                setHadiths(data);
                setTotalPages(r.data.totalPages || 1);
            })
            .catch(err => {
                console.error("Hadiths fetch error:", err);
                setHadiths([]);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchHadiths(); }, [page, difficulty]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchHadiths();
    };

    const isMemorized = (id) => user?.memorizedHadiths?.some(h => (typeof h === 'string' ? h : h._id) === id);

    const diffColors = { kolay: 'var(--green)', orta: 'var(--gold)', zor: 'var(--red)' };

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h2>📖 Hadis Kütüphanesi</h2>
                <p>Tüm hadislere göz atın, ezberleyin ve test edin</p>
            </div>

            {/* Arama ve Filtre */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                <div className="search-bar" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
                    <span className="search-icon">🔍</span>
                    <input placeholder="Hadis, konu, ravi veya kaynak ara..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="form-select" value={difficulty} onChange={e => { setDifficulty(e.target.value); setPage(1); }} style={{ width: 'auto', minWidth: 120 }}>
                    <option value="">Tümü</option>
                    <option value="kolay">Kolay</option>
                    <option value="orta">Orta</option>
                    <option value="zor">Zor</option>
                </select>
                <button type="submit" className="btn btn-primary btn-sm">Ara</button>
            </form>

            {loading ? (
                <div className="loading-spinner">⏳</div>
            ) : (
                <>
                    {hadiths.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📖</div>
                            <p>Hadis bulunamadı</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {hadiths.map(h => (
                                <div key={h._id} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/quiz/${h._id}`)}>
                                    <div className="flex-between" style={{ marginBottom: 8 }}>
                                        <div>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)' }}>#{h.number}</span>
                                            <span style={{ fontSize: 13, fontWeight: 600, marginLeft: 8 }}>{h.topic}</span>
                                            {isMemorized(h._id) && <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--green)' }}>✅ Ezberlendi</span>}
                                        </div>
                                        <span className="tag" style={{ borderColor: diffColors[h.difficulty], color: diffColors[h.difficulty], background: 'transparent', fontSize: 11 }}>
                                            {h.difficulty}
                                        </span>
                                    </div>
                                    <div style={{ fontFamily: 'var(--arabic)', fontSize: 20, direction: 'rtl', textAlign: 'right', color: 'var(--gold)', lineHeight: 1.7, marginBottom: 6 }}>
                                        {h.arabic.length > 100 ? h.arabic.substring(0, 100) + '...' : h.arabic}
                                    </div>
                                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: 8 }}>
                                        "{h.turkish.length > 120 ? h.turkish.substring(0, 120) + '...' : h.turkish}"
                                    </div>
                                    <div className="flex-gap" style={{ gap: 6 }}>
                                        <span className="tag tag-narrator" style={{ fontSize: 10 }}>📜 {h.narrator}</span>
                                        <span className="tag tag-source" style={{ fontSize: 10 }}>📚 {h.source}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex-gap" style={{ justifyContent: 'center', marginTop: 20 }}>
                            <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Önceki</button>
                            <span style={{ color: 'var(--text-dim)', fontSize: 13, alignSelf: 'center' }}>{page} / {totalPages}</span>
                            <button className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Sonraki →</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
