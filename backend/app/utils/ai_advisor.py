import openai
from app.utils.keyword_extractor import extract_keywords
from app.core.config import settings
import json
import re

# py-hanspell은 Python 3.10+ 환경 의존성 충돌로 사용 불가 → 정규식 교정으로 대체

client = openai.OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=settings.OPENAI_API_KEY
)

# ────────────────────────────────────────────────────────────────────
# 힐링 아이템 목록
# ────────────────────────────────────────────────────────────────────
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
    item: icon
    for icon, items in HEALING_ITEMS.items()
    for item in items
}

# ────────────────────────────────────────────────────────────────────
# [FIX 1] 감정·스트레스 기반 카페인 아이템 제한
# 불안(anxious) / 피로(tired) 상태에서 카페인 음료가 처방되지 않도록
# 감정별 블랙리스트를 정의하고, 스트레스 구간 목록 구성 시 필터링 적용.
# ────────────────────────────────────────────────────────────────────
CAFFEINE_ITEMS = {
    "아이스 아메리카노", "따뜻한 아메리카노", "아이스 라떼", "따뜻한 라떼",
    "콜드브루", "바닐라 라떼", "카라멜 마키아토", "에스프레소 샷",
    "아이스 돌체 라떼", "플랫화이트", "말차 라떼", "녹차 라떼",
}

# 감정별 제외할 아이템 카테고리 또는 아이템
EMOTION_ITEM_BLACKLIST: dict[str, set] = {
    # 불안 상태: 카페인은 심박수·불안감 증폭 → 제외
    "anxious": CAFFEINE_ITEMS,
    # 피로 상태: 카페인 일부는 허용하되 고강도 에스프레소 계열만 제외
    "tired":   {"에스프레소 샷", "콜드브루", "아이스 아메리카노"},
}


def filter_items_for_emotion(items_str: str, emotion: str) -> str:
    """
    슬래시(/) 구분 아이템 문자열에서 현재 감정에 맞지 않는 아이템 제거.
    blacklist에 없는 아이템만 남겨서 반환.
    """
    blacklist = EMOTION_ITEM_BLACKLIST.get(emotion, set())
    if not blacklist:
        return items_str
    filtered = [
        item.strip()
        for item in items_str.split("/")
        if item.strip() not in blacklist
    ]
    return " / ".join(filtered)


# ────────────────────────────────────────────────────────────────────
# 유효성 검사
# ────────────────────────────────────────────────────────────────────
def validate_healing_item(title: str, icon: str) -> tuple:
    if title in ITEM_TO_ICON:
        return title, ITEM_TO_ICON[title]
    return "따뜻한 캐모마일 티", "tea"


# ────────────────────────────────────────────────────────────────────
# 한글 외 문자 제거
# ────────────────────────────────────────────────────────────────────
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


