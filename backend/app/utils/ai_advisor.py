import openai
from app.utils.keyword_extractor import extract_keywords
from app.core.config import settings
import json
import re

client = openai.OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=settings.OPENAI_API_KEY
)

# ── 힐링 아이템 ───────────────────────────────────────────
HEALING_ITEMS = {
    "tea": [
        "아이스 아메리카노", "따뜻한 아메리카노", "아이스 라떼", "따뜻한 라떼",
        "콜드브루", "바닐라 라떼", "카라멜 마키아토", "에스프레소 샷",
        "아이스 돌체 라떼", "플랫화이트",
        "캐모마일 티", "따뜻한 캐모마일 티", "아이스 캐모마일 티",
        "페퍼민트 티", "따뜻한 페퍼민트 티", "아이스 페퍼민트 티",
        "히비스커스 티", "루이보스 티", "따뜻한 보이차",
        "핫 레몬차", "따뜻한 레몬차", "생강차", "유자차",
        "카모마일 라떼", "따뜻한 카모마일 라떼", "얼그레이 티",
        "홍차 라떼", "재스민 티", "녹차 라떼", "말차 라떼",
        "로즈힙 티", "애플 시나몬 티",
        "핫초코", "따뜻한 핫초코", "아이스 핫초코",
        "자몽에이드", "레몬에이드", "청포도에이드", "딸기에이드",
        "탄산수", "토닉워터", "딸기 스무디", "망고 스무디",
        "따뜻한 두유", "오트밀 라떼", "아몬드 라떼",
        "복숭아 아이스티", "패션후르츠 에이드",
    ],
    "home": [
        "다크초콜릿 한 조각", "밀크초콜릿", "민트 초콜릿",
        "화이트초콜릿", "초콜릿 트러플",
        "마카롱", "쿠키 한 봉지", "감자칩", "크루아상",
        "버터 쿠키", "브라우니 한 조각", "카스텔라",
        "눈꽃 빙수", "소프트 아이스크림",
        "새콤한 과일 젤리", "따뜻한 군고구마", "군밤",
        "망고 젤리", "하리보 젤리", "말린 과일 믹스",
        "바나나 한 개", "방울토마토 한 줌", "견과류 한 줌",
        "그래놀라 바", "요거트 한 컵",
        "스트레스 볼", "컬러링북", "피젯 큐브",
        "핫팩", "쿨패치", "아이스 안대",
        "향기 나는 손 크림", "립밤", "따뜻한 수건 찜질",
        "마사지 볼", "손가락 지압링",
    ],
    "walk": [
        "가벼운 동네 산책", "10분 스트레칭", "베란다 바람 쐬기",
        "계단 오르내리기", "잠깐 햇빛 쬐기", "공원 벤치에 앉아 멍 때리기",
    ],
    "scent": [
        "라벤더 룸 스프레이", "유칼립투스 디퓨저", "시트러스 향 핸드워시",
        "좋아하는 향수 한 번 뿌리기", "페퍼민트 에센셜 오일 한 방울",
        "로즈 향 바디로션", "샌달우드 인센스 스틱",
    ],
    "music": [
        "좋아하는 플레이리스트", "빗소리 백색소음", "재즈 카페 음악",
        "잔잔한 피아노 연주곡", "파도 소리 자연음", "Lo-Fi 힙합 음악",
        "클래식 현악 4중주", "좋아하는 노래 한 곡 크게 틀기",
    ],
}

ITEM_TO_ICON = {
    item: icon for icon, items in HEALING_ITEMS.items() for item in items
}

STRESS_ITEMS_BY_LEVEL = {
    "high": {
        "tea":   ["아이스 페퍼민트 티", "탄산수", "자몽에이드", "딸기에이드", "패션후르츠 에이드", "아이스 핫초코"],
        "home":  ["쿨패치", "아이스 안대", "스트레스 볼", "피젯 큐브", "마사지 볼", "손가락 지압링", "감자칩", "민트 초콜릿", "하리보 젤리"],
        "walk":  ["계단 오르내리기", "가벼운 동네 산책", "10분 스트레칭"],
        "scent": ["페퍼민트 에센셜 오일 한 방울", "유칼립투스 디퓨저", "시트러스 향 핸드워시"],
        "music": ["빗소리 백색소음", "좋아하는 노래 한 곡 크게 틀기", "Lo-Fi 힙합 음악"],
    },
    "mid": {
        "tea":   ["아이스 라떼", "바닐라 라떼", "오트밀 라떼", "말차 라떼", "캐모마일 티", "루이보스 티", "얼그레이 티", "재스민 티", "복숭아 아이스티", "딸기 스무디", "망고 스무디"],
        "home":  ["다크초콜릿 한 조각", "마카롱", "브라우니 한 조각", "버터 쿠키", "망고 젤리", "그래놀라 바", "요거트 한 컵"],
        "walk":  ["10분 스트레칭", "가벼운 동네 산책", "잠깐 햇빛 쬐기"],
        "scent": ["라벤더 룸 스프레이", "유칼립투스 디퓨저", "로즈 향 바디로션"],
        "music": ["좋아하는 플레이리스트", "재즈 카페 음악", "Lo-Fi 힙합 음악"],
    },
    "low": {
        "tea":   ["따뜻한 핫초코", "따뜻한 두유", "따뜻한 라떼", "따뜻한 카모마일 라떼", "핫 레몬차", "유자차", "생강차", "애플 시나몬 티", "로즈힙 티"],
        "home":  ["따뜻한 군고구마", "군밤", "카스텔라", "크루아상", "바나나 한 개", "견과류 한 줌", "핫팩", "따뜻한 수건 찜질", "향기 나는 손 크림", "립밤", "컬러링북"],
        "walk":  ["공원 벤치에 앉아 멍 때리기", "베란다 바람 쐬기", "잠깐 햇빛 쬐기"],
        "scent": ["샌달우드 인센스 스틱", "좋아하는 향수 한 번 뿌리기", "로즈 향 바디로션"],
        "music": ["잔잔한 피아노 연주곡", "클래식 현악 4중주", "파도 소리 자연음"],
    },
}

