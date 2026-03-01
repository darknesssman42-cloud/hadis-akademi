import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function QuizPage() {
    const { hadithId } = useParams();
    const navigate = useNavigate();
    const { refreshUser } = useAuth();

    const [hadith, setHadith] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // If no hadithId, show quiz selection
    const [hadiths, setHadiths] = useState([]);
    const [dailyHadiths, setDailyHadiths] = useState([]);
    const [selectedHadith, setSelectedHadith] = useState(null);

    useEffect(() => {
        if (hadithId) {
            generateQuiz(hadithId);
        } else {
            Promise.all([
                api.get('/hadiths?limit=100'),
                api.get('/quiz/daily').catch(() => ({ data: { hadiths: [] } }))
            ]).then(([hRes, dRes]) => {
                setHadiths(hRes.data.hadiths || hRes.data || []);
                setDailyHadiths(dRes.data?.hadiths || []);
            }).finally(() => setLoading(false));
        }
    }, [hadithId]);

    const generateQuiz = (id) => {
        setLoading(true);
        api.post('/quiz/generate', { hadithId: id }).then(r => {
            setHadith(r.data.hadith);
            setQuestions(r.data.questions);
            setAnswers({});
            setSubmitted(false);
            setResult(null);
        }).finally(() => setLoading(false));
    };

    const handleAnswer = (qIndex, answer) => {
        if (submitted) return;
        setAnswers(prev => ({ ...prev, [qIndex]: answer }));
    };

    const submitQuiz = async () => {
        if (Object.keys(answers).length < questions.length) return;
        setSubmitting(true);
        try {
            const scoredAnswers = questions.map((q, i) => ({
                questionText: q.questionText,
                options: q.options,
                correctAnswer: q.correctAnswer,
                userAnswer: answers[i] || ''
            }));

            const res = await api.post('/quiz/submit', {
                hadithId: hadith._id,
                answers: scoredAnswers
            });

            setResult(res.data);
            setSubmitted(true);
            await refreshUser();
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loading-spinner">⏳</div>;

    // Quiz selection page
    if (!hadithId && !selectedHadith) {
        return (
            <div className="animate-fade">
                <div className="page-header">
                    <h2>🎯 Quiz</h2>
                    <p>Bilginizi test etmek için bir hadis seçin</p>
                </div>

                {dailyHadiths.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                        <h3 style={{ fontSize: 15, marginBottom: 12, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            ⭐ Günün Quizi (Öğretmen Seçimi)
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {dailyHadiths.map(h => (
                                <div key={'daily-' + h._id} className="card" style={{ cursor: 'pointer', padding: '16px 20px', border: '1px solid rgba(249,183,43,0.3)', background: 'rgba(249,183,43,0.05)' }}
                                    onClick={() => { setSelectedHadith(h._id); generateQuiz(h._id); }}>
                                    <div className="flex-between">
                                        <div>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)' }}>#{h.number}</span>
                                            <span style={{ fontSize: 13, fontWeight: 600, marginLeft: 8 }}>{h.topic}</span>
                                        </div>
                                        <span className="btn btn-gold btn-sm" style={{ background: 'var(--gold)', color: '#000' }}>Hemen Başla →</span>
                                    </div>
                                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, fontStyle: 'italic' }}>
                                        "{h.turkish?.substring(0, 80)}..."
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <h3 style={{ fontSize: 15, marginBottom: 12, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    📚 Tüm Hadisler
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {hadiths.map(h => (
                        <div key={h._id} className="card" style={{ cursor: 'pointer', padding: '16px 20px' }}
                            onClick={() => { setSelectedHadith(h._id); generateQuiz(h._id); }}>
                            <div className="flex-between">
                                <div>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)' }}>#{h.number}</span>
                                    <span style={{ fontSize: 13, fontWeight: 600, marginLeft: 8 }}>{h.topic}</span>
                                </div>
                                <span className="btn btn-primary btn-sm">Quiz Başlat →</span>
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, fontStyle: 'italic' }}>
                                "{h.turkish?.substring(0, 80)}..."
                            </div>
                        </div>
                    ))}
                </div>

                {hadiths.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">🎯</div>
                        <p>Henüz quiz yapılacak hadis bulunmuyor.</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h2>🎯 Quiz — Hadis #{hadith?.number}</h2>
                <p>{hadith?.topic} • Her hadis için 2 soru</p>
            </div>

            {hadith && (
                <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, rgba(249,183,43,0.04), var(--card))' }}>
                    <div style={{ fontFamily: 'var(--arabic)', fontSize: 20, direction: 'rtl', textAlign: 'right', color: 'var(--gold)', lineHeight: 1.7 }}>
                        {hadith.arabic}
                    </div>
                </div>
            )}

            {questions.map((q, qIndex) => (
                <div key={qIndex} className="card" style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-light)', marginBottom: 6 }}>
                        Soru {qIndex + 1} / {questions.length}
                    </div>
                    <div className="quiz-question">{q.questionText}</div>
                    <div>
                        {q.options.map((opt, oIndex) => {
                            let className = 'quiz-option';
                            if (submitted) {
                                if (opt === q.correctAnswer) className += ' correct';
                                else if (answers[qIndex] === opt && opt !== q.correctAnswer) className += ' wrong';
                            } else if (answers[qIndex] === opt) {
                                className += ' selected';
                            }

                            return (
                                <button key={oIndex} className={className}
                                    onClick={() => handleAnswer(qIndex, opt)}
                                    disabled={submitted}>
                                    <span style={{ opacity: 0.5, marginRight: 8, fontWeight: 700 }}>
                                        {String.fromCharCode(65 + oIndex)})
                                    </span>
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}

            {!submitted ? (
                <button className="btn btn-primary btn-lg btn-full" onClick={submitQuiz}
                    disabled={Object.keys(answers).length < questions.length || submitting}>
                    {submitting ? '⏳ Gönderiliyor...' : '📝 Cevapları Gönder'}
                </button>
            ) : (
                <div className="flex-gap" style={{ marginTop: 8 }}>
                    <button className="btn btn-primary" onClick={() => navigate('/quiz')}>🎯 Yeni Quiz</button>
                    <button className="btn btn-outline" onClick={() => navigate('/')}>🏠 Ana Sayfa</button>
                </div>
            )}

            {/* Sonuç overlay */}
            {result && (
                <div className="result-overlay" onClick={() => setResult(null)}>
                    <div className="result-card" onClick={e => e.stopPropagation()}>
                        <div className="result-icon">{result.allCorrect ? '🎉' : result.score > 0 ? '👍' : '😔'}</div>
                        <div className="result-title">
                            {result.allCorrect ? 'Mükemmel!' : result.score > 0 ? 'İyi Deneme!' : 'Tekrar Dene!'}
                        </div>
                        <div className="result-sub">
                            {result.score}/{result.total} doğru cevap
                            {result.allCorrect && <div style={{ color: 'var(--gold)', fontWeight: 700, marginTop: 6 }}>+{result.pointsEarned} puan kazandınız! ⭐</div>}
                            {!result.allCorrect && <div style={{ marginTop: 6, fontSize: 13 }}>2 doğru cevap gerekli. Puan kazanılamadı.</div>}
                        </div>
                        {result.newBadges?.length > 0 && (
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>🏅 Yeni Rozet Kazandınız!</div>
                                <div className="flex-gap" style={{ justifyContent: 'center' }}>
                                    {result.newBadges.map(b => (
                                        <div key={b._id} style={{ background: 'var(--card2)', padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(249,183,43,0.2)' }}>
                                            <span style={{ fontSize: 22 }}>{b.icon}</span>
                                            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gold)' }}>{b.name}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <button className="btn btn-primary btn-full" onClick={() => setResult(null)}>Tamam</button>
                    </div>
                </div>
            )}
        </div>
    );
}
