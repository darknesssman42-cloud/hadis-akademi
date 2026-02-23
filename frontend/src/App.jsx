import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import HadithListPage from './pages/HadithListPage';
import QuizPage from './pages/QuizPage';
import BadgesPage from './pages/BadgesPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProgressPage from './pages/ProgressPage';
import TeacherPage from './pages/TeacherPage';

function PrivateRoute({ children, teacherOnly = false }) {
    const { user, loading } = useAuth();
    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#6c63ff', fontSize: 24 }}>⏳ Yükleniyor...</div>;
    if (!user) return <Navigate to="/login" />;
    if (teacherOnly && user.role !== 'teacher') return <Navigate to="/" />;
    return children;
}

function AppLayout({ children }) {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content animate-fade">
                {children}
            </main>
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<PrivateRoute><AppLayout><HomePage /></AppLayout></PrivateRoute>} />
                    <Route path="/hadiths" element={<PrivateRoute><AppLayout><HadithListPage /></AppLayout></PrivateRoute>} />
                    <Route path="/quiz/:hadithId" element={<PrivateRoute><AppLayout><QuizPage /></AppLayout></PrivateRoute>} />
                    <Route path="/badges" element={<PrivateRoute><AppLayout><BadgesPage /></AppLayout></PrivateRoute>} />
                    <Route path="/leaderboard" element={<PrivateRoute><AppLayout><LeaderboardPage /></AppLayout></PrivateRoute>} />
                    <Route path="/progress" element={<PrivateRoute><AppLayout><ProgressPage /></AppLayout></PrivateRoute>} />
                    <Route path="/teacher" element={<PrivateRoute teacherOnly><AppLayout><TeacherPage /></AppLayout></PrivateRoute>} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