HIGH_INTENSITY_ITEMS = {
    "happy": {
        "tea":   ["청포도에이드", "딸기에이드", "패션후르츠 에이드", "망고 스무디", "딸기 스무디", "레몬에이드", "자몽에이드", "아이스 라떼"],
        "home":  ["마카롱", "새콤한 과일 젤리", "하리보 젤리", "망고 젤리", "소프트 아이스크림", "눈꽃 빙수", "화이트초콜릿"],
        "walk":  ["가벼운 동네 산책", "잠깐 햇빛 쬐기", "베란다 바람 쐬기"],
        "scent": ["시트러스 향 핸드워시", "좋아하는 향수 한 번 뿌리기"],
        "music": ["좋아하는 플레이리스트", "좋아하는 노래 한 곡 크게 틀기", "재즈 카페 음악"],
    },
    "calm": {
        "tea":   ["얼그레이 티", "재스민 티", "오트밀 라떼", "복숭아 아이스티"],
        "home":  ["요거트 한 컵", "그래놀라 바", "버터 쿠키", "견과류 한 줌"],
        "walk":  ["공원 벤치에 앉아 멍 때리기", "잠깐 햇빛 쬐기"],
        "scent": ["라벤더 룸 스프레이", "로즈 향 바디로션"],
        "music": ["잔잔한 피아노 연주곡", "재즈 카페 음악"],
    },
}

CAFFEINE_ITEMS = {
    "아이스 아메리카노", "따뜻한 아메리카노", "아이스 라떼", "따뜻한 라떼",
    "콜드브루", "바닐라 라떼", "카라멜 마키아토", "에스프레소 샷",
    "아이스 돌체 라떼", "플랫화이트", "말차 라떼", "녹차 라떼",
}

EMOTION_ITEM_BLACKLIST: dict[str, set] = {
    "anxious": CAFFEINE_ITEMS,
    "tired":   {"에스프레소 샷", "콜드브루", "아이스 아메리카노"},
}

# ── 신조어 사전 ───────────────────────────────────────────
SLANG_MAP = [
    (r'럭키비키',       '매우 운이 좋다'),
    (r'해피바이러스',   '긍정 에너지'),
    (r'유포자',         '전파하는 사람'),
    (r'이야호',         '신난다'),
    (r'ㅋ+',            '웃음'),
    (r'ㅎ+',            '웃음'),
    (r'ㅠ+|ㅜ+',        '슬픔'),
    (r'대박',           '정말 대단하다'),
    (r'존맛탱구리',     '정말 최고로 맛있다'),
    (r'존맛',           '매우 맛있다'),
    (r'갓생',           '매우 열심히 사는 삶'),
    (r'킹받',           '매우 화가 난다'),
    (r'빡침',           '화남'),
    (r'현타',           '현실감이 갑자기 느껴짐'),
    (r'암쏘',           '매우'),
    (r'꿀잼',           '매우 재미있다'),
    (r'노잼',           '전혀 재미없다'),
    (r'핵피',           '매우 행복하다'),
    (r'심쿵',           '설렘'),
    (r'멘붕',           '멘탈이 무너짐'),
    (r'극혐',           '매우 싫다'),
    (r'레전드',         '전설적으로 대단하다'),
    (r'ㄷㄷ',           '놀라움'),
    (r'ㅇㅈ',           '인정한다'),
    (r'불금',           '불타는 금요일'),
    (r'거시여',         '것이야'),
    (r'J형|계획적 J',   '계획적인 성격'),
    (r'화딱지',         '화'),
    # 추가 신조어
    (r'아신난다',       '정말 신난다'),
    (r'아미친',         '정말 대단하다'),
    (r'난리네',         '분위기가 매우 좋다'),
    (r'쩐다',           '정말 대단하다'),
    (r'미쳤다',         '정말 대단하다'),
    (r'소름',           '강렬한 감동'),
]


def normalize_slang(text: str) -> str:
    normalized = text
    for pattern, replacement in SLANG_MAP:
        normalized = re.sub(pattern, replacement, normalized, flags=re.IGNORECASE)
    return normalized


