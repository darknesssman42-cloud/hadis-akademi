import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function TTSButton({ text, lang = 'ar-SA', label = '🔊 Sesli Dinle' }) {
    const [speaking, setSpeaking] = useState(false);
    const audioRef = useRef(null);
    const isCancelled = useRef(false);

    const speak = async () => {
        if (speaking) {
            isCancelled.current = true;
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            setSpeaking(false);
            return;
        }

        setSpeaking(true);
        isCancelled.current = false;
        try {
            // Split text to fit Google TTS ~200 char limit
            const chunks = text.match(/[^.!?،\n]+[.!?،\n]*/g) || [text];
            let currentChunks = [];
            let temp = "";
            for (let c of chunks) {
                if (temp.length + c.length > 150) {
                    if (temp) currentChunks.push(temp);
                    temp = c;
                } else {
                    temp += c;
                }
            }
            if (temp) currentChunks.push(temp);

            for (let chunk of currentChunks) {
                if (!chunk.trim()) continue;
                if (isCancelled.current) break;

                const url = `${api.defaults.baseURL}/tts?lang=${lang.split('-')[0]}&text=${encodeURIComponent(chunk.trim())}`;
                const audio = new Audio(url);
                audioRef.current = audio;

                await new Promise((resolve) => {
                    audio.onended = resolve;
                    audio.onerror = resolve; // Ignore errors and continue
                    audio.play().catch(resolve);
                });
            }
        } catch (err) {
            console.error("TTS Error:", err);
        } finally {
            setSpeaking(false);
            isCancelled.current = false;
        }
    };

    useEffect(() => {
        return () => {
            isCancelled.current = true;
            if (audioRef.current) audioRef.current.pause();
        };
    }, []);

    return (
        <button className={`tts-btn ${speaking ? 'speaking' : ''}`} onClick={speak}>
            {speaking ? '🔊 Durdur' : label}
        </button>
    );
}