# ────────────────────────────────────────────────────────────────────
# 맞춤법 교정 (hanspell 대체 — 정규식 기반)
# ────────────────────────────────────────────────────────────────────
TYPO_CORRECTIONS = [
    # 되다 / 돼다 혼용
    (r'되요\b',             '돼요'),
    (r'되었어요\b',         '됐어요'),
    (r'되었네요\b',         '됐네요'),
    (r'되었고\b',           '됐고'),
    (r'되었는데\b',         '됐는데'),
    (r'되어요\b',           '돼요'),
    (r'되어서\b',           '돼서'),
    (r'되어\b',             '돼'),
    # 안 되다 띄어쓰기
    (r'안되니까\b',         '안 되니까'),
    (r'안되서\b',           '안 돼서'),
    (r'안되고\b',           '안 되고'),
    (r'안되면\b',           '안 되면'),
    (r'안돼니까\b',         '안 되니까'),
    (r'안됩니다\b',         '안 됩니다'),
    (r'안돼요\b',           '안 돼요'),
    (r'안되요\b',           '안 돼요'),
    (r'돼니까\b',           '되니까'),
    # 수밖에 / 할 수있
    (r'수 밖에\b',          '수밖에'),
    (r'수있',               '수 있'),
    (r'수없',               '수 없'),
    # 이에요 / 예요
    (r'위해서에요\b',        '위해서예요'),
    (r'위해서 에요\b',       '위해서예요'),
    (r'이기 때문에요\b',     '이기 때문이에요'),
    # 어/아 불규칙
    (r'맞추어\b',           '맞춰'),
    (r'나누어\b',           '나눠'),
    (r'바꾸어\b',           '바꿔'),
    (r'이루어\b',           '이뤄'),
    # 의존명사 띄어쓰기
    (r'([가-힣])것\b',      r'\1 것'),
    (r'([가-힣])때\b',      r'\1 때'),
    (r'([가-힣])만큼\b',    r'\1 만큼'),
    (r'그 만큼\b',          '그만큼'),
    (r'([가-힣])뿐\b',      r'\1 뿐'),
    (r'그 뿐\b',            '그뿐'),
    # 어미 -ㄹ게요 / -ㄹ께요
    (r'할께요\b',           '할게요'),
    (r'볼께요\b',           '볼게요'),
    (r'줄께요\b',           '줄게요'),
    (r'갈께요\b',           '갈게요'),
    (r'올께요\b',           '올게요'),
    # [FIX 2] 이중 조사 오류 — healing_desc에서 "이을", "을를" 등 자주 발생
    (r'이을\b',             '을'),
    (r'가이\b',             '이'),
    (r'을를\b',             '를'),
    (r'이가\b',             '이'),
    (r'은는\b',             '는'),
    (r'([가-힣])\s*이\s*을\b', r'\1을'),
    # 구두점 앞 공백 / 연속 공백
    (r'\s+([.,!?…·])',      r'\1'),
    (r' {2,}',              ' '),
]


def fix_common_typos(text: str, nickname: str = "") -> str:
    for pattern, replacement in TYPO_CORRECTIONS:
        text = re.sub(pattern, replacement, text)
    if nickname:
        text = re.sub(
            rf'{re.escape(nickname)}님[,\s]*(께서|은|는|이|가|의|에게)?',
            '', text
        )
        text = re.sub(r' {2,}', ' ', text).strip()
    return text.strip()


# ────────────────────────────────────────────────────────────────────
# AI 응답 정제
# ────────────────────────────────────────────────────────────────────
def sanitize_ai_response(ai_response: dict, nickname: str = "") -> dict:
    text_fields = ['empathy', 'reason', 'action', 'healing_title', 'healing_desc']
    for field in text_fields:
        if field in ai_response and isinstance(ai_response[field], str):
            cleaned = clean_korean_only(ai_response[field])
            ai_response[field] = fix_common_typos(
                cleaned,
                nickname if field not in ('empathy', 'healing_title', 'healing_desc') else ""
            )

    title = ai_response.get("healing_title", "")
    icon  = ai_response.get("healing_icon", "tea")
    ai_response["healing_title"], ai_response["healing_icon"] = validate_healing_item(title, icon)
    return ai_response


