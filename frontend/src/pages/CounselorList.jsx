import React, { useState, useEffect } from 'react';
import { toggleFavorite, getFavorites } from '../api/favorite';
import { useNavigate } from 'react-router-dom';
import { Search, User, Heart } from 'lucide-react';
import Header from '../components/header';
import Footer from '../components/footer';
import '../static/Counselor.css';

export default function CounselorListPage({ userName, setUserName, isLoggedIn, setIsLoggedIn, onFavoriteChange }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [liked, setLiked] = useState({}); // { [id]: true/false }
    const [toast, setToast] = useState(null);
    const [dbCounselors, setDbCounselors] = useState([]);
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
                const initialLikes = {};
                if (favList && Array.isArray(favList.favorites)) {
                    favList.favorites.forEach((fav) => {
                        const cId = Number(fav.counselor_id);
                        if (cId) {
                            initialLikes[cId] = true;
                        }
                    });
                }
                setLiked(initialLikes);
            } catch (err) {
                console.error('찜 목록 로드 실패:', err);
                // 401 에러(세션만료) 시 처리
                if (err.response?.status === 401) {
                    localStorage.removeItem('access_token');
                    alert('로그인 세션이 만료되었습니다. 다시 로그인 해주세요.');
                    navigate('/login');
                }
            }
        };
        fetchLikes();
    }, []); // 빈 배열: 컴포넌트 마운트 시 1회 실행

    useEffect(() => {
        const fetchDbCounselors = async () => {
            try {
                const res = await fetch('/api/counselors/approved');
                if (!res.ok) throw new Error('상담사 목록 조회 실패');
                const data = await res.json();
                // created_at 기준 내림차순 정렬
                const sorted = data.slice().sort((a, b) => {
                    const aTime = a.profile?.created_at ? new Date(a.profile.created_at).getTime() : 0;
                    const bTime = b.profile?.created_at ? new Date(b.profile.created_at).getTime() : 0;
                    return bTime - aTime;
                });
                setDbCounselors(
                    sorted.map((item) => ({
                        id: item.user?.id,
                        name: item.user?.full_name,
                        category:
                            item.specialties && item.specialties[0]?.specialty_name
                                ? item.specialties[0].specialty_name
                                : '',
                        field: item.specialties ? item.specialties.map((s) => s.specialty_name).join(', ') : '',
                        price: item.profile?.consultation_price
                            ? `${item.profile.consultation_price.toLocaleString()}원`
                            : '',
                        intro: item.profile?.intro_line,
                        profile_img_url: item.profile?.profile_img_url,
                    }))
                );
            } catch (err) {
                alert('상담사 목록을 불러오지 못했습니다.');
                setDbCounselors([]);
            }
        };
        fetchDbCounselors();
    }, []);

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

    const allCounselors = [...dbCounselors, ...counselorData];

    const filteredCounselors = allCounselors.filter((c) => {
        const matchesSearch = (c.name && c.name.includes(searchTerm)) || (c.field && c.field.includes(searchTerm));
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
                                key={counselor.id + (counselor.profile_img_url ? '-db' : '-dummy')}
                                className="cld-counselor-card"
                                onClick={() =>
                                    navigate(`/counselor/${counselor.id}`, {
                                        state: {
                                            isLiked: !!liked[counselor.id],
                                            counselor: {
                                                ...counselor,
                                                // DB에서 온 상담사라면 상세 정보도 함께 넘김
                                                ...(dbCounselors.find((c) => c.id === counselor.id) || {}),
                                            },
                                        },
                                    })
                                }
                            >
                                <div className="cld-card-top">
                                    <div className="cld-profile-placeholder">
                                        {counselor.profile_img_url ? (
                                            <img
                                                src={counselor.profile_img_url}
                                                alt="프로필"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    borderRadius: '16px',
                                                    display: 'block',
                                                }}
                                            />
                                        ) : (
                                            <User size={32} />
                                        )}
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