export default function HomePage() {
    const [hadith, setHadith] = useState(null);
    const [loading, setLoading] = useState(true);
    const [memorized, setMemorized] = useState(false);
    const [showMemorizeModal, setShowMemorizeModal] = useState(false);
    const [turkishAnswer, setTurkishAnswer] = useState('');
    const [memResult, setMemResult] = useState(null);
    const [memLoading, setMemLoading] = useState(false);
    const [assignments, setAssignments] = useState([]);
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/hadiths/daily').then(r => {
            setHadith(r.data);
            if (r.data && user?.memorizedHadiths) {
                setMemorized(user.memorizedHadiths.some(h =>
                    (typeof h === 'string' ? h : h._id) === r.data._id
                ));
            }
        }).catch(() => { }).finally(() => setLoading(false));

        if (user?.role === 'student' && user?.classroom) {
            api.get('/assignments/my-class').then(res => setAssignments(res.data)).catch(() => { });
        }
    }, [user]);

    const handleMemorize = async () => {
        if (memorized) return;
        setShowMemorizeModal(true);
        setTurkishAnswer('');
        setMemResult(null);
    };

    const submitMemorize = async () => {
        if (!hadith || !turkishAnswer.trim()) return;
        setMemLoading(true);
        try {
            const res = await api.post(`/hadiths/${hadith._id}/memorize`, { turkishAnswer });
            setMemResult(res.data);
            if (res.data.success) {
                setMemorized(true);
                await refreshUser();
                setTimeout(() => setShowMemorizeModal(false), 2000);
            }
        } catch (err) {
            setMemResult({ success: false, message: err.response?.data?.error || 'Hata oluştu' });
        } finally {
            setMemLoading(false);
        }
    };

    if (loading) return <div className="loading-spinner">⏳</div>;

    const difficultyMap = { kolay: { label: 'Kolay', color: 'var(--green)' }, orta: { label: 'Orta', color: 'var(--gold)' }, zor: { label: 'Zor', color: 'var(--red)' } };
    const diff = hadith ? difficultyMap[hadith.difficulty] || difficultyMap.orta : difficultyMap.orta;

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h2>🌙 Günün Hadisi</h2>
                <p>Bugünün hadisiyle manevi yolculuğuna başla</p>
            </div>

            {/* Stats */}
            <div className="grid-3" style={{ marginBottom: 24 }}>
                <div className="stat-box">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-value" style={{ color: 'var(--gold)' }}>{user?.points || 0}</div>
                    <div className="stat-label">Toplam Puan</div>
                </div>
                <div className="stat-box">
                    <div className="stat-icon">📖</div>
                    <div className="stat-value" style={{ color: 'var(--primary)' }}>{user?.memorizedHadiths?.length || 0}</div>
                    <div className="stat-label">Ezberlenen Hadis</div>
                </div>
                <div className="stat-box">
                    <div className="stat-icon">🔥</div>
                    <div className="stat-value" style={{ color: 'var(--orange)' }}>{user?.streak || 0}</div>
                    <div className="stat-label">Günlük Seri</div>
                </div>
            </div>

            {hadith && (
                <div className="card animate-slide" style={{ marginBottom: 20 }}>
                    <div className="flex-between" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                        <div>
                            <div className="card-title">Hadis #{hadith.number}</div>
                            <div className="card-sub">{hadith.topic}</div>
                        </div>
                        <div className="flex-gap">
                            <TTSButton text={hadith.arabic} lang="ar-SA" label="🔊 Arapça Dinle" />
                        </div>
                    </div>

                    <div className="hadis-arabic">{hadith.arabic}</div>
                    <div className="hadis-turkish">"{hadith.turkish}"</div>

                    <div className="hadis-meta" style={{ marginBottom: 20 }}>
                        <span className="tag tag-narrator">📜 {hadith.narrator}</span>
                        <span className="tag tag-source">📚 {hadith.source}</span>
                        <span className="tag tag-topic">🏷️ {hadith.topic}</span>
                        <span className="tag tag-difficulty" style={{ borderColor: diff.color, color: diff.color }}>
                            📊 {diff.label}
                        </span>
                    </div>

                    {hadith.dailyExample && (
                        <div className="example-box">
                            <div className="ex-title">🌿 Günlük Hayat Örneği</div>
                            <p>{hadith.dailyExample}</p>
                        </div>
                    )}

                    <div className="flex-gap" style={{ marginTop: 20 }}>
                        <button className={`btn ${memorized ? 'btn-outline' : 'btn-gold'}`} onClick={handleMemorize} disabled={memorized}>
                            {memorized ? '✅ Ezberlendi' : '⭐ Ezberledim'}
                        </button>
                        <button className="btn btn-primary" onClick={() => navigate(`/quiz/${hadith._id}`)}>
                            🎯 Test Et
                        </button>
                        <button className="btn btn-outline" onClick={() => navigate('/hadiths')}>
                            📖 Tüm Hadisler
                        </button>
                    </div>
                </div>
            )}

            {/* Sınıf Ödevleri / Quizler */}
            {user?.role === 'student' && assignments.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                    <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(108, 99, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📝</div>
                        <div>
                            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Sınıfıma Ait Ödevler</h3>
                            <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Öğretmeniniz tarafından atanan özel hadis çalışmaları</p>
                        </div>
                    </div>

                    <div className="grid-2">
                        {assignments.map(a => (
                            <div key={a._id} className="card" style={{ padding: '16px', borderLeft: '4px solid var(--primary)' }}>
                                <div className="flex-between">
                                    <div style={{ fontWeight: 700, fontSize: 15 }}>{a.title}</div>
                                    <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{a.teacher?.name} Hoca</span>
                                </div>
                                <div style={{ fontSize: 12, margin: '10px 0', color: 'var(--text-secondary)' }}>
                                    {a.hadiths?.length} Hadis: {a.hadiths?.map(h => `#${h.number}`).join(', ')}
                                </div>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {a.hadiths?.slice(0, 5).map(h => (
                                        <button key={h._id} className="btn btn-primary btn-sm" onClick={() => navigate(`/quiz/${h._id}`)}>
                                            Hadis #{h.number}
                                        </button>
                                    ))}
                                    {a.hadiths?.length > 5 && <span style={{ fontSize: 11, alignSelf: 'center' }}>+ {a.hadiths.length - 5} daha</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Rozetler */}
            {user?.badges?.length > 0 && (
                <div className="card">
                    <div className="card-title" style={{ marginBottom: 12 }}>🏅 Son Kazanılan Rozetler</div>
                    <div className="flex-gap">
                        {user.badges.slice(-4).map(b => (
                            <div key={b._id} style={{ textAlign: 'center', background: 'var(--card2)', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(249,183,43,0.15)', minWidth: 80 }}>
                                <div style={{ fontSize: 28 }}>{b.icon}</div>
                                <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600, marginTop: 4 }}>{b.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Ezberleme Modal */}
            {showMemorizeModal && (
                <div className="modal-overlay" onClick={() => setShowMemorizeModal(false)}>
                    <div className="modal-card animate-scale" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>⭐ Hadis Ezberleme</h3>
                            <button className="modal-close" onClick={() => setShowMemorizeModal(false)}>✕</button>
                        </div>

                        <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 16 }}>
                            Arapça metni sesli okuyun, ardından Türkçe mealini aşağıya yazın.
                        </p>

                        <div style={{ background: 'var(--bg3)', padding: 16, borderRadius: 10, marginBottom: 16 }}>
                            <div style={{ fontFamily: 'var(--arabic)', fontSize: 22, direction: 'rtl', textAlign: 'right', color: 'var(--gold)', lineHeight: 1.8 }}>
                                {hadith?.arabic}
                            </div>
                            <div style={{ marginTop: 8 }}>
                                <TTSButton text={hadith?.arabic} lang="ar-SA" label="🔊 Arapça Dinle" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Türkçe Mealini Yazın</label>
                            <textarea
                                className="form-textarea"
                                placeholder="Hadisin Türkçe anlamını buraya yazın..."
                                value={turkishAnswer}
                                onChange={e => setTurkishAnswer(e.target.value)}
                                rows={3}
                            />
                        </div>

                        {memResult && (
                            <div className={memResult.success ? 'success-msg' : 'error-msg'} style={{ marginBottom: 14 }}>
                                {memResult.success ? '✅' : '❌'} {memResult.message}
                                {memResult.pointsEarned > 0 && <span style={{ marginLeft: 8, fontWeight: 700 }}>+{memResult.pointsEarned} puan!</span>}
                            </div>
                        )}

                        <button className="btn btn-gold btn-full" onClick={submitMemorize} disabled={memLoading || !turkishAnswer.trim()}>
                            {memLoading ? '⏳ Kontrol ediliyor...' : '📝 Gönder ve Ezberle'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