# ────────────────────────────────────────────────────────────────────
# 메인 함수
# ────────────────────────────────────────────────────────────────────
def generate_ai_report(
    diary_text: str,
    emotion: str,
    intensity: int,
    stress: int,
    nickname: str,
):
    auto_keywords = extract_keywords(diary_text, top_n=2)

    system_instruction = (
        "당신은 따뜻하고 통찰력 있는 한국어 심리상담사입니다.\n"
        "반드시 지켜야 할 규칙:\n"
        "1. 출력은 JSON만. JSON 바깥에 어떤 텍스트도 절대 쓰지 마세요.\n"
        "2. 모든 필드는 완전한 한글만 사용. 영어 단어, 로마자, 한자 절대 금지.\n"
        "3. 일기에 실제 쓰인 내용만 반영하세요. 추측 금지."
    )

    # ── [FIX 3] 감정 어휘 가이드 — empathy 어투 개선 ─────────────────
    # 기존에는 어미 규칙만 있어서 "불안함이 나타나고" 같은 관찰 보고서체 생성.
    # 감성적 동사 예시를 프롬프트에 주입해 상담사 어투로 유도.
    empathy_verb_guide = {
        "happy":   "기쁨이 넘치고 / 행복함이 가득하고 / 설레임이 밀려오고",
        "calm":    "마음이 고요하게 가라앉고 / 평온함이 감돌고",
        "tired":   "피로가 쌓여오고 / 지침이 느껴지고 / 무거움이 밀려오고",
        "sad":     "슬픔이 밀려오고 / 쓸쓸함이 감돌고 / 마음이 무겁게 내려앉고",
        "angry":   "답답함이 치밀어 오르고 / 억울함이 가득 차오르고",
        "anxious": "불안함이 밀려오고 / 긴장감이 가슴을 조여오고 / 초조함이 스며들고",
    }.get(emotion, "감정이 밀려오고")

    # ── [FIX 1] 감정별 카페인 필터 적용한 추천 목록 구성 ─────────────
    high_stress_items_raw = (
        "아이스 아메리카노 / 콜드브루 / 에스프레소 샷 / 아이스 페퍼민트 티 / "
        "탄산수 / 자몽에이드 / 딸기에이드 / 패션후르츠 에이드 / "
        "쿨패치 / 아이스 안대 / 스트레스 볼 / 피젯 큐브 / 마사지 볼 / 손가락 지압링 / "
        "감자칩 / 민트 초콜릿 / 하리보 젤리 / "
        "빗소리 백색소음 / 좋아하는 노래 한 곡 크게 틀기 / "
        "페퍼민트 에센셜 오일 한 방울 / 계단 오르내리기"
    )
    mid_stress_items_raw = (
        "아이스 라떼 / 바닐라 라떼 / 오트밀 라떼 / 아몬드 라떼 / 말차 라떼 / "
        "캐모마일 티 / 루이보스 티 / 얼그레이 티 / 재스민 티 / 홍차 라떼 / "
        "복숭아 아이스티 / 딸기 스무디 / 망고 스무디 / "
        "다크초콜릿 한 조각 / 마카롱 / 브라우니 한 조각 / 버터 쿠키 / "
        "망고 젤리 / 그래놀라 바 / 요거트 한 컵 / "
        "라벤더 룸 스프레이 / 유칼립투스 디퓨저 / 로즈 향 바디로션 / "
        "좋아하는 플레이리스트 / 재즈 카페 음악 / "
        "10분 스트레칭 / 가벼운 동네 산책 / 잠깐 햇빛 쬐기"
    )
    low_stress_items_raw = (
        "따뜻한 핫초코 / 따뜻한 두유 / 따뜻한 라떼 / 따뜻한 카모마일 라떼 / "
        "핫 레몬차 / 유자차 / 생강차 / 애플 시나몬 티 / 로즈힙 티 / "
        "따뜻한 군고구마 / 군밤 / 카스텔라 / 크루아상 / "
        "바나나 한 개 / 방울토마토 한 줌 / 견과류 한 줌 / "
        "핫팩 / 따뜻한 수건 찜질 / 향기 나는 손 크림 / 립밤 / "
        "샌달우드 인센스 스틱 / 좋아하는 향수 한 번 뿌리기 / "
        "잔잔한 피아노 연주곡 / 클래식 현악 4중주 / 파도 소리 자연음 / "
        "컬러링북 / 공원 벤치에 앉아 멍 때리기 / 베란다 바람 쐬기"
    )

    if stress >= 70:
        stress_label = "높음 (70% 이상)"
        stress_items_raw = high_stress_items_raw
    elif stress >= 40:
        stress_label = "중간 (40~69%)"
        stress_items_raw = mid_stress_items_raw
    else:
        stress_label = "낮음 (39% 이하)"
        stress_items_raw = low_stress_items_raw

    # 감정에 맞지 않는 아이템 필터링
    stress_items = filter_items_for_emotion(stress_items_raw, emotion)

    # ── [FIX 3] 감정별 아이템 선호 힌트 ─────────────────────────────
    emotion_hint = {
        "happy":   "달콤하거나 향긋한 아이템 선호",
        "calm":    "따뜻하고 부드러운 아이템 선호",
        "tired":   "따뜻하게 위로해주는 아이템 선호 (고카페인 제외)",
        "sad":     "달콤하거나 포근한 아이템 선호",
        "angry":   "차갑고 시원한 자극 또는 손을 바쁘게 하는 아이템 선호",
        "anxious": "진정·이완 효과 아이템 선호. 카페인 음료 절대 금지.",
    }.get(emotion, "감정에 맞는 아이템 선호")

    diary_preview = diary_text[:25]

    # ── [FIX 4] reason에 일기 내용 명시 주입 ─────────────────────────
    # 기존에는 reason이 어떤 일기에도 붙을 수 있는 범용 문장으로 생성됨.
    # diary_text 앞부분을 reason 작성 지침에 직접 명시해 구체성 강제.
    reason_guide = (
        f"이름 없이 2문장. "
        f"일기의 구체적 상황('{diary_preview}...')이 "
        f"왜 심리적으로 소진을 일으키는지 설명. "
        f"스트레스 {stress}%·강도 {intensity}%의 의미를 자연스럽게 연결. "
        f"비유적 언어 사용 가능하되 반드시 일기 상황과 연결할 것. "
        f"범용 위로 문장 금지."
    )

    # ── [FIX 5] action 구체성 강화 ───────────────────────────────────
    # 기존 프롬프트는 "왜 맞는지 설명"이라고만 해서 막연한 권유 문장 생성.
    # 감정 키워드 + 아이템 성분/효과를 1:1로 연결하도록 구조 명시.
    action_guide = (
        "이름 없이 2문장. "
        "healing_title 아이템 하나만 언급. 다른 활동 추가 금지. "
        "문장1: 지금 느끼는 감정 상태(불안/피로/슬픔 등 구체 단어)와 "
        "이 아이템의 성분·특성·효과를 직접 연결해서 설명. '~해요' 어미 사용. "
        "문장2: 아이템을 실제로 사용하는 구체적인 행동 하나를 제안. '~거든요' 어미 사용."
    )

    # ── healing_desc 가이드 ───────────────────────────────────────────
    healing_desc_guide = (
        f"2문장. 이름 언급 금지. '것 같아요'·'마음을 편안하게' 금지. "
        f"문장1: 지금 감정 상태를 한 단어로 짚고 이 아이템 성분·특성이 "
        f"왜 그 상태에 맞는지 연결. '~에 도움이 돼요.' 또는 '~효과가 있어요.'로 끝낼 것. "
        f"문장2: 실제 사용 시 느껴지는 감각(온도·향·맛·촉감 중 하나)을 생생하게. "
        f"'~거든요.' 또는 '~해줘요.'로 끝낼 것. 두 문장 합쳐 70자 이내."
    )

    user_prompt = f"""닉네임: "{nickname}"
일기: "{diary_text}"
감정: {emotion} / 강도: {intensity}% / 스트레스: {stress}%

────────────────────────────────
아래 JSON 형식으로만 응답하세요. JSON 외 텍스트 절대 금지.
────────────────────────────────

{{
  "empathy":      "{nickname}님, 으로 시작하는 2문장. 일기의 구체적 상황을 그대로 반영. 감성 동사 예시: [{empathy_verb_guide}]. 어미는 ~네요/~겠어요/~이에요 혼용. '~것 같아요' 금지. '나타나고' 금지.",
  "reason":       "{reason_guide}",
  "action":       "{action_guide}",
  "healing_title":"아래 [힐링 아이템 선택 기준] 목록에서 딱 하나만 선택. 목록 외 창작 절대 금지.",
  "healing_desc": "{healing_desc_guide}",
  "healing_icon": "음료이면 tea / 음악·소리이면 music / 산책·스트레칭·야외활동이면 walk / 향·스프레이·디퓨저이면 scent / 간식·도구·기타이면 home"
}}

────────────────────────────────
[힐링 아이템 선택 기준]
스트레스: {stress}% ({stress_label}) / 감정: {emotion} → {emotion_hint}
매번 다양하게 선택. 음료만 반복 금지.

추천 목록:
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

        json_match = re.search(r'\{.*\}', raw_content, re.DOTALL)
        if json_match:
            ai_response = json.loads(json_match.group(0))
        else:
            ai_response = json.loads(raw_content)

        ai_response = sanitize_ai_response(ai_response, nickname)

        ai_analysis = "\n\n".join([
            ai_response.get("empathy",  "").strip(),
            ai_response.get("reason",   "").strip(),
            ai_response.get("action",   "").strip(),
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