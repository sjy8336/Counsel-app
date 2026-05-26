import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { toggleFavorite, getFavorites } from '../api/favorite';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, User, Heart, ChevronDown, Check, X } from 'lucide-react';
import Header from '../components/header';
import Footer from '../components/footer';
import MobileTap from '../components/mobileTap';
import '../static/Counselor.css';

export default function CounselorListPage({ userName, setUserName, isLoggedIn, setIsLoggedIn, onFavoriteChange }) {
    const [searchTerm, setSearchTerm] = useState('');
    
    // 복수 선택 및 커스텀 드롭다운 상태 관리
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [activeMainTab, setActiveMainTab] = useState('전체'); // 디폴트를 '전체' 탭으로 설정
    const [selectedSubCategories, setSelectedSubCategories] = useState([]); // 복수 선택된 소분류 배열

    const [liked, setLiked] = useState({}); // { [id]: true/false }
    const [toast, setToast] = useState(null);
    const [dbCounselors, setDbCounselors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0); 
    const [pageOffset, setPageOffset] = useState(0); 
    const loaderRef = useRef(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // 서비스 카테고리 원본 데이터 맵
    const categoriesData = {
        '개인심리': ['개인심리', '대인관계', '가족상담', '우울/불안', '연애/결혼', '공황/장애', '트라우마', '중독상담', '자존감향상', '성격상담'],
        '스트레스': ['스트레스', '번아웃'],
        '직업': ['취업상담', '진로상담', '학업/시험']
    };

    // '전체' 탭 선택 시 보여줄 모든 소분류 리스트 평탄화 배열 산출
    const allSubCategories = useMemo(() => {
        return Object.values(categoriesData).flat();
    }, []);

    // 현재 선택된 대분류 탭에 맞춰 우측 창에 뿌려줄 소분류 항목 배열 결정
    const currentSubList = useMemo(() => {
        if (activeMainTab === '전체') {
            return allSubCategories;
        }
        return categoriesData[activeMainTab] || [];
    }, [activeMainTab, allSubCategories]);

    // 외부 영역 클릭 시 드롭다운 닫기
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 소분류 체크박스 토글 함수
    const handleSubCategoryToggle = (sub) => {
        setSelectedSubCategories(prev => 
            prev.includes(sub) ? prev.filter(item => item !== sub) : [...prev, sub]
        );
    };

    // 필터 전체 해제
    const clearAllFilters = () => {
        setSelectedSubCategories([]);
    };

    // ?q= 검색 파라미터 연동
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get('q');
        if (q) setSearchTerm(q);
    }, [location.search]);

    // 토스트 알림
    const showToast = (msg) => setToast(msg);
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 2500);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // API 데이터 로딩 로직 (필터 조합 연동)
    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            try {
                const params = new URLSearchParams();
                params.append('offset', 0);
                params.append('limit', 20);
                params.append('summary', 'true');
                if (searchTerm) params.append('search', searchTerm);
                
                // 선택된 소분류가 존재한다면 첫 번째 인자를 기반으로 백엔드 1차 필터 패싱
                if (selectedSubCategories.length > 0) {
                    params.append('category', selectedSubCategories[0]);
                }

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
                        category: item.specialties && item.specialties[0]?.specialty_name ? item.specialties[0].specialty_name : '',
                        field: item.specialties ? item.specialties.map((s) => s.specialty_name).join(', ') : '',
                        price: item.profile?.consultation_price ? `${item.profile.consultation_price.toLocaleString()}원` : '',
                        intro: item.profile?.intro_line,
                        profile_img_url: item.profile?.profile_img_url,
                    }))
                );
                
                const initialLikes = {};
                if (favList && Array.isArray(favList.favorites)) {
                    favList.favorites.forEach((fav) => {
                        const cId = Number(fav.counselor_id);
                        if (cId) initialLikes[cId] = true;
                    });
                }
                setLiked(initialLikes);
            } catch (err) {
                setDbCounselors([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [searchTerm, selectedSubCategories]);

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
            alert('찜 처리 중 오류가 발생했습니다.');
        }
    };

    // 멀티 매칭 클라이언트 사이드 필터 가공
    const filteredCounselors = useMemo(() => {
        return dbCounselors.filter((c) => {
            const matchesSearch = (c.name && c.name.includes(searchTerm)) || (c.field && c.field.includes(searchTerm));
            
            let matchesCategory = true;
            if (selectedSubCategories.length > 0) {
                matchesCategory = selectedSubCategories.some(sub => 
                    c.category === sub || (c.field && c.field.includes(sub))
                );
            }
            return matchesSearch && matchesCategory;
        });
    }, [dbCounselors, searchTerm, selectedSubCategories]);

    // 무한 스크롤 구현
    const handleObserver = useCallback(
        (entries) => {
            const target = entries[0];
            if (target.isIntersecting && !loading && dbCounselors.length < totalCount) {
                const fetchNext = async () => {
                    setLoading(true);
                    try {
                        const params = new URLSearchParams();
                        params.append('offset', pageOffset);
                        params.append('limit', 20);
                        params.append('summary', 'true');
                        if (searchTerm) params.append('search', searchTerm);
                        if (selectedSubCategories.length > 0) params.append('category', selectedSubCategories[0]);
                        
                        const res = await fetch(`/api/counselors/approved?${params.toString()}`);
                        if (!res.ok) throw new Error('상담사 추가 조회 실패');
                        const data = await res.json();
                        setDbCounselors((prev) => [
                            ...prev,
                            ...data.counselors.map((item) => ({
                                id: item.user?.id,
                                name: item.user?.full_name,
                                category: item.specialties && item.specialties[0]?.specialty_name ? item.specialties[0].specialty_name : '',
                                field: item.specialties ? item.specialties.map((s) => s.specialty_name).join(', ') : '',
                                price: item.profile?.consultation_price ? `${item.profile.consultation_price.toLocaleString()}원` : '',
                                intro: item.profile?.intro_line,
                                profile_img_url: item.profile?.profile_img_url,
                            })),
                        ]);
                        setPageOffset((prev) => prev + data.counselors.length);
                    } catch (err) {
                        console.error(err);
                    } finally {
                        setLoading(false);
                    }
                };
                fetchNext();
            }
        },
        [loading, dbCounselors.length, totalCount, pageOffset, searchTerm, selectedSubCategories]
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

    const SkeletonCard = () => (
        <div className="counlist-counselor-card skeleton">
            <div className="counlist-card-top"><div className="counlist-profile-placeholder skeleton-img" /></div>
            <div className="counlist-card-body">
                <div className="skeleton-line skeleton-name" />
                <div className="skeleton-line skeleton-intro" />
            </div>
        </div>
    );

    const CounselorCard = memo(function CounselorCard({ id, name, category, field, price, intro, profile_img_url, liked, onLike, onClick }) {
        return (
            <div className="counlist-counselor-card" onClick={onClick}>
                <div className="counlist-card-top">
                    <div className="counlist-profile-placeholder">
                        {profile_img_url ? (
                            <img src={profile_img_url} alt="프로필" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
                        ) : (
                            <User size={32} />
                        )}
                    </div>
                    <button className={`counlist-heart-btn${liked ? ' liked' : ''}`} onClick={onLike}>
                        <Heart size={22} fill={liked ? '#e74c3c' : 'none'} color={liked ? '#e74c3c' : '#bbb'} strokeWidth={2.2} />
                    </button>
                </div>
                <div className="counlist-card-body">
                    <span className="counlist-counselor-category-label">{category}</span>
                    <h3 className="counlist-counselor-name">{name}</h3>
                    <span className="counlist-counselor-field-tags">{field}</span>
                    <p className="counlist-counselor-intro">{intro}</p>
                </div>
                <div className="counlist-card-footer">
                    <span className="counlist-price-info">{price} / 50분</span>
                    <button className="counlist-view-detail-btn">상세보기</button>
                </div>
            </div>
        );
    });

    return (
        <>
            {toast && <div className="counlist-mp-toast">{toast}</div>}
            <div className="counlist-full-page-wrapper">
                <Header activeTab="search" setActiveTab={() => {}} userName={userName} setUserName={setUserName} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
                
                <div className="counlist-counselor-list-container wide">
                    <header className="counlist-clist-search-header">
                        <h2 className="counlist-clist-search-title">전문가 찾기</h2>
                        
                        <div className="counlist-modern-filter-bar-container">
                            <div className="counlist-clist-search-bar-wrapper">
                                <Search className="counlist-clist-search-icon" size={18} />
                                <input
                                    type="text"
                                    className="counlist-clist-search-input"
                                    placeholder="이름/분야 검색"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* 드롭다운 루트 */}
                            <div className="counlist-custom-dropdown-root" ref={dropdownRef}>
                                <button 
                                    className={`counlist-dropdown-trigger-btn ${selectedSubCategories.length > 0 ? 'active' : ''}`}
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <span className="counlist-trigger-text">
                                        {selectedSubCategories.length === 0 
                                            ? '상담 분야 선택' 
                                            : `분야 선택 (${selectedSubCategories.length})`}
                                    </span>
                                    <ChevronDown size={16} className={`counlist-arrow-icon ${isDropdownOpen ? 'rotated' : ''}`} />
                                </button>

                                {/* 판넬 레이어 */}
                                {isDropdownOpen && (
                                    <div className="counlist-dropdown-panel-layer">
                                        <div className="counlist-panel-split-main-tabs">
                                            {/* '전체' 대분류 탭 선두 추가 */}
                                            <button
                                                type="button"
                                                className={`counlist-panel-tab-item ${activeMainTab === '전체' ? 'active' : ''}`}
                                                onClick={() => setActiveMainTab('전체')}
                                            >
                                                전체
                                            </button>
                                            {Object.keys(categoriesData).map((mainCat) => (
                                                <button
                                                    key={mainCat}
                                                    type="button"
                                                    className={`counlist-panel-tab-item ${activeMainTab === mainCat ? 'active' : ''}`}
                                                    onClick={() => setActiveMainTab(mainCat)}
                                                >
                                                    {mainCat}
                                                </button>
                                            ))}
                                        </div>
                                        {/* 우측 소분류 리스트 ('전체'일 경우 스크롤 효율을 위해 격자 최적화) */}
                                        <div className={`counlist-panel-sub-list-content ${activeMainTab === '전체' ? 'all-tab-grid' : ''}`}>
                                            {currentSubList.map((subCat) => {
                                                const isChecked = selectedSubCategories.includes(subCat);
                                                return (
                                                    <div 
                                                        key={subCat} 
                                                        className={`counlist-multi-option-item ${isChecked ? 'checked' : ''}`}
                                                        onClick={() => handleSubCategoryToggle(subCat)}
                                                    >
                                                        <div className="counlist-custom-checkbox">
                                                            {isChecked && <Check size={12} color="#ffffff" strokeWidth={3} />}
                                                        </div>
                                                        <span className="counlist-option-label">{subCat}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 선택 태그 배지 대시보드 */}
                        {selectedSubCategories.length > 0 && (
                            <div className="counlist-selected-tags-badge-board">
                                {selectedSubCategories.map(sub => (
                                    <span key={sub} className="counlist-selected-badge-item">
                                        {sub}
                                        <X size={12} className="counlist-badge-del-icon" onClick={() => handleSubCategoryToggle(sub)} />
                                    </span>
                                ))}
                                <button className="counlist-badge-reset-btn" onClick={clearAllFilters}>전체초기화</button>
                            </div>
                        )}
                    </header>

                    <main className="counlist-counselor-grid counlist-pc-full">
                        {loading && dbCounselors.length === 0 ? (
                            Array.from({ length: 3 }).map((_, idx) => <SkeletonCard key={idx} />)
                        ) : filteredCounselors.length === 0 ? (
                            <div className="counlist-counselor-empty">
                                <div className="counlist-empty-icon"><User size={32} /></div>
                                <p className="counlist-empty-title">조건에 맞는 상담사가 없어요</p>
                                <p className="counlist-empty-sub">다른 키워드나 필터 조합을 선택해보세요.</p>
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
                                        onClick={() => navigate(`/counselor/${counselor.id}`, { state: { isLiked: !!liked[counselor.id], counselor } })}
                                    />
                                ))}
                                {dbCounselors.length < totalCount && (
                                    <div ref={loaderRef} style={{ height: 40, background: 'none' }} />
                                )}
                            </>
                        )}
                    </main>
                </div>
                <MobileTap />
                <Footer />
            </div>
        </>
    );
}
