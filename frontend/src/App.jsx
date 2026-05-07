import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
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


function App() {
    const location = useLocation();
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    useEffect(() => {
        // 로그인 상태 동기화
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
        // 1. 가드 로직: 현재 페이지가 로그인 관련 페이지라면 아무것도 하지 않음
        const isAuthPage = ['/login', '/signup', '/find-password'].includes(location.pathname);
        if (isAuthPage) return;

        // 2. 홈 화면(/)이 로그인 없이도 보는 페이지라면 통과
        if (location.pathname === '/') return;

        const token = localStorage.getItem('access_token');

        // 3. 토큰 검사 (무한 루프 방지를 위해 조건문을 깐깐하게 작성)
        if (!token || isTokenExpired(token)) {
            console.warn('인증 만료 또는 토큰 없음 -> 로그인 이동');

            // 데이터 정리
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            localStorage.removeItem('login_time');

            // 4. 현재 위치가 이미 /login이 아닐 때만 이동 (루프 확정 차단)
            if (location.pathname !== '/login') {
                navigate('/login', { replace: true });
            }
        }
    }, [location.pathname]); // navigate를 의존성에서 빼서 불필요한 재실행 방지

    // 닉네임 로직 (useMemo로 최적화해서 렌더링 부하 줄임)
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
            <Route path="/admin" element={<AdminCounselor />} />
        </Routes>
    );
}

export default App;