# ── 갈등 포인트 감지 ──────────────────────────────────────
CONFLICT_PATTERNS = [
    (r'(먹|마시|즐기).{0,10}(다이어트|살|죄책|미안|괜찮)', 'enjoyment_vs_guilt'),
    (r'(행복|좋아|좋은데).{0,15}(걱정|고민|불안|어떡)', 'happy_but_worried'),
    (r'(하고 싶|하고싶).{0,10}(해야|못|안 돼)', 'desire_vs_obligation'),
    (r'(쉬고|놀고|즐기고).{0,10}(해야|못|바빠|일)', 'rest_vs_duty'),
    (r'(좋은데|좋지만|행복하지만|기쁘지만).{0,20}(하지만|근데|그런데|그래도)', 'mixed_emotion'),
    (r'(다이어트).{0,20}(먹|맛있|행복|좋아)', 'enjoyment_vs_guilt'),
]


def detect_conflict_point(text: str) -> str:
    for pattern, label in CONFLICT_PATTERNS:
        if re.search(pattern, text):
            return label
    return ""


# ── 감정 흐름 추출 ────────────────────────────────────────
EMOTION_FLOW_PATTERNS = [
    (r'(수정|고치|다시|반복|노력|열심).{0,30}(안 ?돼|마음에 안|안 ?된)', "반복 시도에도 원하는 결과가 나오지 않는 좌절"),
    (r'(대단|멋지|부럽|잘 ?한|잘하).{0,20}(나|나도|왜|못)', "타인의 능력에 대한 동경과 자신에 대한 아쉬움"),
    (r'(하고 ?싶|되고 ?싶|갖고 ?싶).{0,30}(막막|모르|어렵|언제)', "하고 싶은 것은 많지만 어디서부터 시작해야 할지 모르는 막막함"),
    (r'(취업|취준|면접|합격|진로).{0,20}(하고 ?싶|걱정|불안|모르|언제)', "취업과 미래에 대한 막연한 불안"),
    (r'(잘 ?하고 ?싶|잘 ?만들|잘 ?되).{0,20}(어렵|힘들|모르|안 ?돼)', "잘 해내고 싶은 마음과 현실의 간극에서 오는 답답함"),
    # 추가: 음악/매체 감상에서 오는 감정 고조
    (r'(노래|음악|앨범|플리).{0,20}(신나|좋아|행복|설레|기분)', "음악이 감정을 직접적으로 끌어올리는 상황"),
    (r'(연속|이어서|다음|또).{0,15}(나온다|틀어|흘러)', "연속 재생으로 감정이 증폭되는 상황"),
]

def extract_emotion_flow(text: str) -> str:
    found = [label for pattern, label in EMOTION_FLOW_PATTERNS if re.search(pattern, text)]
    return " → ".join(found) if found else ""


# ── 일기 내 구체적 소재 추출 (공감 퀄리티 향상) ───────────────
CONCRETE_ITEM_PATTERNS = [
    # 음악/노래
    (r'([가-힣a-zA-Z\s]+(?:노래|곡|음악|앨범|플리|플레이리스트))', 'music'),
    # 음식/음료
    (r'([가-힣a-zA-Z\s]+(?:먹|마시|먹었|마셨|케이크|커피|라떼|에이드|스무디|치킨|피자|밥|음식))', 'food'),
    # 장소/상황
    (r'(점심|저녁|아침|퇴근|출근|학교|회사|집|카페|공원)', 'place'),
    # 사람
    (r'([가-힣]{2,4})(?:이|가|을|를|과|와|랑|이랑)\s*(?:같이|함께|만나|봤)', 'person'),
]

def extract_concrete_items(text: str) -> dict:
    """일기에서 공감에 활용할 구체적 소재를 추출"""
    result = {}
    for pattern, category in CONCRETE_ITEM_PATTERNS:
        matches = re.findall(pattern, text)
        if matches:
            result[category] = matches[0].strip() if isinstance(matches[0], str) else matches[0]
    return result


