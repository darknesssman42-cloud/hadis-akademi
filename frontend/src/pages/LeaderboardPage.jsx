import { useEffect, useState } from 'react';
import api from '../services/api';

export default function LeaderboardPage() {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/leaderboard/weekly').then(r => setLeaders(r.data)).finally(() => setLoading(false));
    }, []);

    const rankLabel = (r) => r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : r;
    const rankClass = (r) => r === 1 ? 'gold' : r === 2 ? 'silver' : r === 3 ? 'bronze' : '';

    if (loading) return <div style={{ textAlign: 'center', paddingTop: 80, fontSize: 32 }}>⏳</div>;

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h2>🏆 Haftalık Sıralama</h2>
                <p>En çok puan kazanan öğrenciler</p>
            </div>
            {leaders.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: 48 }}>🌙</div>
                    <p style={{ marginTop: 12, color: 'var(--text-dim)' }}>Henüz sıralama oluşmadı. Quiz çözerek puan kazan!</p>
                </div>
            ) : (
                <div>
                    {leaders.map(l => (
                        <div key={l.id} className={`leader-row ${l.isCurrentUser ? 'me' : ''}`}>
                            <div className={`leader-rank ${rankClass(l.rank)}`}>{rankLabel(l.rank)}</div>
                            <div className="user-avatar" style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                {l.name[0]}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div className="leader-name">{l.name} {l.isCurrentUser && <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 400 }}>(Sen)</span>}</div>
                                <div className="leader-class">{l.class || '—'} • {l.memorizedCount} hadis • {l.streak} günlük seri 🔥</div>
                            </div>
                            {l.topBadge && <span style={{ fontSize: 20 }}>{l.topBadge.icon}</span>}
                            <div className="leader-points">⭐ {l.points}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
