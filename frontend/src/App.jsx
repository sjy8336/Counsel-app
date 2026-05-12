import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { isTokenExpired } from './utils/jwt';

import Home from './pages/home';
import AdminCounselor from './pages/AdminCounselor';
import LoginPage from './pages/Login';
import SignUp from './pages/SignUp';
import MyPage from './pages/mypage';
import Diary from './pages/Diary';
import HealingRounge from './pages/HealingRounge';
import FindPwPage from './pages/FindPw';
import ReservationPage from './pages/Reservation';
import CounselorListPage from './pages/CounselorList';
import CounselorDetailPage from './pages/CounselorDetail';
import CounselorMyPage from './pages/CounselorMyPage';
import CounselorUpload from './pages/CounselorUpload';
import Schedule from './pages/Schedule';
import CounselorPlanner from './pages/CounselorPlanner';
import CounselorHome from './pages/CounselorHome';
import CounselorClient from './pages/CounselorClient';
import AIDiary from './pages/AIdiary';
import Survey from './pages/Survey';
import Payment from './pages/Payment';
import Success from './pages/Success';
import Fail from './pages/Fail';
import CounselorMessages from './pages/CounselorMessages';
import ContactCoach from './pages/ContactCoach';

// ✅ 관리자 전용 보호 라우트 (App.jsx 내부에 인라인 선언)
const ProtectedAdminRoute = ({ children }) => {
    const token = localStorage.getItem('access_token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!token || isTokenExpired(token) || user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }
    return children;
};

function App() {
    const location = useLocation();
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // ✅ 페이지 이동 시 항상 최상단으로 스크롤
    useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTo(0, 0);
    document.body.scrollTo(0, 0);
}, [location.pathname]);

    useEffect(() => {
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');
        if (user && token && !isTokenExpired(token)) {
            const userObj = JSON.parse(user);
            setUserName(userObj.full_name || userObj.username || '');
            setIsLoggedIn(true);
        } else {
            setUserName('');
            setIsLoggedIn(false);
        }
    }, [location.pathname, localStorage.getItem('user')]);

    useEffect(() => {
        const isAuthPage = ['/login', '/signup', '/find-password'].includes(location.pathname);
        if (isAuthPage) return;
        if (location.pathname === '/') return;

        const token = localStorage.getItem('access_token');

        if (!token || isTokenExpired(token)) {
            console.warn('인증 만료 또는 토큰 없음 -> 로그인 이동');
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            localStorage.removeItem('login_time');

            if (location.pathname !== '/login') {
                navigate('/login', { replace: true });
            }
        }
    }, [location.pathname]);

    const nickname = useMemo(() => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            return user?.full_name || user?.username || '';
        } catch (e) {
            return '';
        }
    }, []);

    return (
        <Routes>
            <Route path="/contact-coach" element={<ContactCoach />} />
            <Route
                path="/"
                element={
                    <Home
                        userName={userName}
                        setUserName={setUserName}
                        isLoggedIn={isLoggedIn}
                        setIsLoggedIn={setIsLoggedIn}
                    />
                }
            />
            <Route path="/login" element={<LoginPage setUserName={setUserName} setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/find-password" element={<FindPwPage />} />
            <Route
                path="/reserve"
                element={
                    <ReservationPage
                        userName={userName}
                        setUserName={setUserName}
                        isLoggedIn={isLoggedIn}
                        setIsLoggedIn={setIsLoggedIn}
                    />
                }
            />
            <Route
                path="/counselors"
                element={
                    <CounselorListPage
                        userName={userName}
                        setUserName={setUserName}
                        isLoggedIn={isLoggedIn}
                        setIsLoggedIn={setIsLoggedIn}
                    />
                }
            />
            <Route
                path="/counselor/:id"
                element={
                    <CounselorDetailPage
                        userName={userName}
                        setUserName={setUserName}
                        isLoggedIn={isLoggedIn}
                        setIsLoggedIn={setIsLoggedIn}
                    />
                }
            />
            <Route path="/CounselorMyPage" element={<CounselorMyPage />} />
            <Route path="/counselorUpload" element={<CounselorUpload />} />
            <Route
                path="/diary"
                element={
                    <Diary
                        userName={userName}
                        setUserName={setUserName}
                        isLoggedIn={isLoggedIn}
                        setIsLoggedIn={setIsLoggedIn}
                    />
                }
            />
            <Route
                path="/healing"
                element={
                    <HealingRounge
                        userName={userName}
                        setUserName={setUserName}
                        isLoggedIn={isLoggedIn}
                        setIsLoggedIn={setIsLoggedIn}
                    />
                }
            />
            <Route path="/schedule" element={<Schedule />} />
            <Route
                path="/CounselorPlanner"
                element={
                    <CounselorPlanner
                        userName={userName}
                        setUserName={setUserName}
                        isLoggedIn={isLoggedIn}
                        setIsLoggedIn={setIsLoggedIn}
                    />
                }
            />
            <Route
                path="/CounselorClient"
                element={
                    <CounselorClient
                        userName={userName}
                        setUserName={setUserName}
                        isLoggedIn={isLoggedIn}
                        setIsLoggedIn={setIsLoggedIn}
                    />
                }
            />
            <Route path="/counselorhome" element={<CounselorHome />} />
            <Route
                path="/AIdiary"
                element={
                    <AIDiary
                        userName={userName}
                        setUserName={setUserName}
                        isLoggedIn={isLoggedIn}
                        setIsLoggedIn={setIsLoggedIn}
                    />
                }
            />
            <Route path="/survey" element={<Survey />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment/success" element={<Success />} />
            <Route path="/payment/fail" element={<Fail />} />
            <Route
                path="/CounselorMessages"
                element={
                    <CounselorMessages
                        userName={userName}
                        setUserName={setUserName}
                        isLoggedIn={isLoggedIn}
                        setIsLoggedIn={setIsLoggedIn}
                    />
                }
            />



            {/* ✅ 관리자 라우트 - role: 'admin' 계정만 접근 가능 */}
            <Route
                path="/admin"
                element={
                    <ProtectedAdminRoute>
                        <AdminCounselor />
                    </ProtectedAdminRoute>
                }
            />
        </Routes>
    );
}

export default App;