# ── 감정 강도별 처방 전략 ─────────────────────────────────
def get_intensity_strategy(intensity: int, emotion: str) -> str:
    """
    감정 강도에 따라 처방의 방향성을 결정.
    높은 강도 → 감정을 함께 타고 가는 전략
    낮은 강도 → 감정을 살살 끌어올리는 전략
    """
    if intensity >= 80:
        strategies = {
            "happy":   "지금 이 에너지가 최고조예요. 감정을 함께 폭발시켜줄 아이템이 필요해요. 단순히 즐기는 것을 넘어 '지금 이 순간을 기억하게 해주는' 방향으로 제안하세요.",
            "angry":   "강한 화는 몸으로 풀어야 해요. 즉각적인 신체 자극 또는 손이 바쁜 활동을 우선 제안하세요.",
            "sad":     "깊은 슬픔은 억지로 끌어올리려 하면 안 돼요. 지금 이 감정을 온전히 느끼게 해주는 포근한 아이템을 제안하세요.",
            "anxious": "강한 불안 상태예요. 즉각적인 진정 효과가 있는 아이템을 과학적 근거와 함께 제안하세요.",
            "tired":   "완전한 탈진 상태예요. 아무것도 안 해도 되는 '허락'을 먼저 주고, 최소 에너지로 할 수 있는 아이템을 제안하세요.",
            "calm":    "깊은 평온 상태예요. 이 고요함을 더 깊게 만들어주는 아이템을 제안하세요.",
        }
    elif intensity >= 50:
        strategies = {
            "happy":   "기분이 좋은 상태예요. 이 기분을 조금 더 끌어올려줄 아이템을 제안하세요.",
            "angry":   "어느 정도 화가 난 상태예요. 화를 인정하면서도 자연스럽게 해소되는 방향으로 제안하세요.",
            "sad":     "슬픔이 있는 상태예요. 위로와 함께 가볍게 기분을 환기할 아이템을 제안하세요.",
            "anxious": "불안이 있는 상태예요. 긴장을 천천히 풀어주는 아이템을 제안하세요.",
            "tired":   "피로가 쌓인 상태예요. 에너지를 충전해줄 아이템을 제안하세요.",
            "calm":    "차분한 상태예요. 이 상태를 유지하면서 소소한 즐거움을 더해줄 아이템을 제안하세요.",
        }
    else:
        strategies = {
            "happy":   "잔잔한 기쁨이 있는 상태예요. 이 감정을 더 또렷하게 느끼게 해줄 아이템을 제안하세요.",
            "angry":   "약한 짜증이 있는 상태예요. 가볍게 기분을 전환해줄 아이템을 제안하세요.",
            "sad":     "약간 울적한 상태예요. 기분을 살살 환기해줄 따뜻한 아이템을 제안하세요.",
            "anxious": "약간의 긴장이 있는 상태예요. 부드럽게 긴장을 풀어줄 아이템을 제안하세요.",
            "tired":   "약간 피곤한 상태예요. 가볍게 기분을 전환해줄 아이템을 제안하세요.",
            "calm":    "매우 차분한 상태예요. 이 고요함을 즐기게 해줄 아이템을 제안하세요.",
        }
    return strategies.get(emotion, "감정 상태에 맞는 아이템을 제안하세요.")


# ── 일기 톤 감지 ──────────────────────────────────────────
POSITIVE_SIGNALS = [
    '좋', '행복', '기뻐', '설레', '즐거', '신나', '완료', '성공', '대박',
    '이야호', '럭키', '해피', '핵피', '꿀잼', '갓생', '뿌듯', '감사',
    'ㅋ', 'ㅎ', '!', '완전', '최고', '짱', '굿', '오예', '불금', '존맛',
    '아신난다', '아미친', '난리네',
]
NEGATIVE_SIGNALS = [
    '힘들', '지쳐', '슬프', '우울', '불안', '걱정', '무서', '짜증',
    '화나', '억울', '싫', '피곤', '지침', '멘붕', '현타', '킹받', '빡',
    '화딱지', '말썽', '수정', '안 되', '안되',
    'ㅠ', 'ㅜ', '...', '모르겠', '망했', '최악', '극혐',
]
CONFLICT_SIGNALS = ['고민', '괜찮', '해야', '어떡', '하지만', '근데', '그런데', '그래도', '다이어트']


def detect_diary_tone(text: str) -> str:
    pos      = sum(1 for sig in POSITIVE_SIGNALS if sig in text)
    neg      = sum(1 for sig in NEGATIVE_SIGNALS if sig in text)
    conflict = sum(1 for sig in CONFLICT_SIGNALS if sig in text)
    if conflict >= 2 and pos >= 1 and neg >= 1:
        return "양가적(기쁨과 갈등이 공존)"
    if conflict >= 2 and pos >= 2:
        return "양가적(행복하지만 고민 있음)"
    if pos > neg * 1.5:
        return "긍정적"
    elif neg > pos * 1.5:
        return "부정적"
    else:
        return "복합적"


# ── 유효성 검사 ───────────────────────────────────────────
def validate_healing_item(title: str, icon: str) -> tuple:
    if title in ITEM_TO_ICON:
        return title, ITEM_TO_ICON[title]
    return "따뜻한 캐모마일 티", "tea"


def clean_korean_only(text: str) -> str:
    allowed_chars = set(' \n.,!?%~()[]"\'…·—–')
    result = []
    for char in text:
        if '\uAC00' <= char <= '\uD7A3':
            result.append(char)
        elif '\u3131' <= char <= '\u318E':
            result.append(char)
        elif char.isdigit():
            result.append(char)
        elif char in allowed_chars:
            result.append(char)
    cleaned = ''.join(result)
    cleaned = re.sub(r' +([.,!?…])', r'\1', cleaned)
    cleaned = re.sub(r' {2,}', ' ', cleaned)
    return cleaned.strip()


