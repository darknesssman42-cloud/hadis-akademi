import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../services/api';

export default function ProgressPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/progress/me').then(r => setData(r.data)).finally(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ textAlign: 'center', paddingTop: 80, fontSize: 32 }}>⏳</div>;
    if (!data) return null;

    const { user, weeklyData, totalQuizzes } = data;

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h2>📊 İlerleme Takibi</h2>
                <p>Öğrenme yolculuğundaki gelişimin</p>
            </div>

            {/* Stats */}
            <div className="grid-3" style={{ marginBottom: 24 }}>
                <div className="stat-box">
                    <div className="stat-value" style={{ color: 'var(--gold)' }}>{user.points}</div>
                    <div className="stat-label">Toplam Puan</div>
                </div>
                <div className="stat-box">
                    <div className="stat-value" style={{ color: 'var(--green)' }}>{user.accuracy}%</div>
                    <div className="stat-label">Doğruluk Oranı</div>
                </div>
                <div className="stat-box">
                    <div className="stat-value" style={{ color: 'var(--primary)' }}>{user.memorizedHadiths.length}</div>
                    <div className="stat-label">Ezberlenen Hadis</div>
                </div>
                <div className="stat-box">
                    <div className="stat-value" style={{ color: '#f97316' }}>{user.streak}</div>
                    <div className="stat-label">Günlük Seri 🔥</div>
                </div>
                <div className="stat-box">
                    <div className="stat-value" style={{ color: 'var(--primary-light)' }}>{totalQuizzes}</div>
                    <div className="stat-label">Toplam Quiz</div>
                </div>
                <div className="stat-box">
                    <div className="stat-value" style={{ color: 'var(--gold)' }}>{user.badges.length}</div>
                    <div className="stat-label">Rozet 🏅</div>
                </div>
            </div>

            {/* Weekly chart */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-title" style={{ marginBottom: 20 }}>📅 Haftalık Quiz Grafiği</div>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={weeklyData}>
                        <XAxis dataKey="date" tick={{ fill: '#8892b0', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#8892b0', fontSize: 12 }} allowDecimals={false} />
                        <Tooltip contentStyle={{ background: '#1e253a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, color: '#e8eaf6' }} />
                        <Bar dataKey="quizzes" name="Quiz Sayısı" radius={[6, 6, 0, 0]}>
                            {weeklyData.map((_, i) => <Cell key={i} fill={`hsl(${250 + i * 10}, 70%, 65%)`} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Accuracy chart */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-title" style={{ marginBottom: 20 }}>🎯 Günlük Doğruluk Oranı (%)</div>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={weeklyData.map(d => ({ ...d, accuracy: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0 }))}>
                        <XAxis dataKey="date" tick={{ fill: '#8892b0', fontSize: 12 }} />
                        <YAxis domain={[0, 100]} tick={{ fill: '#8892b0', fontSize: 12 }} />
                        <Tooltip contentStyle={{ background: '#1e253a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, color: '#e8eaf6' }} formatter={(v) => [`${v}%`, 'Doğruluk']} />
                        <Bar dataKey="accuracy" name="Doğruluk %" radius={[6, 6, 0, 0]} fill="#10b981" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Memorized hadiths */}
            {user.memorizedHadiths.length > 0 && (
                <div className="card">
                    <div className="card-title" style={{ marginBottom: 14 }}>📖 Ezberlenen Hadisler</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {user.memorizedHadiths.map(h => (
                            <span key={h._id} className="tag tag-topic">#{h.number} {h.topic}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
