import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function QuizPage() {
    const { hadithId } = useParams();
    const navigate = useNavigate();
    const [hadith, setHadith] = useState(null);
    const [quizType, setQuizType] = useState('');
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        api.get(`/hadiths/${hadithId}`).then(r => setHadith(r.data));
    }, [hadithId]);

    const startQuiz = async (type) => {
        setQuizType(type); setGenerating(true);
        try {
            const r = await api.post('/quiz/generate', { hadithId, quizType: type });
            setQuestions(r.data.questions);
            setAnswers(r.data.questions.map(q => ({ ...q, userAnswer: '' })));
        } finally {
            setGenerating(false);
        }
    };

    const selectAnswer = (qi, answer) => {
        if (submitted) return;
        setAnswers(prev => prev.map((a, i) => i === qi ? { ...a, userAnswer: answer } : a));
    };

    const handleFillBlankInput = (qi, val) => {
        if (submitted) return;
        setAnswers(prev => prev.map((a, i) => i === qi ? { ...a, userAnswer: val } : a));
    };

    const submitQuiz = async () => {
        if (answers.some(a => !a.userAnswer)) return alert('Tüm soruları cevaplayın!');
        setLoading(true);
        try {
            const r = await api.post('/quiz/submit', { hadithId, quizType, answers });
            setResult(r.data);
            setSubmitted(true);
            setAnswers(r.data.attempt.questions);
        } finally {
            setLoading(false);
        }
    };

    if (!hadith) return <div style={{ textAlign: 'center', paddingTop: 80, fontSize: 32 }}>⏳</div>;

    // Quiz type selection
    if (!quizType) return (
        <div className="animate-fade">
            <div className="page-header">
                <h2>🎯 Quiz Başlat</h2>
                <p>Hadis #{hadith.number}: {hadith.topic}</p>
            </div>
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="hadis-arabic">{hadith.arabic}</div>
                <div className="hadis-turkish" style={{ marginTop: 8 }}>"{hadith.turkish}"</div>
            </div>
            <div className="card-title" style={{ marginBottom: 16 }}>Quiz türü seçin:</div>
            <div className="grid-3">
                {[
                    { type: 'multiple_choice', icon: '🔘', title: 'Çoktan Seçmeli', desc: 'Doğru cevabı 4 seçenek arasından seç' },
                    { type: 'fill_blank', icon: '✏️', title: 'Boşluk Doldurma', desc: 'Eksik kelime ya da bilgiyi yaz' },
                    { type: 'matching', icon: '🔗', title: 'Eşleştirme', desc: 'Arapça metni Türkçesiyle eşleştir' }
                ].map(q => (
                    <div key={q.type} className="card" style={{ cursor: 'pointer', textAlign: 'center' }}
                        onClick={() => startQuiz(q.type)}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>{q.icon}</div>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{q.title}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>{q.desc}</div>
                    </div>
                ))}
            </div>
        </div>
    );

    if (generating) return <div style={{ textAlign: 'center', paddingTop: 80 }}><div style={{ fontSize: 48 }}>🧠</div><p style={{ marginTop: 16, color: 'var(--text-dim)' }}>Sorular hazırlanıyor...</p></div>;

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h2>🎯 {quizType === 'multiple_choice' ? 'Çoktan Seçmeli' : quizType === 'fill_blank' ? 'Boşluk Doldurma' : 'Eşleştirme'} Quiz</h2>
                <p>Hadis #{hadith.number}: {hadith.topic}</p>
            </div>

            {questions.map((q, qi) => (
                <div key={qi} className="card" style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Soru {qi + 1}: {q.questionText}</div>

                    {quizType === 'multiple_choice' || quizType === 'matching' ? (
                        q.options.map((opt, oi) => {
                            let cls = 'quiz-option';
                            if (submitted) {
                                if (opt === q.correctAnswer) cls += ' correct';
                                else if (opt === answers[qi]?.userAnswer && opt !== q.correctAnswer) cls += ' wrong';
                            } else if (answers[qi]?.userAnswer === opt) cls += ' selected';
                            return (
                                <button key={oi} className={cls} onClick={() => selectAnswer(qi, opt)} disabled={submitted}>
                                    {String.fromCharCode(65 + oi)}) {opt}
                                </button>
                            );
                        })
                    ) : (
                        <div>
                            <input
                                className="form-input"
                                placeholder="Cevabınızı buraya yazın..."
                                value={answers[qi]?.userAnswer || ''}
                                onChange={e => handleFillBlankInput(qi, e.target.value)}
                                disabled={submitted}
                                style={submitted ? { borderColor: answers[qi]?.isCorrect ? 'var(--green)' : 'var(--red)' } : {}}
                            />
                            {submitted && (
                                <div style={{ marginTop: 8, fontSize: 13, color: answers[qi]?.isCorrect ? 'var(--green)' : 'var(--red)' }}>
                                    {answers[qi]?.isCorrect ? '✅ Doğru!' : `❌ Doğru cevap: ${q.correctAnswer}`}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}

            {!submitted ? (
                <button className="btn btn-primary btn-lg" onClick={submitQuiz} disabled={loading}>
                    {loading ? '⏳ Gönderiliyor...' : '✅ Quizi Tamamla'}
                </button>
            ) : result && (
                <div className="result-overlay" onClick={() => navigate('/hadiths')}>
                    <div className="result-card" onClick={e => e.stopPropagation()}>
                        <div className="result-icon">{result.score === result.total ? '🏆' : result.score >= result.total / 2 ? '🌟' : '📚'}</div>
                        <div className="result-title">{result.score === result.total ? 'Mükemmel!' : result.score >= result.total / 2 ? 'Tebrikler!' : 'Devam Et!'}</div>
                        <div className="result-sub">{result.score} / {result.total} doğru • +{result.pointsEarned} puan kazandın!</div>
                        {result.newBadges?.length > 0 && (
                            <div style={{ margin: '16px 0', padding: 14, background: 'rgba(251,191,36,0.1)', borderRadius: 10, border: '1px solid var(--gold)' }}>
                                <div style={{ color: 'var(--gold)', fontWeight: 700, marginBottom: 8 }}>🎉 Yeni Rozet Kazandın!</div>
                                {result.newBadges.map(b => <div key={b._id}>{b.icon} {b.name}</div>)}
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button className="btn btn-primary" onClick={() => { setSubmitted(false); setQuizType(''); setQuestions([]); }}>🔄 Tekrar Yap</button>
                            <button className="btn btn-outline" onClick={() => navigate('/hadiths')}>📖 Hadisler</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
