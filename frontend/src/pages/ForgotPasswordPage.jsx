
00import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const res = await api.post('/auth/forgotpassword', { email });
            setMessage(res.data.message);
        } catch (err) {
            setError(err.response?.data?.error || 'Bir hata oluştu');
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
            <div className="auth-card animate-slide">
                <div className="auth-logo">
                    <div className="logo-big">🔑</div>
                    <h1>Şifremi Unuttum</h1>
                    <p>Sıfırlama bağlantısı almak için e-postanızı girin</p>
                </div>

                {message && <div className="success-msg">✅ {message}</div>}
                {error && <div className="error-msg">⚠️ {error}</div>}

                {!message && (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">E-posta Adresi</label>
                            <input
                                className="form-input"
                                type="email"
                                placeholder="ornek@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                            {loading ? '⏳ Gönderiliyor...' : '📧 Sıfırlama Bağlantısı Gönder'}
                        </button>
                    </form>
                )}

                <div style={{ marginTop: 20, textAlign: 'center' }}>
                    <Link to="/login" className="link" style={{ color: 'var(--gold)', fontSize: 14 }}>
                        ← Giriş Sayfasına Dön
                    </Link>
                </div>
            </div>
        </div>
    );
}
