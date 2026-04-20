import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LoginPage from './pages/Login';
import SignUp from './pages/SignUp';
import MyPage from './pages/MyPage'
import FindPwPage from './pages/FindPw';
import ReservationPage from './pages/Reservation';

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
            </Routes>
        </BrowserRouter>
    );
}

export default App;
