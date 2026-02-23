import { useEffect, useState } from 'react';
import api from '../services/api';

export default function TeacherPage() {
    const [students, setStudents] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        Promise.all([api.get('/teacher/students'), api.get('/teacher/stats')])
            .then(([sr, str]) => { setStudents(sr.data); setStats(str.data); })
            .finally(() => setLoading(false));
    }, []);

    const filtered = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.class || '').toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div style={{ textAlign: 'center', paddingTop: 80, fontSize: 32 }}>⏳</div>;

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h2>👨‍🏫 Öğretmen Paneli</h2>
                <p>Sınıf genelindeki öğrenci ilerlemesi</p>
            </div>

            {/* Sınıf istatistikleri */}
            {stats && (
                <div className="grid-3" style={{ marginBottom: 24 }}>
                    <div className="stat-box">
                        <div className="stat-value" style={{ color: 'var(--primary)' }}>{stats.totalStudents}</div>
                        <div className="stat-label">Kayıtlı Öğrenci</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-value" style={{ color: 'var(--gold)' }}>{stats.totalQuizzes}</div>
                        <div className="stat-label">Toplam Quiz</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-value" style={{ color: 'var(--green)' }}>{stats.avgScore}%</div>
                        <div className="stat-label">Ortalama Başarı</div>
                    </div>
                </div>
            )}

            {stats?.topStudent && (
                <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, rgba(251,191,36,0.1), var(--card))', borderColor: 'rgba(251,191,36,0.3)' }}>
                    <div style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 700, marginBottom: 4 }}>🏆 En Başarılı Öğrenci</div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>{stats.topStudent.name}</div>
                    <div style={{ color: 'var(--gold)' }}>⭐ {stats.topStudent.points} puan</div>
                </div>
            )}

            <input className="form-input" placeholder="🔍 Öğrenci veya sınıfa göre ara..."
                value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 16 }} />

            <div className="card" style={{ overflowX: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Öğrenci</th>
                            <th>Sınıf</th>
                            <th>Puan</th>
                            <th>Quiz</th>
                            <th>Doğruluk</th>
                            <th>Ezber</th>
                            <th>Rozet</th>
                            <th>Seri</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(s => (
                            <tr key={s.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
                                            {s.name[0]}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{s.name}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{s.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{s.class || '—'}</td>
                                <td><span style={{ color: 'var(--gold)', fontWeight: 700 }}>⭐ {s.points}</span></td>
                                <td>{s.quizCount}</td>
                                <td>
                                    <span style={{ color: s.accuracy >= 70 ? 'var(--green)' : s.accuracy >= 40 ? 'var(--gold)' : 'var(--red)', fontWeight: 600 }}>
                                        {s.accuracy}%
                                    </span>
                                </td>
                                <td>📖 {s.memorizedCount}</td>
                                <td>🏅 {s.badgeCount}</td>
                                <td>🔥 {s.streak}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-dim)' }}>Öğrenci bulunamadı</div>
                )}
            </div>
        </div>
    );
}
