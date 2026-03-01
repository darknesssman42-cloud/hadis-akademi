import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ProgressPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/progress/me').then(r => setData(r.data)).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-spinner">⏳</div>;
    if (!data) return null;

    const { user, weeklyData, totalQuizzes } = data;

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h2>📊 İlerleme</h2>
                <p>{user.name} — Genel performans özeti</p>
            </div>

            {/* Ana İstatistikler */}
            <div className="grid-3" style={{ marginBottom: 20 }}>
                <div className="stat-box">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-value" style={{ color: 'var(--gold)' }}>{user.points}</div>
                    <div className="stat-label">Toplam Puan</div>
                </div>
                <div className="stat-box">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-value" style={{ color: user.accuracy >= 70 ? 'var(--green)' : user.accuracy >= 40 ? 'var(--gold)' : 'var(--red)' }}>
                        %{user.accuracy}
                    </div>
                    <div className="stat-label">Quiz Doğruluk Oranı</div>
                </div>
                <div className="stat-box">
                    <div className="stat-icon">📝</div>
                    <div className="stat-value" style={{ color: 'var(--primary)' }}>{totalQuizzes}</div>
                    <div className="stat-label">Toplam Quiz</div>
                </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 20 }}>
                <div className="stat-box">
                    <div className="stat-icon">📖</div>
                    <div className="stat-value" style={{ color: 'var(--green)' }}>{user.memorizedHadiths?.length || 0}</div>
                    <div className="stat-label">Ezberlenen Hadis</div>
                </div>
                <div className="stat-box">
                    <div className="stat-icon">🏅</div>
                    <div className="stat-value" style={{ color: 'var(--purple)' }}>{user.badges?.length || 0}</div>
                    <div className="stat-label">Kazanılan Rozet</div>
                </div>
            </div>

            {/* Detay İstatistikler */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-title" style={{ marginBottom: 16 }}>📈 Detaylı İstatistikler</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="flex-between">
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Toplam Doğru Cevap</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)' }}>{user.totalCorrect}</span>
                    </div>
                    <div className="flex-between">
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Toplam Soru</span>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{user.totalAttempted}</span>
                    </div>
                    <div className="flex-between">
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Günlük Seri</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--orange)' }}>🔥 {user.streak}</span>
                    </div>
                </div>
            </div>

            {/* Haftalık Aktivite */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-title" style={{ marginBottom: 16 }}>📅 Son 7 Gün Aktivite</div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', overflowX: 'auto' }}>
                    {weeklyData?.map((d, i) => {
                        const maxQ = Math.max(...weeklyData.map(w => w.quizzes), 1);
                        const height = d.quizzes > 0 ? Math.max(10, (d.quizzes / maxQ) * 80) : 6;
                        return (
                            <div key={i} style={{ textAlign: 'center', flex: 1, minWidth: 40 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, color: d.quizzes > 0 ? 'var(--primary-light)' : 'var(--text-dim)' }}>
                                    {d.quizzes}
                                </div>
                                <div style={{ height: 80, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                                    <div style={{
                                        width: '70%', height, borderRadius: 4,
                                        background: d.quizzes > 0
                                            ? 'linear-gradient(180deg, var(--primary), var(--purple))'
                                            : 'var(--bg3)',
                                        transition: 'height 0.5s ease'
                                    }} />
                                </div>
                                <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>{d.date}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Kazanılan Rozetler */}
            {user.badges?.length > 0 && (
                <div className="card">
                    <div className="card-title" style={{ marginBottom: 12 }}>🏅 Kazanılan Rozetler</div>
                    <div className="flex-gap">
                        {user.badges.map(b => (
                            <div key={b._id} style={{ textAlign: 'center', background: 'var(--card2)', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(249,183,43,0.12)', minWidth: 70 }}>
                                <div style={{ fontSize: 26 }}>{b.icon}</div>
                                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--gold)', marginTop: 4 }}>{b.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Ezberlenen Hadisler */}
            {user.memorizedHadiths?.length > 0 && (
                <div className="card" style={{ marginTop: 16 }}>
                    <div className="card-title" style={{ marginBottom: 12 }}>📖 Ezberlenen Hadis Konuları</div>
                    <div className="flex-gap">
                        {user.memorizedHadiths.map((h, i) => (
                            <span key={h._id || i} className="tag tag-topic">
                                #{h.number} {h.topic}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
