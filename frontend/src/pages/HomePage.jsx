import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function TTSButton({ text, lang = 'tr-TR' }) {
    const [speaking, setSpeaking] = useState(false);
    const speak = () => {
        if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
        const utt = new SpeechSynthesisUtterance(text);
        utt.lang = lang; utt.rate = 0.85;
        utt.onend = () => setSpeaking(false);
        window.speechSynthesis.speak(utt);
        setSpeaking(true);
    };
    return (
        <button className={`tts-btn ${speaking ? 'speaking' : ''}`} onClick={speak}>
            {speaking ? '🔊 Duraksıyor...' : '🔊 Sesli Dinle'}
        </button>
    );
}

export default function HomePage() {
    const [hadith, setHadith] = useState(null);
    const [loading, setLoading] = useState(true);
    const [memorized, setMemorized] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/hadiths/daily').then(r => {
            setHadith(r.data);
            setMemorized(user?.memorizedHadiths?.includes(r.data._id));
        }).finally(() => setLoading(false));
    }, []);

    const toggleMemorize = async () => {
        if (!hadith) return;
        if (memorized) {
            await api.delete(`/hadiths/${hadith._id}/memorize`);
            setMemorized(false);
        } else {
            await api.post(`/hadiths/${hadith._id}/memorize`);
            setMemorized(true);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', paddingTop: 80, fontSize: 32 }}>⏳</div>;

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h2>🌙 Günün Hadisi</h2>
                <p>Bugünün hadisinle manevi yolculuğuna başla</p>
            </div>

            {/* Stats row */}
            <div className="grid-3" style={{ marginBottom: 24 }}>
                <div className="stat-box">
                    <div className="stat-value" style={{ color: 'var(--gold)' }}>⭐ {user?.points || 0}</div>
                    <div className="stat-label">Toplam Puan</div>
                </div>
                <div className="stat-box">
                    <div className="stat-value" style={{ color: 'var(--primary)' }}>📖 {user?.memorizedHadiths?.length || 0}</div>
                    <div className="stat-label">Ezberlenen Hadis</div>
                </div>
                <div className="stat-box">
                    <div className="stat-value" style={{ color: '#f97316' }}>🔥 {user?.streak || 0}</div>
                    <div className="stat-label">Günlük Seri</div>
                </div>
            </div>

            {hadith && (
                <div className="card animate-slide" style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <div>
                            <div className="card-title">Hadis #{hadith.number}</div>
                            <div className="card-sub">{hadith.topic}</div>
                        </div>
                        <TTSButton text={hadith.turkish} />
                    </div>

                    <div className="hadis-arabic">{hadith.arabic}</div>
                    <div className="hadis-turkish">"{hadith.turkish}"</div>

                    <div className="hadis-meta" style={{ marginBottom: 20 }}>
                        <span className="tag tag-narrator">📜 {hadith.narrator}</span>
                        <span className="tag tag-source">📚 {hadith.source}</span>
                        <span className="tag tag-topic">🏷️ {hadith.topic}</span>
                    </div>

                    {hadith.dailyExample && (
                        <div className="example-box">
                            <div className="ex-title">🌿 Günlük Hayat Örneği</div>
                            <p>{hadith.dailyExample}</p>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
                        <button className={`btn ${memorized ? 'btn-outline' : 'btn-gold'}`} onClick={toggleMemorize}>
                            {memorized ? '✅ Ezberlendi' : '⭐ Ezberledim'}
                        </button>
                        <button className="btn btn-primary" onClick={() => navigate(`/quiz/${hadith._id}`)}>
                            🎯 Bunu Test Et
                        </button>
                        <button className="btn btn-outline" onClick={() => navigate('/hadiths')}>
                            📖 Tüm Hadisler
                        </button>
                    </div>
                </div>
            )}

            {/* Badges preview */}
            {user?.badges?.length > 0 && (
                <div className="card">
                    <div className="card-title" style={{ marginBottom: 12 }}>🏅 Son Kazanılan Rozetler</div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {user.badges.slice(0, 4).map(b => (
                            <div key={b._id} style={{ textAlign: 'center', background: 'var(--card2)', padding: '10px 16px', borderRadius: 10, border: '1px solid var(--gold)' }}>
                                <div style={{ fontSize: 24 }}>{b.icon}</div>
                                <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600 }}>{b.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
