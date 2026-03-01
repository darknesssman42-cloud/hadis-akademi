import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            // Ensure axios has the token
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            api.get('/auth/me')
                .then(res => setUser(res.data))
                .catch(() => {
                    localStorage.removeItem('token');
                    sessionStorage.removeItem('token');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password, rememberMe = false) => {
        const res = await api.post('/auth/login', { email, password, rememberMe });
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', res.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        setUser(res.data.user);
        return res.data.user;
    };

    const registerStudent = async (data) => {
        const res = await api.post('/auth/register/student', data);
        localStorage.setItem('token', res.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        setUser(res.data.user);
        return res.data;
    };

    const registerTeacher = async (data) => {
        const res = await api.post('/auth/register/teacher', data);
        return res.data; // { message, pending: true }
    };

    const registerManager = async (data) => {
        const res = await api.post('/auth/register/manager', data);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const updateUser = (updates) => setUser(prev => prev ? { ...prev, ...updates } : null);

    const refreshUser = async () => {
        try {
            const res = await api.get('/auth/me');
            setUser(res.data);
        } catch { /* ignore */ }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, registerStudent, registerTeacher, registerManager, logout, updateUser, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
