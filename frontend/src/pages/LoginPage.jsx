import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [tab, setTab] = useState('login');
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', class: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            if (tab === 'login') {
                await login(form.email, form.password);
            } else {
                await register(form);
            }
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card animate-slide">
                <div className="auth-logo">
                    <div className="logo-big">🕌</div>
                    <h1>Hadis Akademi</h1>
                    <p>10. Sınıf Hadis Dersi Platformu</p>
                </div>

                <div className="auth-tabs">
                    <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Giriş Yap</button>
                    <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>Kayıt Ol</button>
                </div>

                {error && <div className="error-msg">⚠️ {error}</div>}

                <form onSubmit={submit}>
                    {tab === 'register' && (
                        <>
                            <div className="form-group">
                                <label className="form-label">Ad Soyad</label>
                                <input className="form-input" name="name" placeholder="Adınızı girin" value={form.name} onChange={handle} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Rol</label>
                                <select className="form-select" name="role" value={form.role} onChange={handle}>
                                    <option value="student">🎓 Öğrenci</option>
                                    <option value="teacher">👨‍🏫 Öğretmen</option>
                                </select>
                            </div>
                            {form.role === 'student' && (
                                <div className="form-group">
                                    <label className="form-label">Sınıf</label>
                                    <input className="form-input" name="class" placeholder="Örn: 10-A" value={form.class} onChange={handle} />
                                </div>
                            )}
                        </>
                    )}
                    <div className="form-group">
                        <label className="form-label">E-posta</label>
                        <input className="form-input" name="email" type="email" placeholder="ornek@email.com" value={form.email} onChange={handle} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Şifre</label>
                        <input className="form-input" name="password" type="password" placeholder="••••••" value={form.password} onChange={handle} required />
                    </div>
                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                        {loading ? '⏳ Bekleyin...' : tab === 'login' ? '🚀 Giriş Yap' : '✨ Kayıt Ol'}
                    </button>
                </form>

                <div style={{ marginTop: 20, padding: 14, background: 'var(--bg)', borderRadius: 10, fontSize: 12, color: 'var(--text-dim)' }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>🎯 Demo Hesaplar:</div>
                    <div>👨‍🏫 ogretmen@demo.com / 123456</div>
                    <div>🎓 ogrenci@demo.com / 123456</div>
                </div>
            </div>
        </div>
    );
}
