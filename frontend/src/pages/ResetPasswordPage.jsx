import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Şifreler eşleşmiyor');
        }
        if (password.length < 6) {
            return setError('Şifre en az 6 karakter olmalıdır');
        }

        setLoading(true);
        setError('');
        try {
            const res = await api.put(`/auth/resetpassword/${token}`, { password });
            setMessage(res.data.message);
            setTimeout(() => navigate('/login'), 3000);
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
                    <div className="logo-big">🔐</div>
                    <h1>Yeni Şifre Oluştur</h1>
                    <p>Lütfen yeni şifrenizi belirleyin</p>
                </div>

                {message && <div className="success-msg">✅ {message}</div>}
                {error && <div className="error-msg">⚠️ {error}</div>}

                {!message && (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Yeni Şifre</label>
                            <input
                                className="form-input"
                                type="password"
                                placeholder="En az 6 karakter"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Şifre Onayı</label>
                            <input
                                className="form-input"
                                type="password"
                                placeholder="Şifreyi tekrar girin"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                            {loading ? '⏳ Güncelleniyor...' : '💾 Şifreyi Güncelle'}
                        </button>
                    </form>
                )}

                {!message && (
                    <div style={{ marginTop: 20, textAlign: 'center' }}>
                        <Link to="/login" className="link" style={{ color: 'var(--gold)', fontSize: 14 }}>
                            ← İptal ve Geri Dön
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
