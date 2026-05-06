import React, { useState, useEffect } from 'react';
import { toggleFavorite, getFavorites } from '../api/favorite';
import { useNavigate } from 'react-router-dom';
import { Search, User, Heart } from 'lucide-react';
import Header from '../components/header';
import Footer from '../components/footer';
import '../static/Counselor.css';

const counselorData = [
    {
        id: 1,
        name: '이은지 상담사',
        category: '개인 심리',
        field: '우울, 불안, 공황',
        price: '60,000원',
        intro: '감정 일기 분석을 통해 당신의 마음을 함께 들여다봅니다.',
    },
    {
        id: 2,
        name: '김태현 상담사',
        category: '직장',
        field: '스트레스, 번아웃',
        price: '60,000원',
        intro: '직장 내 대인관계와 커리어 고민에 솔루션을 드립니다.',
    },
    {
        id: 3,
        name: '박소담 상담사',
        category: '진로',
        field: '취업불안, 진로고민',
        price: '60,000원',
        intro: '나를 사랑하는 법, 작은 기록부터 시작해봐요.',
    },
    {
        id: 4,
        name: '정다은 상담사',
        category: '개인 심리',
        field: '자존감, 강박',
        price: '60,000원',
        intro: '막막한 미래, 당신의 강점을 찾는 솔루션을 제공합니다.',
    },
    {
        id: 5,
        name: '한지우 상담사',
        category: '직장',
        field: '소통, 대인관계',
        price: '60,000원',
        intro: '오늘의 감정이 내일의 평온이 되도록 돕겠습니다.',
    },
    {
        id: 6,
        name: '최민준 상담사',
        category: '진로',
        field: '진로고민, 번아웃',
        price: '60,000원',
        intro: '지친 마음을 회복하고 다시 나아갈 힘을 드립니다.',
    },
];

export default function CounselorListPage({ userName, setUserName, isLoggedIn, setIsLoggedIn, onFavoriteChange }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [liked, setLiked] = useState({}); // { [id]: true/false }
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();

    // 토스트 표시 함수
    const showToast = (msg) => setToast(msg);
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 2500);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    useEffect(() => {
        const fetchLikes = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            try {
                const favList = await getFavorites(token);
                console.log('1. 서버 응답 데이터 확인:', favList);

                const initialLikes = {};
                if (favList && Array.isArray(favList.favorites)) {
                    favList.favorites.forEach((fav) => {
                        const cId = Number(fav.counselor_id);
                        if (cId) {
                            initialLikes[cId] = true;
                        }
                    });
                }

                console.log('2. 변환된 liked 객체:', initialLikes);
                setLiked(initialLikes);
            } catch (err) {
                console.error('찜 목록 로드 실패:', err);
                // 401 에러(세션만료) 시 처리
                if (err.response?.status === 401) {
                    localStorage.removeItem('access_token');
                    // navigate('/login'); // 필요시 활성화
                }
            }
        };
        fetchLikes();
    }, []); // 빈 배열: 컴포넌트 마운트 시 1회 실행

    const handleLike = async (id, e) => {
        e.stopPropagation();
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');
        if (!user || !token) {
            alert('로그인 후 이용 가능한 기능입니다.');
            navigate('/login');
            return;
        }
        try {
            const res = await toggleFavorite(id, token);
            setLiked((prev) => ({ ...prev, [id]: res.is_favorite }));
            if (typeof onFavoriteChange === 'function') {
                onFavoriteChange(id, res.is_favorite);
            }
            showToast(res.is_favorite ? '찜이 추가되었습니다.' : '찜이 취소되었습니다.');
        } catch (err) {
            // 401 에러가 난다면 콘솔에 찍어서 확인해봅시다.
            console.error('찜 에러 상세:', err.response);
            alert('찜 처리 중 오류가 발생했습니다.');
        }
    };

    const filteredCounselors = counselorData.filter((c) => {
        const matchesSearch = c.name.includes(searchTerm) || c.field.includes(searchTerm);
        const matchesCategory = selectedCategory === '전체' || c.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <>
            {toast && <div className="cld-mp-toast">{toast}</div>}
            <div className="cld-full-page-wrapper">
                <Header
                    activeTab="search"
                    setActiveTab={() => {}}
                    userName={userName}
                    setUserName={setUserName}
                    isLoggedIn={isLoggedIn}
                    setIsLoggedIn={setIsLoggedIn}
                />
                <div className="cld-counselor-list-container wide">
                    <header className="cld-clist-search-header">
                        <h2 className="cld-clist-search-title">전문가 찾기</h2>
                        <div className="cld-clist-search-bar-wrapper">
                            <Search className="cld-clist-search-icon" size={20} />
                            <input
                                type="text"
                                className="cld-clist-search-input"
                                placeholder="이름 혹은 고민 중인 분야를 입력하세요"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="cld-category-tabs">
                            {['전체', '개인 심리', '직장', '진로'].map((cat) => (
                                <button
                                    key={cat}
                                    className={`cld-category-btn ${selectedCategory === cat ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </header>

                    <main className="cld-counselor-grid cld-pc-full">
                        {filteredCounselors.map((counselor) => (
                            <div
                                key={counselor.id}
                                className="cld-counselor-card"
                                onClick={() =>
                                    navigate(`/counselor/${counselor.id}`, {
                                        state: { isLiked: !!liked[counselor.id] },
                                    })
                                }
                            >
                                <div className="cld-card-top">
                                    <div className="cld-profile-placeholder">
                                        <User size={32} />
                                    </div>
                                    <button
                                        className={`cld-heart-btn${liked[counselor.id] ? ' liked' : ''}`}
                                        onClick={(e) => handleLike(counselor.id, e)}
                                        aria-label="좋아요"
                                    >
                                        <Heart
                                            size={22}
                                            fill={liked[counselor.id] ? '#e74c3c' : 'none'}
                                            color={liked[counselor.id] ? '#e74c3c' : '#bbb'}
                                            strokeWidth={2.2}
                                        />
                                    </button>
                                </div>
                                <div className="cld-card-body">
                                    <span className="cld-counselor-category-label">{counselor.category}</span>
                                    <h3 className="cld-counselor-name">{counselor.name}</h3>
                                    <span className="cld-counselor-field-tags">{counselor.field}</span>
                                    <p className="cld-counselor-intro">{counselor.intro}</p>
                                </div>
                                <div className="cld-card-footer">
                                    <span className="cld-price-info">{counselor.price} / 50분</span>
                                    <button className="cld-view-detail-btn">상세보기</button>
                                </div>
                            </div>
                        ))}
                    </main>
                </div>
                <Footer />
            </div>
        </>
    );
}
