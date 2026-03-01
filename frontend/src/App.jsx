import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import HadithListPage from './pages/HadithListPage';
import MemorizedPage from './pages/MemorizedPage';
import QuizPage from './pages/QuizPage';
import BadgesPage from './pages/BadgesPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProgressPage from './pages/ProgressPage';
import TeacherPage from './pages/TeacherPage';
import AdminPage from './pages/AdminPage';
import SchoolMemorizePage from './pages/SchoolMemorizePage';
import MyClassPage from './pages/MyClassPage';
import MyClassesPage from './pages/MyClassesPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ManagerPage from './pages/ManagerPage';

function PrivateRoute({ children, roles }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="loading-spinner">⏳</div>;
    if (!user) return <Navigate to="/login" />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
    return children;
}

function AppLayout({ children }) {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content animate-fade">
                <div className="main-content-inner">
                    {children}
                </div>
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
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                    <Route path="/" element={<PrivateRoute><AppLayout><HomePage /></AppLayout></PrivateRoute>} />
                    <Route path="/hadiths" element={<PrivateRoute><AppLayout><HadithListPage /></AppLayout></PrivateRoute>} />
                    <Route path="/memorized" element={<PrivateRoute><AppLayout><MemorizedPage /></AppLayout></PrivateRoute>} />
                    <Route path="/quiz" element={<PrivateRoute><AppLayout><QuizPage /></AppLayout></PrivateRoute>} />
                    <Route path="/quiz/:hadithId" element={<PrivateRoute><AppLayout><QuizPage /></AppLayout></PrivateRoute>} />
                    <Route path="/badges" element={<PrivateRoute><AppLayout><BadgesPage /></AppLayout></PrivateRoute>} />
                    <Route path="/leaderboard" element={<PrivateRoute><AppLayout><LeaderboardPage /></AppLayout></PrivateRoute>} />
                    <Route path="/school-program" element={<PrivateRoute><AppLayout><SchoolMemorizePage /></AppLayout></PrivateRoute>} />
                    <Route path="/progress" element={<PrivateRoute><AppLayout><ProgressPage /></AppLayout></PrivateRoute>} />
                    <Route path="/my-class" element={<PrivateRoute roles={['student']}><AppLayout><MyClassPage /></AppLayout></PrivateRoute>} />
                    <Route path="/my-classes" element={<PrivateRoute roles={['teacher', 'admin']}><AppLayout><MyClassesPage /></AppLayout></PrivateRoute>} />
                    <Route path="/teacher" element={<PrivateRoute roles={['teacher', 'admin']}><AppLayout><TeacherPage /></AppLayout></PrivateRoute>} />
                    <Route path="/manager" element={<PrivateRoute roles={['principal', 'assistant_principal', 'admin']}><AppLayout><ManagerPage /></AppLayout></PrivateRoute>} />
                    <Route path="/admin" element={<PrivateRoute roles={['admin']}><AppLayout><AdminPage /></AppLayout></PrivateRoute>} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