TYPO_CORRECTIONS = [
    (r'되요\b', '돼요'), (r'되었어요\b', '됐어요'), (r'되었네요\b', '됐네요'),
    (r'되었고\b', '됐고'), (r'되었는데\b', '됐는데'), (r'되어요\b', '돼요'),
    (r'되어서\b', '돼서'), (r'되어\b', '돼'), (r'안되니까\b', '안 되니까'),
    (r'안되서\b', '안 돼서'), (r'안되고\b', '안 되고'), (r'안되면\b', '안 되면'),
    (r'안됩니다\b', '안 됩니다'), (r'안돼요\b', '안 돼요'), (r'안되요\b', '안 돼요'),
    (r'수 밖에\b', '수밖에'), (r'수있', '수 있'), (r'수없', '수 없'),
    (r'맞추어\b', '맞춰'), (r'나누어\b', '나눠'), (r'바꾸어\b', '바꿔'), (r'이루어\b', '이뤄'),
    (r'([가-힣])것\b', r'\1 것'), (r'([가-힣])때\b', r'\1 때'), (r'([가-힣])만큼\b', r'\1 만큼'),
    (r'그 만큼\b', '그만큼'), (r'([가-힣])뿐\b', r'\1 뿐'), (r'그 뿐\b', '그뿐'),
    (r'할께요\b', '할게요'), (r'볼께요\b', '볼게요'), (r'줄께요\b', '줄게요'),
    (r'갈께요\b', '갈게요'), (r'올께요\b', '올게요'),
    (r'([가-힣])입니다\b', r'\1이에요'), (r'있습니다\b', '있어요'), (r'없습니다\b', '없어요'),
    (r'합니다\b', '해요'), (r'됩니다\b', '돼요'), (r'([가-힣])십니다\b', r'\1세요'),
    (r'드는 것 같아요', '드네요'), (r'([가-힣]) 것 같아요', r'\1네요'),
    (r'인 것 같아요', '이네요'), (r'것 같아요', '네요'),
    (r'좋을 것 같아요', '좋을 거예요'), (r'좋을 것 같습니다', '좋아요'),
    (r'([가-힣])ㄹ 수도 있겠어요', r'\1ㄹ 수 있어요'), (r'([가-힣]) 수도 있겠어요', r'\1 수 있어요'),
    (r'([가-힣])ㄹ 수도 있어요', r'\1ㄹ 수 있어요'), (r'([가-힣]) 수도 있어요', r'\1 수 있어요'),
    (r'생각해요\.', '거든요.'), (r'생각해요', '거든요'),
    (r'마음을 편안하게 해줘요', '긴장을 풀어줘요'), (r'마음을 편안하게 해주는', '긴장을 풀어주는'),
    (r'마음이 편안해지는', '긴장이 풀리는'), (r'마음을 안정시켜줘요', '긴장을 가라앉혀줘요'),
    (r'기분을 좋게 해줘요', '기분을 띄워줘요'), (r'기분을 좋게 해주는', '기분을 띄워주는'),
    (r'\s+([.,!?…·])', r'\1'), (r' {2,}', ' '),
]


def fix_common_typos(text: str, nickname: str = "") -> str:
    for pattern, replacement in TYPO_CORRECTIONS:
        text = re.sub(pattern, replacement, text)
    if nickname:
        text = re.sub(rf'{re.escape(nickname)}님[,\s]*(께서|은|는|이|가|의|에게)?', '', text)
        text = re.sub(r' {2,}', ' ', text).strip()
    return text.strip()


def sanitize_ai_response(ai_response: dict, nickname: str = "") -> dict:
    text_fields = ['empathy', 'reason', 'action', 'healing_title', 'healing_desc']
    for field in text_fields:
        if field in ai_response and isinstance(ai_response[field], str):
            cleaned = clean_korean_only(ai_response[field])
            ai_response[field] = fix_common_typos(
                cleaned, nickname if field not in ('empathy', 'healing_title', 'healing_desc') else ""
            )
    title = ai_response.get("healing_title", "")
    icon  = ai_response.get("healing_icon", "tea")
    ai_response["healing_title"], ai_response["healing_icon"] = validate_healing_item(title, icon)
    return ai_response


def build_stress_items(stress_level: str, emotion: str, intensity: int) -> str:
    blacklist  = EMOTION_ITEM_BLACKLIST.get(emotion, set())
    categories = (HIGH_INTENSITY_ITEMS[emotion]
                  if intensity >= 80 and emotion in HIGH_INTENSITY_ITEMS
                  else STRESS_ITEMS_BY_LEVEL.get(stress_level, STRESS_ITEMS_BY_LEVEL["mid"]))
    lines = []
    for icon, items in categories.items():
        filtered = [i for i in items if i not in blacklist]
        if filtered:
            lines.append(f"[{icon}] " + " / ".join(filtered))
    return "\n".join(lines)


# ── 갈등 유형별 힌트 ──────────────────────────────────────
CONFLICT_EMPATHY_HINTS = {
    "enjoyment_vs_guilt": (
        "empathy 문장1에서 먹는 행복감을 구체적으로 공감하고, "
        "문장2에서 그 즐거움 뒤에 찾아오는 복잡한 마음도 자연스럽게 짚어주세요. "
        "다이어트 조언이나 죄책감 강화 표현은 절대 금지."
    ),
    "happy_but_worried": (
        "문장1에서 행복한 감정을 충분히 공감하고, "
        "문장2에서 그 행복 속에서도 걱정이 따라오는 마음 자체를 따뜻하게 인정해주세요."
    ),
    "desire_vs_obligation": "하고 싶은 마음과 해야 한다는 압박 사이에서 고민하는 마음 자체를 공감해주세요.",
    "rest_vs_duty": "쉬고 싶은 마음과 해야 할 일 사이의 긴장감을 먼저 인정해주세요.",
    "mixed_emotion": "기쁨과 다른 감정이 동시에 존재한다는 사실을 자연스럽게 담아주세요.",
}

