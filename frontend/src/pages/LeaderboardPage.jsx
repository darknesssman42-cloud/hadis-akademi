import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LeaderboardPage() {
    const [ranked, setRanked] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        api.get('/leaderboard/weekly').then(r => setRanked(r.data)).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-spinner">⏳</div>;

    const medals = ['🥇', '🥈', '🥉'];

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h2>🏆 Haftalık Sıralama</h2>
                <p>Bu haftanın en çok puan kazanan öğrencileri</p>
            </div>

            {ranked.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🏆</div>
                    <p>Henüz sıralama verisi yok</p>
                </div>
            ) : (
                <div>
                    {ranked.map((r, i) => {
                        const topClass = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '';
                        const rankColor = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';

                        return (
                            <div key={r.id} className={`leader-row ${r.isCurrentUser ? 'me' : ''} ${topClass}`}>
                                <div className={`leader-rank ${rankColor}`}>
                                    {i < 3 ? medals[i] : r.rank}
                                </div>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--primary), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: 'white', flexShrink: 0 }}>
                                    {r.name?.[0]?.toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="leader-name">
                                        {r.name}
                                        {r.isCurrentUser && <span style={{ fontSize: 11, color: 'var(--primary-light)', marginLeft: 6 }}>(Sen)</span>}
                                    </div>
                                    <div className="leader-class">{r.classroom?.name || r.class || '—'} {r.school?.name && `• ${r.school.name}`} • 📖 {r.memorizedCount} ezber • 🔥 {r.streak} seri</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div className="leader-points">⭐ {r.weeklyPoints || r.points}</div>
                                    <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>haftalık</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
