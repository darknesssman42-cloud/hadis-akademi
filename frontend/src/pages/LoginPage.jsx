import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function LoginPage() {
    const [tab, setTab] = useState('login');
    const [form, setForm] = useState({ name: '', email: '', password: '', school: '', classroom: '', schoolNumber: '', phone: '', role: '' });
    const [schools, setSchools] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showTeacherRegister, setShowTeacherRegister] = useState(false);
    const [showManagerRegister, setShowManagerRegister] = useState(false);
    const { login, registerStudent, registerTeacher, registerManager } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSchools = async () => {
            try {
                const res = await api.get('/schools');
                setSchools(res.data);
            } catch (err) {
                console.error('Okulları yüklerken hata oluştu', err);
            }
        };
        fetchSchools();
    }, []);

    useEffect(() => {
        if (form.school) {
            const fetchClassrooms = async () => {
                try {
                    const res = await api.get(`/classrooms/school/${form.school}`);
                    setClassrooms(res.data);
                } catch (err) {
                    console.error('Sınıfları yüklerken hata oluştu', err);
                }
            };
            fetchClassrooms();
        } else {
            setClassrooms([]);
        }
    }, [form.school]);

    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess(''); setLoading(true);
        try {
            if (tab === 'login') {
                await login(form.email, form.password, rememberMe);
                navigate('/');
            } else if (tab === 'register') {
                await registerStudent({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    school: form.school,
                    classroom: form.classroom,
                    schoolNumber: form.schoolNumber
                });
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const submitTeacher = async (e) => {
        e.preventDefault();
        setError(''); setSuccess(''); setLoading(true);
        try {
            const result = await registerTeacher({
                name: form.name,
                email: form.email,
                password: form.password,
                phone: form.phone,
                school: form.school
            });
            if (result.pending) {
                setSuccess('Kayıt başarılı! Hesabınız admin onayı bekliyor. Onaylandıktan sonra giriş yapabilirsiniz.');
                setShowTeacherRegister(false);
                setTab('login');
            }
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const submitManager = async (e) => {
        e.preventDefault();
        setError(''); setSuccess(''); setLoading(true);
        try {
            const result = await registerManager({
                name: form.name,
                email: form.email,
                password: form.password,
                phone: form.phone,
                school: form.school,
                role: form.role
            });
            if (result.pending) {
                setSuccess('Kayıt başarılı! İdareci hesabınız admin onayı bekliyor. Onaylandıktan sonra giriş yapabilirsiniz.');
                setShowManagerRegister(false);
                setTab('login');
            }
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page" style={{
            background: 'linear-gradient(135deg, #062c20 0%, #02140e 100%)',
            backgroundImage: `radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.1) 0%, transparent 50%), 
                             radial-gradient(circle at 80% 70%, rgba(249, 183, 43, 0.05) 0%, transparent 50%)`
        }}>
            <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.1,
                pointerEvents: 'none',
                background: 'radial-gradient(circle at 2px 2px, #f9b72b 1px, transparent 0)',
                backgroundSize: '40px 40px'
            }}></div>

            <div style={{
                position: 'absolute',
                top: 40,
                right: 50,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                zIndex: 10
            }}>
                <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 0.8, perspective: '1000px' }}>
                    <span style={{ color: '#fff', letterSpacing: -2, textShadow: '0 0 30px rgba(255,255,255,0.2)' }}>Alp</span>
                    <span style={{
                        display: 'block',
                        background: 'linear-gradient(to right, #f9b72b, #fff8e1)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: 24,
                        fontWeight: 300,
                        letterSpacing: 8,
                        marginTop: 5,
                        textAlign: 'right',
                        textTransform: 'uppercase'
                    }}>Tech</span>
                </div>
                <div style={{ width: 60, height: 2, background: '#f9b72b', marginTop: 12, boxShadow: '0 0 10px rgba(249, 183, 43, 0.5)' }}></div>
            </div>

            <div className="auth-card animate-slide">
                <div className="auth-logo">
                    <div className="logo-big">🕌</div>
                    <h1>Hadis Akademi</h1>
                    <p>Hadis Eğitim Platformu</p>
                </div>

                {!showTeacherRegister && !showManagerRegister ? (
                    <>
                        <div className="auth-tabs">
                            <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>Giriş Yap</button>
                            <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>Öğrenci Kayıt</button>
                        </div>

                        {error && <div className="error-msg">⚠️ {error}</div>}
                        {success && <div className="success-msg">✅ {success}</div>}

                        <form onSubmit={submit}>
                            {tab === 'register' && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Ad Soyad</label>
                                        <input className="form-input" name="name" placeholder="Adınızı ve soyadınızı girin" value={form.name} onChange={handle} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Okul</label>
                                        <select className="form-input" name="school" value={form.school} onChange={handle} required>
                                            <option value="">Okul Seçin</option>
                                            {schools.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Sınıf</label>
                                        <select className="form-input" name="classroom" value={form.classroom} onChange={handle} required disabled={!form.school}>
                                            <option value="">{form.school ? 'Sınıf Seçin' : 'Önce Okul Seçin'}</option>
                                            {classrooms.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Okul Numarası</label>
                                        <input className="form-input" name="schoolNumber" placeholder="Okul numaranızı girin" value={form.schoolNumber} onChange={handle} required />
                                    </div>
                                </>
                            )}
                            <div className="form-group">
                                <label className="form-label">E-posta</label>
                                <input className="form-input" name="email" type="email" placeholder="ornek@email.com" value={form.email} onChange={handle} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Şifre</label>
                                <input className="form-input" name="password" type="password" placeholder="En az 6 karakter" value={form.password} onChange={handle} required />
                                {tab === 'login' && (
                                    <div style={{ textAlign: 'right', marginTop: 4 }}>
                                        <Link to="/forgot-password" style={{ color: 'var(--gold)', fontSize: 12, textDecoration: 'none' }}>Şifremi Unuttum?</Link>
                                    </div>
                                )}
                            </div>
                            {tab === 'login' && (
                                <div className="form-group">
                                    <label className="form-checkbox">
                                        <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                                        Beni Hatırla
                                    </label>
                                </div>
                            )}
                            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 4 }}>
                                {loading ? '⏳ Bekleyin...' : tab === 'login' ? '🚀 Giriş Yap' : '✨ Kayıt Ol'}
                            </button>
                        </form>
                    </>
                ) : showManagerRegister ? (
                    <>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>🏫 İdareci Kayıt</h3>
                        <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 20 }}>Müdür veya Müdür Yrd. hesabınız admin onayından sonra aktif olacaktır.</p>
                        {error && <div className="error-msg">⚠️ {error}</div>}
                        <form onSubmit={submitManager}>
                            <div className="form-group">
                                <label className="form-label">Rolünüz</label>
                                <select className="form-input" name="role" value={form.role} onChange={handle} required>
                                    <option value="">Rol Seçin</option>
                                    <option value="principal">Müdür</option>
                                    <option value="assistant_principal">Müdür Yardımcısı</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Ad Soyad</label>
                                <input className="form-input" name="name" placeholder="Adınızı ve soyadınızı girin" value={form.name} onChange={handle} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">E-posta</label>
                                <input className="form-input" name="email" type="email" placeholder="ornek@email.com" value={form.email} onChange={handle} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Şifre</label>
                                <input className="form-input" name="password" type="password" placeholder="En az 6 karakter" value={form.password} onChange={handle} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Telefon</label>
                                <input className="form-input" name="phone" placeholder="0555 555 5555" value={form.phone} onChange={handle} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Okul</label>
                                <select className="form-input" name="school" value={form.school} onChange={handle} required>
                                    <option value="">Okul Seçin</option>
                                    {schools.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                                {loading ? '⏳ Bekleyin...' : '✨ İdareci Olarak Kayıt Ol'}
                            </button>
                            <button type="button" className="btn btn-outline btn-full" style={{ marginTop: 10 }}
                                onClick={() => { setShowManagerRegister(false); setError(''); }}>
                                ← Geri Dön
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>👨‍🏫 Öğretmen Kayıt</h3>
                        <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 20 }}>Hesabınız admin onayından sonra aktif olacaktır.</p>
                        {error && <div className="error-msg">⚠️ {error}</div>}
                        <form onSubmit={submitTeacher}>
                            <div className="form-group">
                                <label className="form-label">Ad Soyad</label>
                                <input className="form-input" name="name" placeholder="Adınızı ve soyadınızı girin" value={form.name} onChange={handle} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">E-posta</label>
                                <input className="form-input" name="email" type="email" placeholder="ornek@email.com" value={form.email} onChange={handle} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Şifre</label>
                                <input className="form-input" name="password" type="password" placeholder="En az 6 karakter" value={form.password} onChange={handle} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Telefon</label>
                                <input className="form-input" name="phone" placeholder="0555 555 5555" value={form.phone} onChange={handle} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Okul</label>
                                <select className="form-input" name="school" value={form.school} onChange={handle} required>
                                    <option value="">Okul Seçin</option>
                                    {schools.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                                {loading ? '⏳ Bekleyin...' : '✨ Öğretmen Olarak Kayıt Ol'}
                            </button>
                            <button type="button" className="btn btn-outline btn-full" style={{ marginTop: 10 }}
                                onClick={() => { setShowTeacherRegister(false); setError(''); }}>
                                ← Geri Dön
                            </button>
                        </form>
                    </>
                )}
            </div>

            <div style={{ position: 'fixed', bottom: 30, right: 30, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
                {!showTeacherRegister && !showManagerRegister && (
                    <>
                        <button className="teacher-register-link" style={{ position: 'static' }} onClick={() => { setShowManagerRegister(true); setTab(''); setError(''); setSuccess(''); }}>
                            🏫 İdareci misiniz?
                        </button>
                        <button className="teacher-register-link" style={{ position: 'static' }} onClick={() => { setShowTeacherRegister(true); setTab(''); setError(''); setSuccess(''); }}>
                            👨‍🏫 Öğretmen misiniz?
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