CONFLICT_REASON_HINTS = {
    "enjoyment_vs_guilt": (
        "reason 문장1에서 먹는 즐거움 자체는 충분히 진짜라는 점을 인정하세요. "
        "문장2에서는 즐거움과 고민이 동시에 존재할 때 그 사이에서 답을 찾으려는 것 자체가 "
        "스트레스를 높인다는 점을 일기 속 소재와 직접 연결해서 설명하세요. "
        "조언이나 죄책감 심화 표현 절대 금지."
    ),
    "happy_but_worried": "기쁜 감정은 진짜이지만, 그 속에서도 걱정이 따라오는 패턴이 에너지를 소모시킨다는 점을 설명해주세요.",
    "desire_vs_obligation": "원하는 것과 해야 하는 것 사이의 갈등이 감정적 피로를 만들어낸다는 점을 일기 소재와 연결해서 설명해주세요.",
}

CONFLICT_ITEM_HINT = {
    "enjoyment_vs_guilt": "죄책감 없이 가볍게 즐길 수 있는 아이템. 예: 새콤한 과일 젤리, 탄산수, 에이드.",
    "happy_but_worried": "행복한 기분을 유지하면서 걱정을 잠시 내려놓게 도와주는 아이템.",
    "desire_vs_obligation": "잠깐이라도 해방감을 주는 아이템. 산책이나 향기 아이템이 효과적.",
}


