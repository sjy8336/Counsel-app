import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import LoginPage from './pages/Login';
import SignUp from './pages/SignUp';
import MyPage from './pages/MyPage';
import Diary from './pages/Diary';
import HealingRounge from './pages/HealingRounge';
import FindPwPage from './pages/FindPw';
import ReservationPage from './pages/Reservation';
import CounselorListPage from './pages/CounselorList';
import CounselorDetailPage from './pages/CounselorDetail';
import CounselorMyPage from './pages/CounselorMyPage';
import Schedule from './pages/Schedule';
import CounselorPlanner from './pages/CounselorPlanner';
import CounselorHome from './pages/CounselorHome';
import CounselorClient from './pages/CounselorClient';
import AIDiary from './pages/AIdiary';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/mypage" element={<MyPage />} />
                <Route path="/find-password" element={<FindPwPage />} />
                <Route path="/reserve" element={<ReservationPage />} />
                <Route path="/counselors" element={<CounselorListPage />} />
                <Route path="/counselor/:id" element={<CounselorDetailPage />} />
                <Route path="/CounselorMyPage" element={<CounselorMyPage />} />
                <Route path="/diary" element={<Diary />} />
                <Route path="/healing" element={<HealingRounge />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/CounselorPlanner" element={<CounselorPlanner />} />
                <Route path="/CounselorClient" element={<CounselorClient />} />
                <Route path="/counselorhome" element={<CounselorHome />} />
                <Route path="/AIdiary" element={<AIDiary />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
