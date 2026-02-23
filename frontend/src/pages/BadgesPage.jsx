import { useEffect, useState } from 'react';
import api from '../services/api';

export default function BadgesPage() {
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/badges').then(r => setBadges(r.data)).finally(() => setLoading(false));
    }, []);

    const earned = badges.filter(b => b.earned);
    const locked = badges.filter(b => !b.earned);

    if (loading) return <div style={{ textAlign: 'center', paddingTop: 80, fontSize: 32 }}>⏳</div>;

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h2>🏅 Rozetler</h2>
                <p>{earned.length} / {badges.length} rozet kazanıldı</p>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 600 }}>İlerleme</span>
                    <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{earned.length}/{badges.length}</span>
                </div>
                <div className="progress-bar-outer">
                    <div className="progress-bar-inner" style={{ width: `${(earned.length / badges.length) * 100}%` }} />
                </div>
            </div>

            {earned.length > 0 && (
                <>
                    <h3 style={{ marginBottom: 14, fontSize: 16, color: 'var(--gold)' }}>✨ Kazanılan Rozetler</h3>
                    <div className="badge-grid" style={{ marginBottom: 28 }}>
                        {earned.map(b => (
                            <div key={b._id} className="badge-item earned">
                                <div className="badge-icon">{b.icon}</div>
                                <div className="badge-name">{b.name}</div>
                                <div className="badge-desc">{b.description}</div>
                                <div className="badge-earned-label">✅ Kazanıldı</div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {locked.length > 0 && (
                <>
                    <h3 style={{ marginBottom: 14, fontSize: 16, color: 'var(--text-dim)' }}>🔒 Kilitli Rozetler</h3>
                    <div className="badge-grid">
                        {locked.map(b => (
                            <div key={b._id} className="badge-item locked">
                                <div className="badge-icon">{b.icon}</div>
                                <div className="badge-name">{b.name}</div>
                                <div className="badge-desc">{b.description}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6 }}>
                                    {b.requirement.type === 'points' && `${b.requirement.value} puan kazan`}
                                    {b.requirement.type === 'memorized' && `${b.requirement.value} hadis ezberle`}
                                    {b.requirement.type === 'quizzes' && `${b.requirement.value} quiz tamamla`}
                                    {b.requirement.type === 'correct' && `${b.requirement.value} doğru cevap ver`}
                                    {b.requirement.type === 'streak' && `${b.requirement.value} günlük seri yap`}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