# ── 메인 함수 ─────────────────────────────────────────────
def generate_ai_report(
    diary_text: str,
    emotion: str,
    intensity: int,
    stress: int,
    nickname: str,
):
    auto_keywords    = extract_keywords(diary_text, top_n=2)
    normalized_diary = normalize_slang(diary_text)
    diary_tone       = detect_diary_tone(diary_text)
    conflict_point   = detect_conflict_point(diary_text)
    emotion_flow     = extract_emotion_flow(diary_text)
    concrete_items   = extract_concrete_items(diary_text)  # ★ 신규
    intensity_strategy = get_intensity_strategy(intensity, emotion)  # ★ 신규
    diary_preview    = diary_text[:50]  # 원본 그대로 (신조어 포함)

    # 스트레스 구간
    if stress >= 70:
        stress_level, stress_label = "high", "높음 (70% 이상)"
    elif stress >= 40:
        stress_level, stress_label = "mid", "중간 (40~69%)"
    else:
        stress_level, stress_label = "low", "낮음 (39% 이하)"

    intensity_label = "매우 강함" if intensity >= 80 else ("중간" if intensity >= 50 else "약함")
    stress_items    = build_stress_items(stress_level, emotion, intensity)

    # ── 감정별 가이드 ──────────────────────────────────────
    empathy_verb_guide = {
        "happy":   "기쁨이 넘치고 / 행복함이 가득하고 / 설레임이 밀려오고 / 신남이 터져 나오고",
        "calm":    "마음이 고요하게 가라앉고 / 평온함이 감돌고",
        "tired":   "피로가 쌓여오고 / 지침이 느껴지고 / 무거움이 밀려오고",
        "sad":     "슬픔이 밀려오고 / 쓸쓸함이 감돌고 / 마음이 무겁게 내려앉고",
        "angry":   "화딱지가 치밀어 오르고 / 답답함이 폭발하고 / 속에서 열이 올라오고 / 억울함이 끓어오르고",
        "anxious": "불안함이 밀려오고 / 긴장감이 가슴을 조여오고 / 초조함이 스며들고",
    }.get(emotion, "감정이 밀려오고")

    empathy_verb_forbidden = {
        "angry":   "피로·지침·무거움·슬픔·불안 관련 동사 절대 금지",
        "tired":   "화·분노·억울 관련 동사 절대 금지",
        "happy":   "피로·슬픔·불안·화 관련 동사 절대 금지",
        "sad":     "기쁨·화·피로 관련 동사 절대 금지",
        "anxious": "화·피로·기쁨 관련 동사 절대 금지",
        "calm":    "화·피로·불안·슬픔 관련 동사 절대 금지",
    }.get(emotion, "")

    emotion_hint = {
        "happy":   "경쾌하고 달콤하거나 상큼한 아이템 선호. 차분한 아이템 금지.",
        "calm":    "따뜻하고 부드러운 아이템 선호",
        "tired":   "따뜻하게 위로해주는 아이템 선호 (고카페인 제외)",
        "sad":     "달콤하거나 포근한 아이템 선호",
        "angry":   "차갑고 시원한 자극 또는 손을 바쁘게 하는 아이템 선호",
        "anxious": "진정·이완 효과 아이템 선호. 카페인 음료 절대 금지.",
    }.get(emotion, "감정에 맞는 아이템 선호")

    conflict_empathy_hint = CONFLICT_EMPATHY_HINTS.get(conflict_point, "")
    conflict_reason_hint  = CONFLICT_REASON_HINTS.get(conflict_point, "")
    conflict_item_hint    = CONFLICT_ITEM_HINT.get(conflict_point, "")

    conflict_tone_note = ""
    if conflict_point:
        conflict_tone_note = (
            f"\n⚠️ 갈등 패턴 감지: '{conflict_point}'. "
            f"단순 긍정으로만 처리하지 말고 복합적인 감정을 세심하게 다뤄주세요."
        )

    # ★ 구체적 소재 힌트 (empathy 퀄리티 향상)
    concrete_hint = ""
    if concrete_items:
        items_str = " / ".join(f"{v}({k})" for k, v in concrete_items.items())
        concrete_hint = (
            f"\n★ 일기 속 구체적 소재: {items_str}. "
            "empathy 문장1에서 이 소재를 직접 언급해서 '내 일기를 진짜로 읽었구나'는 느낌을 줄 것. "
            "변환된 설명문(예: '정말 대단하다는 것이') 붙여넣기 절대 금지 — 원본 소재명을 자연스럽게 사용."
        )

    # ★ 감정 강도 전략 힌트
    intensity_hint = f"\n★ 감정 강도 {intensity}% 처방 전략: {intensity_strategy}"

    # ── empathy 가이드 ─────────────────────────────────────
    empathy_guide = (
        f'"{nickname}님, "으로 시작하는 2문장. '
        f"현재 감정은 {emotion}이에요. "
        f"사용할 감성 동사: [{empathy_verb_guide}] 중 하나. "
        f"{empathy_verb_forbidden}. "
        f"문장1: 일기의 구체적 상황과 원본 소재(음악명, 음식명, 장소 등)를 직접 언급하며 감정 공감. 어미 ~네요. "
        f"신조어 변환문을 그대로 붙여넣기 금지 — 원본 표현을 살려서 쓸 것. "
        f"문장2: 갈등·복합 감정이 있다면 그 뒤에 오는 복잡한 마음도 짚어주세요. 어미 ~겠어요 또는 ~이에요. "
        f"'~수도 있겠어요' 같은 추측·가정 어미 절대 금지. "
        f"일기에 없는 감정 임의 추가 금지. 두 문장 내용 반복 금지. '~것 같아요'·'나타나고' 절대 금지. "
        + (f"\n[갈등 공감 가이드] {conflict_empathy_hint}" if conflict_empathy_hint else "")
        + concrete_hint
    )

    emotion_flow_note = f"\n감지된 감정 흐름: {emotion_flow}" if emotion_flow else ""

    # ── reason 가이드 ──────────────────────────────────────
    reason_guide = (
        f"이름 없이 2문장. 어미는 반드시 ~이에요/~거든요/~네요 중 하나. "
        f"'~입니다'·'~습니다'·'~수도 있어요'·'~수도 있겠어요' 절대 금지. "
        f"일기 톤은 '{diary_tone}', 감정은 {emotion}, 강도는 {intensity}%이에요. "
        f"empathy에서 언급한 상황을 그대로 반복하지 말 것. "
        f"reason의 역할: '왜 이 감정이 드는지' 구조적·심리적 원인 설명. "
        f"문장1: 이 강도({intensity}%)의 {emotion} 감정이 생겨나는 심리적 메커니즘을 설명. "
        f"문장2: 일기 속 구체적 소재('{diary_preview[:30]}...')와 연결해서 이 감정이 왜 지금 이 강도인지 설명. "
        f"일기와 무관한 추상적 자연 비유 금지. 범용 위로 문장 금지."
        f"{emotion_flow_note}"
        + (f"\n[갈등 분석 가이드] {conflict_reason_hint}" if conflict_reason_hint else "")
        + intensity_hint
    )

    # ── action 가이드 ─────────────────────────────────────
    action_guide = (
        "이름 없이 2문장. healing_title 아이템 하나만 언급. "
        "어미는 반드시 ~해요/~거든요 사용. "
        "'~것 같아요'·'잘 맞아요'·'~생각해요'·'~수도 있어요' 절대 금지. "
        f"문장1: 지금 {emotion} 감정 강도 {intensity}%인 상태와 이 아이템의 성분·특성·효과를 "
        "논리적으로 1:1 연결. 예) '강한 신남 상태일 때 탄산의 자극적인 청량감이 감정의 에너지를 함께 끌어올려줘요.' "
        "단순히 '잘 맞아요'나 '좋아요'처럼 근거 없는 연결 절대 금지. "
        "문장2: 아이템을 사용하는 구체적 행동 하나를 짧고 생생하게 제안. healing_desc와 내용 겹치지 않도록."
    )

    # ── healing_desc 가이드 ───────────────────────────────
    healing_desc_emotion_hint = {
        "angry":   "화를 식히는 데 / 열을 내려주는 데",
        "tired":   "피로 회복에 / 지친 몸을 달래는 데",
        "sad":     "울적함을 달래는 데 / 쓸쓸함을 감싸주는 데",
        "anxious": "긴장을 가라앉히는 데 / 초조함을 누그러뜨리는 데",
        "happy":   "기쁨을 더 빛내주는 데 / 신남을 함께 즐기는 데",
        "calm":    "평온함을 유지하는 데 / 고요함을 깊게 해주는 데",
    }.get(emotion, "지금 감정 상태에")

    healing_desc_guide = (
        "2문장. 이름 언급 금지. "
        "'것 같아요'·'마음을 편안하게'·'기분을 좋게' 절대 금지. '~입니다'·'~습니다' 절대 금지. "
        f"문장1: '{healing_desc_emotion_hint}' 표현 활용, 이 아이템의 성분·특성이 왜 지금 {emotion} 강도 {intensity}% 상태에 맞는지 연결. "
        "'~에 도움이 돼요.' 또는 '~효과가 있어요.'로 끝낼 것. "
        "문장2: 실제 사용 시 느껴지는 구체적 감각 묘사. "
        "예: '한 모금 마시면 시원한 청량감이 목을 타고 내려가거든요.' "
        "'~거든요.' 또는 '~해줘요.'로 끝낼 것. 두 문장 합쳐 70자 이내."
    )

    system_instruction = (
        "당신은 따뜻하고 통찰력 있는 한국어 심리상담사입니다.\n"
        "반드시 지켜야 할 규칙:\n"
        "1. 출력은 JSON만. JSON 바깥에 어떤 텍스트도 절대 쓰지 마세요.\n"
        "2. 모든 필드는 완전한 한글만 사용. 영어·로마자·한자 절대 금지.\n"
        "3. 일기에 실제 쓰인 내용만 반영. 없는 감정·상황 추측해서 추가하지 마세요.\n"
        "4. empathy에서는 일기 속 원본 소재(음악명, 음식명, 장소명 등)를 반드시 직접 언급하세요. "
        "신조어 변환 설명문을 붙여넣기 금지.\n"
        "5. 일기 톤과 반대되는 해석 엄격히 금지.\n"
        "6. 금지 어미: '~것 같아요'·'~입니다'·'~습니다'·'~수도 있겠어요'·'~수도 있어요'·'~생각해요'. "
        "추측·가정 표현 어떤 형태든 절대 금지.\n"
        "7. 필드 간 중복 엄격 금지:\n"
        "   - empathy: 감정 공감 (지금 어떤 감정인지, 구체적 소재 활용)\n"
        "   - reason: 원인 분석 (왜 그 강도로 그 감정이 드는지 — empathy 상황 반복 금지)\n"
        "   - action: 아이템 행동 제안 (감정-아이템 논리적 연결 필수)\n"
        "   - healing_desc: 아이템 효과 설명 (action과 다른 각도)\n"
        "8. 갈등·양가 감정이 감지된 일기: 긍정만 일방적으로 공감하지 말고 갈등하는 마음도 함께 짚어주세요.\n"
        "9. action 문장1: 감정 강도와 아이템 특성을 논리적으로 연결. '잘 맞아요' 같은 근거 없는 연결 금지.\n"
        "10. 감정 강도가 매우 높을 때(80% 이상): 처방이 평이하지 않도록. "
        "이 에너지 상태에서 이 아이템이 왜 지금 딱 맞는지 구체적으로 설명하세요."
    )

    user_prompt = f"""닉네임: "{nickname}"
원본 일기 (신조어 포함 그대로): "{diary_text}"
일기 설명 (신조어 변환): "{normalized_diary}"
일기 전체 톤: {diary_tone}{conflict_tone_note}
감정: {emotion} / 강도: {intensity}% ({intensity_label}) / 스트레스: {stress}% ({stress_label})
일기 속 구체적 소재: {json.dumps(concrete_items, ensure_ascii=False)}

────────────────────────────────
아래 JSON 형식으로만 응답하세요. JSON 외 텍스트 절대 금지.
────────────────────────────────

{{
  "empathy":       "{empathy_guide}",
  "reason":        "{reason_guide}",
  "action":        "{action_guide}",
  "healing_title": "아래 [힐링 아이템 선택 기준] 목록에서 딱 하나만 선택. 목록 외 창작 절대 금지. 매번 다양한 카테고리에서 선택.",
  "healing_desc":  "{healing_desc_guide}",
  "healing_icon":  "음료이면 tea / 음악·소리이면 music / 산책·스트레칭·야외활동이면 walk / 향·스프레이·디퓨저이면 scent / 간식·도구·기타이면 home"
}}

────────────────────────────────
[힐링 아이템 선택 기준]
스트레스: {stress}% ({stress_label}) / 감정: {emotion} (강도 {intensity}%, {intensity_label})
{emotion_hint}
{f"갈등 유형 아이템 힌트: {conflict_item_hint}" if conflict_item_hint else ""}
{intensity_hint}
카테고리를 다양하게 선택. [tea] 음료만 반복 금지.

{stress_items}
────────────────────────────────
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user",   "content": user_prompt},
            ],
            temperature=0.7,
        )

        raw_content = response.choices[0].message.content.strip()
        json_match  = re.search(r'\{.*\}', raw_content, re.DOTALL)
        ai_response = json.loads(json_match.group(0) if json_match else raw_content)
        ai_response = sanitize_ai_response(ai_response, nickname)

        ai_analysis = "\n\n".join([
            ai_response.get("empathy", "").strip(),
            ai_response.get("reason",  "").strip(),
            ai_response.get("action",  "").strip(),
        ]).strip()

        return (
            ai_analysis,
            ai_response.get("healing_title"),
            ai_response.get("healing_desc"),
            ai_response.get("healing_icon", "tea"),
            auto_keywords,
        )

    except Exception as e:
        import traceback
        print("\n❌ ====== Groq AI 연동 에러 상세 로그 ======")
        print(f"에러 메시지: {e}")
        traceback.print_exc()
        print("==========================================\n")
        return (
            "현재 AI 서버에서 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
            "새로운 휴식",
            "안정을 취하는 것을 권장합니다.",
            "tea",
            auto_keywords,
        )