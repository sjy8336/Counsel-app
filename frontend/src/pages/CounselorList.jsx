import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
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
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(20); // 한 번에 보여줄 상담사 수
    const [totalCount, setTotalCount] = useState(0); // 전체 상담사 수
    const [pageOffset, setPageOffset] = useState(0); // 현재 불러온 offset
    const loaderRef = useRef(null);
    const navigate = useNavigate();

    // 토스트 표시 함수
    const showToast = (msg) => setToast(msg);
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 2500);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // 검색어/카테고리 변경 시 서버에 조건에 맞는 상담사 리스트를 offset=0부터 새로 요청
    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            try {
                // 쿼리 파라미터 구성
                const params = new URLSearchParams();
                params.append('offset', 0);
                params.append('limit', 20);
                if (searchTerm) params.append('search', searchTerm);
                if (selectedCategory && selectedCategory !== '전체') params.append('category', selectedCategory);
                const [counselorRes, favList] = await Promise.all([
                    fetch(`/api/counselors/approved?${params.toString()}`),
                    token ? getFavorites(token) : Promise.resolve({ favorites: [] }),
                ]);
                if (!counselorRes.ok) throw new Error('상담사 목록 조회 실패');
                const data = await counselorRes.json();
                setTotalCount(data.total || 0);
                setPageOffset(data.counselors.length);
                setDbCounselors(
                    data.counselors.map((item) => ({
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
                // 찜 상태 세팅
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
                alert('상담사 목록을 불러오지 못했습니다.');
                setDbCounselors([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [searchTerm, selectedCategory]);

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

    // filter/sort/map 연산 useMemo로 최적화
    const filteredCounselors = useMemo(() => {
        return dbCounselors.filter((c) => {
            const matchesSearch = (c.name && c.name.includes(searchTerm)) || (c.field && c.field.includes(searchTerm));
            const matchesCategory = selectedCategory === '전체' || c.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [dbCounselors, searchTerm, selectedCategory]);

    // 무한스크롤: 하단 도달 시 추가 데이터 페이징 요청 (검색/카테고리 조건 반영)
    const handleObserver = useCallback(
        (entries) => {
            const target = entries[0];
            if (target.isIntersecting && !loading && dbCounselors.length < totalCount) {
                // 다음 페이지 요청
                const fetchNext = async () => {
                    setLoading(true);
                    try {
                        const params = new URLSearchParams();
                        params.append('offset', pageOffset);
                        params.append('limit', 20);
                        if (searchTerm) params.append('search', searchTerm);
                        if (selectedCategory && selectedCategory !== '전체')
                            params.append('category', selectedCategory);
                        const res = await fetch(`/api/counselors/approved?${params.toString()}`);
                        if (!res.ok) throw new Error('상담사 추가 조회 실패');
                        const data = await res.json();
                        setDbCounselors((prev) => [
                            ...prev,
                            ...data.counselors.map((item) => ({
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
                            })),
                        ]);
                        setPageOffset((prev) => prev + data.counselors.length);
                    } catch (err) {
                        alert('상담사 추가 목록을 불러오지 못했습니다.');
                    } finally {
                        setLoading(false);
                    }
                };
                fetchNext();
            }
        },
        [loading, dbCounselors.length, totalCount, pageOffset, searchTerm, selectedCategory]
    );

    useEffect(() => {
        if (loading) return;
        const option = { root: null, rootMargin: '0px', threshold: 0.1 };
        const observer = new window.IntersectionObserver(handleObserver, option);
        if (loaderRef.current) observer.observe(loaderRef.current);
        return () => {
            if (loaderRef.current) observer.unobserve(loaderRef.current);
        };
    }, [handleObserver, loading]);

    // 검색/카테고리 변경 시 페이징 초기화 (추후 확장 가능)
    // useEffect(() => {
    //     setVisibleCount(20);
    // }, [searchTerm, selectedCategory, allCounselors.length]);

    // 스켈레톤 카드 컴포넌트
    const SkeletonCard = () => (
        <div className="cld-counselor-card skeleton">
            <div className="cld-card-top">
                <div className="cld-profile-placeholder skeleton-img" />
                <div className="cld-heart-btn skeleton-heart" />
            </div>
            <div className="cld-card-body">
                <div className="skeleton-line skeleton-category" />
                <div className="skeleton-line skeleton-name" />
                <div className="skeleton-line skeleton-field" />
                <div className="skeleton-line skeleton-intro" />
            </div>
            <div className="cld-card-footer">
                <div className="skeleton-line skeleton-price" />
                <div className="skeleton-line skeleton-btn" />
            </div>
        </div>
    );

    // 상담사 카드 컴포넌트 (React.memo 적용)
    const CounselorCard = memo(function CounselorCard({
        id,
        name,
        category,
        field,
        price,
        intro,
        profile_img_url,
        liked,
        onLike,
        onClick,
    }) {
        return (
            <div key={id} className="cld-counselor-card" onClick={onClick}>
                <div className="cld-card-top">
                    <div className="cld-profile-placeholder">
                        {profile_img_url ? (
                            <img
                                src={profile_img_url}
                                alt="프로필"
                                loading="lazy"
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
                    <button className={`cld-heart-btn${liked ? ' liked' : ''}`} onClick={onLike} aria-label="좋아요">
                        <Heart
                            size={22}
                            fill={liked ? '#e74c3c' : 'none'}
                            color={liked ? '#e74c3c' : '#bbb'}
                            strokeWidth={2.2}
                        />
                    </button>
                </div>
                <div className="cld-card-body">
                    <span className="cld-counselor-category-label">{category}</span>
                    <h3 className="cld-counselor-name">{name}</h3>
                    <span className="cld-counselor-field-tags">{field}</span>
                    <p className="cld-counselor-intro">{intro}</p>
                </div>
                <div className="cld-card-footer">
                    <span className="cld-price-info">{price} / 50분</span>
                    <button className="cld-view-detail-btn">상세보기</button>
                </div>
            </div>
        );
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
                        {loading && dbCounselors.length === 0 ? (
                            Array.from({ length: 6 }).map((_, idx) => <SkeletonCard key={idx} />)
                        ) : filteredCounselors.length === 0 ? (
                            <div className="cld-counselor-empty">
                                <div className="cld-empty-icon">
                                    <User size={32} />
                                </div>
                                <p className="cld-empty-title">
                                    {searchTerm
                                        ? `'${searchTerm}'에 해당하는 상담사가 없어요`
                                        : selectedCategory !== '전체'
                                        ? `'${selectedCategory}' 분야의 상담사가 없어요`
                                        : '등록된 상담사가 없어요'}
                                </p>
                                <p className="cld-empty-sub">검색어나 카테고리를 바꿔서 다시 찾아보세요.</p>
                            </div>
                        ) : (
                            <>
                                {filteredCounselors.map((counselor) => (
                                    <CounselorCard
                                        key={counselor.id}
                                        id={counselor.id}
                                        name={counselor.name}
                                        category={counselor.category}
                                        field={counselor.field}
                                        price={counselor.price}
                                        intro={counselor.intro}
                                        profile_img_url={counselor.profile_img_url}
                                        liked={!!liked[counselor.id]}
                                        onLike={(e) => handleLike(counselor.id, e)}
                                        onClick={() =>
                                            navigate(`/counselor/${counselor.id}`, {
                                                state: {
                                                    isLiked: !!liked[counselor.id],
                                                    counselor: {
                                                        ...counselor,
                                                        ...(dbCounselors.find((c) => c.id === counselor.id) || {}),
                                                    },
                                                },
                                            })
                                        }
                                    />
                                ))}
                                {/* 무한스크롤 로더 */}
                                {dbCounselors.length < totalCount && (
                                    <div ref={loaderRef} style={{ height: 40, background: 'none' }} />
                                )}
                            </>
                        )}
                    </main>
                </div>
                <Footer />
            </div>
        </>
    );
}
