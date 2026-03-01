import { useEffect, useState } from 'react';
import api from '../services/api';

export default function BadgesPage() {
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/badges').then(r => setBadges(r.data)).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-spinner">⏳</div>;

    const earned = badges.filter(b => b.earned);
    const locked = badges.filter(b => !b.earned);

    const rarityLabel = { common: 'Yaygın', rare: 'Nadir', epic: 'Epik', legendary: 'Efsanevi' };
    const rarityClass = { common: 'rarity-common', rare: 'rarity-rare', epic: 'rarity-epic', legendary: 'rarity-legendary' };

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h2>🏅 Rozetler</h2>
                <p>{earned.length} / {badges.length} rozet kazanıldı</p>
            </div>

            {/* Progress */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="flex-between" style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Rozet İlerleme</span>
                    <span style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 700 }}>{Math.round((earned.length / badges.length) * 100)}%</span>
                </div>
                <div className="progress-bar-outer">
                    <div className="progress-bar-inner" style={{ width: `${(earned.length / badges.length) * 100}%` }} />
                </div>
            </div>

            {/* Kazanılan */}
            {earned.length > 0 && (
                <>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>✨ Kazanılan Rozetler ({earned.length})</h3>
                    <div className="badge-grid" style={{ marginBottom: 28 }}>
                        {earned.map(b => (
                            <div key={b._id} className="badge-item earned animate-scale">
                                {b.rarity && <span className={`badge-rarity ${rarityClass[b.rarity]}`}>{rarityLabel[b.rarity]}</span>}
                                <div className="badge-icon">{b.icon}</div>
                                <div className="badge-name">{b.name}</div>
                                <div className="badge-desc">{b.description}</div>
                                <div className="badge-earned-label">✅ Kazanıldı</div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Kilitli */}
            {locked.length > 0 && (
                <>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>🔒 Kilitli Rozetler ({locked.length})</h3>
                    <div className="badge-grid">
                        {locked.map(b => (
                            <div key={b._id} className="badge-item locked">
                                {b.rarity && <span className={`badge-rarity ${rarityClass[b.rarity]}`}>{rarityLabel[b.rarity]}</span>}
                                <div className="badge-icon">{b.icon}</div>
                                <div className="badge-name">{b.name}</div>
                                <div className="badge-desc">{b.description}</div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
