import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function MemorizedPage() {
    const [memorized, setMemorized] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        api.get('/auth/me').then(r => {
            setMemorized(r.data.memorizedHadiths || []);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-spinner">⏳</div>;

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h2>✅ Ezberlenen Hadisler</h2>
                <p>Şimdiye kadar {memorized.length} hadis ezberlediniz</p>
            </div>

            {memorized.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📖</div>
                    <p>Henüz ezberlediğiniz hadis yok. Günün hadisini ezberleyerek başlayın!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {memorized.map((h, i) => (
                        <div key={h._id || i} className="card">
                            <div className="flex-between" style={{ marginBottom: 8 }}>
                                <div>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)' }}>✅ #{h.number || (i + 1)}</span>
                                    <span style={{ fontSize: 13, fontWeight: 600, marginLeft: 8 }}>{h.topic || 'Konu'}</span>
                                </div>
                                <span className="tag tag-difficulty" style={{ fontSize: 11 }}>{h.difficulty || 'orta'}</span>
                            </div>
                            {h.arabic && (
                                <div style={{ fontFamily: 'var(--arabic)', fontSize: 18, direction: 'rtl', textAlign: 'right', color: 'var(--gold)', lineHeight: 1.7, marginBottom: 6 }}>
                                    {h.arabic}
                                </div>
                            )}
                            {h.turkish && (
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                    "{h.turkish}"
                                </div>
                            )}
                            {(h.narrator || h.source) && (
                                <div className="flex-gap" style={{ gap: 6, marginTop: 8 }}>
                                    {h.narrator && <span className="tag tag-narrator" style={{ fontSize: 10 }}>📜 {h.narrator}</span>}
                                    {h.source && <span className="tag tag-source" style={{ fontSize: 10 }}>📚 {h.source}</span>}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
